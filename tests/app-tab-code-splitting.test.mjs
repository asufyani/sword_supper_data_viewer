import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('App lazy-loads tab panels and keeps loaded tabs mounted', () => {
  const appSource = fs.readFileSync('src/App.tsx', 'utf8')

  assert.match(appSource, /React\.lazy\(\(\) => import\('\.\/LootTable'\)\)/)
  assert.match(appSource, /React\.lazy\(\(\) => import\('\.\/EnemyTable'\)\)/)
  assert.match(appSource, /<Suspense fallback=/)
  assert.match(appSource, /loadedTabs\.has\(/)
  assert.match(appSource, /setLoadedTabs\(\(current\) => new Set\(current\)\.add\(newValue\)\)/)
})
