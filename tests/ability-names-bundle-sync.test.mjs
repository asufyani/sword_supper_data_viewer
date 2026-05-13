import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

import { resolveBundlePath } from '../scripts/sync_bundle_data.mjs'

function abilityParamKey(params) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(params).sort(([left], [right]) => left.localeCompare(right))
    )
  )
}

function loadLocalItems() {
  const itemsSource = fs
    .readFileSync('src/utils/items.ts', 'utf8')
    .replace(/^import type .*$/gm, '')
    .replace('export const items: Record<string, Item> =', 'const items =')

  return Function(`${itemsSource}; return items;`)()
}

function loadLocalAbilityExports() {
  const abilitySource = fs
    .readFileSync('src/utils/abilityNames.ts', 'utf8')
    .replace(/^import type .*$/gm, '')
    .replace(
      /export const ([A-Za-z_$][A-Za-z0-9_$]*)(?:\s*:[^=]+)?\s*=/g,
      'const $1 ='
    )

  return Function(
    `${abilitySource}; return { abilityNameMap, abilityParamDescriptionMap };`
  )()
}

test('ability names stay in sync with bundle ability registry', async () => {
  const bundle = fs.readFileSync(await resolveBundlePath(process.cwd()), 'utf8')
  const start = bundle.indexOf('function validateAbilityParams')
  const end = bundle.indexOf('const DEFAULT_WEAPON_DAMAGE', start)

  assert.notEqual(start, -1)
  assert.notEqual(end, -1)

  const snippet = bundle.slice(start, end)
  const { abilityRegistry, loadAbilityFromId, loadAbility } = Function(
    snippet + '; return { abilityRegistry, loadAbilityFromId, loadAbility };'
  )()
  const expectedAbilityNameMap = Object.fromEntries(
    Object.keys(abilityRegistry).map((id) => {
      const ability = loadAbilityFromId(id)
      return [id, { name: ability.name, description: ability.description }]
    })
  )
  const expectedParamDescriptionMap = {}

  for (const item of Object.values(loadLocalItems())) {
    for (const ability of item.abilities ?? []) {
      if (!ability.params || Object.keys(ability.params).length === 0) continue
      expectedParamDescriptionMap[ability.id] ??= {}
      expectedParamDescriptionMap[ability.id][abilityParamKey(ability.params)] =
        loadAbility(ability).description
    }
  }

  const { abilityNameMap, abilityParamDescriptionMap } = loadLocalAbilityExports()

  assert.deepEqual(abilityNameMap, expectedAbilityNameMap)
  assert.deepEqual(abilityParamDescriptionMap, expectedParamDescriptionMap)
  assert.equal(abilityNameMap.WeakOnCrit.name, 'Cast Weak On Crit')
  assert.equal(
    abilityNameMap.ApplyPoisonOnAttack.description,
    '50% chance to poison your target when you attack.'
  )
  assert.equal(
    abilityParamDescriptionMap.HealOnEnemyDeath[
      abilityParamKey({ healAmount: 0.025 })
    ],
    'Heal for 3% when an enemy dies.'
  )
})
