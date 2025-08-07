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

export interface ItemsTableProps {
  itemsArray: Item[],
  itemNameMap: ItemNameMap
}

export type ItemNameMap = Record<string, {name: string, id: string, rarity: Rarity}>

export type Slot = 'Amulet' | 'Belt' | 'Chest' | 'Head' | 'Ring' | 'Weapon';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type Item = {
  key: string;
  type: string;
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

export type damageType = 'physical' | 'lightning' | 'fire' | 'shadow' | 'ice'
