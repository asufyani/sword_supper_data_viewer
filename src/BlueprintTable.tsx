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
import { AssetIcon } from './AssetIcon'

export const BlueprintTable: React.FC<ItemsTableProps> = ({
  itemsArray,
  itemNameMap,
  goTo,
}) => {
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
            <TableCell>Upgrades</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itemsArray
            .filter((item) => item.name.toLowerCase().includes(searchString))
            .map((item) => (
              <TableRow key={item.id}>
                <TableCell id={item.id}>
                  <AssetIcon assetName={item.assetName} rarity={item.rarity} />
                  <RarityChip item={item} />
                </TableCell>
                <TableCell>
                  <UpgradeList
                    itemNameMap={itemNameMap}
                    upgrades={item.upgrades}
                    goTo={goTo}
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  )
}

export default BlueprintTable
