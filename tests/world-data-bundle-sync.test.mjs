import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

function extractBalancedObject(source, objectStart) {
  let i = objectStart
  let depth = 0
  let inStr = false
  let quote = ''
  let esc = false

  for (; i < source.length; i++) {
    const ch = source[i]

    if (inStr) {
      if (esc) esc = false
      else if (ch === '\\') esc = true
      else if (ch === quote) {
        inStr = false
        quote = ''
      }
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = true
      quote = ch
      continue
    }

    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return source.slice(objectStart, i + 1)
    }
  }

  throw new Error('Unbalanced object')
}

function loadExportObject(filePath, exportName, nextExportName) {
  const source = fs.readFileSync(filePath, 'utf8')
  const start = source.indexOf(`export const ${exportName} =`)
  const end = nextExportName
    ? source.indexOf(`export const ${nextExportName} =`, start)
    : source.length
  const context = { result: null }

  vm.createContext(context)
  vm.runInContext(
    'result=' +
      source.slice(start + `export const ${exportName} =`.length, end),
    context
  )

  return context.result
}

function assertJsonEqual(actual, expected) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected))
}

test('foods, map enemies, and quests stay aligned with the bundle', () => {
  const bundle = fs.readFileSync('public/index-CGcaOcB4.js', 'utf8')

  const foodsStart = bundle.indexOf('essencesByImageName=')
  const foodsObjectStart = bundle.indexOf('{', foodsStart)
  const bundleFoods = vm.runInNewContext(
    '(' + extractBalancedObject(bundle, foodsObjectStart) + ')'
  )

  const enemyStart = bundle.indexOf('enemySpawnTableByEnvironment=')
  const enemyObjectStart = bundle.indexOf('{', enemyStart)
  const bundleEnemies = vm.runInNewContext(
    '(' + extractBalancedObject(bundle, enemyObjectStart) + ')'
  )

  const bossStart = bundle.indexOf('bossSpawnTableByEnvironment=')
  const bossObjectStart = bundle.indexOf('{', bossStart)
  const bundleBosses = vm.runInNewContext(
    '(' + extractBalancedObject(bundle, bossObjectStart) + ')'
  )

  const questStart = bundle.indexOf('DEFAULT_EXPIRES_SEC=days(1),_quests=')
  const questObjectStart = bundle.indexOf('{', questStart)
  const questContext = {
    result: null,
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
  vm.createContext(questContext)
  vm.runInContext(
    'result=' + extractBalancedObject(bundle, questObjectStart),
    questContext
  )
  const bundleQuests = Object.fromEntries(
    Object.entries(questContext.result).map(([id, quest]) => [
      id,
      {
        type: quest.type,
        description: quest.description,
        rewardTiers: quest.rewardTiers,
        expiresSeconds: quest.expiresSeconds,
      },
    ])
  )

  const localFoods = loadExportObject(
    'src/utils/foods.ts',
    'foods',
    'foodNames'
  )
  const localEnemies = loadExportObject('src/utils/mapEnemies.ts', 'Z0', '$0')
  const localBosses = loadExportObject('src/utils/mapEnemies.ts', '$0')
  const localQuests = loadExportObject('src/utils/quests.ts', 'quests')

  assertJsonEqual(localFoods, bundleFoods)
  assertJsonEqual(localEnemies, bundleEnemies)
  assertJsonEqual(localBosses, bundleBosses)
  assertJsonEqual(localQuests, bundleQuests)

  assert.ok(localEnemies.ancient_battlefield)
  assert.ok(localEnemies.haunted_forest)
  assert.ok(localBosses.winter_festival)
  assert.equal(localQuests.collect_equipment.description, 'Collect Gear')
  assert.ok(localQuests.kill_shadow_enemies_scarf)
})
