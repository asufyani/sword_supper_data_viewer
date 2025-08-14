import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TextField from '@mui/material/TextField'
import { useState, type ChangeEvent } from 'react'
import { foods } from './utils/foods'
import type { ItemNameMap } from './types'


const food = foods;
export const FoodTable: React.FC<{itemNamesMap: ItemNameMap}> = ({itemNamesMap}) => {
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
            <TableCell>Essences</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(food).filter((key) => food[key as keyof typeof food].some((essence) => essence.id.toLowerCase().includes(searchString))).map((foodName) => {
            const essences = food[foodName as keyof typeof food];
            return <TableRow>
              <TableCell>{foodName}</TableCell>
              <TableCell>
                {
                  essences.map((essence) => {
                    return <div>{itemNamesMap[essence.id].name}: {essence.quantity}</div>
                  })
                }
              </TableCell>
            </TableRow>
          })}
            
        </TableBody>
      </Table>
    </>
  )
}

export default FoodTable
