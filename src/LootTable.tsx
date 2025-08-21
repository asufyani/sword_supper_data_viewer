import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  TextField,
  Typography,
} from '@mui/material'
import type { ItemNameMap, GoToType } from './types'
import { et } from './utils/loot'
import { RarityChip } from './RarityChip'
import { useCallback, useMemo, type ChangeEvent } from 'react'
import { useDebounceValue } from 'usehooks-ts'

interface LootTableProps {
  itemNameMap: ItemNameMap
  goTo: GoToType
}

type LootTableData = {
  tiers: LootTier[]
}

type LootTier = {
  minLevel: number
  maxLevel?: number
  items: LootItem[]
}

type LootItem = {
  id?: string
  tableId?: string
  weight?: number
  quantity?: number | number[]
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
})

type LootKey = keyof LootTableData
export const LootTable: React.FC<LootTableProps> = ({ itemNameMap, goTo }) => {
  const lootTable: Record<string, LootTableData> = useMemo(() => {
    return et
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
          itemNameMap[item.id].name.toLowerCase().includes(searchString)
      ),
    [itemNameMap]
  )

  const filterTables = useCallback(
    (key: string) => {
      const tableHasItem = lootTable[key].tiers.some(tierHasItem(searchString))
      const showTable = tableHasItem || !searchString
      return showTable
    },
    [tierHasItem, lootTable]
  )

  const filteredTableKeys = useMemo(() => {
    return Object.keys(lootTable).filter(filterTables)
  }, [lootTable, filterTables])

  return (
    <>
      <TextField onChange={handleSearchChange}></TextField>

      {filteredTableKeys.map((key) => {
        const tableHasItem = lootTable[key].tiers.some(
          tierHasItem(searchString)
        )
        const showTable = tableHasItem || !searchString
        if (showTable) {
          return (
            <Accordion id={key} key={key}>
              <AccordionSummary id={key}>
                <Typography component="span">{key}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {(lootTable[key as LootKey].tiers || []).map((tier, idx) => {
                  const totalWeight: number = tier.items.reduce(
                    (total, item) => {
                      return total + (item.weight || 0)
                    },
                    0
                  )
                  const showTier =
                    tierHasItem(searchString)(tier) || !searchString
                  if (showTier) {
                    return (
                      <Accordion key={key + '-' + idx}>
                        <AccordionSummary>
                          <Typography component={'span'}>
                            {tier.minLevel}
                            {tier.maxLevel ? '-' + tier.maxLevel : '+'}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {tier.items.map((item, itemIdx) => {
                            debugger
                            const itemToLink = item.id && itemNameMap[item.id]
                            const dropPercentage =
                              (item.weight || 0) / totalWeight
                            const dropRate = dropPercentage
                              ? formatter.format(dropPercentage)
                              : undefined
                            let quantityString
                            if (
                              item.quantity &&
                              typeof item.quantity !== 'number'
                            ) {
                              quantityString = item.quantity.join('-')
                            }
                            return (
                              <span
                                key={
                                  key +
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
                  }
                })}
              </AccordionDetails>
            </Accordion>
          )
        }
      })}
    </>
  )
}

export default LootTable
