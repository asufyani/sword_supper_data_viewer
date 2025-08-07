import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TextField from '@mui/material/TextField'
import type { ItemsTableProps } from './types'
import { RarityChip } from './RarityChip'
import { useState, type ChangeEvent } from 'react'
import { UpgradeList } from './UpgradeList'


export const BlueprintTable: React.FC<ItemsTableProps> = ({itemsArray, itemNameMap}) => {

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
          <TableCell>Upgrades</TableCell>
      </TableRow>
        </TableHead>
      <TableBody>
        {itemsArray.filter(item => item.name.toLowerCase().includes(searchString)).map( item => <TableRow>
          <TableCell id={item.key}><RarityChip key={item.key} label={item.name} rarity={item.rarity}/></TableCell>
          <TableCell><UpgradeList itemNameMap={itemNameMap} upgrades={item.upgrades}/></TableCell>
        </TableRow>)}
      </TableBody>
    </Table>
    </>
  )
  
      
}

export default BlueprintTable;