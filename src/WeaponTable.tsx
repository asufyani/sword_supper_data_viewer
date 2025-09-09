import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TextField from '@mui/material/TextField'
import type {
  damageType,
  Item,
  ItemsTableProps,
  SortableProperty,
} from './types'
import { RarityChip } from './RarityChip'
import { useState, type ChangeEvent } from 'react'
import { UpgradeList } from './UpgradeList'
import { SortableHeader } from './SortableHeader'
import { getItemComparator } from './utils/get_comparator'
import { StatsDisplay } from './StatsDisplay'
import { useDebounceValue } from 'usehooks-ts'
import { damageTypeSymbols } from './utils/constants'
import { AssetIcon } from './AssetIcon'
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material'
import { IconButton, Collapse } from '@mui/material'
import React from 'react'

const formatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
})

export const WeaponTable: React.FC<ItemsTableProps> = ({
  itemsArray,
  itemNameMap,
  goTo,
  upgradeMaterialsList,
  itemDropLocations,
}) => {
  const [searchString, setSearchString] = useDebounceValue('', 250)
  const [orderBy, setOrderBy] = useState<SortableProperty>('name')
  const [order, setOrder] = useState(1)

  const handleHeaderClick = (propName: SortableProperty) => {
    if (orderBy == propName) {
      setOrder(-1 * order)
    } else {
      setOrder(1)
      setOrderBy(propName)
    }
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchString(event.target.value.toLowerCase())
  }

  function Row(props: { item: Item }) {
    const { item } = props
    const [open, setOpen] = React.useState(false)
    const itemHasDropLocations = !!Object.keys(itemDropLocations[item.id])
      .length
    return (
      <React.Fragment>
        <TableRow
          sx={{ '& > *': { borderBottom: 'unset' } }}
          key={item.id + '-row'}
          id={item.id + '-row'}
        >
          <TableCell key={item.id} id={item.id}>
            <AssetIcon assetName={item.assetName} rarity={item.rarity} />
            <RarityChip item={item} goTo={goTo} />
          </TableCell>
          <TableCell key={item.id + '-damage'}>
            {(Object.keys(item.damage || {}) as damageType[]).map(
              (typeString) => (
                <span key={item.id + '-' + typeString}>
                  {item.damage![typeString]}
                  {damageTypeSymbols[typeString]}
                </span>
              )
            )}
          </TableCell>
          <TableCell key={item.id + '-mods'}>
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
              goTo={goTo}
              upgradeMaterialsList={upgradeMaterialsList}
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
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <SortableHeader
              handleHeaderClick={handleHeaderClick}
              orderBy={orderBy}
              order={order}
              label="Name"
              property="name"
            />
            <SortableHeader
              handleHeaderClick={handleHeaderClick}
              orderBy={orderBy}
              order={order}
              label="Damage"
              property="dmg"
            />
            <TableCell>Stat Modifiers and Abilities</TableCell>
            <SortableHeader
              handleHeaderClick={handleHeaderClick}
              orderBy={orderBy}
              order={order}
              label="Required Level"
              property="requiredLevel"
            />
            <TableCell>Upgrades</TableCell>
            <TableCell>Drops From</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itemsArray
            .filter((item) => item.name.toLowerCase().includes(searchString))
            .sort(getItemComparator(orderBy, order))
            .map((item) => (
              <Row item={item} />
            ))}
        </TableBody>
      </Table>
    </>
  )
}

export default WeaponTable
