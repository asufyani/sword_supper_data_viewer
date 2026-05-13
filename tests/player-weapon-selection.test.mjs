import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('clicking a weapon asset icon selects the player Spine weapon texture', () => {
  const appSource = fs.readFileSync('src/App.tsx', 'utf8')
  const playerSource = fs.readFileSync('src/PagePlayerSpine.tsx', 'utf8')
  const weaponTableSource = fs.readFileSync('src/WeaponTable.tsx', 'utf8')
  const playerWeaponSource = fs.readFileSync(
    'src/utils/playerWeapons.ts',
    'utf8'
  )
  const globalStyles = fs.readFileSync('src/index.css', 'utf8')

  assert.match(appSource, /useState<PlayerWeaponAsset \| null>\(null\)/)
  assert.match(
    appSource,
    /<PagePlayerSpine selectedWeapon=\{selectedPlayerWeapon\} \/>/
  )
  assert.match(appSource, /onSelectPlayerWeapon=\{setSelectedPlayerWeapon\}/)

  assert.match(playerSource, /selectedWeapon\?: PlayerWeaponAsset \| null/)
  assert.match(
    playerSource,
    /const randomWeapon = useMemo\(\(\) => selectRandomPlayerWeapon\(\), \[\]\)/
  )
  assert.match(playerSource, /const weapon = selectedWeapon \?\? randomWeapon/)

  assert.match(playerWeaponSource, /getPlayerWeaponAssetForItem/)
  assert.match(
    weaponTableSource,
    /onSelectPlayerWeapon\?: \(weapon: PlayerWeaponAsset\) => void/
  )
  assert.match(weaponTableSource, /onSelectPlayerWeapon=\{onSelectPlayerWeapon\}/)
  assert.match(weaponTableSource, /className="weapon-asset-button"/)
  assert.match(
    weaponTableSource,
    /onSelectPlayerWeapon\?\.\(getPlayerWeaponAssetForItem\(item\)\)/
  )
  assert.match(globalStyles, /\.weapon-asset-button\s*{/)
  assert.match(
    globalStyles,
    /\.weapon-asset-button\s*\{[^}]*display:\s*inline-block/
  )
  assert.match(
    globalStyles,
    /\.weapon-asset-button\s*\{[^}]*line-height:\s*0/
  )
  assert.match(globalStyles, /\.weapon-asset-button:focus-visible\s*{/)
})
