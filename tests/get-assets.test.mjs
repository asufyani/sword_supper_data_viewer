import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import http from 'node:http'

import {
  collectMapKeys,
  syncAssets,
  syncMapBackgroundAssets,
} from '../scripts/get_assets.mjs'

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

test('syncAssets downloads item icons, Spine files, and weapon textures from one asset root', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'get-assets-'))
  const enemiesFile = path.join(tempRoot, 'enemies.ts')
  const itemsFile = path.join(tempRoot, 'items.ts')
  const iconsDir = path.join(tempRoot, 'itemIcons')
  const spineDir = path.join(tempRoot, 'spine')
  const weaponDir = path.join(tempRoot, 'gear', 'weapons')

  await fs.mkdir(iconsDir, { recursive: true })
  await fs.writeFile(
    enemiesFile,
    `
      export const enemies = {
        alpha: { id: 'alpha', spineAssetKey: 'fresh_enemy' },
      }
    `
  )
  await fs.writeFile(
    itemsFile,
    `
export const items = {
  Existing: { id: 'Existing', assetName: 'ExistingIcon' },
  Fresh: { id: 'Fresh', assetName: 'FreshIcon' },
  FreshWeapon: {
    id: 'FreshWeapon',
    equipSlots: ['Weapon'],
    assetName: 'FreshBlade',
  },
}
    `
  )
  await fs.writeFile(path.join(iconsDir, 'ExistingIcon.png'), 'keep-icon')

  const responses = new Map([
    ['/assets/ui/item-icons/FreshIcon.png', 'fresh-icon'],
    ['/assets/ui/item-icons/FreshBlade.png', 'fresh-blade-icon'],
    ['/assets/spine/fresh_enemy.png', 'fresh-png'],
    ['/assets/spine/fresh_enemy.skel', 'fresh-skel'],
    ['/assets/spine/fresh_enemy.atlas', 'fresh-atlas'],
    ['/assets/gear/weapons/default.png', 'default-weapon'],
    ['/assets/gear/weapons/FreshBlade.png', 'fresh-blade-weapon'],
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

        response.writeHead(200, { 'Content-Type': 'application/octet-stream' })
        response.end(body)
      },
      async (baseUrl) => {
        const result = await syncAssets({
          baseUrl,
          enemiesFile,
          itemsFile,
          iconsDir,
          spineDir,
          weaponDir,
        })

        assert.deepEqual(result, {
          totalItemAssetNames: 3,
          totalSpineAssetKeys: 1,
          totalWeaponAssetNames: 2,
          downloaded: [
            'gear/weapons/FreshBlade.png',
            'gear/weapons/default.png',
            'itemIcons/FreshBlade.png',
            'itemIcons/FreshIcon.png',
            'spine/fresh_enemy.atlas',
            'spine/fresh_enemy.png',
            'spine/fresh_enemy.skel',
          ],
          skipped: ['itemIcons/ExistingIcon.png'],
          failed: [],
        })
      }
    )

    assert.equal(
      await fs.readFile(path.join(iconsDir, 'ExistingIcon.png'), 'utf8'),
      'keep-icon'
    )
    assert.equal(
      await fs.readFile(path.join(iconsDir, 'FreshIcon.png'), 'utf8'),
      'fresh-icon'
    )
    assert.equal(
      await fs.readFile(path.join(iconsDir, 'FreshBlade.png'), 'utf8'),
      'fresh-blade-icon'
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
      await fs.readFile(path.join(spineDir, 'fresh_enemy.atlas'), 'utf8'),
      'fresh-atlas'
    )
    assert.equal(
      await fs.readFile(path.join(weaponDir, 'default.png'), 'utf8'),
      'default-weapon'
    )
    assert.equal(
      await fs.readFile(path.join(weaponDir, 'FreshBlade.png'), 'utf8'),
      'fresh-blade-weapon'
    )
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
})

