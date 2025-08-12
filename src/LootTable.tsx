import { Accordion, AccordionDetails, AccordionSummary, Chip, Typography } from '@mui/material';
import type { ItemNameMap, GoToType } from './types';
import {et} from './utils/loot'
import { RarityChip } from './RarityChip';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  id?: string,
  tableId?: string
}

 

type LootKey = keyof typeof et;
export const ArmorTable: React.FC<LootTableProps> = ({itemNameMap, goTo}) => {
  const lootTable: Record<string, LootTable> = useMemo(() => {return et}, []);
  console.log(lootTable);

  const [focusedTable, setFocusedTable] = useState('');
   const goToTable = useCallback((tableId: string) => {
    setFocusedTable(tableId);
  }, [setFocusedTable]);

  useEffect(() => {
    if (focusedTable) {
      const element = document.getElementById(focusedTable);
      element?.scrollIntoView({behavior: 'smooth'});
      element?.click();
    }
  }, [focusedTable])

  const handleClick = (panel: string) => () => {
      setFocusedTable(panel);
    };
  return (
    <>
      {Object.keys(lootTable).map((key) => 
        <Accordion id={key} key={key} expanded={key == focusedTable} onChange={handleClick(key)}>
          <AccordionSummary id={key}>
            <Typography component="span">{key}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {(lootTable[key as LootKey].tiers || []).map((tier, idx) =>
              <Accordion key={key+'-'+idx} >
                <AccordionSummary>{tier.minLevel}{tier.maxLevel ? '-'+tier.maxLevel : '+'}</AccordionSummary>
                <AccordionDetails>
                  {tier.items.map((item, itemIdx) => {
                    const itemToLink = item.id && itemNameMap[item.id];
                    return <span key={key+'-'+idx+'-'+ (item.id || item.tableId)+itemIdx}>
                      {itemToLink && <RarityChip item={itemToLink} showPopover={true} goTo={goTo} />}
                      
                      {item.tableId && <Chip label={item.tableId} className='loot-table-link' onClick={() => {goToTable(item.tableId || '')}}/>}
                    </span>
                  }
                  )}
                </AccordionDetails>
              </Accordion>
            )}
          </AccordionDetails>
        </Accordion>
      )}
    </>
  )
  
      
}

export default ArmorTable;