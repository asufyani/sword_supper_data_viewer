import type { Rarity } from '../types'

export const rarityColorMap: Record<Rarity, string> = {
  common: 'var(--rarity-common)',
  uncommon: 'var(--rarity-uncommon)',
  rare: 'var(--rarity-rare)',
  epic: 'var(--rarity-epic)',
  legendary: 'var(--rarity-legendary)',
  mythic: 'var(--rarity-mythic)',
}

export function getRarityColor(rarity: Rarity) {
  return rarityColorMap[rarity]
}
