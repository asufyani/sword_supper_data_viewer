import fs from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import { pathToFileURL } from 'node:url'
import prettier from 'prettier'

const DEFAULT_TARGETS = [
  'loot',
  'items',
  'enemies',
  'foods',
  'mapEnemies',
  'quests',
  'vaultLoot',
  'abilityNames',
  'enemyNames',
  'levelCosts',
]

class RawCode {
  constructor(code) {
    this.code = code
  }
}

function assertFound(index, label) {
  if (index === -1) {
    throw new Error(`Could not find ${label} in bundle`)
  }
}

function extractBalanced(source, start, openChar = '{', closeChar = '}') {
  let depth = 0
  let inString = false
  let quote = ''
  let escaped = false

  for (let i = start; i < source.length; i += 1) {
    const char = source[i]

    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) {
        inString = false
        quote = ''
      }
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = true
      quote = char
      continue
    }

    if (char === openChar) depth += 1
    else if (char === closeChar) {
      depth -= 1
      if (depth === 0) return source.slice(start, i + 1)
    }
  }

  throw new Error(`Unbalanced ${openChar}${closeChar} expression`)
}

function extractFunction(source, functionName) {
  const start = source.indexOf(`function ${functionName}`)
  assertFound(start, `function ${functionName}`)
  const bodyStart = source.indexOf('{', start)
  return source.slice(start, bodyStart) + extractBalanced(source, bodyStart)
}

function runExpression(expression, context = {}) {
  const vmContext = { result: null, ...context }
  vm.createContext(vmContext)
  vm.runInContext(`result=${expression}`, vmContext)
  return vmContext.result
}

function runStatements(statements, resultExpression, context = {}) {
  const vmContext = { result: null, ...context }
  vm.createContext(vmContext)
  vm.runInContext(`${statements}\nresult=${resultExpression}`, vmContext)
  return vmContext.result
}

function extractObjectAfter(source, marker) {
  const markerStart = source.indexOf(marker)
  assertFound(markerStart, marker)
  const objectStart = source.indexOf('{', markerStart)
  assertFound(objectStart, `${marker} object`)
  return extractBalanced(source, objectStart)
}

function extractAssignedObject(source, identifier) {
  const pattern = new RegExp(`(?:^|[^A-Za-z0-9_$])${identifier}=`)
  const match = pattern.exec(source)

  if (!match) {
    throw new Error(`Could not find ${identifier} assignment in bundle`)
  }

  const objectStart = source.indexOf('{', match.index)
  assertFound(objectStart, `${identifier} object`)
  return extractBalanced(source, objectStart)
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, canonicalize(child)])
  )
}

function valuesEqual(actual, expected) {
  return JSON.stringify(canonicalize(actual)) === JSON.stringify(canonicalize(expected))
}

function isIdentifier(value) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value)
}

function objectKey(key) {
  return isIdentifier(key) ? key : JSON.stringify(key)
}

function abilityParamKey(params) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(params).sort(([left], [right]) => left.localeCompare(right))
    )
  )
}

function toTsExpression(value, rawObjects = new WeakMap()) {
  if (value instanceof RawCode) return value.code
  if (value && typeof value === 'object' && rawObjects.has(value)) {
    return rawObjects.get(value).code
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => toTsExpression(item, rawObjects)).join(',')}]`
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .filter(([, child]) => child !== undefined)
      .map(([key, child]) => `${objectKey(key)}:${toTsExpression(child, rawObjects)}`)
      .join(',')}}`
  }
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value === undefined) return 'undefined'
  return 'null'
}

async function formatTypescript(source) {
  return prettier.format(source, {
    parser: 'typescript',
    trailingComma: 'es5',
    tabWidth: 2,
    semi: false,
    singleQuote: true,
  })
}

async function renderConstModule({ imports = '', exportName, typeAnnotation = '', value }) {
  const declaration = `export const ${exportName}${typeAnnotation} = ${toTsExpression(value)}\n`
  return formatTypescript(`${imports}${imports ? '\n' : ''}${declaration}`)
}

