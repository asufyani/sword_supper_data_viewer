import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TextField from '@mui/material/TextField'
import type { Item, ItemsTableProps, Slot} from './types'
import { RarityChip } from './RarityChip'
import { useState, useCallback, type ChangeEvent } from 'react'
import { TableContainer, Paper, ToggleButton, ToggleButtonGroup, TableSortLabel, Tooltip } from '@mui/material'
import { UpgradeList } from './UpgradeList'
import { getComparator } from './utils/get_comparator'


export const ArmorTable: React.FC<ItemsTableProps> = ({itemsArray, itemNameMap, goTo}) => {
  const [searchString, setSearchString] = useState('');
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

  const [orderBy, setOrderBy] = useState<PropName>('name');
  const [order, setOrder] = useState(1);

  type PropName = 'name' | 'requiredLevel' | 'dmg'
  
  const handleHeaderClick = useCallback((propName: PropName) => {
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
          <TableCell className='sortable' onClick={()=>{handleHeaderClick('name')}}><Tooltip title="Click to sort"><span>Name<TableSortLabel active={orderBy == 'name'} direction={(order > 0) ? 'asc' : 'desc'}/></span></Tooltip></TableCell>
          <TableCell>Slot</TableCell>
          <TableCell>Stat Modifiers and Abilities</TableCell>
          <TableCell className='sortable' onClick={()=>{handleHeaderClick('requiredLevel')}}>Minimum Level<TableSortLabel active={orderBy == 'requiredLevel'} direction={(order > 0) ? 'asc' : 'desc'}/></TableCell>
          <TableCell>Upgrades</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredItems.sort(getComparator(orderBy, order)).map( item => <TableRow>
          <TableCell id={item.id}><RarityChip item={item} goTo={goTo}/></TableCell>
          <TableCell>{item.equipSlots}</TableCell>
          <TableCell>
            {item.statModifiers.map(modifier => <div>{modifier.stat}: {modifier.value}</div>)}
            {item.abilities?.map(ability => <div>{ability.id}</div>)}
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