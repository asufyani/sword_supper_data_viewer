import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TextField from '@mui/material/TextField'
import type { damageType, Item, ItemsTableProps, Slot} from './types'
import { RarityChip } from './RarityChip'
import { useState, type ChangeEvent } from 'react'
import { TableContainer, Paper, ToggleButton, ToggleButtonGroup, TableSortLabel } from '@mui/material'
import { UpgradeList } from './UpgradeList'


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
  
    const getComparator = (property: PropName, order: number): ((a: Item, b: Item) => number) => {
      if (property == 'name' || property == 'requiredLevel') {
        return (a:Item, b: Item) => { return order  * ((a[property] < b[property]) ? -1 : 1)}
      }
      else {
        return (a:Item, b: Item) => {
          let aDamage=0, bDamage=0;
          Object.keys(a.damage || {}).forEach((key: string) => {
            if (a.damage) {
              aDamage += (a.damage[key as damageType] || 0);
            }
          });
          Object.keys(b.damage || {}).forEach((key) => {
            if (b.damage) {
              bDamage += (b.damage[key as damageType] || 0);
            }
          });
          return order * (aDamage < bDamage ? -1 : 1);
        }
      }
  
    }
  
    const handleHeaderClick = (propName: PropName) => {
      if (orderBy == propName) {
        setOrder(-1  * order);
      }
      else {
        setOrder(1);
        setOrderBy(propName);
      }
    }


  const filteredBySlots = slot ? itemsArray.filter(item => item.equipSlots.includes(slot)) : itemsArray;

  const filteredItems = filteredBySlots.filter(item => item.name.toLowerCase().includes(searchString));

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
          <TableCell className='clickable' onClick={()=>{handleHeaderClick('name')}}>Name<TableSortLabel active={orderBy == 'name'} direction={(order > 0) ? 'asc' : 'desc'}/></TableCell>
          <TableCell>Slot</TableCell>
          <TableCell>Stat Modifiers and Abilities</TableCell>
          <TableCell className='clickable' onClick={()=>{handleHeaderClick('requiredLevel')}}>Minimum Level<TableSortLabel active={orderBy == 'requiredLevel'} direction={(order > 0) ? 'asc' : 'desc'}/></TableCell>
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