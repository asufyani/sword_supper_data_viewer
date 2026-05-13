import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { resolveBundlePath, syncBundleData } from '../scripts/sync_bundle_data.mjs'

const bundleSource = `
const vaultGoldLoot={type:"oneOf",tiers:[{minLevel:1,items:[{id:"Gold",weight:1,quantity:[500,700]}]}]},
vaultResourceLoot={type:"oneOf",tiers:[{minLevel:1,items:[{id:"Luminite",weight:10,quantity:[2,4]}]}]},
vaultEquipLoot={type:"oneOf",tiers:[{minLevel:1,items:[{id:"ChippedShortsword",weight:12}]}]};
`

const lootBundleSource = `
const ENVIRONMENT_LOOT_TABLES={mossy_forest:"mossyForestLoot"},LOOT_TABLES={mossyForestLoot:{type:"always",tiers:[{minLevel:1,items:[{id:"Gold",quantity:[10,20]}]}]}};
`

const enemyNamesBundleSource = `
const golemBaby={displayName:"Baby Golem",spineAssetKey:"golem_baby"};
const ENEMY_DISPLAY_REGISTRY={golemBaby};
const _EnemyDefinitions={
  golemBaby:{id:"golemBaby"},
  poisonDemon:{id:"poisonDemon"},
  blossomGolem:{id:"blossomGolem"},
  robotNo5Lucky:{id:"robotNo5Lucky"}
};
class PoisonDemon extends DisplayCharacter{constructor({scene:e,x:i}){super({displayName:"PoisonDemon"}),this.displayName="Toxic Winged Shadeborn"}}
class BlossomGolem extends DisplayCharacter{constructor({scene:e,x:i}){super({displayName:"Blossom Golem"})}}
class RobotNo5 {}
function createDisplayNameVariant(x,e){return class extends x{constructor(...i){super(...i),this.displayName=e}}}
const RobotNo5Lucky=createDisplayNameVariant(RobotNo5,"Loaded Robot 5");
const EnemyTypeToClass={poisonDemon:PoisonDemon,blossomGolem:BlossomGolem,robotNo5Lucky:RobotNo5Lucky};
`

const staleVaultLootSource = `export const vt = {
  vaultGoldLoot: {
    type: 'oneOf',
    tiers: [
      {
        minLevel: 1,
        items: [
          {
            id: 'Gold',
            weight: 1,
            quantity: [1, 2],
          },
        ],
      },
    ],
  },
  vaultResourceLoot: {
    type: 'oneOf',
    tiers: [],
  },
  vaultEquipLoot: {
    type: 'oneOf',
    tiers: [],
  },
}

export const vaultLootTables = vt
`

async function withTempProject(callback) {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-bundle-data-'))
  const utilsDir = path.join(rootDir, 'src', 'utils')
  const bundlePath = path.join(rootDir, 'index-test.js')
  const vaultLootPath = path.join(utilsDir, 'vaultLoot.ts')

  await fs.mkdir(utilsDir, { recursive: true })
  await fs.writeFile(bundlePath, bundleSource)
  await fs.writeFile(vaultLootPath, staleVaultLootSource)

  try {
    await callback({ rootDir, bundlePath, vaultLootPath })
  } finally {
    await fs.rm(rootDir, { recursive: true, force: true })
  }
}

async function withTempEnemyNamesProject(callback) {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-enemy-names-'))
  const utilsDir = path.join(rootDir, 'src', 'utils')
  const bundlePath = path.join(rootDir, 'index-test.js')
  const enemyNamesPath = path.join(utilsDir, 'enemyNames.ts')

  await fs.mkdir(utilsDir, { recursive: true })
  await fs.writeFile(bundlePath, enemyNamesBundleSource)
  await fs.writeFile(
    enemyNamesPath,
    `export const enemyNames: Record<string, string> = {}
`
  )

  try {
    await callback({ rootDir, bundlePath, enemyNamesPath })
  } finally {
    await fs.rm(rootDir, { recursive: true, force: true })
  }
}

