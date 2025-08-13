import { Accordion, AccordionDetails, AccordionSummary, Chip, TextField, Typography } from '@mui/material';
import type { ItemNameMap, GoToType } from './types';
import {et} from './utils/loot'
import { RarityChip } from './RarityChip';
import { useCallback,  useMemo,  useState, type ChangeEvent } from 'react';
import { useDebounceValue } from 'usehooks-ts';

interface LootTableProps {
  itemNameMap: ItemNameMap
  goTo: GoToType
}

type LootTable = {
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
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
})



type LootKey = keyof LootTable;
export const ArmorTable: React.FC<LootTableProps> = ({itemNameMap, goTo}) => {
  const lootTable: Record<string, LootTable> = useMemo(() => {return et}, []);

  const [searchString, setSearchString] = useDebounceValue('', 500);

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      setSearchString(event.target.value.toLowerCase().trim())
  }, [setSearchString]);
  const goToTable = useCallback((tableId: string) => {
    const element = document.getElementById(tableId);
    element?.scrollIntoView({behavior: 'smooth'});
  }, []);


  return (
    <>
      <TextField onChange={handleSearchChange}></TextField>
    
      {Object.keys(lootTable).map((key) => {
        const tableHasItem = lootTable[key].tiers.some((tier) =>  tier.items.some((item) => item.id && itemNameMap[item.id].name.toLowerCase().includes(searchString)));
        const showTable = tableHasItem || !searchString;
        if (showTable) {
          return <Accordion id={key} key={key}>
            <AccordionSummary id={key}>
              <Typography component="span">{key}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {(lootTable[key as LootKey].tiers || []).map((tier, idx) => {
                const totalWeight: number = tier.items.reduce((total, item) => { return total + (item.weight || 0)}, 0);
                const tierHasItem = tier.items.some((item) => item.id && itemNameMap[item.id].name.toLowerCase().includes(searchString));
                const showTier = tierHasItem || !searchString;
                if (showTier) {
                  return <Accordion key={key+'-'+idx} >
                    <AccordionSummary>{tier.minLevel}{tier.maxLevel ? '-'+tier.maxLevel : '+'}</AccordionSummary>
                    <AccordionDetails>
                      {tier.items.map((item, itemIdx) => {
                        const itemToLink = item.id && itemNameMap[item.id];
                        const dropPercentage = ((item.weight || 0)/totalWeight);
                        const dropRate = dropPercentage ? formatter.format(dropPercentage) : undefined;
                        return <span key={key+'-'+idx+'-'+ (item.id || item.tableId)+itemIdx}>
                          {itemToLink && <RarityChip item={itemToLink} showPopover={true} goTo={goTo} weight={dropRate}/>}
                          {item.tableId && <Chip label={dropRate ? `${item.tableId} - ${dropRate}` : item.tableId} className='loot-table-link' onClick={() => {goToTable(item.tableId || '')}}/>}
                        </span>
                      })}
                    </AccordionDetails>
                  </Accordion>
                }
              })}
            </AccordionDetails>
          </Accordion>
        }
      }

      )}
    </>
  )
  
      
}

export default ArmorTable;