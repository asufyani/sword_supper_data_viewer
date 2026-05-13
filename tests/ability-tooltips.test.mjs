import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createServer } from 'vite'

async function withViteServer(callback) {
  const server = await createServer({
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { hmr: false, middlewareMode: true, ws: false },
    logLevel: 'error',
  })

  try {
    await callback(server)
  } finally {
    await server.close()
  }
}

test('ability tooltips include item ability params', async () => {
  await withViteServer(async (server) => {
    const { formatAbilityTooltip } = await server.ssrLoadModule(
      '/src/utils/abilityTooltips.ts'
    )
    const statsDisplaySource = fs.readFileSync('src/StatsDisplay.tsx', 'utf8')

    assert.equal(
      formatAbilityTooltip({
        id: 'RemoveWeakOnRage',
        params: { removeChance: 0.25 },
      }),
      '25% chance to remove Weak from yourself when you use a rage attack.\n\nParams: Remove chance: 25%'
    )
    assert.equal(
      formatAbilityTooltip({
        id: 'ApplyPoisonOnAttack',
        params: { damagePerTurn: 90, applyChance: 0.6 },
      }),
      '60% chance to poison your target when you attack.\n\nParams: Damage per turn: 90; Apply chance: 60%'
    )
    assert.equal(
      formatAbilityTooltip({
        id: 'HealOnEnemyDeath',
        params: { healAmount: 0.025 },
      }),
      'Heal for 3% when an enemy dies.\n\nParams: Heal amount: 2.5%'
    )
    assert.equal(
      formatAbilityTooltip({ id: 'HealOnCritAbility' }),
      'Heal for 5% HP whenever you land a critical hit.'
    )
    assert.match(statsDisplaySource, /formatAbilityTooltip\(ability\)/)
  })
})
