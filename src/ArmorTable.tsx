import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TextField from '@mui/material/TextField'
import type { Item, ItemsTableProps, Slot, SortableProperty } from './types'
import { RarityChip } from './RarityChip'
import { useState, useCallback, type ChangeEvent } from 'react'
import {
  TableContainer,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material'
import { UpgradeList } from './UpgradeList'
import { getItemComparator } from './utils/get_comparator'
import { SortableHeader } from './SortableHeader'
import { StatsDisplay } from './StatsDisplay'
import { useDebounceValue } from 'usehooks-ts'
import { AssetIcon } from './AssetIcon'
import React from 'react'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'

const formatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
})

export const ArmorTable: React.FC<ItemsTableProps> = ({
  itemsArray,
  itemNameMap,
  goTo,
  upgradeMaterialsList,
  itemDropLocations,
}) => {
  const [searchString, setSearchString] = useDebounceValue('', 250)
  const [slot, setSlots] = useState<Slot>()

  const handleChangeSlots = (
    _event: React.MouseEvent<HTMLElement>,
    newSlot: Slot
  ) => {
    setSlots(newSlot)
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchString(event.target.value.toLowerCase())
  }

  const [orderBy, setOrderBy] = useState<SortableProperty>('name')
  const [order, setOrder] = useState(1)

  const handleHeaderClick = useCallback(
    (propName: SortableProperty) => {
      if (orderBy == propName) {
        setOrder(-1 * order)
      } else {
        setOrder(1)
        setOrderBy(propName)
      }
    },
    [order, setOrder, orderBy, setOrderBy]
  )

  const filterFunction = useCallback(
    (item: Item) => {
      return (
        item.name.toLowerCase().includes(searchString) &&
        (!slot || item.equipSlots.includes(slot))
      )
    },
    [searchString, slot]
  )

  const filteredItems = itemsArray.filter(filterFunction)

  function Row(props: { item: Item }) {
    const { item } = props
    const [open, setOpen] = React.useState(false)
    const itemHasDropLocations = !!Object.keys(itemDropLocations[item.id])
      .length
    return (
      <React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} key={item.id}>
          <TableCell id={item.id}>
            <AssetIcon assetName={item.assetName} rarity={item.rarity} />
            <RarityChip item={item} goTo={goTo} />
          </TableCell>
          <TableCell>{item.equipSlots}</TableCell>
          <TableCell>
            <StatsDisplay
              statModifiers={item.statModifiers}
              abilities={item.abilities}
            />
          </TableCell>
          {/* <TableCell><RarityChip rarity={item.rarity} key={item.key}/></TableCell> */}
          <TableCell>{item.requiredLevel}</TableCell>
          <TableCell>
            <UpgradeList
              itemId={item.id}
              itemNameMap={itemNameMap}
              upgrades={item.upgrades}
              upgradeMaterialsList={upgradeMaterialsList}
              goTo={goTo}
            />
          </TableCell>
          <TableCell align="center">
            {itemHasDropLocations && (
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(!open)}
              >
                {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              {Object.keys(itemDropLocations[item.id]).map((tierName) => {
                return (
                  <div>
                    {tierName}:{' '}
                    {formatter.format(itemDropLocations[item.id][tierName])}
                  </div>
                )
              })}
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    )
  }

  return (
    <>
      <TextField onChange={handleSearchChange}></TextField>
      <ToggleButtonGroup
        value={slot}
        exclusive
        onChange={handleChangeSlots}
        aria-label="text alignment"
      >
        <ToggleButton value="Amulet">Amulet</ToggleButton>
        <ToggleButton value="Belt">Belt</ToggleButton>
        <ToggleButton value="Chest">Chest</ToggleButton>

        <ToggleButton value="Head">Head</ToggleButton>

        <ToggleButton value="Ring">Ring</ToggleButton>
      </ToggleButtonGroup>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <SortableHeader
                handleHeaderClick={handleHeaderClick}
                order={order}
                orderBy={orderBy}
                label="Name"
                property="name"
              />
              <TableCell>Slot</TableCell>
              <TableCell>Stat Modifiers and Abilities</TableCell>
              <SortableHeader
                handleHeaderClick={handleHeaderClick}
                order={order}
                orderBy={orderBy}
                label="Required Level"
                property="requiredLevel"
              />
              <TableCell>Upgrades</TableCell>
              <TableCell>Drops From</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems
              .sort(getItemComparator(orderBy, order))
              .map((item) => (
                <Row item={item} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

export default ArmorTable
