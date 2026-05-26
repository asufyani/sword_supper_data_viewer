import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

function loadTsModule(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  })
  const context = { exports: {} }

  vm.runInNewContext(outputText, context)

  return context.exports
}

function plain(value) {
  return JSON.parse(JSON.stringify(value))
}

function testEnemy() {
  return {
    id: 'testEnemy',
    spineAssetKey: 'test',
    damageType: 'physical',
    baseHp: 1,
    hpGrowth: 1,
    baseDamage: 1,
    damageGrowth: 1,
    baseDefense: 1,
    defenseGrowth: 1,
    speed: 1,
    crit: 0,
    dodge: 0,
    lootTables: [],
    tags: [],
    lightningResist: 0.3,
    fireResist: -0.2,
    hypnotizeResist: 0.3,
    weakResist: 0.2,
    levelOverrides: [
      {
        minLevel: 81,
        maxLevel: 90,
        resistOverrides: {
          fireResist: 0.2,
          shadowResist: 0.2,
          hypnotizeResist: 1,
        },
      },
      {
        minLevel: 101,
        abilities: [{ id: 'DefaultAttack' }],
      },
    ],
  }
}

test('enemy resistance rows include status resistances and active level overrides', () => {
  const { getEnemyResistanceRows } = loadTsModule(
    'src/utils/enemyResistances.ts'
  )

  assert.deepEqual(plain(getEnemyResistanceRows(testEnemy(), 80)), [
    { key: 'lightningResist', value: 0.3 },
    { key: 'fireResist', value: -0.2 },
    { key: 'weakResist', value: 0.2 },
    { key: 'hypnotizeResist', value: 0.3 },
  ])

  assert.deepEqual(plain(getEnemyResistanceRows(testEnemy(), 95)), [
    { key: 'shadowResist', value: 0.2 },
    { key: 'lightningResist', value: 0.3 },
    { key: 'fireResist', value: 0.2 },
    { key: 'weakResist', value: 0.2 },
    { key: 'hypnotizeResist', value: 1 },
  ])

  assert.deepEqual(plain(getEnemyResistanceRows(testEnemy(), 101)), [
    { key: 'lightningResist', value: 0.3 },
    { key: 'fireResist', value: -0.2 },
    { key: 'weakResist', value: 0.2 },
    { key: 'hypnotizeResist', value: 0.3 },
  ])
})
