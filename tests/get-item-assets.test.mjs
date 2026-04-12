import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import http from 'node:http'

import { collectAssetNames, syncItemAssets } from '../scripts/get_item_assets.mjs'

async function withServer(handler, callback) {
  const server = http.createServer(handler)

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve)
  })

  const address = server.address()
  const baseUrl = `http://127.0.0.1:${address.port}/assets`

  try {
    await callback(baseUrl)
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })
  }
}

test('collectAssetNames returns unique assetName values only', () => {
  const source = `
    export const items = {
      Alpha: { id: 'Alpha', assetName: 'SharedBlade' },
      Beta: { id: 'Beta', assetName: 'SharedBlade' },
      Gamma: { id: 'Gamma' },
      Delta: { id: 'Delta', assetName: 'StormRing' },
    }
  `

  assert.deepEqual(collectAssetNames(source), ['SharedBlade', 'StormRing'])
})

test('syncItemAssets skips existing icons and downloads missing ones', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'get-item-assets-'))
  const itemsFile = path.join(tempRoot, 'items.ts')
  const iconsDir = path.join(tempRoot, 'itemIcons')

  await fs.mkdir(iconsDir, { recursive: true })
  await fs.writeFile(
    itemsFile,
    `
      export const items = {
        Alpha: { id: 'Alpha', assetName: 'ExistingBlade' },
        Beta: { id: 'Beta', assetName: 'MissingRing' },
        Gamma: { id: 'Gamma', assetName: 'MissingRing' },
        Delta: { id: 'Delta' },
        Epsilon: { id: 'Epsilon', assetName: 'FreshCape' },
      }
    `
  )
  await fs.writeFile(path.join(iconsDir, 'ExistingBlade.png'), 'keep-me')

  const responses = new Map([
    ['/assets/MissingRing.png', 'downloaded-ring'],
    ['/assets/FreshCape.png', 'downloaded-cape'],
  ])

  try {
    await withServer((request, response) => {
      const body = responses.get(request.url)

      if (!body) {
        response.writeHead(404)
        response.end('missing')
        return
      }

      response.writeHead(200, { 'Content-Type': 'image/png' })
      response.end(body)
    }, async (baseUrl) => {
      const result = await syncItemAssets({
        baseUrl,
        itemsFile,
        iconsDir,
      })

      assert.deepEqual(result, {
        totalAssetNames: 3,
        downloaded: ['FreshCape', 'MissingRing'],
        skipped: ['ExistingBlade'],
        failed: [],
      })
    })

    assert.equal(
      await fs.readFile(path.join(iconsDir, 'ExistingBlade.png'), 'utf8'),
      'keep-me'
    )
    assert.equal(
      await fs.readFile(path.join(iconsDir, 'MissingRing.png'), 'utf8'),
      'downloaded-ring'
    )
    assert.equal(
      await fs.readFile(path.join(iconsDir, 'FreshCape.png'), 'utf8'),
      'downloaded-cape'
    )
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
})
