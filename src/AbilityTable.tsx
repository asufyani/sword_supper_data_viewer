import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TextField from '@mui/material/TextField'
import { useState, type ChangeEvent } from 'react'
import { abilityNameMap } from './utils/abilityNames.js'
import type { ItemNameMap } from './types'

export const AbilityTable: React.FC<{ itemNamesMap: ItemNameMap }> = () => {
  const [searchString, setSearchString] = useState('')
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchString(event.target.value.toLowerCase())
  }

  return (
    <>
      <TextField onChange={handleSearchChange}></TextField>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(abilityNameMap)
            .filter((abilityname) =>
              abilityNameMap[abilityname as keyof typeof abilityNameMap].name
                .toLowerCase()
                .includes(searchString)
            )
            .map((abilityName) => {
              const ability =
                abilityNameMap[abilityName as keyof typeof abilityNameMap]
              return (
                <TableRow key={abilityName}>
                  <TableCell>{ability.name}</TableCell>
                  <TableCell>{ability.description}</TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </>
  )
}

export default AbilityTable
