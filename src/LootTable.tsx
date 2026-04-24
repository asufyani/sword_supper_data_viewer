import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  TextField,
  Typography,
} from '@mui/material'
import type {
  ItemNameMap,
  GoToType,
  LootTier,
  LootTable as LootTableData,
} from './types'
import { et } from './utils/loot'
import { RarityChip } from './RarityChip'
import { useCallback, useMemo, type ChangeEvent } from 'react'
import { useDebounceValue } from 'usehooks-ts'
import { z3 } from './utils/enemies'
import { enemyNames } from './utils/enemyNames'
import { EnemyAnimationViewer } from './EnemyViewer'

interface LootTableProps {
  itemNameMap: ItemNameMap
  goTo: GoToType
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
})

type LootKey = keyof LootTableData
export const LootTable: React.FC<LootTableProps> = ({ itemNameMap, goTo }) => {
  const lootTable: Record<string, LootTableData> = useMemo(() => {
    const processedLoot: Record<string, LootTableData> = {}
    Object.keys(et).forEach((lootTableName) => {
      processedLoot[lootTableName] = {
        enemies: [],
        ...et[lootTableName],
      }
      Object.keys(z3).forEach((enemyKey) => {
        if (z3[enemyKey].lootTables.includes(et[lootTableName])) {
          processedLoot[lootTableName].enemies?.push(enemyKey)
        }
      })
    })
    return processedLoot
  }, [])

  const [searchString, setSearchString] = useDebounceValue('', 500)

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchString(event.target.value.toLowerCase().trim())
    },
    [setSearchString]
  )
  const goToTable = useCallback((tableId: string) => {
    const element = document.getElementById(tableId)
    element?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const tierHasItem = useCallback(
    (searchString: string) => (tier: LootTier) =>
      tier.items.some(
        (item) =>
          item.id &&
          itemNameMap[item.id]?.name.toLowerCase().includes(searchString)
      ),
    [itemNameMap]
  )

  const getEnemyNames = useCallback((enemyKeys: string[]) => {
    return enemyKeys.map((enemyName) => {
      return enemyNames[enemyName]
    })
  }, [])

  const visibleTables = useMemo(() => {
    return Object.keys(lootTable)
      .map((key) => {
        const tiers = (lootTable[key as LootKey].tiers || []).filter(
          (tier) => !searchString || tierHasItem(searchString)(tier)
        )

        if (searchString && tiers.length === 0) {
          return null
        }

        return {
          enemies: lootTable[key].enemies || [],
          enemyNames: getEnemyNames(lootTable[key].enemies || []),
          key,
          tiers,
        }
      })
      .filter((table): table is NonNullable<typeof table> => table !== null)
  }, [getEnemyNames, lootTable, searchString, tierHasItem])

  return (
    <>
      <TextField label="Search loot" onChange={handleSearchChange}></TextField>

      {visibleTables.map((table) => (
        <Accordion
          id={table.key}
          key={table.key}
          slotProps={{ transition: { unmountOnExit: true } }}
        >
          <AccordionSummary id={table.key}>
            <Typography component="span">
              {table.enemies.length
                ? `${table.key}: ${table.enemyNames.join(', ')}`
                : table.key}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div style={{ display: 'flex' }}>
              {table.enemies.length > 0 &&
                table.enemies.length < 10 &&
                table.enemies.map((enemyKey) => (
                  <EnemyAnimationViewer
                    key={`${table.key}-${enemyKey}`}
                    spineAssetKey={z3[enemyKey].spineAssetKey}
                  />
                ))}
            </div>
            {table.tiers.map((tier, idx) => {
              const totalWeight: number = tier.items.reduce((total, item) => {
                return total + (item.weight || 0)
              }, 0)

              return (
                <Accordion key={table.key + '-' + idx}>
                  <AccordionSummary>
                    <Typography component={'span'}>
                      {tier.minLevel}
                      {tier.maxLevel ? '-' + tier.maxLevel : '+'}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {tier.items.map((item, itemIdx) => {
                      const itemToLink = item.id && itemNameMap[item.id]
                      const dropPercentage = (item.weight || 0) / totalWeight
                      const dropRate = dropPercentage
                        ? formatter.format(dropPercentage)
                        : undefined
                      let quantityString
                      if (item.quantity && typeof item.quantity !== 'number') {
                        quantityString = item.quantity.join('-')
                      }

                      return (
                        <span
                          key={
                            table.key +
                            '-' +
                            idx +
                            '-' +
                            (item.id || item.tableId) +
                            itemIdx
                          }
                        >
                          {itemToLink && (
                            <RarityChip
                              item={itemToLink}
                              showPopover={itemToLink.tags.includes(
                                'equipment'
                              )}
                              goTo={goTo}
                              weight={dropRate}
                              quantityString={quantityString}
                              showIcon={true}
                            />
                          )}
                          {item.id && !itemToLink && (
                            <Chip
                              label={
                                dropRate ? `${item.id} - ${dropRate}` : item.id
                              }
                            />
                          )}
                          {item.tableId && (
                            <Chip
                              label={
                                dropRate
                                  ? `${item.tableId} - ${dropRate}`
                                  : item.tableId
                              }
                              className="loot-table-link"
                              onClick={() => {
                                goToTable(item.tableId || '')
                              }}
                            />
                          )}
                        </span>
                      )
                    })}
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  )
}

export default LootTable
