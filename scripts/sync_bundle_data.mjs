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
  const match = new RegExp(
    `(?<![A-Za-z0-9_$])function\\s+${escapeRegExp(functionName)}\\s*\\(`
  ).exec(source)
  const start = match ? match.index : -1
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

// --- Content-based (minification-resistant) extraction helpers -----------
//
// Local variable and function names get re-mangled by the build's minifier
// on every release, so anchoring extraction on those names (e.g. `LOOT_TABLES`,
// `TAG_EQUIPMENT`, `validateAbilityParams`) is brittle. Property/object keys
// and string literals that are part of the actual game data (item ids, enemy
// ids, quest ids, `displayName:` etc.) are NOT renamed by minifiers, so we
// prefer anchoring on those wherever possible. The helpers below implement
// that strategy; each bundle extractor tries the historical name-based
// lookup first (so synthetic test fixtures that spell out names like
// `LOOT_TABLES` keep working) and falls back to a content-based lookup that
// keeps working after the identifier is minified to something like `ze`.

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Blanks out the contents of string/template literals (keeping their
// length, so match indices used elsewhere stay valid) so identifier-lookup
// regexes don't get confused by ordinary words inside descriptions/names
// that happen to coincide with a short mangled variable name (e.g. the
// English word "an" inside a description vs. the identifier `an`).
function stripStringAndTemplateLiterals(text) {
  return text.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g, (literal) =>
    ' '.repeat(literal.length)
  )
}

function parseEntryKey(entry) {
  const match = /^\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|([A-Za-z_$][A-Za-z0-9_$]*))\s*:/.exec(
    entry
  )
  if (!match) return undefined
  if (match[1] !== undefined) return JSON.parse(`"${match[1]}"`)
  if (match[2] !== undefined) return JSON.parse(`"${match[2].replace(/\\'/g, "'")}"`)
  return match[3]
}

function entryValueText(entry) {
  const match = /^\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[A-Za-z_$][A-Za-z0-9_$]*)\s*:([\s\S]*)$/.exec(
    entry
  )
  return match ? match[1].trim() : undefined
}

// Finds an object literal by the (stable) key names of its first entries,
// rather than by the (unstable) identifier it happens to be assigned to.
function extractObjectByFirstKeys(source, keys, { requireObjectValue = false } = {}) {
  const [firstKey] = keys
  const pattern = new RegExp(
    `\\{\\s*(?:"${escapeRegExp(firstKey)}"|'${escapeRegExp(firstKey)}'|${escapeRegExp(
      firstKey
    )})\\s*:`,
    'g'
  )

  for (const match of source.matchAll(pattern)) {
    let objectSource
    try {
      objectSource = extractBalanced(source, match.index)
    } catch {
      continue
    }

    const entries = splitTopLevelObjectEntries(objectSource)
    if (entries.length === 0) continue
    if (parseEntryKey(entries[0]) !== firstKey) continue

    const restKeysMatch = keys
      .slice(1)
      .every((key, i) => entries[i + 1] && parseEntryKey(entries[i + 1]) === key)
    if (!restKeysMatch) continue

    if (requireObjectValue && !entryValueText(entries[0])?.startsWith('{')) continue

    return objectSource
  }

  throw new Error(`Could not find object with first keys ${keys.join(', ')} in bundle`)
}

// Finds an object literal that contains the given key somewhere among its
// top-level entries and whose value looks like a data object (starts with
// `{`) rather than a bare identifier/alias. Used to disambiguate between
// several bundle objects that all happen to use the same id as a key.
function extractDataObjectContainingKey(source, key) {
  const pattern = new RegExp(
    `\\{\\s*(?:"${escapeRegExp(key)}"|'${escapeRegExp(key)}'|${escapeRegExp(key)})\\s*:`,
    'g'
  )

  for (const match of source.matchAll(pattern)) {
    let objectSource
    try {
      objectSource = extractBalanced(source, match.index)
    } catch {
      continue
    }
    const entries = splitTopLevelObjectEntries(objectSource)
    if (parseEntryKey(entries[0]) !== key) continue
    if (entryValueText(entries[0])?.startsWith('{')) return objectSource
  }

  return undefined
}

