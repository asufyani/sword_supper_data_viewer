import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TextField from '@mui/material/TextField'
import type { ItemsTableProps, Slot} from './types'
import { RarityChip } from './RarityChip'
import { useState, type ChangeEvent } from 'react'
import { TableContainer, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material'
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
    </ToggleButtonGroup>
    <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Slot</TableCell>
          {/* <TableCell>Rarity</TableCell> */}
          <TableCell>Stat Modifiers and Abilities</TableCell>
          <TableCell>Minimum Level</TableCell>
          <TableCell>Upgrades</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredItems.map( item => <TableRow>
          <TableCell id={item.key}><RarityChip item={item} goTo={goTo}/></TableCell>
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