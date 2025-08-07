import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TextField from '@mui/material/TextField'
import type { damageType, ItemsTableProps } from './types'
import { RarityChip } from './RarityChip'
import { useState, type ChangeEvent } from 'react'
import { UpgradeList } from './UpgradeList'


export const WeaponTable: React.FC<ItemsTableProps> = ({itemsArray, itemNameMap, goTo}) => {

  const [searchString, setSearchString] = useState('');


  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSearchString(event.target.value.toLowerCase())
  };
  return (
    <>
    <TextField onChange={handleSearchChange}></TextField>
    <Table stickyHeader >
        <TableHead>
      <TableRow>
          <TableCell>Name</TableCell>
          {/* <TableCell>Rarity</TableCell> */}
          <TableCell>Damage</TableCell>
          <TableCell>Stat Modifiers and Abilities</TableCell>
          <TableCell>Minimum Level</TableCell>
          <TableCell>Upgrades</TableCell>
      </TableRow>
        </TableHead>
      <TableBody>
        {itemsArray.filter(item => item.name.toLowerCase().includes(searchString)).map( item => <TableRow>
          <TableCell id={item.key}><RarityChip item={item} goTo={goTo}/></TableCell>
          {/* <TableCell><RarityChip rarity={weapon.rarity} key={weapon.key}/></TableCell> */}
          <TableCell>{(Object.keys(item.damage || {}) as damageType[]).map(typeString=> <span>{typeString} : {item.damage![typeString]} </span>)}</TableCell>
          <TableCell>
            {item.statModifiers.map(modifier => <div>{modifier.stat}: {modifier.value}</div>)}
            {item.abilities?.map(ability => <div>{ability.id}</div>)}
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