import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('item source includes bundled richer item data', () => {
  const itemsSource = fs.readFileSync('src/utils/items.ts', 'utf8')
  const typesSource = fs.readFileSync('src/types.tsx', 'utf8')

  assert.match(itemsSource, /SouleaterAxe:\s+\{/)
  assert.match(itemsSource, /VigilLocket:\s+\{/)
  assert.match(itemsSource, /id: 'SouleaterAxe'/)
  assert.match(typesSource, /'mythic'/)
  assert.match(typesSource, /params\?: Record<string, number>/)
  assert.match(typesSource, /modifierType: 'add' \| 'multiply'/)
  assert.match(typesSource, /\| 'Hat'/)
  assert.match(typesSource, /\| 'Cloak'/)
  assert.match(typesSource, /\| 'Shirt'/)
})
