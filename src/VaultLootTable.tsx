import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback, useMemo, type ChangeEvent } from 'react'
import { useDebounceValue } from 'usehooks-ts'
import type { GoToType, ItemNameMap, LootTier } from './types'
import { RarityChip } from './RarityChip'
import { vaultLootTables } from './utils/vaultLoot'

interface VaultLootTableProps {
  itemNameMap: ItemNameMap
  goTo: GoToType
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
})

type VisibleVaultTable = {
  key: string
  tiers: LootTier[]
}

export default function VaultLootTable({
  itemNameMap,
  goTo,
}: VaultLootTableProps) {
  const [searchString, setSearchString] = useDebounceValue('', 500)

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchString(event.target.value.toLowerCase().trim())
    },
    [setSearchString]
  )

  const tierHasItem = useCallback(
    (needle: string) => (tier: LootTier) =>
      tier.items.some(
        (item) =>
          item.id && itemNameMap[item.id]?.name.toLowerCase().includes(needle)
      ),
    [itemNameMap]
  )

  const visibleTables = useMemo<VisibleVaultTable[]>(() => {
    return Object.entries(vaultLootTables).reduce<VisibleVaultTable[]>(
      (tables, [key, table]) => {
        const tiers = table.tiers.filter(
          (tier) => !searchString || tierHasItem(searchString)(tier as LootTier)
        )

        if (searchString && tiers.length === 0) {
          return tables
        }

        tables.push({
          key,
          tiers: tiers as LootTier[],
        })

        return tables
      },
      []
    )
  }, [searchString, tierHasItem])

  return (
    <>
      <TextField label="Search vault loot" onChange={handleSearchChange} />

      {visibleTables.map((table) => (
        <Accordion
          id={table.key}
          key={table.key}
          slotProps={{ transition: { unmountOnExit: true } }}
        >
          <AccordionSummary id={table.key}>
            <Typography component="span">{table.key}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {table.tiers.map((tier, idx) => {
              const totalWeight = tier.items.reduce((total, item) => {
                return total + (item.weight || 0)
              }, 0)

              return (
                <Accordion key={`${table.key}-${idx}`}>
                  <AccordionSummary>
                    <Typography component="span">
                      {tier.minLevel}
                      {tier.maxLevel ? '-' + tier.maxLevel : '+'}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {tier.items.map((item, itemIdx) => {
                      const itemToLink = item.id && itemNameMap[item.id]
                      const dropPercentage =
                        totalWeight > 0 ? (item.weight || 0) / totalWeight : 0
                      const dropRate = dropPercentage
                        ? formatter.format(dropPercentage)
                        : undefined

                      let quantityString
                      if (
                        'quantity' in item &&
                        item.quantity &&
                        typeof item.quantity !== 'number'
                      ) {
                        quantityString = item.quantity.join('-')
                      }

                      return (
                        <span key={`${table.key}-${idx}-${item.id}-${itemIdx}`}>
                          {itemToLink ? (
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
                          ) : item.id ? (
                            <Chip
                              label={
                                dropRate ? `${item.id} - ${dropRate}` : item.id
                              }
                            />
                          ) : null}
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
