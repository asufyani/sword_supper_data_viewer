import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('enemy source includes bundled richer enemy data', () => {
  const enemiesSource = fs.readFileSync('src/utils/enemies.ts', 'utf8')
  const typesSource = fs.readFileSync('src/types.tsx', 'utf8')

  assert.match(enemiesSource, /poisonDemon:\s*\{/)
  assert.match(enemiesSource, /blossomGolem:\s*\{/)
  assert.match(enemiesSource, /levelOverrides:\s*\[/)
  assert.match(enemiesSource, /PoisonOnAttackScaled/)
  assert.match(enemiesSource, /lootTables:\s*\[et\.poisonDemonBossLoot\]/)
  assert.match(enemiesSource, /lootTables:\s*\[et\.blossomGolemBossLoot\]/)
  assert.match(typesSource, /levelOverrides\?: EnemyLevelOverride\[\]/)
})
