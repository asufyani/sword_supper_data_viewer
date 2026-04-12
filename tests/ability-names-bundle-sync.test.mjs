import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('ability names stay in sync with bundle ability registry', () => {
  const bundle = fs.readFileSync('public/index-CGcaOcB4.js', 'utf8')
  const start = bundle.indexOf('function validateAbilityParams')
  const end = bundle.indexOf('const DEFAULT_WEAPON_DAMAGE', start)

  assert.notEqual(start, -1)
  assert.notEqual(end, -1)

  const snippet = bundle.slice(start, end)
  const { abilityRegistry, loadAbilityFromId } = Function(
    snippet + '; return { abilityRegistry, loadAbilityFromId };'
  )()
  const expected = Object.fromEntries(
    Object.keys(abilityRegistry).map((id) => {
      const ability = loadAbilityFromId(id)
      return [id, { name: ability.name, description: ability.description }]
    })
  )

  const abilitySource = fs.readFileSync('src/utils/abilityNames.ts', 'utf8')
  const actual = Function(
    abilitySource.replace('export const abilityNameMap =', 'return ')
  )()

  assert.deepEqual(actual, expected)
  assert.equal(actual.WeakOnCrit.name, 'Cast Weak On Crit')
  assert.equal(
    actual.ApplyPoisonOnAttack.description,
    '50% chance to poison your target when you attack.'
  )
})
