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

test('player weapon pool randomizes from local weapon gear assets', async () => {
  await withViteServer(async (server) => {
    const {
      PLAYER_WEAPON_ASSETS,
      getPlayerWeaponAssetPath,
      selectRandomPlayerWeapon,
    } = await server.ssrLoadModule('/src/utils/playerWeapons.ts')

    assert.ok(
      PLAYER_WEAPON_ASSETS.length > 20,
      'expected a broad local weapon asset pool'
    )
    assert.equal(
      selectRandomPlayerWeapon(() => 0),
      PLAYER_WEAPON_ASSETS[0]
    )
    assert.equal(
      selectRandomPlayerWeapon(() => 0.999),
      PLAYER_WEAPON_ASSETS.at(-1)
    )

    for (const weapon of PLAYER_WEAPON_ASSETS) {
      assert.ok(
        fs.existsSync(`public/gear/weapons/${weapon.assetName}.png`),
        `${weapon.assetName}.png should be stored locally as weapon gear art`
      )
    }

    assert.match(
      getPlayerWeaponAssetPath(PLAYER_WEAPON_ASSETS[0]),
      /^\/sword_supper_data_viewer\/gear\/weapons\/.+\.png$/
    )
  })
})

test('app renders a desktop-only transparent player Spine overlay', () => {
  assert.ok(
    fs.existsSync('src/PagePlayerSpine.tsx'),
    'PagePlayerSpine component should exist'
  )
  const appSource = fs.readFileSync('src/App.tsx', 'utf8')
  const playerSource = fs.readFileSync('src/PagePlayerSpine.tsx', 'utf8')
  const globalStyles = fs.readFileSync('src/index.css', 'utf8')

  assert.match(
    appSource,
    /import \{ PagePlayerSpine \} from '\.\/PagePlayerSpine'/
  )
  assert.match(appSource, /<PagePlayerSpine \/>/)

  assert.match(playerSource, /new SpinePlayer/)
  assert.match(playerSource, /frogPlayer/)
  assert.match(playerSource, /selectRandomPlayerWeapon/)
  assert.match(playerSource, /applyWeaponTexture/)
  assert.match(playerSource, /className="page-player-spine"/)
  assert.match(playerSource, /showControls:\s*false/)
  assert.match(playerSource, /interactive:\s*false/)
  assert.match(playerSource, /alpha:\s*true/)
  assert.match(playerSource, /backgroundColor:\s*'00000000'/)
  assert.match(playerSource, /skeleton\.scaleX = -1/)

  assert.match(globalStyles, /\.page-player-spine\s*{[\s\S]*position:\s*fixed;/)
  assert.match(globalStyles, /\.page-player-spine\s*{[\s\S]*left:/)
  assert.match(globalStyles, /\.page-player-spine\s*{[\s\S]*bottom:/)
  assert.match(
    globalStyles,
    /\.page-player-spine\s*{[\s\S]*pointer-events:\s*none;/
  )
  assert.match(
    globalStyles,
    /\.page-player-spine \.spine-player\s*{[\s\S]*width:\s*100%;[\s\S]*height:\s*100%;/
  )
  assert.match(
    globalStyles,
    /@media \(max-width: 700px\)[\s\S]*\.page-player-spine\s*{[\s\S]*display:\s*none;/
  )

  for (const extension of ['skel', 'atlas', 'png']) {
    assert.ok(
      fs.existsSync(`public/spine/frogPlayer.${extension}`),
      `frogPlayer.${extension} should be stored locally`
    )
  }
})

test('page enemy selector uses enemies from the selected map background', async () => {
  await withViteServer(async (server) => {
    const { MAP_PAGE_BACKGROUNDS } = await server.ssrLoadModule(
      '/src/utils/pageBackground.ts'
    )
    const { getPageEnemySpineAssetPath, selectRandomPageEnemy } =
      await server.ssrLoadModule('/src/utils/pageEnemy.ts')

    const fieldsBackground = MAP_PAGE_BACKGROUNDS.find(
      (background) => background.key === 'fields'
    )
    const forbiddenCityBackground = MAP_PAGE_BACKGROUNDS.find(
      (background) => background.key === 'forbidden_city'
    )

    assert.equal(
      selectRandomPageEnemy(fieldsBackground, () => 0).id,
      'mushroomChild'
    )
    assert.equal(
      selectRandomPageEnemy(forbiddenCityBackground, () => 0).spineAssetKey,
      'robot_no1'
    )
    assert.match(
      getPageEnemySpineAssetPath(
        selectRandomPageEnemy(fieldsBackground, () => 0),
        'skel'
      ),
      /^\/sword_supper_data_viewer\/spine\/mushroom_child\.skel$/
    )
  })
})

test('app renders a desktop-only transparent enemy Spine overlay for the selected background', () => {
  assert.ok(
    fs.existsSync('src/PageEnemySpine.tsx'),
    'PageEnemySpine component should exist'
  )

  const appSource = fs.readFileSync('src/App.tsx', 'utf8')
  const mainSource = fs.readFileSync('src/main.tsx', 'utf8')
  const enemySource = fs.readFileSync('src/PageEnemySpine.tsx', 'utf8')
  const globalStyles = fs.readFileSync('src/index.css', 'utf8')

  assert.match(
    mainSource,
    /const pageBackground = applyRandomPageBackground\(\)/
  )
  assert.match(
    appSource,
    /import \{ PageEnemySpine \} from '\.\/PageEnemySpine'/
  )
  assert.match(
    appSource,
    /<PageEnemySpine pageBackground=\{pageBackground\} \/>/
  )

  assert.match(enemySource, /new SpinePlayer/)
  assert.match(enemySource, /selectRandomPageEnemy/)
  assert.match(enemySource, /className="page-enemy-spine"/)
  assert.match(enemySource, /showControls:\s*false/)
  assert.match(enemySource, /interactive:\s*false/)
  assert.match(enemySource, /alpha:\s*true/)
  assert.match(enemySource, /backgroundColor:\s*'00000000'/)

  assert.match(globalStyles, /\.page-enemy-spine\s*{[\s\S]*position:\s*fixed;/)
  assert.match(globalStyles, /\.page-enemy-spine\s*{[\s\S]*right:/)
  assert.match(globalStyles, /\.page-enemy-spine\s*{[\s\S]*bottom:/)
  assert.match(
    globalStyles,
    /\.page-enemy-spine\s*{[\s\S]*pointer-events:\s*none;/
  )
  assert.match(
    globalStyles,
    /\.page-enemy-spine \.spine-player\s*{[\s\S]*width:\s*100%;[\s\S]*height:\s*100%;/
  )
  assert.match(
    globalStyles,
    /@media \(max-width: 700px\)[\s\S]*\.page-enemy-spine\s*{[\s\S]*display:\s*none;/
  )
})

test('player weapon texture swap uses the full-size weapon gear texture', () => {
  const playerSource = fs.readFileSync('src/PagePlayerSpine.tsx', 'utf8')
  const weaponSource = fs.readFileSync('src/utils/playerWeapons.ts', 'utf8')

  assert.match(weaponSource, /gear\/weapons/)
  assert.doesNotMatch(weaponSource, /itemIcons/)
  assert.match(playerSource, /new GLTexture\(player\.context,\s*image\)/)
  assert.match(playerSource, /buildTextureRegion\(texture,\s*image\)/)
  assert.match(playerSource, /region\.width = width/)
  assert.match(playerSource, /region\.height = height/)
})