function stripImports(source) {
  return source.replace(/^import .*$/gm, '')
}

function stripExportConst(source) {
  return source.replace(
    /export const ([A-Za-z_$][A-Za-z0-9_$]*)(?:\s*:[^=]+)?\s*=/g,
    'const $1 ='
  )
}

async function loadLocalExport(filePath, exportName, context = {}) {
  const source = await fs.readFile(filePath, 'utf8')
  const executable = stripExportConst(stripImports(source))
  return runStatements(executable, exportName, context)
}

async function maybeLoadLocalExport(filePath, exportName, context = {}) {
  const source = await fs.readFile(filePath, 'utf8')

  if (!source.includes(`export const ${exportName}`)) {
    return undefined
  }

  return loadLocalExport(filePath, exportName, context)
}

function extractBundleLootTables(bundleSource) {
  return runExpression(`(${extractAssignedObject(bundleSource, 'LOOT_TABLES')})`)
}

function extractBundleItems(bundleSource) {
  const start = bundleSource.indexOf('const TAG_EQUIPMENT')
  assertFound(start, 'item definitions start')
  const end = bundleSource.indexOf('function itemDamageToDamageProfile', start)
  assertFound(end, 'item definitions end')
  return runStatements(bundleSource.slice(start, end), 'ItemDefinitions')
}

function extractBundleEnemies(bundleSource, lootTables) {
  const enemies = runExpression(`(${extractObjectAfter(bundleSource, '_EnemyDefinitions=')})`, {
    LOOT_TABLES: lootTables,
  })
  const spineScales = extractBundleEnemySpineScales(bundleSource)

  for (const [enemyId, spineScale] of Object.entries(spineScales)) {
    if (enemies[enemyId]) enemies[enemyId].spineScale = spineScale
  }

  return enemies
}

function extractTopLevelNumericProperty(objectSource, propertyName) {
  let depth = 0
  let inString = false
  let quote = ''
  let escaped = false

  for (let i = 0; i < objectSource.length; i += 1) {
    const char = objectSource[i]

    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) {
        inString = false
        quote = ''
      }
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = true
      quote = char
      continue
    }

    if (char === '{' || char === '(' || char === '[') depth += 1
    else if (char === '}' || char === ')' || char === ']') depth -= 1

    if (depth !== 1) continue

    const match = new RegExp(
      `^${propertyName}\\s*:\\s*(-?(?:\\d+(?:\\.\\d*)?|\\.\\d+))`
    ).exec(objectSource.slice(i))
    if (match) return Number(match[1])
  }

  return undefined
}

