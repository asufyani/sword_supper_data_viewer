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

test('app viewport css variables track scrollbar-free width and visual height', async () => {
  await withViteServer(async (server) => {
    const { installAppViewportWidthSync } = await server.ssrLoadModule(
      '/src/utils/appViewportWidth.ts'
    )

    const properties = new Map()
    const listeners = []
    const visualViewportListeners = []
    const root = {
      clientWidth: 1265,
      clientHeight: 820,
      style: {
        setProperty(name, value) {
          properties.set(name, value)
        },
      },
    }
    const visualViewport = {
      height: 910,
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
    const activeWindow = {
      document: { documentElement: root },
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
    }

    const cleanup = installAppViewportWidthSync(activeWindow)

    assert.equal(properties.get('--app-viewport-width'), '1265px')
    assert.equal(properties.get('--app-viewport-height'), '910px')
    assert.equal(listeners.length, 1)
    assert.equal(listeners[0].name, 'resize')
    assert.equal(visualViewportListeners.length, 1)
    assert.equal(visualViewportListeners[0].name, 'resize')

    root.clientWidth = 1440
    visualViewport.height = 1080
    listeners[0].listener()

    assert.equal(properties.get('--app-viewport-width'), '1440px')
    assert.equal(properties.get('--app-viewport-height'), '1080px')

    cleanup()
    assert.equal(listeners.length, 0)
    assert.equal(visualViewportListeners.length, 0)
  })
})

test('main installs the app viewport width sync before rendering', () => {
  const mainSource = fs.readFileSync('src/main.tsx', 'utf8')

  assert.match(
    mainSource,
    /import \{ installAppViewportWidthSync \} from '\.\/utils\/appViewportWidth'/
  )
  assert.match(mainSource, /installAppViewportWidthSync\(\)/)
})
