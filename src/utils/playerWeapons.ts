import { items } from './items'

export type PlayerWeaponAsset = {
  id: string
  assetName: string
  name: string
}

const FALLBACK_PLAYER_WEAPON: PlayerWeaponAsset = {
  id: 'RusticSword',
  assetName: 'RusticSword',
  name: 'Rustic Sword',
}

function buildPlayerWeaponAssets() {
  const weaponAssetsByName = new Map<string, PlayerWeaponAsset>()

  for (const item of Object.values(items)) {
    if (
      !item.assetName ||
      !item.tags.includes('equipment') ||
      !item.equipSlots.includes('Weapon')
    ) {
      continue
    }

    if (!weaponAssetsByName.has(item.assetName)) {
      weaponAssetsByName.set(item.assetName, {
        id: item.id,
        assetName: item.assetName,
        name: item.name,
      })
    }
  }

  return Array.from(weaponAssetsByName.values()).sort((first, second) =>
    first.assetName.localeCompare(second.assetName)
  )
}

export const PLAYER_WEAPON_ASSETS = buildPlayerWeaponAssets()

export function selectRandomPlayerWeapon(random = Math.random) {
  const index = Math.floor(random() * PLAYER_WEAPON_ASSETS.length)

  return PLAYER_WEAPON_ASSETS[index] ?? FALLBACK_PLAYER_WEAPON
}

export function getPlayerWeaponAssetPath(weapon: PlayerWeaponAsset) {
  return `${import.meta.env.BASE_URL}gear/weapons/${weapon.assetName}.png`
}
