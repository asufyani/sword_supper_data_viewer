import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('search-driven tabs use labeled text fields', () => {
  const expectations = [
    ['src/WeaponTable.tsx', 'Search weapons'],
    ['src/ArmorTable.tsx', 'Search armor'],
    ['src/BlueprintTable.tsx', 'Search blueprints'],
    ['src/LootTable.tsx', 'Search loot'],
    ['src/EnemyTable.tsx', 'Search enemies'],
    ['src/FoodTable.tsx', 'Search essences'],
    ['src/AbilityTable.tsx', 'Search abilities'],
  ]

  expectations.forEach(([filePath, label]) => {
    const source = fs.readFileSync(filePath, 'utf8')
    assert.match(source, new RegExp(`label="${label}"`))
  })
})