test('collectMapKeys returns unique map asset keys in first-seen order', () => {
  assert.deepEqual(
    collectMapKeys(`
export const items = {
  FieldsMap: { assetName: 'map_fields' },
  FieldsMapRare: { assetName: 'map_fields' },
  CrystalMap: { assetName: 'map_crystal_cave' },
  Sword: { assetName: 'IronBlade' },
}
    `),
    ['fields', 'crystal_cave']
  )
})

test('syncMapBackgroundAssets downloads manifests and layer pngs from local map data', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'get-map-assets-'))
  const itemsFile = path.join(tempRoot, 'items.ts')
  const backgroundsDir = path.join(tempRoot, 'backgrounds')
  const mapBackgroundsDir = path.join(tempRoot, 'pageBackgrounds')

  await fs.writeFile(
    itemsFile,
    `
export const items = {
  ExistingFields: { assetName: 'map_fields' },
  DuplicateFields: { assetName: 'map_fields' },
  CrystalCave: { assetName: 'map_crystal_cave' },
  PlainItem: { assetName: 'NotAMap' },
}
    `
  )
  const manifests = {
    fields: {
      layers: [
        {
          key: 'assets/battle/environments/fields/sky',
          width: 16,
          height: 800,
          xOffset: 0,
          yOffset: 0,
        },
        {
          key: 'assets/battle/environments/fields/walkable_area',
          width: 1821,
          height: 362,
          xOffset: 0,
          yOffset: 670,
        },
      ],
    },
    crystal_cave: {
      layers: [
        {
          key: 'assets/battle/environments/crystal_cave/sky',
          width: 32,
          height: 512,
          xOffset: 0,
          yOffset: 0,
        },
        {
          key: 'assets/battle/environments/crystal_cave/crystals',
          width: 1821,
          height: 640,
          xOffset: 0,
          yOffset: 35,
        },
        {
          key: 'assets/battle/environments/crystal_cave/walkable_area',
          width: 1821,
          height: 320,
          xOffset: 0,
          yOffset: 700,
        },
      ],
    },
  }

  const responses = new Map([
    ['/assets/data/environments/fields.json', JSON.stringify(manifests.fields)],
    [
      '/assets/data/environments/crystal_cave.json',
      JSON.stringify(manifests.crystal_cave),
    ],
    ['/assets/battle/environments/fields/sky.png', 'fields-sky'],
    ['/assets/battle/environments/fields/walkable_area.png', 'fields-walkable'],
    ['/assets/battle/environments/crystal_cave/sky.png', 'crystal-sky'],
    [
      '/assets/battle/environments/crystal_cave/crystals.png',
      'crystal-crystals',
    ],
    [
      '/assets/battle/environments/crystal_cave/walkable_area.png',
      'crystal-walkable',
    ],
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

        response.writeHead(200, { 'Content-Type': 'application/octet-stream' })
        response.end(body)
      },
      async (baseUrl) => {
        const result = await syncMapBackgroundAssets({
          baseUrl,
          itemsFile,
          backgroundsDir,
          mapBackgroundsDir,
        })

        assert.deepEqual(result, {
          totalMapKeys: 2,
          downloaded: [
            'backgrounds/crystal_cave/crystals.png',
            'backgrounds/crystal_cave/sky.png',
            'backgrounds/crystal_cave/walkable_area.png',
            'backgrounds/fields/sky.png',
            'backgrounds/fields/walkable_area.png',
            'pageBackgrounds/crystal_cave.json',
            'pageBackgrounds/fields.json',
          ],
          skipped: [],
          failed: [],
        })
      }
    )

    assert.equal(
      await fs.readFile(path.join(backgroundsDir, 'fields', 'sky.png'), 'utf8'),
      'fields-sky'
    )
    assert.equal(
      await fs.readFile(
        path.join(backgroundsDir, 'crystal_cave', 'crystals.png'),
        'utf8'
      ),
      'crystal-crystals'
    )

    assert.deepEqual(
      JSON.parse(
        await fs.readFile(
          path.join(mapBackgroundsDir, 'crystal_cave.json'),
          'utf8'
        )
      ),
      manifests.crystal_cave
    )
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
})
