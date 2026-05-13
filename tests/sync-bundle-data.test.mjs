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

const enemyScalesBundleSource = `
const LOOT_TABLES={};
function variant(x,e){return{...x,displayName:e}}
const mushroomLarge={displayName:"Erin-guy",spineAssetKey:"mushroom_large",scale:.4,origin:{x:.5,y:1},vfxOverrides:{default:{scale:.75}}},
livingArmorCute={displayName:"Tiny Revenant",spineAssetKey:"livingArmorCute",scale:.16},
robotBoss={displayName:"Slumbering Guardian-X5",spineAssetKey:"robot_boss"};
const ENEMY_DISPLAY_REGISTRY={mushroomLarge,mushroomLargeBoss:variant(mushroomLarge,"Boss Mushroom"),livingArmorCute,robotBoss};
const _EnemyDefinitions={
  mushroomLarge:{id:"mushroomLarge",lootTables:[]},
  mushroomLargeBoss:{id:"mushroomLargeBoss",lootTables:[]},
  livingArmorCute:{id:"livingArmorCute",lootTables:[]},
  robotBoss:{id:"robotBoss",lootTables:[]},
  skeleton:{id:"skeleton",lootTables:[]}
};
class RobotBoss extends DisplayCharacter{constructor(){super({displayName:"Robot Boss"}),this.setScale(.22),this.updateAttackVfxConfig("rage",{scale:2})}}
const EnemyTypeToClass={robotBoss:RobotBoss};
`

const abilityNamesBundleSource = `
function validateAbilityParams(x,e,i){}
class TestAbility{constructor(e){this.name="Test Ability",this.amount=typeof(e==null?void 0:e.amount)=="number"?e.amount:.5,this.description="Use "+Math.round(this.amount*100)+"% power."}}
class PlainAbility{constructor(){this.name="Plain Ability",this.description="Plain description."}}
const abilityRegistry={TestAbility:x=>new TestAbility(x),PlainAbility:()=>new PlainAbility};
function loadAbilityFromId(x){return abilityRegistry[x]()}
function loadAbility(x){return abilityRegistry[x.id](x.params)}
const DEFAULT_WEAPON_DAMAGE={};
const TAG_EQUIPMENT="equipment";
const ItemDefinitions={
  TestItem:{id:"TestItem",abilities:[{id:"TestAbility",params:{amount:.25}}]},
  PlainItem:{id:"PlainItem",abilities:[{id:"PlainAbility"}]}
};
function itemDamageToDamageProfile(){}
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

async function withTempEnemyScalesProject(callback) {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-enemy-scales-'))
  const utilsDir = path.join(rootDir, 'src', 'utils')
  const bundlePath = path.join(rootDir, 'index-test.js')
  const enemiesPath = path.join(utilsDir, 'enemies.ts')

  await fs.mkdir(utilsDir, { recursive: true })
  await fs.writeFile(bundlePath, enemyScalesBundleSource)
  await fs.writeFile(
    path.join(utilsDir, 'loot.ts'),
    `export const et = {}
`
  )
  await fs.writeFile(
    enemiesPath,
    `export const z3 = {
  mushroomLarge: { id: 'mushroomLarge', lootTables: [] },
  mushroomLargeBoss: { id: 'mushroomLargeBoss', lootTables: [] },
  livingArmorCute: { id: 'livingArmorCute', lootTables: [] },
  robotBoss: { id: 'robotBoss', lootTables: [] },
  skeleton: { id: 'skeleton', lootTables: [] },
}
`
  )

  try {
    await callback({ rootDir, bundlePath, enemiesPath })
  } finally {
    await fs.rm(rootDir, { recursive: true, force: true })
  }
}

async function withTempAbilityNamesProject(callback) {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-ability-names-'))
  const utilsDir = path.join(rootDir, 'src', 'utils')
  const bundlePath = path.join(rootDir, 'index-test.js')
  const abilityNamesPath = path.join(utilsDir, 'abilityNames.ts')

  await fs.mkdir(utilsDir, { recursive: true })
  await fs.writeFile(bundlePath, abilityNamesBundleSource)
  await fs.writeFile(
    abilityNamesPath,
    `export const abilityNameMap = {}
`
  )

  try {
    await callback({ rootDir, bundlePath, abilityNamesPath })
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

test('syncBundleData includes display scale in generated enemy records', async () => {
  await withTempEnemyScalesProject(async ({ rootDir, bundlePath, enemiesPath }) => {
    await syncBundleData({
      rootDir,
      bundlePath,
      targets: ['enemies'],
      write: true,
    })
    const source = await fs.readFile(enemiesPath, 'utf8')

    assert.match(source, /mushroomLarge:[\s\S]*spineScale: 0\.4/)
    assert.match(source, /mushroomLargeBoss:[\s\S]*spineScale: 0\.4/)
    assert.match(source, /livingArmorCute:[\s\S]*spineScale: 0\.16/)
    assert.match(source, /robotBoss:[\s\S]*spineScale: 0\.22/)
    assert.doesNotMatch(source, /skeleton:[\s\S]*spineScale/)
  })
})

test('syncBundleData generates ability descriptions for item ability params', async () => {
  await withTempAbilityNamesProject(
    async ({ rootDir, bundlePath, abilityNamesPath }) => {
      await syncBundleData({
        rootDir,
        bundlePath,
        targets: ['abilityNames'],
        write: true,
      })
      const source = await fs.readFile(abilityNamesPath, 'utf8')

      assert.match(source, /export const abilityNameMap =/)
      assert.match(source, /TestAbility:[\s\S]*description: 'Use 50% power\.'/)
      assert.match(source, /export const abilityParamDescriptionMap/)
      assert.match(source, /TestAbility:[\s\S]*'\{"amount":0\.25\}': 'Use 25% power\.'/)
      assert.doesNotMatch(source, /PlainAbility:[\s\S]*Plain description[\s\S]*\{\}/)
    }
  )
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
