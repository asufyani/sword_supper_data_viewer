import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('App aggregates standard loot and vault loot into item drop locations', () => {
  const source = fs.readFileSync('src/App.tsx', 'utf8')

  assert.match(
    source,
    /import \{ vaultLootTables \} from '\.\/utils\/vaultLoot'/
  )
  assert.ok(source.includes('[et, vaultLootTables as Record<string, LootTable>]'))
  assert.match(
    source,
    /Object\.keys\(lootTables\)\.forEach\(\(lootTableName\) => \{/
  )
  assert.match(
    source,
    /itemDropLocations\[item\.id\]\[\`\$\{lootTableName\} \$\{levels\}\`\] =/
  )
})
