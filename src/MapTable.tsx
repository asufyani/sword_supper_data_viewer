import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import type { ItemsTableProps } from './types'
import { RarityChip } from './RarityChip'


export const MapTable: React.FC<ItemsTableProps> = ({itemsArray, itemNameMap}) => {

  console.log(itemsArray);
  return (
    <>
    <Table stickyHeader >
        <TableHead>
      <TableRow>
          <TableCell>Name</TableCell>
      </TableRow>
        </TableHead>
      <TableBody>
        {itemsArray.map( item => <TableRow>
          <TableCell id={item.id}><RarityChip item={itemNameMap[item.id]} /></TableCell>
          <TableCell>{item.description}</TableCell>
        </TableRow>)}
      </TableBody>
    </Table>
    </>
  )
  
      
}

export default MapTable;