// Finds an object literal that contains the given key among its top-level
// entries with a value that is NOT a data object (i.e. a bare identifier or
// a call like `variant(ident,"Name")`). Used for registries that alias into
// other definitions (e.g. an enemy display registry).
function extractAliasObjectContainingKey(source, key, { minKeyOverlap = [] } = {}) {
  const pattern = new RegExp(
    `\\{\\s*(?:"${escapeRegExp(key)}"|'${escapeRegExp(key)}'|${escapeRegExp(key)})\\s*:`,
    'g'
  )

  for (const match of source.matchAll(pattern)) {
    let objectSource
    try {
      objectSource = extractBalanced(source, match.index)
    } catch {
      continue
    }
    const entries = splitTopLevelObjectEntries(objectSource)
    if (parseEntryKey(entries[0]) !== key) continue
    if (entryValueText(entries[0])?.startsWith('{')) continue

    if (minKeyOverlap.length > 0) {
      const keys = new Set(entries.map(parseEntryKey))
      const overlap = minKeyOverlap.filter((candidateKey) => keys.has(candidateKey)).length
      if (overlap < Math.min(3, minKeyOverlap.length)) continue
    }

    return objectSource
  }

  return undefined
}

// --- Generic dependency auto-resolution ----------------------------------
//
// Some data (ability descriptions, item definitions, quest expirations) is
// only available after *running* a chunk of the bundle's minified code
// (e.g. calling an ability constructor, or a `days(3)` helper). The specific
// helper/class names involved are re-mangled every build, so instead of
// hardcoding them we execute the target expression, and whenever it throws a
// `X is not defined` error we locate `X`'s definition in the bundle by its
// (stable) *shape* - a `function X(...)`, `class X ...`, or `X=<expr>`
// assignment/declarator - and splice that definition in before retrying.
// This converges on exactly the closure of code actually needed, regardless
// of what the minifier renamed everything to.

function extractTopLevelAssignmentValue(source, equalsIndex) {
  let i = equalsIndex + 1
  let depth = 0
  let inString = false
  let quote = ''
  let escaped = false

  for (; i < source.length; i += 1) {
    const char = source[i]

    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) inString = false
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = true
      quote = char
      continue
    }

    if (char === '{' || char === '(' || char === '[') depth += 1
    else if (char === '}' || char === ')' || char === ']') {
      if (depth === 0) break
      depth -= 1
    } else if (depth === 0 && (char === ',' || char === ';')) break
  }

  return source.slice(equalsIndex + 1, i).trim()
}

function findDeclarationStatement(bundleSource, name) {
  const escaped = escapeRegExp(name)

  const fnMatch = new RegExp(`(?<![A-Za-z0-9_$])function\\s+${escaped}\\s*\\(`).exec(bundleSource)
  if (fnMatch) return extractFunction(bundleSource, name)

  const classMatch = new RegExp(`(?<![A-Za-z0-9_$])class\\s+${escaped}(?:\\s|\\{)`).exec(
    bundleSource
  )
  if (classMatch) {
    const bodyStart = bundleSource.indexOf('{', classMatch.index)
    return bundleSource.slice(classMatch.index, bodyStart) + extractBalanced(bundleSource, bodyStart)
  }

  const assignMatch = new RegExp(`(?<![A-Za-z0-9_$.])${escaped}=(?!=)`).exec(bundleSource)
  if (assignMatch) {
    const equalsIndex = assignMatch.index + name.length
    const value = extractTopLevelAssignmentValue(bundleSource, equalsIndex)
    // `var` (rather than `const`) so self-referencing initializers (common
    // in compiled TS namespace/enum merges, e.g. `var Re=(s=>(...))(Re||{})`)
    // see a hoisted `undefined` instead of throwing a reference error.
    return `var ${name}=${value};`
  }

  return undefined
}

