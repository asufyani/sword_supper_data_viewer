export type ability = {
  type: string,
  id: string
}

export type statModifier = {
  type: string,
  stat: string,
  value: number,
  modifierType: 'add'
}

export type UpgradeRequirement = {
  id: string,
  amount: number
}

export type Upgrade = {
  requires: UpgradeRequirement[],
  yields: string
}

export type GoToType = (tab: TabName, id: string) => void

export interface ItemsTableProps {
  itemsArray: Item[],
  itemNameMap: ItemNameMap,
  goTo?: GoToType
}

export type TabName = 'Armor' | 'Weapons' | 'Blueprints' | 'Maps';

export type ItemNameMap = Record<string, Item>

export type Slot = 'Amulet' | 'Belt' | 'Chest' | 'Head' | 'Ring' | 'Weapon';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type Item = {
  rarity: Rarity;
  abilities?: ability[],
  tags: string[],
  statModifiers: statModifier[]
  equipSlots: Slot[],
  isStackable: boolean,
  amount: number,
  upgrades: Upgrade[]
  retainOnUpgrade: boolean,
  requiredLevel: number,
  sellPrice: number,
  name: string,
  assetName?: string,
  description: string,
  damage?: { [key in damageType]?: number}
  id: string
}

export type ItemData = Partial<Item>

export type damageType = 'physical' | 'lightning' | 'fire' | 'shadow' | 'ice'

export type SortableProperty = 'name' | 'requiredLevel' | 'dmg'

