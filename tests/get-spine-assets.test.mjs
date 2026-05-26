import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import http from 'node:http'

import {
  collectSpineAssetKeys,
  collectWeaponAssetNames,
  syncSpineAssets,
} from '../scripts/get_assets.mjs'

async function withServer(handler, callback, basePath = 'spine') {
  const server = http.createServer(handler)

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve)
  })

  const address = server.address()
  const baseUrl = `http://127.0.0.1:${address.port}/${basePath}`

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

test('collectWeaponAssetNames returns default plus unique weapon assetName values only', () => {
  const source = `
export const items = {
  Alpha: {
    equipSlots: ['Weapon'],
    assetName: 'SharedBlade',
  },
  Beta: {
    equipSlots: ['Weapon'],
    assetName: 'SharedBlade',
  },
  Gamma: {
    equipSlots: ['Head'],
    assetName: 'Helmet',
  },
  Delta: {
    equipSlots: ['Weapon'],
    assetName: 'StormMace',
  },
}
  `

  assert.deepEqual(collectWeaponAssetNames(source), [
    'default',
    'SharedBlade',
    'StormMace',
  ])
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

test('syncSpineAssets downloads weapon gear textures from the assets gear folder', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'get-spine-assets-'))
  const enemiesFile = path.join(tempRoot, 'enemies.ts')
  const itemsFile = path.join(tempRoot, 'items.ts')
  const spineDir = path.join(tempRoot, 'spine')
  const weaponDir = path.join(tempRoot, 'gear', 'weapons')

  await fs.mkdir(spineDir, { recursive: true })
  await fs.mkdir(weaponDir, { recursive: true })
  await fs.writeFile(
    enemiesFile,
    `
      export const enemies = {
        alpha: { id: 'alpha', spineAssetKey: 'shared_enemy' },
      }
    `
  )
  await fs.writeFile(
    itemsFile,
    `
export const items = {
  Alpha: {
    equipSlots: ['Weapon'],
    assetName: 'ExistingBlade',
  },
  Beta: {
    equipSlots: ['Weapon'],
    assetName: 'FreshAxe',
  },
  Gamma: {
    equipSlots: ['Head'],
    assetName: 'FreshHat',
  },
}
    `
  )
  await fs.writeFile(path.join(spineDir, 'shared_enemy.png'), 'keep-png')
  await fs.writeFile(path.join(spineDir, 'shared_enemy.skel'), 'keep-skel')
  await fs.writeFile(path.join(spineDir, 'shared_enemy.atlas'), 'keep-atlas')
  await fs.writeFile(path.join(weaponDir, 'ExistingBlade.png'), 'keep-weapon')

  const responses = new Map([
    ['/assets/gear/weapons/default.png', 'default-weapon'],
    ['/assets/gear/weapons/FreshAxe.png', 'fresh-axe'],
  ])

  try {
    await withServer(
      (request, response) => {
        const body = responses.get(request.url)

        if (!body) {
          response.writeHead(404)
          response.end('missing')
          return
        }

        response.writeHead(200, { 'Content-Type': 'image/png' })
        response.end(body)
      },
      async (baseUrl) => {
        const result = await syncSpineAssets({
          baseUrl,
          enemiesFile,
          spineDir,
          itemsFile,
          weaponDir,
        })

        assert.deepEqual(result, {
          totalAssetKeys: 1,
          totalWeaponAssetNames: 3,
          downloaded: ['weapons/FreshAxe.png', 'weapons/default.png'],
          skipped: [
            'shared_enemy.atlas',
            'shared_enemy.png',
            'shared_enemy.skel',
            'weapons/ExistingBlade.png',
          ],
          failed: [],
        })
      },
      'assets'
    )

    assert.equal(
      await fs.readFile(path.join(weaponDir, 'ExistingBlade.png'), 'utf8'),
      'keep-weapon'
    )
    assert.equal(
      await fs.readFile(path.join(weaponDir, 'default.png'), 'utf8'),
      'default-weapon'
    )
    assert.equal(
      await fs.readFile(path.join(weaponDir, 'FreshAxe.png'), 'utf8'),
      'fresh-axe'
    )
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
})

test('checked-in Spine assets cover every enemy asset key', async () => {
  const enemiesSource = await fs.readFile('src/utils/enemies.ts', 'utf8')
  const assetKeys = collectSpineAssetKeys(enemiesSource)
  const missingFiles = []

  for (const assetKey of assetKeys) {
    for (const extension of ['png', 'skel', 'atlas']) {
      const fileName = `${assetKey}.${extension}`

      try {
        await fs.access(path.join('public/spine', fileName))
      } catch {
        missingFiles.push(fileName)
      }
    }
  }

  assert.deepEqual(missingFiles, [])
})

test('checked-in weapon gear assets cover every player weapon asset key', async () => {
  const itemsSource = await fs.readFile('src/utils/items.ts', 'utf8')
  const assetNames = collectWeaponAssetNames(itemsSource)
  const missingFiles = []

  for (const assetName of assetNames) {
    const fileName = `${assetName}.png`

    try {
      await fs.access(path.join('public/gear/weapons', fileName))
    } catch {
      missingFiles.push(fileName)
    }
  }

  assert.deepEqual(missingFiles, [])
})