test('syncBundleData reports drift without writing in check mode', async () => {
  await withTempProject(async ({ rootDir, bundlePath, vaultLootPath }) => {
    const before = await fs.readFile(vaultLootPath, 'utf8')
    const result = await syncBundleData({
      rootDir,
      bundlePath,
      targets: ['vaultLoot'],
      write: false,
    })
    const after = await fs.readFile(vaultLootPath, 'utf8')

    assert.equal(result.hasChanges, true)
    assert.deepEqual(result.results, [
      {
        target: 'vaultLoot',
        filePath: path.join(rootDir, 'src', 'utils', 'vaultLoot.ts'),
        status: 'different',
        written: false,
      },
    ])
    assert.equal(after, before)
  })
})

test('syncBundleData updates generated utils in write mode', async () => {
  await withTempProject(async ({ rootDir, bundlePath, vaultLootPath }) => {
    const result = await syncBundleData({
      rootDir,
      bundlePath,
      targets: ['vaultLoot'],
      write: true,
    })
    const source = await fs.readFile(vaultLootPath, 'utf8')

    assert.equal(result.hasChanges, true)
    assert.equal(result.results[0].status, 'different')
    assert.equal(result.results[0].written, true)
    assert.match(source, /quantity: \[500, 700\]/)
    assert.match(source, /export const vaultLootTables = vt/)
  })
})

test('syncBundleData extracts LOOT_TABLES without matching ENVIRONMENT_LOOT_TABLES', async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-bundle-loot-'))
  const utilsDir = path.join(rootDir, 'src', 'utils')
  const bundlePath = path.join(rootDir, 'index-test.js')
  const lootPath = path.join(utilsDir, 'loot.ts')

  await fs.mkdir(utilsDir, { recursive: true })
  await fs.writeFile(bundlePath, lootBundleSource)
  await fs.writeFile(
    lootPath,
    `import { type LootTable } from '../types'

export const et: Record<string, LootTable> = {}
`
  )

  try {
    await syncBundleData({
      rootDir,
      bundlePath,
      targets: ['loot'],
      write: true,
    })
    const source = await fs.readFile(lootPath, 'utf8')

    assert.match(source, /mossyForestLoot/)
    assert.match(source, /quantity: \[10, 20\]/)
    assert.doesNotMatch(source, /mossy_forest/)
  } finally {
    await fs.rm(rootDir, { recursive: true, force: true })
  }
})

test('syncBundleData keeps enemyNames complete for bundled enemy definitions', async () => {
  await withTempEnemyNamesProject(async ({ rootDir, bundlePath, enemyNamesPath }) => {
    await syncBundleData({
      rootDir,
      bundlePath,
      targets: ['enemyNames'],
      write: true,
    })
    const source = await fs.readFile(enemyNamesPath, 'utf8')

    assert.match(source, /golemBaby: 'Baby Golem'/)
    assert.match(source, /poisonDemon: 'Toxic Winged Shadeborn'/)
    assert.match(source, /blossomGolem: 'Blossom Golem'/)
    assert.match(source, /robotNo5Lucky: 'Loaded Robot 5'/)
  })
})

test('resolveBundlePath prefers a root bundle over built viewer assets', async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-bundle-path-'))
  const rootBundlePath = path.join(rootDir, 'index-root.js')
  const distDir = path.join(rootDir, 'dist', 'assets')
  const distBundlePath = path.join(distDir, 'index-dist.js')

  await fs.mkdir(distDir, { recursive: true })
  await fs.writeFile(rootBundlePath, '// root bundle')
  await fs.writeFile(distBundlePath, '// built viewer bundle')

  try {
    assert.equal(await resolveBundlePath(rootDir), rootBundlePath)
  } finally {
    await fs.rm(rootDir, { recursive: true, force: true })
  }
})
