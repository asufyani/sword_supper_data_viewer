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

test('app viewport width css variable tracks scrollbar-free client width', async () => {
  await withViteServer(async (server) => {
    const { installAppViewportWidthSync } = await server.ssrLoadModule(
      '/src/utils/appViewportWidth.ts'
    )

    const properties = new Map()
    const listeners = []
    const root = {
      clientWidth: 1265,
      style: {
        setProperty(name, value) {
          properties.set(name, value)
        },
      },
    }
    const activeWindow = {
      document: { documentElement: root },
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
    assert.equal(listeners.length, 1)
    assert.equal(listeners[0].name, 'resize')

    root.clientWidth = 1440
    listeners[0].listener()

    assert.equal(properties.get('--app-viewport-width'), '1440px')

    cleanup()
    assert.equal(listeners.length, 0)
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
