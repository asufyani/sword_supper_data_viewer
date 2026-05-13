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

test('Maps tab renders current map items when some maps have no bosses', async () => {
  await withViteServer(async (server) => {
    globalThis.window = { location: 'http://localhost' }

    try {
      const [
        { default: MapTable },
        { ItemDetailsPopoverProvider },
        { items },
      ] = await Promise.all([
        server.ssrLoadModule('/src/MapTable.tsx'),
        server.ssrLoadModule('/src/ItemDetailsPopover.tsx'),
        server.ssrLoadModule('/src/utils/items.ts'),
      ])
      const itemNameMap = Object.fromEntries(
        Object.entries(items).map(([id, item]) => [id, { ...item, id }])
      )
      const mapArray = Object.values(itemNameMap).filter((item) =>
        item.tags.includes('map')
      )

      assert.doesNotThrow(() => {
        renderToString(
          React.createElement(
            ItemDetailsPopoverProvider,
            null,
            React.createElement(MapTable, {
              itemsArray: mapArray,
              itemNameMap,
              itemDropLocations: {},
              goTo: () => {},
            })
          )
        )
      })
    } finally {
      delete globalThis.window
    }
  })
})