function evalWithAutoResolve(bundleSource, statements, resultExpression, context = {}) {
  const maxIterations = 5000
  // `resolved` maps name -> declaration text; `order` is the sequence they
  // should appear in so that each declaration's own dependencies (e.g. a
  // `class X extends Y` heritage clause, which - unlike function/var
  // hoisting - throws if evaluated before Y is initialized) already precede
  // it. We can't know the full dependency graph up front (the whole point
  // is that we don't know what a given bundle needs until we try running
  // it), so each newly discovered declaration is inserted right after the
  // last already-known declaration it references, rather than always at the
  // very front - otherwise a chain like "new thing depends on an
  // already-resolved thing" would silently reverse their order.
  const resolved = new Map()
  const order = []
  const extraPrelude = statements ?? ''

  const buildPrelude = () =>
    `${order.map((name) => resolved.get(name)).join('\n')}\n${extraPrelude}`

  const insertDeclaration = (name, text) => {
    // Strip string/template literal contents before checking for identifier
    // references: a short mangled name like `an` or `I` can otherwise
    // "match" ordinary English text inside an item/ability description
    // (e.g. "...with an unlockable Ability...") and be mistaken for a real
    // code dependency, corrupting the ordering.
    const codeOnly = stripStringAndTemplateLiterals(text)
    let insertAt = 0
    for (let i = 0; i < order.length; i += 1) {
      const pattern = new RegExp(`(?<![A-Za-z0-9_$.])${escapeRegExp(order[i])}(?![A-Za-z0-9_$])`)
      if (pattern.test(codeOnly)) insertAt = i + 1
    }
    order.splice(insertAt, 0, name)
    resolved.set(name, text)
  }

  for (let attempt = 0; attempt < maxIterations; attempt += 1) {
    try {
      return runStatements(buildPrelude(), resultExpression, context)
    } catch (error) {
      const message = error?.message ?? ''
      const notDefinedMatch = /^([A-Za-z_$][A-Za-z0-9_$]*) is not defined$/.exec(message)
      const tdzMatch = /^Cannot access '([A-Za-z_$][A-Za-z0-9_$]*)' before initialization$/.exec(
        message
      )

      if (tdzMatch && resolved.has(tdzMatch[1])) {
        // Our ordering heuristic guessed wrong for this one; pin it to the
        // very front (it clearly has no unmet dependency of its own, since
        // it was already successfully resolved) and retry.
        order.splice(order.indexOf(tdzMatch[1]), 1)
        order.unshift(tdzMatch[1])
        continue
      }

      if (!notDefinedMatch || resolved.has(notDefinedMatch[1])) throw error

      const name = notDefinedMatch[1]
      const declaration = findDeclarationStatement(bundleSource, name)
      if (!declaration) {
        throw new Error(
          `Could not resolve dependency "${name}" while evaluating bundle expression (${error.message})`
        )
      }

      insertDeclaration(name, declaration)
    }
  }

  throw new Error('Exceeded max iterations resolving bundle dependencies')
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

function toTsExpression(value, rawObjects = new WeakMap(), contentMap = null) {
  if (value instanceof RawCode) return value.code
  if (value && typeof value === 'object' && rawObjects.has(value)) {
    return rawObjects.get(value).code
  }
  if (value && typeof value === 'object' && !Array.isArray(value) && contentMap) {
    const match = contentMap.get(JSON.stringify(canonicalize(value)))
    if (match) return match.code
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => toTsExpression(item, rawObjects, contentMap)).join(',')}]`
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .filter(([, child]) => child !== undefined)
      .map(([key, child]) => `${objectKey(key)}:${toTsExpression(child, rawObjects, contentMap)}`)
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

// Stable content anchor: the first two keys of the exported loot table
// object (see src/utils/loot.ts). These are game data, not identifiers, so
// minifiers never rename them.
const LOOT_TABLE_FIRST_KEYS = ['emptyDropLoot', 'missionGoldLoot']

function extractBundleLootTables(bundleSource) {
  try {
    return runExpression(`(${extractAssignedObject(bundleSource, 'LOOT_TABLES')})`)
  } catch {
    return runExpression(`(${extractObjectByFirstKeys(bundleSource, LOOT_TABLE_FIRST_KEYS)})`)
  }
}

// Stable content anchor: the id of the game's currency item, always the
// first entry of the item definitions map (see src/utils/items.ts).
const ITEM_FIRST_KEYS = ['Gold', 'Gem']

function extractBundleItems(bundleSource) {
  const start = bundleSource.indexOf('const TAG_EQUIPMENT')
  const end = start === -1 ? -1 : bundleSource.indexOf('function itemDamageToDamageProfile', start)

  if (start !== -1 && end !== -1) {
    return runStatements(bundleSource.slice(start, end), 'ItemDefinitions')
  }

  // Newer bundles expose the item map through a compiled TS namespace/enum
  // merge object (`s.ItemDefinitions=an`). `.ItemDefinitions=` is a property
  // key on that namespace object (part of its public surface), so - unlike
  // the local variable it's assigned to - it is never renamed by the
  // minifier. `an` itself already has `id` merged into every entry.
  const namespaceMatch = /\.ItemDefinitions=([A-Za-z_$][A-Za-z0-9_$]*)/.exec(bundleSource)
  if (namespaceMatch) {
    return evalWithAutoResolve(bundleSource, '', `(${namespaceMatch[1]})`)
  }

  // Last resort: the map from item id to its (mangled) item-constant
  // identifier (`{Gold:Fce,Gem:Hce,...}`), located by its first two (stable)
  // item ids. This map is missing the `id` field (added by a later
  // `Object.entries(...).map(...)` step we didn't manage to find), so add
  // it back in manually.
  const itemMap = extractObjectByFirstKeys(bundleSource, ITEM_FIRST_KEYS)
  const items = evalWithAutoResolve(bundleSource, '', `(${itemMap})`)
  return Object.fromEntries(
    Object.entries(items).map(([id, item]) => [id, { ...item, id }])
  )
}

// Stable content anchor: an enemy id, always present as the first key of
// the internal enemy definitions map (see src/utils/enemies.ts).
const ENEMY_FIRST_KEY = 'golemBaby'

function extractBundleEnemyDefinitionsSource(bundleSource) {
  try {
    return extractObjectAfter(bundleSource, '_EnemyDefinitions=')
  } catch {
    const objectSource = extractDataObjectContainingKey(bundleSource, ENEMY_FIRST_KEY)
    if (!objectSource) {
      throw new Error('Could not find enemy definitions object in bundle')
    }
    return objectSource
  }
}

function extractBundleEnemies(bundleSource, lootTables) {
  const enemiesSource = extractBundleEnemyDefinitionsSource(bundleSource)
  const enemies = evalWithAutoResolve(bundleSource, '', `(${enemiesSource})`, {
    LOOT_TABLES: lootTables,
  })
  const spineScales = extractBundleEnemySpineScales(bundleSource, enemies)
  const enemyNames = extractBundleEnemyNames(bundleSource, enemies)

  for (const [enemyId, spineScale] of Object.entries(spineScales)) {
    if (enemies[enemyId]) enemies[enemyId].spineScale = spineScale
  }
  for (const [enemyId, name] of Object.entries(enemyNames)) {
    if (enemies[enemyId]) {
      const { id, name: _staleName, ...enemy } = enemies[enemyId]
      enemies[enemyId] = { id, name, ...enemy }
    }
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
  const end = start === -1 ? -1 : bundleSource.indexOf('ENEMY_DISPLAY_REGISTRY=', start)

  if (start !== -1 && end !== -1) {
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

  // Content-based fallback: display objects are identifiable by the
  // (stable, un-mangled) `displayName:` data key regardless of what the
  // enclosing variable/registry is named this build.
  const displayObjectScales = new Map()
  for (const [name, display] of extractBundleDisplayObjects(bundleSource)) {
    if (display.scale !== undefined) displayObjectScales.set(name, display.scale)
  }
  return displayObjectScales
}

// Every `IDENT={displayName:"...",...}` in the bundle, keyed by IDENT. The
// `displayName:` key is real game data (never mangled), so this needs no
// knowledge of the enclosing registry's (mangled) variable name.
function extractBundleDisplayObjects(bundleSource) {
  const displayObjects = new Map()

  for (const match of bundleSource.matchAll(
    /(?:const\s+|,)([A-Za-z_$][A-Za-z0-9_$]*)=\{displayName:"((?:\\.|[^"])*)"/g
  )) {
    const objectStart = bundleSource.indexOf('{', match.index)
    const objectSource = extractBalanced(bundleSource, objectStart)
    displayObjects.set(match[1], {
      displayName: JSON.parse(`"${match[2]}"`),
      scale: extractTopLevelNumericProperty(objectSource, 'scale'),
    })
  }

  return displayObjects
}

// Finds an alias/registry object (values are bare identifiers or calls like
// `variant(ident,"Name")`, never nested data objects) whose keys overlap
// heavily with known enemy ids. Falls back through a handful of known ids
// so a single coincidental match elsewhere in the bundle can't fool it.
function extractEnemyAliasRegistrySource(bundleSource, enemyIds) {
  const candidateIds = enemyIds.slice(0, 25)

  for (const id of candidateIds) {
    const objectSource = extractAliasObjectContainingKey(bundleSource, id, {
      minKeyOverlap: enemyIds,
    })
    if (objectSource) return objectSource
  }

  return undefined
}

// Matches Phaser display classes that override the default spine scale or
// display name for a specific spine asset, e.g.
// `class Foo extends Bar{constructor(...){super({...atlasKey:"robot_boss-atlas"...}),this.setScale(.22)}}`.
// Keyed by `spineAssetKey` (real game data) rather than by class name, so it
// connects back to enemy records without needing an `EnemyTypeToClass`-style
// mapping object at all.
function extractBundleSpineAssetClassOverrides(bundleSource, classScales, classDisplayNames) {
  const overridesBySpineAssetKey = new Map()
  const classPattern =
    /class\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+extends\s+[A-Za-z_$][A-Za-z0-9_$]*/g

  for (const match of bundleSource.matchAll(classPattern)) {
    const bodyStart = bundleSource.indexOf('{', match.index)
    if (bodyStart === -1) continue
    let classBody
    try {
      classBody = extractBalanced(bundleSource, bodyStart)
    } catch {
      continue
    }

    const atlasMatch = classBody.match(/atlasKey:"([A-Za-z0-9_]+)-atlas"/)
    if (!atlasMatch) continue

    overridesBySpineAssetKey.set(atlasMatch[1], {
      scale: classScales.get(match[1]),
      displayName: classDisplayNames.get(match[1]),
    })
  }

  return overridesBySpineAssetKey
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

function extractBundleEnemySpineScales(bundleSource, enemies = {}) {
  const displayObjectScales = extractBundleDisplayObjectSpineScales(bundleSource)
  const classScales = extractBundleClassSpineScales(bundleSource)
  const enemyIds = Object.keys(enemies)
  const enemySpineScales = {}

  let registrySource
  try {
    registrySource = extractObjectAfter(bundleSource, 'ENEMY_DISPLAY_REGISTRY=')
  } catch {
    registrySource = extractEnemyAliasRegistrySource(bundleSource, enemyIds)
  }

  if (registrySource) {
    for (const entry of splitTopLevelObjectEntries(registrySource)) {
      const variant = entry.match(
        /^([A-Za-z_$][A-Za-z0-9_$]*):[A-Za-z_$][A-Za-z0-9_$]*\(([A-Za-z_$][A-Za-z0-9_$]*),/
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
  }

  let typeToClassSource
  try {
    typeToClassSource = extractObjectAfter(bundleSource, 'EnemyTypeToClass=')
  } catch {
    // Not present in this build; the spineAssetKey-based lookup below
    // covers the equivalent bundles that no longer expose this mapping.
  }

  if (typeToClassSource) {
    for (const entry of splitTopLevelObjectEntries(typeToClassSource)) {
      const mappedClass = entry.match(
        /^([A-Za-z_$][A-Za-z0-9_$]*):([A-Za-z_$][A-Za-z0-9_$]*)$/
      )
      if (!mappedClass) continue

      const spineScale = classScales.get(mappedClass[2])
      if (spineScale !== undefined) enemySpineScales[mappedClass[1]] = spineScale
    }
  }

  // Content-based fallback/enrichment: match custom Phaser display classes
  // to enemies via `atlasKey:"<spineAssetKey>-atlas"`, which links back to
  // an enemy's own (real, un-mangled) `spineAssetKey` field.
  const spineAssetOverrides = extractBundleSpineAssetClassOverrides(
    bundleSource,
    classScales,
    extractBundleClassDisplayNames(bundleSource)
  )
  for (const [enemyId, enemy] of Object.entries(enemies)) {
    const override = enemy.spineAssetKey && spineAssetOverrides.get(enemy.spineAssetKey)
    if (override?.scale !== undefined) enemySpineScales[enemyId] = override.scale
  }

  return enemySpineScales
}

// Stable content anchor: one of the food image filenames from
// src/utils/foods.ts. File names are asset references (real data), never
// identifiers, so they survive minification untouched.
const FOOD_FIRST_KEY = 'Bacon_Cooked.png'

function extractBundleFoods(bundleSource) {
  try {
    return runExpression(`(${extractObjectAfter(bundleSource, 'essencesByImageName=')})`)
  } catch {
    return runExpression(`(${extractObjectByFirstKeys(bundleSource, [FOOD_FIRST_KEY])})`)
  }
}

// Stable content anchors: the first environment key of each map's spawn
// table (see src/utils/mapEnemies.ts). Distinguished from each other (and
// from unrelated bundle objects that reuse the same environment key, e.g.
// loot-table or display-name lookups) by requiring the matched entry's
// value to look like loot-table shaped data (`{type:...`).
const MAP_ENEMY_FIRST_KEY = 'castle_road'
const MAP_BOSS_FIRST_KEY = 'weapons_market'

function extractBundleMapEnemies(bundleSource) {
  let enemies
  let bosses

  try {
    enemies = runExpression(
      `(${extractObjectAfter(bundleSource, 'enemySpawnTableByEnvironment=')})`
    )
  } catch {
    enemies = runExpression(
      `(${extractObjectByFirstKeys(bundleSource, [MAP_ENEMY_FIRST_KEY], {
        requireObjectValue: true,
      })})`
    )
  }

  try {
    bosses = runExpression(`(${extractObjectAfter(bundleSource, 'bossSpawnTableByEnvironment=')})`)
  } catch {
    bosses = runExpression(
      `(${extractObjectByFirstKeys(bundleSource, [MAP_BOSS_FIRST_KEY], {
        requireObjectValue: true,
      })})`
    )
  }

  return { enemies, bosses }
}

// Stable content anchor: the first quest id from src/utils/quests.ts. Quest
// ids/descriptions are real data, so they survive minification even though
// the helper functions used inside each quest (day/minute conversion,
// progress trackers) get renamed every build.
const QUEST_FIRST_KEY = 'collect_spicy_essence'

function findQuestsObjectSource(bundleSource) {
  const questStart = bundleSource.indexOf('DEFAULT_EXPIRES_SEC=days(1),_quests=')
  if (questStart !== -1) {
    const objectStart = bundleSource.indexOf('{', questStart)
    return extractBalanced(bundleSource, objectStart)
  }

  return extractObjectByFirstKeys(bundleSource, [QUEST_FIRST_KEY], { requireObjectValue: true })
}

function extractBundleQuests(bundleSource) {
  const questsSource = findQuestsObjectSource(bundleSource)

  // The quest object references helper functions/enums (day & minute
  // converters, progress trackers, an encounter-type enum) by whatever name
  // this build's minifier assigned them. We don't need their *behavior* -
  // only `expiresSeconds` (a real number) and `type`/`description`/
  // `rewardTiers` (plain data) survive into the final output - but the
  // object literal still has to evaluate without throwing, so resolve
  // whatever it references from the bundle itself rather than guessing
  // fixed names.
  const rawQuests = evalWithAutoResolve(bundleSource, '', `(${questsSource})`)

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

// Stable content anchor: the `vaultGoldLoot`/`vaultResourceLoot`/
// `vaultEquipLoot` property keys. Even when the underlying loot tables are
// built from mangled local variables, bundlers preserve a wrapper object's
// literal key names (e.g. `{vaultGoldLoot:nae,vaultResourceLoot:rae,...}`).
const VAULT_LOOT_FIRST_KEYS = ['vaultGoldLoot', 'vaultResourceLoot', 'vaultEquipLoot']

function extractBundleVaultLoot(bundleSource) {
  try {
    return {
      vaultGoldLoot: runExpression(`(${extractObjectAfter(bundleSource, 'vaultGoldLoot=')})`),
      vaultResourceLoot: runExpression(
        `(${extractObjectAfter(bundleSource, 'vaultResourceLoot=')})`
      ),
      vaultEquipLoot: runExpression(`(${extractObjectAfter(bundleSource, 'vaultEquipLoot=')})`),
    }
  } catch {
    const wrapperSource = extractObjectByFirstKeys(bundleSource, VAULT_LOOT_FIRST_KEYS)
    return evalWithAutoResolve(bundleSource, '', `(${wrapperSource})`)
  }
}

// Stable content anchors: ability ids, which are game data referenced from
// item definitions (`abilities:[{id:"DefaultAttack",...}]`), so they show up
// unchanged as the ability registry's own object keys.
const ABILITY_REGISTRY_FIRST_KEYS = ['DefaultAttack', 'DoNothing']

function findAbilityRegistrySource(bundleSource) {
  try {
    return extractAssignedObject(bundleSource, 'abilityRegistry')
  } catch {
    return extractObjectByFirstKeys(bundleSource, ABILITY_REGISTRY_FIRST_KEYS)
  }
}

function extractBundleAbilityNames(bundleSource, items) {
  const registrySource = findAbilityRegistrySource(bundleSource)

  // Rather than hunting for `loadAbilityFromId`/`loadAbility`-style wrapper
  // functions (whose names are re-mangled every build), call the registry's
  // own factory functions directly - `registry[id]()` and
  // `registry[id](params)` are exactly what those wrappers did anyway. Any
  // ability class the registry references gets pulled in automatically by
  // evalWithAutoResolve the first time its constructor is actually invoked.
  const itemAbilityParams = {}
  for (const item of Object.values(items)) {
    for (const ability of item.abilities ?? []) {
      if (!ability.params || Object.keys(ability.params).length === 0) continue
      itemAbilityParams[ability.id] ??= []
      itemAbilityParams[ability.id].push(ability.params)
    }
  }

  const statements = `
    const __registry = (${registrySource});
    const __abilityNameMap = {};
    for (const __id of Object.keys(__registry)) {
      const __ability = __registry[__id]();
      __abilityNameMap[__id] = { name: __ability.name, description: __ability.description };
    }
    const __abilityParamDescriptionMap = {};
    for (const [__id, __paramsList] of Object.entries(__itemAbilityParams)) {
      __abilityParamDescriptionMap[__id] = {};
      for (const __params of __paramsList) {
        __abilityParamDescriptionMap[__id][__abilityParamKey(__params)] =
          __registry[__id](__params).description;
      }
    }
  `

  return evalWithAutoResolve(
    bundleSource,
    statements,
    '({ abilityNameMap: __abilityNameMap, abilityParamDescriptionMap: __abilityParamDescriptionMap })',
    { __itemAbilityParams: itemAbilityParams, __abilityParamKey: abilityParamKey }
  )
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
    if (!mappedClass) continue

    const displayName = classDisplayNames.get(mappedClass[2])
    if (displayName) enemyNames[mappedClass[1]] = displayName
  }
}

function extractBundleEnemyNames(bundleSource, enemies = {}) {
  const displayNames = new Map()
  for (const match of bundleSource.matchAll(
    /(?:const\s+|,)([A-Za-z_$][A-Za-z0-9_$]*)=\{displayName:"((?:\\"|[^"])*)"/g
  )) {
    displayNames.set(match[1], JSON.parse(`"${match[2]}"`))
  }
  const classDisplayNames = extractBundleClassDisplayNames(bundleSource)

  let registrySource
  try {
    registrySource = extractObjectAfter(bundleSource, 'ENEMY_DISPLAY_REGISTRY=')
  } catch {
    registrySource = extractEnemyAliasRegistrySource(bundleSource, Object.keys(enemies))
  }

  const enemyNames = {}

  if (registrySource) {
    for (const entry of splitTopLevelObjectEntries(registrySource)) {
      const variant = entry.match(
        /^([A-Za-z_$][A-Za-z0-9_$]*):[A-Za-z_$][A-Za-z0-9_$]*\([A-Za-z_$][A-Za-z0-9_$]*,"((?:\\"|[^"])*)"\)$/
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
  }

  addEnemyTypeClassNames(bundleSource, enemyNames, classDisplayNames)

  // Content-based fallback/enrichment via spineAssetKey <-> atlasKey, same
  // mechanism used for spine scale overrides above.
  const spineAssetOverrides = extractBundleSpineAssetClassOverrides(
    bundleSource,
    extractBundleClassSpineScales(bundleSource),
    classDisplayNames
  )
  for (const [enemyId, enemy] of Object.entries(enemies)) {
    const override = enemy.spineAssetKey && spineAssetOverrides.get(enemy.spineAssetKey)
    if (override?.displayName) enemyNames[enemyId] = override.displayName
  }

  return enemyNames
}

// `getUpgradeCost` is a public method name (a property key), which
// minifiers never rename - only the free function it may delegate to (e.g.
// `getUpgradeCost(e){return Wp(e)}`) gets a fresh mangled name every build.
function findLevelCostFunctionSource(bundleSource) {
  try {
    return extractFunction(bundleSource, 'getUpgradeCost')
  } catch {
    const methodMatch = /(?:^|[;{},])getUpgradeCost\(([A-Za-z_$][A-Za-z0-9_$]*)\)\{/.exec(
      bundleSource
    )
    if (!methodMatch) throw new Error('Could not find getUpgradeCost in bundle')

    const bodyStart = bundleSource.indexOf('{', methodMatch.index + methodMatch[0].indexOf('{'))
    const paramName = methodMatch[1]
    const body = extractBalanced(bundleSource, bodyStart)
    const delegate = new RegExp(
      `^\\{return\\s+([A-Za-z_$][A-Za-z0-9_$]*)\\(${escapeRegExp(paramName)}\\)\\}$`
    ).exec(body)

    if (delegate) return extractFunction(bundleSource, delegate[1])

    return `function getUpgradeCost(${paramName})${body}`
  }
}

function extractBundleLevelCostFunction(bundleSource) {
  const functionSource = findLevelCostFunctionSource(bundleSource)
  const costFunction = evalWithAutoResolve(bundleSource, functionSource, functionSource.match(
    /function\s+([A-Za-z_$][A-Za-z0-9_$]*)/
  )[1], { Math })
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
      const contentMap = new Map()
      for (const [name, lootTable] of Object.entries(lootTables)) {
        const key = JSON.stringify(canonicalize(lootTable))
        if (!contentMap.has(key)) contentMap.set(key, new RawCode(`et.${name}`))
      }
      return formatTypescript(
        `import type { Enemy } from '../types'\nimport { et } from './loot'\n\nexport const z3: Record<string, Enemy> = ${toTsExpression(expected, rawObjects, contentMap)}\n`
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
      const paramName = expected.functionSource.match(
        /function\s+[A-Za-z_$][A-Za-z0-9_$]*\(([A-Za-z_$][A-Za-z0-9_$]*)\)/
      )[1]
      const body = getFunctionBody(expected.functionSource)
        .replace(new RegExp(`\\b${escapeRegExp(paramName)}\\b`, 'g'), 'level')
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
