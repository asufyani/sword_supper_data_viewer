import type { Enemy, ItemNameMap, LootTable } from '../types'

type ItemDropLocations = Record<string, Record<string, number>>
type EnemyNamesByLootTable = Record<string, string[]>

const readableLootTableNames: Record<string, string> = {
  fieldsEquipLoot: 'Fields gear pool',
  mossyForestEquipLoot: 'Mossy Forest gear pool',
  mountainPassEquipLoot: 'Mountain Pass gear pool',
  outerTempleEquipLoot: 'Outer Temple gear pool',
  ruinedPathEquipLoot: 'Ruined Path gear pool',
  seasideCliffsEquipLoot: 'Seaside Cliffs gear pool',
  forbiddenCityEquipLoot: 'Forbidden City gear pool',
  newEdenEquipLoot: 'New Eden gear pool',
  ancientBattlefieldEquipLoot: 'Ancient Battlefield gear pool',
  bossRushFieldsEquipLoot: 'Boss Rush: Fields gear pool',
  bossRushMossyForestEquipLoot: 'Boss Rush: Mossy Forest gear pool',
  bossRushMountainPassEquipLoot: 'Boss Rush: Mountain Pass gear pool',
  bossRushOuterTempleEquipLoot: 'Boss Rush: Outer Temple gear pool',
  bossRushRuinedPathEquipLoot: 'Boss Rush: Ruined Path gear pool',
  bossRushSeasideCliffsEquipLoot: 'Boss Rush: Seaside Cliffs gear pool',
  bossRushForbiddenCityEquipLoot: 'Boss Rush: Forbidden City gear pool',
  bossRushNewEdenEquipLoot: 'Boss Rush: New Eden gear pool',
  bossRushAncientBattlefieldEquipLoot:
    'Boss Rush: Ancient Battlefield gear pool',
  vaultEquipLoot: 'Daily Dungeon vault gear pool',
  vaultGoldLoot: 'Daily Dungeon vault gold pool',
  vaultResourceLoot: 'Daily Dungeon vault resource pool',
}

function getLevelRange(tier: LootTable['tiers'][number]) {
  return tier.maxLevel ? `${tier.minLevel}-${tier.maxLevel}` : `${tier.minLevel}+`
}

function getReadableLootTableName(
  lootTableName: string,
  enemyNamesByLootTable: EnemyNamesByLootTable
) {
  const enemyNames = enemyNamesByLootTable[lootTableName]

  if (enemyNames?.length) {
    return `${enemyNames.join(', ')} loot`
  }

  return readableLootTableNames[lootTableName] || lootTableName
}

export function buildEnemyNamesByLootTable(
  lootTables: Record<string, LootTable>,
  enemies: Record<string, Enemy>,
  enemyNameMap: Record<string, string>
) {
  return Object.entries(lootTables).reduce<EnemyNamesByLootTable>(
    (enemyNamesByLootTable, [lootTableName, lootTable]) => {
      Object.values(enemies).forEach((enemy) => {
        if (enemy.lootTables.includes(lootTable)) {
          enemyNamesByLootTable[lootTableName] ||= []
          enemyNamesByLootTable[lootTableName].push(
            enemyNameMap[enemy.id] || enemy.id
          )
        }
      })

      if (enemyNamesByLootTable[lootTableName]) {
        enemyNamesByLootTable[lootTableName].sort((a, b) => a.localeCompare(b))
      }

      return enemyNamesByLootTable
    },
    {}
  )
}

export function buildItemDropLocations(
  itemNameMap: ItemNameMap,
  lootTableGroups: Record<string, LootTable>[],
  enemyNamesByLootTable: EnemyNamesByLootTable
) {
  const itemDropLocations = Object.keys(itemNameMap).reduce<ItemDropLocations>(
    (locationsByItem, itemId) => {
      locationsByItem[itemId] = {}
      return locationsByItem
    },
    {}
  )

  lootTableGroups.forEach((lootTables) => {
    Object.entries(lootTables).forEach(([lootTableName, lootTable]) => {
      const readableLootTableName = getReadableLootTableName(
        lootTableName,
        enemyNamesByLootTable
      )

      lootTable.tiers.forEach((tier) => {
        const totalWeight = tier.items.reduce((total, item) => {
          return total + (item.weight || 0)
        }, 0)
        const levels = getLevelRange(tier)

        tier.items.forEach((item) => {
          if (item.id && itemDropLocations[item.id]) {
            itemDropLocations[item.id][`${readableLootTableName} ${levels}`] =
              item.weight! / totalWeight
          }
        })
      })
    })
  })

  return itemDropLocations
}
