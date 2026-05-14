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

test('page background pool includes every map with remote environment art', async () => {
  await withViteServer(async (server) => {
    const { MAP_PAGE_BACKGROUNDS } = await server.ssrLoadModule(
      '/src/utils/pageBackground.ts'
    )

    assert.deepEqual(
      MAP_PAGE_BACKGROUNDS.map((background) => background.key),
      [
        'fields',
        'mossy_forest',
        'mountain_pass',
        'ruined_path',
        'seaside_cliffs',
        'outer_temple',
        'forbidden_city',
        'new_eden',
      ]
    )

    for (const background of MAP_PAGE_BACKGROUNDS) {
      assert.ok(background.layers.length >= 4)
      assert.ok(
        background.layers.some((layer) => layer.name === 'walkable_area'),
        `${background.key} should include the ground layer`
      )

      for (const layer of background.layers) {
        assert.ok(
          fs.existsSync(
            `public/backgrounds/${background.key}/${layer.name}.png`
          ),
          `${background.key}/${layer.name}.png should be stored locally`
        )
      }
    }
  })
})

test('selectRandomPageBackground picks one map using the provided random source', async () => {
  await withViteServer(async (server) => {
    const { selectRandomPageBackground } = await server.ssrLoadModule(
      '/src/utils/pageBackground.ts'
    )

    assert.equal(selectRandomPageBackground(() => 0).key, 'fields')
    assert.equal(selectRandomPageBackground(() => 0.999).key, 'new_eden')
  })
})

test('applyRandomPageBackground sets the body dataset and layered CSS variables', async () => {
  await withViteServer(async (server) => {
    const { applyRandomPageBackground } = await server.ssrLoadModule(
      '/src/utils/pageBackground.ts'
    )
    const values = new Map()
    const documentStub = {
      body: {
        dataset: {},
        style: {
          setProperty(name, value) {
            values.set(name, value)
          },
        },
      },
    }

    const selected = applyRandomPageBackground(documentStub, () => 0)

    assert.equal(selected.key, 'fields')
    assert.equal(documentStub.body.dataset.mapBackground, 'fields')
    assert.match(
      values.get('--page-bg-images'),
      /\/sword_supper_data_viewer\/backgrounds\/fields\/walkable_area\.png/
    )
    assert.match(
      values.get('--page-bg-images'),
      /\/sword_supper_data_viewer\/backgrounds\/fields\/sky\.png/
    )
    assert.match(values.get('--page-bg-positions'), /center 670px/)
    assert.match(values.get('--page-bg-sizes'), /(^|, )1821px auto(,|$)/)
    assert.doesNotMatch(values.get('--page-bg-sizes'), /100vw/)
  })
})

test('page background layers scale vertically to cover taller viewports', async () => {
  await withViteServer(async (server) => {
    const {
      MAP_PAGE_BACKGROUNDS,
      installPageBackgroundScaleSync,
    } = await server.ssrLoadModule('/src/utils/pageBackground.ts')

    const values = new Map()
    const listeners = []
    const visualViewportListeners = []
    const visualViewport = {
      height: 1032,
      addEventListener(name, listener) {
        visualViewportListeners.push({ name, listener })
      },
      removeEventListener(name, listener) {
        const index = visualViewportListeners.findIndex(
          (entry) => entry.name === name && entry.listener === listener
        )
        if (index !== -1) {
          visualViewportListeners.splice(index, 1)
        }
      },
    }
    const documentStub = {
      body: {
        dataset: {},
        style: {
          setProperty(name, value) {
            values.set(name, value)
          },
        },
      },
      documentElement: { clientHeight: 1032 },
      defaultView: {
        visualViewport,
        addEventListener(name, listener) {
          listeners.push({ name, listener })
        },
        removeEventListener(name, listener) {
          const index = listeners.findIndex(
            (entry) => entry.name === name && entry.listener === listener
          )
          if (index !== -1) {
            listeners.splice(index, 1)
          }
        },
      },
    }

    const cleanup = installPageBackgroundScaleSync(
      MAP_PAGE_BACKGROUNDS[0],
      documentStub
    )

    assert.match(values.get('--page-bg-positions'), /center 670px/)
    assert.match(values.get('--page-bg-sizes'), /(^|, )1821px auto(,|$)/)

    visualViewport.height = 2064
    visualViewportListeners[0].listener()

    assert.match(values.get('--page-bg-positions'), /center 1340px/)
    assert.match(values.get('--page-bg-sizes'), /(^|, )3642px auto(,|$)/)

    cleanup()
    assert.equal(listeners.length, 0)
    assert.equal(visualViewportListeners.length, 0)
  })
})
