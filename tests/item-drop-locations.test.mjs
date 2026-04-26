import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('App aggregates standard loot and vault loot into item drop locations', () => {
  const source = fs.readFileSync('src/App.tsx', 'utf8')
  const utilitySource = fs.readFileSync('src/utils/itemDropLocations.ts', 'utf8')

  assert.match(
    source,
    /import \{ vaultLootTables \} from '\.\/utils\/vaultLoot'/
  )
  assert.match(
    source,
    /import \{\s*buildEnemyNamesByLootTable,\s*buildItemDropLocations,\s*\} from '\.\/utils\/itemDropLocations'/
  )
  assert.match(
    source,
    /const enemyNamesByLootTable = buildEnemyNamesByLootTable\(/
  )
  assert.match(source, /const itemDropLocations = buildItemDropLocations\(/)
  assert.match(utilitySource, /mountainPassEquipLoot:\s*'Mountain Pass gear pool'/)
  assert.match(
    utilitySource,
    /bossRushMountainPassEquipLoot:\s*'Boss Rush: Mountain Pass gear pool'/
  )
  assert.match(utilitySource, /vaultEquipLoot:\s*'Daily Dungeon vault gear pool'/)
  assert.match(utilitySource, /enemyNamesByLootTable\[lootTableName\]/)
  assert.doesNotMatch(
    source,
    /itemDropLocations\[item\.id\]\[\`\$\{lootTableName\} \$\{levels\}\`\] =/
  )
})
