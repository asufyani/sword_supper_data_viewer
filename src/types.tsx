export type ability = {
  type: string
  id: string
}

export type statModifier = {
  type: string
  stat: string
  value: number
  modifierType: 'add'
}

export type UpgradeRequirement = {
  id: string
  amount: number
}

export type Upgrade = {
  requires: UpgradeRequirement[]
  yields: string
}

export type GoToType = (tab: TabName, id: string) => void

export interface ItemsTableProps {
  itemsArray: Item[]
  itemNameMap: ItemNameMap
  goTo?: GoToType
  upgradeMaterialsList?: Record<string, string[]>
}

export type TabName = 'Armor' | 'Weapons' | 'Blueprints' | 'Maps'

export type ItemNameMap = Record<string, Item>

export type Slot = 'Amulet' | 'Belt' | 'Chest' | 'Head' | 'Ring' | 'Weapon'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type Item = {
  rarity: Rarity
  abilities?: ability[]
  tags: string[]
  statModifiers: statModifier[]
  equipSlots: Slot[]
  isStackable: boolean
  amount: number
  upgrades: Upgrade[]
  retainOnUpgrade: boolean
  requiredLevel: number
  sellPrice: number
  name: string
  assetName: string
  description: string
  damage?: { [key in damageType]?: number }
  id: string
}

export type ItemData = Partial<Item>

export const damageTypes = [
  'physical',
  'lightning',
  'fire',
  'shadow',
  'ice',
] as const

export type damageType = (typeof damageTypes)[number]

export type Enemy = {
  id: string
  name?: string
  baseDamage: number
  baseDefense: number
  baseHp: number
  crit: number
  damageGrowth: number
  damageType: damageType
  defenseGrowth: number
  hpGrowth: number
  dodge: number
  speed: number
  lootTables: LootTable[]
  spineAssetKey: string
  tags: string[]
  lightningResist?: number
  iceResist?: number
  fireResist?: number
  shadowResist?: number
  abilities?: string[]
  scaledHp?: number
  scaledDamage?: number
  scaledDefense?: number
}

export type LootTable = {
  tiers: LootTier[]
  type: string
  enemies?: string[]
  count?: number[]
}

export type LootTier = {
  minLevel: number
  maxLevel?: number
  items: LootItem[]
}

type LootItem = {
  id?: string
  tableId?: string
  weight?: number
  quantity?: number[] | number
}

export type SortableProperty = 'dmg' | keyof Item | keyof Enemy
