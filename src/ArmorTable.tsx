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

function ArmorRow({
  item,
  itemDropLocations,
  itemNameMap,
  upgradeMaterialsList,
  goTo,
}: {
  item: Item
  itemDropLocations: Record<string, Record<string, number>>
  itemNameMap: ItemsTableProps['itemNameMap']
  upgradeMaterialsList: ItemsTableProps['upgradeMaterialsList']
  goTo: ItemsTableProps['goTo']
}) {
  const [open, setOpen] = React.useState(false)
  const dropLocations = itemDropLocations[item.id]
  const tierNames = Object.keys(dropLocations)
  const itemHasDropLocations = tierNames.length > 0

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} key={item.id}>
        <TableCell id={item.id}>
          <AssetIcon
            assetName={item.assetName || item.id}
            rarity={item.rarity}
          />
          <RarityChip item={item} goTo={goTo} />
        </TableCell>
        <TableCell>{item.equipSlots}</TableCell>
        <TableCell>
          <StatsDisplay
            statModifiers={item.statModifiers}
            abilities={item.abilities}
          />
        </TableCell>
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
            {tierNames.map((tierName) => (
              <div key={`${item.id}-${tierName}`}>
                {tierName}:{' '}
                {formatter.format(itemDropLocations[item.id][tierName])}
              </div>
            ))}
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

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

  const visibleItems = React.useMemo<Item[]>(
    () =>
      [...itemsArray.filter(filterFunction)].sort(
        getItemComparator(orderBy, order)
      ),
    [filterFunction, itemsArray, order, orderBy]
  )

  return (
    <>
      <TextField label="Search armor" onChange={handleSearchChange}></TextField>
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
            {visibleItems.map((item) => (
              <ArmorRow
                key={item.id}
                item={item}
                itemDropLocations={itemDropLocations}
                itemNameMap={itemNameMap}
                upgradeMaterialsList={upgradeMaterialsList}
                goTo={goTo}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

export default ArmorTable
