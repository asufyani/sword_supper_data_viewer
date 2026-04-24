import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import http from 'node:http'

import {
  collectSpineAssetKeys,
  syncSpineAssets,
} from '../scripts/get_spine_assets.mjs'

async function withServer(handler, callback) {
  const server = http.createServer(handler)

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve)
  })

  const address = server.address()
  const baseUrl = `http://127.0.0.1:${address.port}/spine`

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

test('collectSpineAssetKeys returns unique spineAssetKey values only', () => {
  const source = `
    export const enemies = {
      alpha: { id: 'alpha', spineAssetKey: 'shared_enemy' },
      beta: { id: 'beta', spineAssetKey: 'shared_enemy' },
      gamma: { id: 'gamma' },
      delta: { id: 'delta', spineAssetKey: 'fresh_enemy' },
    }
  `

  assert.deepEqual(collectSpineAssetKeys(source), ['shared_enemy', 'fresh_enemy'])
})

test('syncSpineAssets skips existing files and downloads missing trio members', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'get-spine-assets-'))
  const enemiesFile = path.join(tempRoot, 'enemies.ts')
  const spineDir = path.join(tempRoot, 'spine')

  await fs.mkdir(spineDir, { recursive: true })
  await fs.writeFile(
    enemiesFile,
    `
      export const enemies = {
        alpha: { id: 'alpha', spineAssetKey: 'shared_enemy' },
        beta: { id: 'beta', spineAssetKey: 'shared_enemy' },
        gamma: { id: 'gamma', spineAssetKey: 'missing_enemy' },
        delta: { id: 'delta', spineAssetKey: 'fresh_enemy' },
      }
    `
  )

  await fs.writeFile(path.join(spineDir, 'shared_enemy.png'), 'keep-png')
  await fs.writeFile(path.join(spineDir, 'fresh_enemy.atlas'), 'keep-atlas')

  const responses = new Map([
    ['/spine/shared_enemy.skel', 'shared-skel'],
    ['/spine/shared_enemy.atlas', 'shared-atlas'],
    ['/spine/missing_enemy.png', 'missing-png'],
    ['/spine/missing_enemy.skel', 'missing-skel'],
    ['/spine/missing_enemy.atlas', 'missing-atlas'],
    ['/spine/fresh_enemy.png', 'fresh-png'],
    ['/spine/fresh_enemy.skel', 'fresh-skel'],
  ])

  try {
    await withServer((request, response) => {
      const body = responses.get(request.url)

      if (!body) {
        response.writeHead(404)
        response.end('missing')
        return
      }

      response.writeHead(200, { 'Content-Type': 'application/octet-stream' })
      response.end(body)
    }, async (baseUrl) => {
      const result = await syncSpineAssets({
        baseUrl,
        enemiesFile,
        spineDir,
      })

      assert.deepEqual(result, {
        totalAssetKeys: 3,
        downloaded: [
          'fresh_enemy.png',
          'fresh_enemy.skel',
          'missing_enemy.atlas',
          'missing_enemy.png',
          'missing_enemy.skel',
          'shared_enemy.atlas',
          'shared_enemy.skel',
        ],
        skipped: ['fresh_enemy.atlas', 'shared_enemy.png'],
        failed: [],
      })
    })

    assert.equal(
      await fs.readFile(path.join(spineDir, 'shared_enemy.png'), 'utf8'),
      'keep-png'
    )
    assert.equal(
      await fs.readFile(path.join(spineDir, 'shared_enemy.skel'), 'utf8'),
      'shared-skel'
    )
    assert.equal(
      await fs.readFile(path.join(spineDir, 'shared_enemy.atlas'), 'utf8'),
      'shared-atlas'
    )
    assert.equal(
      await fs.readFile(path.join(spineDir, 'fresh_enemy.atlas'), 'utf8'),
      'keep-atlas'
    )
    assert.equal(
      await fs.readFile(path.join(spineDir, 'fresh_enemy.png'), 'utf8'),
      'fresh-png'
    )
    assert.equal(
      await fs.readFile(path.join(spineDir, 'fresh_enemy.skel'), 'utf8'),
      'fresh-skel'
    )
    assert.equal(
      await fs.readFile(path.join(spineDir, 'missing_enemy.png'), 'utf8'),
      'missing-png'
    )
    assert.equal(
      await fs.readFile(path.join(spineDir, 'missing_enemy.skel'), 'utf8'),
      'missing-skel'
    )
    assert.equal(
      await fs.readFile(path.join(spineDir, 'missing_enemy.atlas'), 'utf8'),
      'missing-atlas'
    )
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
})