function extractBundleDisplayObjectSpineScales(bundleSource) {
  const start = bundleSource.indexOf('function variant')
  if (start === -1) return new Map()

  const end = bundleSource.indexOf('ENEMY_DISPLAY_REGISTRY=', start)
  if (end === -1) return new Map()

  const displaySource = bundleSource.slice(start, end)
  const displayObjectScales = new Map()
  const assignmentPattern = /(?:const\s+|,\s*)([A-Za-z_$][A-Za-z0-9_$]*)=\{/g

  for (const match of displaySource.matchAll(assignmentPattern)) {
    const objectStart = displaySource.indexOf('{', match.index)
    assertFound(objectStart, `${match[1]} display object`)
    const objectSource = extractBalanced(displaySource, objectStart)
    const spineScale = extractTopLevelNumericProperty(objectSource, 'scale')

    if (spineScale !== undefined) displayObjectScales.set(match[1], spineScale)
  }

  return displayObjectScales
}

function extractSpineScaleFromConstructor(constructorBody) {
  const match = constructorBody.match(
    /this\.setScale\(\s*(-?(?:\d+(?:\.\d*)?|\.\d+))(?:\s*,\s*(-?(?:\d+(?:\.\d*)?|\.\d+)))?\s*\)/
  )

  return match ? Number(match[1]) : undefined
}

function extractBundleClassSpineScales(bundleSource) {
  const classScales = new Map()
  const classPattern =
    /class\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+extends\s+[A-Za-z_$][A-Za-z0-9_$]*/g

  for (const match of bundleSource.matchAll(classPattern)) {
    const bodyStart = bundleSource.indexOf('{', match.index)
    assertFound(bodyStart, `class ${match[1]} body`)
    const classBody = extractBalanced(bundleSource, bodyStart)
    const constructorStart = classBody.indexOf('constructor(')
    if (constructorStart === -1) continue

    const constructorParamsStart = classBody.indexOf('(', constructorStart)
    const constructorParams = extractBalanced(
      classBody,
      constructorParamsStart,
      '(',
      ')'
    )
    const constructorBodyStart = classBody.indexOf(
      '{',
      constructorParamsStart + constructorParams.length
    )
    if (constructorBodyStart === -1) continue

    const spineScale = extractSpineScaleFromConstructor(
      extractBalanced(classBody, constructorBodyStart)
    )
    if (spineScale !== undefined) classScales.set(match[1], spineScale)
  }

  return classScales
}

function extractBundleEnemySpineScales(bundleSource) {
  const displayObjectScales = extractBundleDisplayObjectSpineScales(bundleSource)
  const classScales = extractBundleClassSpineScales(bundleSource)
  const enemySpineScales = {}

  try {
    const registrySource = extractObjectAfter(bundleSource, 'ENEMY_DISPLAY_REGISTRY=')

    for (const entry of splitTopLevelObjectEntries(registrySource)) {
      const variant = entry.match(
        /^([A-Za-z_$][A-Za-z0-9_$]*):variant\(([A-Za-z_$][A-Za-z0-9_$]*),/
      )
      if (variant) {
        const spineScale = displayObjectScales.get(variant[2])
        if (spineScale !== undefined) enemySpineScales[variant[1]] = spineScale
        continue
      }

      const alias = entry.match(
        /^([A-Za-z_$][A-Za-z0-9_$]*):([A-Za-z_$][A-Za-z0-9_$]*)$/
      )
      if (alias) {
        const spineScale = displayObjectScales.get(alias[2])
        if (spineScale !== undefined) enemySpineScales[alias[1]] = spineScale
        continue
      }

      const spineScale = displayObjectScales.get(entry)
      if (spineScale !== undefined) enemySpineScales[entry] = spineScale
    }
  } catch {
    // Older or reduced bundles may not include display metadata.
  }

  try {
    const typeToClassSource = extractObjectAfter(bundleSource, 'EnemyTypeToClass=')

    for (const entry of splitTopLevelObjectEntries(typeToClassSource)) {
      const mappedClass = entry.match(
        /^([A-Za-z_$][A-Za-z0-9_$]*):([A-Za-z_$][A-Za-z0-9_$]*)$/
      )
      if (!mappedClass) continue

      const spineScale = classScales.get(mappedClass[2])
      if (spineScale !== undefined) enemySpineScales[mappedClass[1]] = spineScale
    }
  } catch {
    // Reduced bundles in tests do not always include class mappings.
  }

  return enemySpineScales
}

function extractBundleFoods(bundleSource) {
  return runExpression(`(${extractObjectAfter(bundleSource, 'essencesByImageName=')})`)
}

function extractBundleMapEnemies(bundleSource) {
  return {
    enemies: runExpression(
      `(${extractObjectAfter(bundleSource, 'enemySpawnTableByEnvironment=')})`
    ),
    bosses: runExpression(
      `(${extractObjectAfter(bundleSource, 'bossSpawnTableByEnvironment=')})`
    ),
  }
}

function extractBundleQuests(bundleSource) {
  const questStart = bundleSource.indexOf('DEFAULT_EXPIRES_SEC=days(1),_quests=')
  assertFound(questStart, 'quest definitions')
  const objectStart = bundleSource.indexOf('{', questStart)
  const questContext = {
    days: (n) => n * 24 * 60 * 60,
    minutes: (n) => n * 60,
    LootCollected: (id) => ({ kind: 'LootCollected', id }),
    LootCollectedWithTag: (tag) => ({ kind: 'LootCollectedWithTag', tag }),
    EnemyKilled: (id) => ({ kind: 'EnemyKilled', id }),
    EnemyKilledWithTag: (tag) => ({ kind: 'EnemyKilledWithTag', tag }),
    AcceptedEncounter: (type) => ({ kind: 'AcceptedEncounter', type }),
    RefusedEncounter: (type) => ({ kind: 'RefusedEncounter', type }),
    EncounterType: { SkillBargain: 'SkillBargain', Investigate: 'Investigate' },
  }
  const rawQuests = runExpression(extractBalanced(bundleSource, objectStart), questContext)

  return Object.fromEntries(
    Object.entries(rawQuests).map(([id, quest]) => [
      id,
      {
        type: quest.type,
        description: quest.description,
        rewardTiers: quest.rewardTiers,
        expiresSeconds: quest.expiresSeconds,
      },
    ])
  )
}

function extractBundleVaultLoot(bundleSource) {
  return {
    vaultGoldLoot: runExpression(`(${extractObjectAfter(bundleSource, 'vaultGoldLoot=')})`),
    vaultResourceLoot: runExpression(
      `(${extractObjectAfter(bundleSource, 'vaultResourceLoot=')})`
    ),
    vaultEquipLoot: runExpression(`(${extractObjectAfter(bundleSource, 'vaultEquipLoot=')})`),
  }
}

function extractBundleAbilityNames(bundleSource, items) {
  const start = bundleSource.indexOf('function validateAbilityParams')
  const end = bundleSource.indexOf('const DEFAULT_WEAPON_DAMAGE', start)
  assertFound(start, 'ability registry start')
  assertFound(end, 'ability registry end')

  const { abilityRegistry, loadAbilityFromId, loadAbility } = Function(
    `${bundleSource.slice(start, end)}; return { abilityRegistry, loadAbilityFromId, loadAbility };`
  )()
  const abilityNameMap = Object.fromEntries(
    Object.keys(abilityRegistry).map((id) => {
      const ability = loadAbilityFromId(id)
      return [id, { name: ability.name, description: ability.description }]
    })
  )
  const abilityParamDescriptionMap = {}

  for (const item of Object.values(items)) {
    for (const ability of item.abilities ?? []) {
      if (!ability.params || Object.keys(ability.params).length === 0) continue
      abilityParamDescriptionMap[ability.id] ??= {}
      abilityParamDescriptionMap[ability.id][abilityParamKey(ability.params)] =
        loadAbility(ability).description
    }
  }

  return { abilityNameMap, abilityParamDescriptionMap }
}

function splitTopLevelObjectEntries(objectSource) {
  const body = objectSource.slice(1, -1)
  const entries = []
  let start = 0
  let depth = 0
  let inString = false
  let quote = ''
  let escaped = false

  for (let i = 0; i < body.length; i += 1) {
    const char = body[i]

    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) {
        inString = false
        quote = ''
      }
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = true
      quote = char
      continue
    }

    if (char === '{' || char === '(' || char === '[') depth += 1
    else if (char === '}' || char === ')' || char === ']') depth -= 1
    else if (char === ',' && depth === 0) {
      entries.push(body.slice(start, i).trim())
      start = i + 1
    }
  }

  const last = body.slice(start).trim()
  if (last) entries.push(last)
  return entries
}

