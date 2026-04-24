import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('HelpPanel documents the current tabs and newly added features', () => {
  const source = fs.readFileSync('src/HelpPanel.tsx', 'utf8')

  assert.match(source, /Vault Loot/)
  assert.match(source, /Level Costs/)
  assert.match(source, /Abilities/)
  assert.match(source, /vault/i)
  assert.match(source, /jump/i)
})
