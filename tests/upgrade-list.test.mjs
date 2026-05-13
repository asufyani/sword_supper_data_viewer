import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToString } from 'react-dom/server'
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

function testItem(id, name = id) {
  return {
    id,
    name,
    rarity: 'common',
    tags: ['equipment'],
    equipSlots: ['Weapon'],
    statModifiers: [],
    isStackable: false,
    amount: 1,
    upgrades: [],
    retainOnUpgrade: false,
    requiredLevel: 1,
    sellPrice: 1,
    description: '',
  }
}

test('UpgradeList renders upgrade and required-by lists without key warnings', async () => {
  await withViteServer(async (server) => {
    globalThis.window = { location: 'http://localhost' }
    const originalError = console.error
    const errors = []
    console.error = (...args) => {
      errors.push(args.map(String).join(' '))
    }

    try {
      const [{ UpgradeList }, { ItemDetailsPopoverProvider }] =
        await Promise.all([
          server.ssrLoadModule('/src/UpgradeList.tsx'),
          server.ssrLoadModule('/src/ItemDetailsPopover.tsx'),
        ])
      const itemNameMap = Object.fromEntries(
        [
          testItem('base', 'Base sword'),
          testItem('ore', 'Ore'),
          testItem('gem', 'Gem'),
          testItem('upgrade-one', 'Upgrade one'),
          testItem('upgrade-two', 'Upgrade two'),
          testItem('required-one', 'Required one'),
          testItem('required-two', 'Required two'),
        ].map((item) => [item.id, item])
      )

      renderToString(
        React.createElement(
          ItemDetailsPopoverProvider,
          null,
          React.createElement(UpgradeList, {
            itemId: 'base',
            itemNameMap,
            upgradeMaterialsList: {
              base: ['required-one', 'required-two'],
            },
            upgrades: [
              {
                yields: 'upgrade-one',
                requires: [{ id: 'ore', amount: 1 }],
              },
              {
                yields: 'upgrade-two',
                requires: [{ id: 'gem', amount: 2 }],
              },
            ],
          })
        )
      )

      assert.equal(
        errors.some((message) =>
          message.includes('Each child in a list should have a unique "key" prop')
        ),
        false
      )
    } finally {
      console.error = originalError
      delete globalThis.window
    }
  })
})
