import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TextField from '@mui/material/TextField'
import type { damageType, ItemsTableProps, SortableProperty } from './types'
import { RarityChip } from './RarityChip'
import { useState, type ChangeEvent } from 'react'
import { UpgradeList } from './UpgradeList'
import { SortableHeader } from './SortableHeader'
import { getComparator } from './utils/get_comparator'


export const WeaponTable: React.FC<ItemsTableProps> = ({itemsArray, itemNameMap, goTo}) => {

  const [searchString, setSearchString] = useState('');
  const [orderBy, setOrderBy] = useState<SortableProperty>('name');
  const [order, setOrder] = useState(1);

  const handleHeaderClick = (propName: SortableProperty) => {
    if (orderBy == propName) {
      setOrder(-1  * order);
    }
    else {
      setOrder(1);
      setOrderBy(propName);
    }
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSearchString(event.target.value.toLowerCase())
  };
  return (
    <>
    <TextField onChange={handleSearchChange}></TextField>
    <Table stickyHeader >
        <TableHead>
      <TableRow>
          <SortableHeader handleHeaderClick={handleHeaderClick} orderBy={orderBy} order={order} label='Name' property='name'/>
          <SortableHeader handleHeaderClick={handleHeaderClick} orderBy={orderBy} order={order} label='Damage' property='dmg'/>
          <TableCell>Stat Modifiers and Abilities</TableCell>
          <SortableHeader handleHeaderClick={handleHeaderClick} orderBy={orderBy} order={order} label='Required Level' property='requiredLevel'/>
          <TableCell>Upgrades</TableCell>
      </TableRow>
        </TableHead>
      <TableBody>
        {itemsArray.filter(item => item.name.toLowerCase().includes(searchString)).sort(getComparator(orderBy, order)).map( item => <TableRow key= {item.id+'-row'} id={item.id+'-row'}>
          <TableCell key={item.id} id={item.id}><RarityChip item={item} goTo={goTo}/></TableCell>
          <TableCell key={item.id+'-damage'}>{(Object.keys(item.damage || {}) as damageType[]).map(typeString=> <span key={item.id+'-'+typeString}>{typeString} : {item.damage![typeString]} </span>)}</TableCell>
          <TableCell key={item.id+'-mods'}>
            {item.statModifiers.map(modifier => <div key={item.id+'-'+modifier.stat}>{modifier.stat}: {modifier.value}</div>)}
            {item.abilities?.map(ability => <div key={item.id+'-'+ability.id}>{ability.id}</div>)}
          </TableCell>
          <TableCell>{item.requiredLevel}</TableCell>
          <TableCell><UpgradeList itemNameMap={itemNameMap} upgrades={item.upgrades} goTo={goTo}/></TableCell>
        </TableRow>)}
      </TableBody>
    </Table>
    </>
  )
  
      
}

export default WeaponTable;