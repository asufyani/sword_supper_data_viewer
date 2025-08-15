import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TextField from '@mui/material/TextField'
import type { Item, ItemsTableProps, Slot, SortableProperty} from './types'
import { RarityChip } from './RarityChip'
import { useState, useCallback, type ChangeEvent } from 'react'
import { TableContainer, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { UpgradeList } from './UpgradeList'
import { getComparator } from './utils/get_comparator'
import { SortableHeader } from './SortableHeader'
import { StatsDisplay } from './StatsDisplay'
import { useDebounceValue } from 'usehooks-ts'


export const ArmorTable: React.FC<ItemsTableProps> = ({itemsArray, itemNameMap, goTo}) => {
  const [searchString, setSearchString] = useDebounceValue('', 250);
    const [slot, setSlots] = useState<Slot>();

    const handleChangeSlots = (
      _event: React.MouseEvent<HTMLElement>,
      newSlot: Slot,
    ) => {
      setSlots(newSlot);
    };


  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSearchString(event.target.value.toLowerCase())
  };

  const [orderBy, setOrderBy] = useState<SortableProperty>('name');
  const [order, setOrder] = useState(1);
  
  const handleHeaderClick = useCallback((propName: SortableProperty) => {
    if (orderBy == propName) {
      setOrder(-1  * order);
    }
    else {
      setOrder(1);
      setOrderBy(propName);
    }
  }, [order, setOrder, orderBy, setOrderBy])

  const filterFunction = useCallback((item: Item) => {
    return item.name.toLowerCase().includes(searchString)
      && (!slot || item.equipSlots.includes(slot))
  }, [searchString, slot])

  const filteredItems = itemsArray.filter(filterFunction);

  return (
    <>
    <TextField onChange={handleSearchChange}></TextField>
    <ToggleButtonGroup
      value={slot}
      exclusive
      onChange={handleChangeSlots}
      aria-label="text alignment"
    >
      <ToggleButton value="Amulet">
        Amulet
      </ToggleButton>
      <ToggleButton value="Belt">
         Belt
      </ToggleButton>
      <ToggleButton value="Chest">
        Chest
      </ToggleButton>
      
      <ToggleButton value="Head">
        Head
      </ToggleButton>

      <ToggleButton value="Ring">
        Ring
      </ToggleButton>
    </ToggleButtonGroup>
    <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <SortableHeader handleHeaderClick={handleHeaderClick} order={order} orderBy={orderBy} label='Name' property='name'/>
          <TableCell>Slot</TableCell>
          <TableCell>Stat Modifiers and Abilities</TableCell>
          <SortableHeader handleHeaderClick={handleHeaderClick} order={order} orderBy={orderBy} label='Required Level' property='requiredLevel'/>
          <TableCell>Upgrades</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredItems.sort(getComparator(orderBy, order)).map( item => <TableRow key={item.id}>
          <TableCell id={item.id}><RarityChip item={item} goTo={goTo}/></TableCell>
          <TableCell>{item.equipSlots}</TableCell>
          <TableCell>
            <StatsDisplay statModifiers={item.statModifiers} abilities={item.abilities} />
          </TableCell>
          {/* <TableCell><RarityChip rarity={item.rarity} key={item.key}/></TableCell> */}
          <TableCell>{item.requiredLevel}</TableCell>
          <TableCell><UpgradeList itemNameMap={itemNameMap} upgrades={item.upgrades} goTo={goTo}/></TableCell>
        </TableRow>)}
      </TableBody>
    </Table>
    </TableContainer>
    </>
  )
  
      
}

export default ArmorTable;