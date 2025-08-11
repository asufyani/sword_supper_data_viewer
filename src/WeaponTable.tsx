import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TextField from '@mui/material/TextField'
import type { damageType, Item, ItemsTableProps } from './types'
import { RarityChip } from './RarityChip'
import { useState, type ChangeEvent } from 'react'
import { UpgradeList } from './UpgradeList'
import { TableSortLabel } from '@mui/material'


export const WeaponTable: React.FC<ItemsTableProps> = ({itemsArray, itemNameMap, goTo}) => {

  const [searchString, setSearchString] = useState('');
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

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSearchString(event.target.value.toLowerCase())
  };
  return (
    <>
    <TextField onChange={handleSearchChange}></TextField>
    <Table stickyHeader >
        <TableHead>
      <TableRow>
          <TableCell className='clickable' onClick={()=>{handleHeaderClick('name')}}>Name<TableSortLabel active={orderBy == 'name'} direction={(order > 0) ? 'asc' : 'desc'}/></TableCell>
          <TableCell className='clickable' onClick={()=>{handleHeaderClick('dmg')}}>Damage<TableSortLabel active={orderBy == 'dmg'} direction={(order > 0) ? 'asc' : 'desc'}/></TableCell>
          <TableCell>Stat Modifiers and Abilities</TableCell>
          <TableCell className='clickable' onClick={()=>{handleHeaderClick('requiredLevel')}}>Minimum Level<TableSortLabel active={orderBy == 'requiredLevel'} direction={(order > 0) ? 'asc' : 'desc'}/></TableCell>
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