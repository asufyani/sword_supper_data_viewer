import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import React from 'react'
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

function childWithClass(children, className) {
  return React.Children.toArray(children).find((child) =>
    child.props?.className?.split(' ').includes(className)
  )
}

test('AssetIcon shows a question mark fallback when icon art fails to load', async () => {
  await withViteServer(async (server) => {
    globalThis.window = { location: 'http://localhost' }

    try {
      const { AssetIcon } = await server.ssrLoadModule('/src/AssetIcon.tsx')
      const element = AssetIcon({
        rarity: 'uncommon',
        assetName: 'map_castle_road',
      })
      const fallback = childWithClass(element.props.children, 'assetIconFallback')
      const image = childWithClass(element.props.children, 'assetIcon')

      assert.equal(fallback?.props.children, '?')
      assert.equal(fallback?.props.hidden, true)
      assert.equal(typeof image?.props.onError, 'function')

      const fallbackElement = { hidden: true }
      const imageElement = { hidden: false, previousElementSibling: fallbackElement }
      image.props.onError({ currentTarget: imageElement })

      assert.equal(fallbackElement.hidden, false)
      assert.equal(imageElement.hidden, true)
    } finally {
      delete globalThis.window
    }
  })
})

test('AssetIcon hidden fallback is not displayed behind loaded transparent art', () => {
  const styles = fs.readFileSync('src/index.css', 'utf8')

  assert.match(
    styles,
    /\.assetIconFallback\[hidden\]\s*\{\s*display:\s*none/
  )
})