function extractDisplayNameFromConstructor(constructorBody) {
  const directDisplayName = constructorBody.match(
    /this\.displayName\s*=\s*"((?:\\"|[^"])*)"/
  )
  if (directDisplayName) return JSON.parse(`"${directDisplayName[1]}"`)

  const superDisplayName = constructorBody.match(/displayName\s*:\s*"((?:\\"|[^"])*)"/)
  if (superDisplayName) return JSON.parse(`"${superDisplayName[1]}"`)

  return undefined
}

function extractBundleClassDisplayNames(bundleSource) {
  const classDisplayNames = new Map()
  const classPattern =
    /class\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+extends\s+[A-Za-z_$][A-Za-z0-9_$]*/g

  for (const match of bundleSource.matchAll(classPattern)) {
    const bodyStart = bundleSource.indexOf('{', match.index)
    assertFound(bodyStart, `class ${match[1]} body`)
    const classBody = extractBalanced(bundleSource, bodyStart)
    const constructorStart = classBody.indexOf('constructor(')
    if (constructorStart === -1) continue

    const constructorParamsStart = classBody.indexOf('(', constructorStart)
    const constructorParams = extractBalanced(
      classBody,
      constructorParamsStart,
      '(',
      ')'
    )
    const constructorBodyStart = classBody.indexOf(
      '{',
      constructorParamsStart + constructorParams.length
    )
    if (constructorBodyStart === -1) continue

    const displayName = extractDisplayNameFromConstructor(
      extractBalanced(classBody, constructorBodyStart)
    )
    if (displayName) classDisplayNames.set(match[1], displayName)
  }

  for (const match of bundleSource.matchAll(
    /(?:const\s+|,)([A-Za-z_$][A-Za-z0-9_$]*)=createDisplayNameVariant\([A-Za-z_$][A-Za-z0-9_$]*,"((?:\\"|[^"])*)"\)/g
  )) {
    classDisplayNames.set(match[1], JSON.parse(`"${match[2]}"`))
  }

  return classDisplayNames
}

function addEnemyTypeClassNames(bundleSource, enemyNames, classDisplayNames) {
  let typeToClassSource
  try {
    typeToClassSource = extractObjectAfter(bundleSource, 'EnemyTypeToClass=')
  } catch {
    return
  }

  for (const entry of splitTopLevelObjectEntries(typeToClassSource)) {
    const mappedClass = entry.match(
      /^([A-Za-z_$][A-Za-z0-9_$]*):([A-Za-z_$][A-Za-z0-9_$]*)$/
    )
    if (!mappedClass || enemyNames[mappedClass[1]]) continue

    const displayName = classDisplayNames.get(mappedClass[2])
    if (displayName) enemyNames[mappedClass[1]] = displayName
  }
}

function extractBundleEnemyNames(bundleSource) {
  const displayNames = new Map()
  for (const match of bundleSource.matchAll(
    /(?:const\s+|,)([A-Za-z_$][A-Za-z0-9_$]*)=\{displayName:"((?:\\"|[^"])*)"/g
  )) {
    displayNames.set(match[1], JSON.parse(`"${match[2]}"`))
  }
  const classDisplayNames = extractBundleClassDisplayNames(bundleSource)

  const registrySource = extractObjectAfter(bundleSource, 'ENEMY_DISPLAY_REGISTRY=')
  const enemyNames = {}

  for (const entry of splitTopLevelObjectEntries(registrySource)) {
    const variant = entry.match(
      /^([A-Za-z_$][A-Za-z0-9_$]*):variant\([A-Za-z_$][A-Za-z0-9_$]*,"((?:\\"|[^"])*)"\)$/
    )
    if (variant) {
      enemyNames[variant[1]] = JSON.parse(`"${variant[2]}"`)
      continue
    }

    const alias = entry.match(
      /^([A-Za-z_$][A-Za-z0-9_$]*):([A-Za-z_$][A-Za-z0-9_$]*)$/
    )
    if (alias) {
      const displayName = displayNames.get(alias[2])
      if (displayName) enemyNames[alias[1]] = displayName
      continue
    }

    const displayName = displayNames.get(entry)
    if (displayName) enemyNames[entry] = displayName
  }

  addEnemyTypeClassNames(bundleSource, enemyNames, classDisplayNames)

  return enemyNames
}

function extractBundleLevelCostFunction(bundleSource) {
  const functionSource = extractFunction(bundleSource, 'getUpgradeCost')
  const costFunction = runStatements(functionSource, 'getUpgradeCost', { Math })
  return { functionSource, costFunction }
}

function getFunctionBody(functionSource) {
  const bodyStart = functionSource.indexOf('{')
  return extractBalanced(functionSource, bodyStart).slice(1, -1)
}

async function loadLocalLevelCosts(filePath) {
  const source = await fs.readFile(filePath, 'utf8')
  const executable = source
    .replace(/export function /g, 'function ')
    .replace(/: number/g, '')

  return runStatements(executable, '{ getLevelUpgradeCost, getLevelCostSoFar }', { Math })
}

function createCache(bundleSource) {
  return {
    bundleSource,
    lootTables: undefined,
    items: undefined,
    enemies: undefined,
    foods: undefined,
    mapEnemies: undefined,
    quests: undefined,
    vaultLoot: undefined,
    abilityNames: undefined,
    enemyNames: undefined,
    levelCosts: undefined,
  }
}

function getCached(cache, key, load) {
  if (cache[key] === undefined) cache[key] = load()
  return cache[key]
}

const targets = {
  loot: {
    filePath: 'src/utils/loot.ts',
    readBundle: (cache) =>
      getCached(cache, 'lootTables', () => extractBundleLootTables(cache.bundleSource)),
    readLocal: ({ filePath }) => loadLocalExport(filePath, 'et'),
    render: ({ expected }) =>
      renderConstModule({
        imports: "import { type LootTable } from '../types'\n",
        exportName: 'et',
        typeAnnotation: ': Record<string, LootTable>',
        value: expected,
      }),
  },
  items: {
    filePath: 'src/utils/items.ts',
    readBundle: (cache) =>
      getCached(cache, 'items', () => extractBundleItems(cache.bundleSource)),
    readLocal: ({ filePath }) => loadLocalExport(filePath, 'items'),
    render: ({ expected }) =>
      renderConstModule({
        imports: "import type { Item } from '../types'\n",
        exportName: 'items',
        typeAnnotation: ': Record<string, Item>',
        value: expected,
      }),
  },
  enemies: {
    filePath: 'src/utils/enemies.ts',
    readBundle: (cache) =>
      getCached(cache, 'enemies', () =>
        extractBundleEnemies(
          cache.bundleSource,
          getCached(cache, 'lootTables', () => extractBundleLootTables(cache.bundleSource))
        )
      ),
    readLocal: async ({ filePath, rootDir }) => {
      const lootTables = await loadLocalExport(path.join(rootDir, 'src/utils/loot.ts'), 'et')
      return loadLocalExport(filePath, 'z3', { et: lootTables })
    },
    render: ({ expected, cache }) => {
      const lootTables = getCached(cache, 'lootTables', () =>
        extractBundleLootTables(cache.bundleSource)
      )
      const rawObjects = new WeakMap(
        Object.entries(lootTables).map(([name, lootTable]) => [
          lootTable,
          new RawCode(`et.${name}`),
        ])
      )
      return formatTypescript(
        `import type { Enemy } from '../types'\nimport { et } from './loot'\n\nexport const z3: Record<string, Enemy> = ${toTsExpression(expected, rawObjects)}\n`
      )
    },
  },
  foods: {
    filePath: 'src/utils/foods.ts',
    readBundle: (cache) =>
      getCached(cache, 'foods', () => extractBundleFoods(cache.bundleSource)),
    readLocal: ({ filePath }) => loadLocalExport(filePath, 'foods'),
    render: async ({ expected, filePath }) => {
      const foodNames = await maybeLoadLocalExport(filePath, 'foodNames')
      const foodNamesExport =
        foodNames === undefined
          ? ''
          : `\nexport const foodNames = ${toTsExpression(foodNames)}\n`
      return formatTypescript(
        `export const foods = ${toTsExpression(expected)}\n${foodNamesExport}`
      )
    },
  },
  mapEnemies: {
    filePath: 'src/utils/mapEnemies.ts',
    readBundle: (cache) =>
      getCached(cache, 'mapEnemies', () => extractBundleMapEnemies(cache.bundleSource)),
    readLocal: async ({ filePath }) => ({
      enemies: await loadLocalExport(filePath, 'Z0'),
      bosses: await loadLocalExport(filePath, '$0'),
    }),
    render: ({ expected }) =>
      formatTypescript(
        `export const Z0 = ${toTsExpression(expected.enemies)}\n\nexport const $0 = ${toTsExpression(expected.bosses)}\n`
      ),
  },
  quests: {
    filePath: 'src/utils/quests.ts',
    readBundle: (cache) =>
      getCached(cache, 'quests', () => extractBundleQuests(cache.bundleSource)),
    readLocal: ({ filePath }) => loadLocalExport(filePath, 'quests'),
    render: ({ expected }) =>
      renderConstModule({ exportName: 'quests', value: expected }),
  },
  vaultLoot: {
    filePath: 'src/utils/vaultLoot.ts',
    readBundle: (cache) =>
      getCached(cache, 'vaultLoot', () => extractBundleVaultLoot(cache.bundleSource)),
    readLocal: ({ filePath }) => loadLocalExport(filePath, 'vt'),
    render: ({ expected }) =>
      formatTypescript(
        `export const vt = ${toTsExpression(expected)}\n\nexport const vaultLootTables = vt\n`
      ),
  },
  abilityNames: {
    filePath: 'src/utils/abilityNames.ts',
    readBundle: (cache) =>
      getCached(cache, 'abilityNames', () =>
        extractBundleAbilityNames(
          cache.bundleSource,
          getCached(cache, 'items', () => extractBundleItems(cache.bundleSource))
        )
      ),
    readLocal: async ({ filePath }) => ({
      abilityNameMap: await loadLocalExport(filePath, 'abilityNameMap'),
      abilityParamDescriptionMap:
        (await maybeLoadLocalExport(filePath, 'abilityParamDescriptionMap')) ?? {},
    }),
    render: ({ expected }) =>
      formatTypescript(
        `export const abilityNameMap = ${toTsExpression(expected.abilityNameMap)}

export const abilityParamDescriptionMap: Record<string, Record<string, string>> = ${toTsExpression(expected.abilityParamDescriptionMap)}
`
      ),
  },
  enemyNames: {
    filePath: 'src/utils/enemyNames.ts',
    readBundle: (cache) =>
      getCached(cache, 'enemyNames', () => extractBundleEnemyNames(cache.bundleSource)),
    readLocal: ({ filePath }) => loadLocalExport(filePath, 'enemyNames'),
    render: ({ expected }) =>
      renderConstModule({
        exportName: 'enemyNames',
        typeAnnotation: ': Record<string, string>',
        value: expected,
      }),
  },
  levelCosts: {
    filePath: 'src/utils/levelCosts.ts',
    readBundle: (cache) =>
      getCached(cache, 'levelCosts', () =>
        extractBundleLevelCostFunction(cache.bundleSource)
      ),
    readLocal: ({ filePath }) => loadLocalLevelCosts(filePath),
    isEqual: (actual, expected) => {
      for (const level of [1, 2, 3, 4, 10, 25, 100, 250, 500]) {
        if (actual.getLevelUpgradeCost(level) !== expected.costFunction(level)) {
          return false
        }
      }
      return (
        actual.getLevelCostSoFar(1) === 0 &&
        actual.getLevelCostSoFar(5) ===
          expected.costFunction(1) +
            expected.costFunction(2) +
            expected.costFunction(3) +
            expected.costFunction(4)
      )
    },
    render: ({ expected }) => {
      const body = getFunctionBody(expected.functionSource)
        .replace(/\bx\b/g, 'level')
        .trim()
      return formatTypescript(
        `export function getLevelUpgradeCost(level: number): number {\n${body}\n}\n\nexport function getLevelCostSoFar(level: number): number {\nlet total = 0\nfor (let currentLevel = 1; currentLevel < level; currentLevel += 1) {\ntotal += getLevelUpgradeCost(currentLevel)\n}\nreturn total\n}\n`
      )
    },
  },
}

async function getMostRecentFile(filePaths) {
  const stats = await Promise.all(
    filePaths.map(async (filePath) => ({ filePath, stat: await fs.stat(filePath) }))
  )
  stats.sort((left, right) => right.stat.mtimeMs - left.stat.mtimeMs)
  return stats[0]?.filePath
}

async function findBundleFilesInDir(candidateDir) {
  const bundleFiles = []

  try {
    const entries = await fs.readdir(candidateDir)
    for (const entry of entries) {
      if (/^index-[A-Za-z0-9_-]+\.js$/.test(entry)) {
        bundleFiles.push(path.join(candidateDir, entry))
      }
    }
  } catch {
    // Candidate directories are optional.
  }

  return bundleFiles
}

export async function resolveBundlePath(rootDir, bundlePath) {
  if (bundlePath) return path.resolve(rootDir, bundlePath)

  const candidateDirs = [
    rootDir,
    path.join(rootDir, 'public'),
    path.join(rootDir, 'dist', 'assets'),
  ]

  for (const candidateDir of candidateDirs) {
    const bundleFiles = await findBundleFilesInDir(candidateDir)
    if (bundleFiles.length > 0) {
      return getMostRecentFile(bundleFiles)
    }
  }

  throw new Error(
    'No bundle found. Pass one with --bundle <path> or as a positional argument.'
  )
}

export async function syncBundleData({
  rootDir = process.cwd(),
  bundlePath,
  targets: targetNames = DEFAULT_TARGETS,
  write = false,
} = {}) {
  const resolvedRootDir = path.resolve(rootDir)
  const resolvedBundlePath = await resolveBundlePath(resolvedRootDir, bundlePath)
  const bundleSource = await fs.readFile(resolvedBundlePath, 'utf8')
  const cache = createCache(bundleSource)
  const results = []

  for (const targetName of targetNames) {
    const target = targets[targetName]
    if (!target) throw new Error(`Unknown target: ${targetName}`)

    const filePath = path.join(resolvedRootDir, target.filePath)
    const expected = target.readBundle(cache)
    const actual = await target.readLocal({ filePath, rootDir: resolvedRootDir })
    const equal = target.isEqual
      ? target.isEqual(actual, expected)
      : valuesEqual(actual, expected)
    const result = {
      target: targetName,
      filePath,
      status: equal ? 'same' : 'different',
      written: false,
    }

    if (!equal && write) {
      const source = await target.render({ expected, cache, filePath, rootDir: resolvedRootDir })
      await fs.writeFile(filePath, source)
      result.written = true
    }

    results.push(result)
  }

  return {
    bundlePath: resolvedBundlePath,
    hasChanges: results.some((result) => result.status === 'different'),
    results,
  }
}

function parseArgs(argv) {
  const options = {
    write: false,
    check: false,
    rootDir: process.cwd(),
    bundlePath: undefined,
    targets: [],
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]

    if (arg === '--write') options.write = true
    else if (arg === '--check') options.check = true
    else if (arg === '--root') {
      i += 1
      options.rootDir = argv[i]
    } else if (arg === '--bundle') {
      i += 1
      options.bundlePath = argv[i]
    } else if (arg === '--target') {
      i += 1
      options.targets.push(...argv[i].split(',').filter(Boolean))
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`)
    } else if (!options.bundlePath) {
      options.bundlePath = arg
    } else {
      throw new Error(`Unexpected argument: ${arg}`)
    }
  }

  return {
    rootDir: options.rootDir,
    bundlePath: options.bundlePath,
    write: options.write,
    targets: options.targets.length ? options.targets : DEFAULT_TARGETS,
  }
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2))
    const result = await syncBundleData(options)
    const mode = options.write ? 'write' : 'check'

    console.log(`Bundle: ${path.relative(options.rootDir, result.bundlePath)}`)
    console.log(`Mode: ${mode}`)

    for (const item of result.results) {
      const label = item.status === 'same' ? 'same' : item.written ? 'updated' : 'different'
      console.log(`${label}: ${path.relative(options.rootDir, item.filePath)}`)
    }

    if (result.hasChanges && !options.write) {
      console.log('Data drift found. Run with --write to update generated utils.')
      process.exitCode = 1
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
