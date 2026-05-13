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

test('rarity colors are shared through CSS variables and one TS helper', async () => {
  await withViteServer(async (server) => {
    const { getRarityColor, rarityColorMap } = await server.ssrLoadModule(
      '/src/utils/rarityColors.ts'
    )
    const globalStyles = fs.readFileSync('src/index.css', 'utf8')
    const chipSource = fs.readFileSync('src/RarityChip.tsx', 'utf8')
    const popoverSource = fs.readFileSync('src/ItemDetailsPopover.tsx', 'utf8')

    assert.equal(getRarityColor('rare'), 'var(--rarity-rare)')
    assert.equal(rarityColorMap.mythic, 'var(--rarity-mythic)')

    for (const rarity of [
      'common',
      'uncommon',
      'rare',
      'epic',
      'legendary',
      'mythic',
    ]) {
      assert.match(
        globalStyles,
        new RegExp(`--rarity-${rarity}:\\s*#[0-9a-fA-F]{6}`)
      )
    }

    assert.match(chipSource, /getRarityColor\(item\.rarity\)/)
    assert.match(popoverSource, /getRarityColor\(item\.rarity\)/)
    assert.doesNotMatch(chipSource, /const colorMap/)
    assert.doesNotMatch(popoverSource, /const rarityBorderMap/)
  })
})
