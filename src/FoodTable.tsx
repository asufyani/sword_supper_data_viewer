import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TextField from '@mui/material/TextField'
import { useState, type ChangeEvent } from 'react'
import { foods, foodNames } from './utils/foods'
import type { ItemNameMap } from './types'
import Typography from '@mui/material/Typography'

const food = foods
export const FoodTable: React.FC<{ itemNamesMap: ItemNameMap }> = ({
  itemNamesMap,
}) => {
  const [searchString, setSearchString] = useState('')

  function getImageUrl(name: string) {
    // Assuming images are in a 'dir' subdirectory relative to the current module
    return new URL(`${window.location}/food/${name}`, import.meta.url).href
  }
  // const urls: string[] = []
  // Object.keys(foods).forEach((filename) =>
  //   urls.push(
  //     'https://eimoap--5ea9dfdf-b835-45a9-b89d-e27ea9f9a35c-0-0-37-webview.devvit.net/assets/food/' +
  //       filename
  //   )
  // )
  // console.log(urls)
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchString(event.target.value.toLowerCase())
  }
  return (
    <>
      <TextField onChange={handleSearchChange}></TextField>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell align="center">Name</TableCell>
            <TableCell>Essences</TableCell>
            <TableCell>Default Names</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(food)
            .filter((key) =>
              food[key as keyof typeof food].some((essence) =>
                essence.id.toLowerCase().includes(searchString)
              )
            )
            .map((foodName) => {
              const essences = food[foodName as keyof typeof food]
              const names = foodNames[foodName as keyof typeof foodNames]
              const imgSrc = getImageUrl(foodName)
              return (
                <TableRow key={foodName}>
                  <TableCell align="center">
                    <img src={imgSrc} height={'100px'} alt={foodName} />
                    <Typography component="div">{foodName}</Typography>
                  </TableCell>
                  <TableCell>
                    {essences.map((essence) => {
                      return (
                        <div key={essence.id}>
                          {itemNamesMap[essence.id].name}: {essence.quantity}
                        </div>
                      )
                    })}
                  </TableCell>
                  <TableCell>
                    {names.map((name) => {
                      return <div key={name}>{name}</div>
                    })}
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </>
  )
}

export default FoodTable
