import test from 'node:test'
import assert from 'node:assert/strict'
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

test('item search matches abilities, stats, and upgrade yields', async () => {
  await withViteServer(async (server) => {
    const { itemMatchesSearch, buildItemSearchText } = await server.ssrLoadModule(
      '/src/utils/itemSearch.ts'
    )
    const { items } = await server.ssrLoadModule('/src/utils/items.ts')

    const furybringer = { ...items.Furybringer, id: 'Furybringer' }
    const furybringerUltimate = {
      ...items.FurybringerUltimate,
      id: 'FurybringerUltimate',
    }
    const itemNameMap = {
      Furybringer: furybringer,
      FurybringerUltimate: furybringerUltimate,
    }

    assert.equal(
      itemMatchesSearch(furybringer, 'lightning rage', itemNameMap),
      true
    )
    assert.equal(
      itemMatchesSearch(furybringer, 'LightningOnRage', itemNameMap),
      true
    )
    assert.equal(
      itemMatchesSearch(furybringerUltimate, 'second wind', itemNameMap),
      false
    )

    const secondWindBelt = Object.values(items).find((item) =>
      item.abilities?.some((ability) => ability.id === 'SecondWindAbility')
    )
    assert.ok(secondWindBelt)
    assert.equal(
      itemMatchesSearch(
        { ...secondWindBelt, id: 'SecondWindBelt' },
        'second wind'
      ),
      true
    )

    const dodgeItem = Object.values(items).find((item) =>
      item.statModifiers.some((modifier) => modifier.stat === 'Dodge')
    )
    assert.ok(dodgeItem)
    assert.equal(
      itemMatchesSearch({ ...dodgeItem, id: 'DodgeItem' }, 'dodge'),
      true
    )

    assert.match(
      buildItemSearchText(furybringer, itemNameMap).toLowerCase(),
      /lightning on rage/
    )
  })
})

test('item tables use shared free-text item search', async () => {
  const { readFileSync } = await import('node:fs')

  ;['src/WeaponTable.tsx', 'src/ArmorTable.tsx', 'src/BlueprintTable.tsx'].forEach(
    (filePath) => {
      const source = readFileSync(filePath, 'utf8')
      assert.match(source, /itemMatchesSearch/)
    }
  )
})
