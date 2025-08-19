import './App.css'
// import items from './items.json'
import { GL as items } from './utils/generate_items'
import WeaponTable from './WeaponTable'

import type {
  Item,
  Rarity,
  statModifier,
  Slot,
  ItemNameMap,
  TabName,
} from './types'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import React, { useCallback, useEffect, useMemo } from 'react'
import ArmorTable from './ArmorTable'
import BlueprintTable from './BlueprintTable'
import { ThemeProvider } from '@emotion/react'
import { createTheme } from '@mui/material/styles'
import { TableContainer, Card, Paper, Typography } from '@mui/material'
import LootTable from './LootTable'
import MapTable from './MapTable'
import EnemyTable from './EnemyTable'
import FoodTable from './FoodTable'
import QuestsTable from './QuestsTable'
type itemsKey = keyof typeof items

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function App() {
  const itemArrays = useMemo(() => {
    const itemNameMap: ItemNameMap = {}
    const weaponsArray: Item[] = []
    const armorArray: Item[] = []
    const blueprintArray: Item[] = []
    const mapArray: Item[] = []
    Object.keys(items).forEach((key) => {
      const item = {
        ...items[key as itemsKey],
        rarity: items[key as itemsKey].rarity as Rarity,
        statModifiers: items[key as itemsKey].statModifiers as statModifier[],
        equipSlots: items[key as itemsKey].equipSlots as Slot[],
        id: key,
      }

      itemNameMap[key] = item
      if (
        item.tags.includes('equipment') &&
        item.equipSlots.includes('Weapon')
      ) {
        weaponsArray.push(item)
      } else if (
        item.tags.includes('equipment') &&
        !item.equipSlots.includes('Weapon')
      ) {
        armorArray.push(item)
      } else if (item.tags.includes('blueprint')) {
        blueprintArray.push(item)
      } else if (item.tags.includes('map')) {
        mapArray.push(item)
      }
    })
    return {
      itemNameMap,
      weaponsArray,
      armorArray,
      blueprintArray,
      mapArray,
    }
  }, [])

  const [tabIndex, setTabIndex] = React.useState(0)
  const [focusedItem, setFocusedItem] = React.useState('')

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue)
  }

  const theme = createTheme({
    typography: {
      fontFamily: 'Lexend',
    },
  })

  const goTo = useCallback(
    (tab: TabName, id: string) => {
      const tabToIndex = {
        Weapons: 0,
        Armor: 1,
        Blueprints: 2,
        Maps: 3,
      }
      setTabIndex(tabToIndex[tab])
      setFocusedItem(id)
    },
    [setTabIndex]
  )

  useEffect(() => {
    if (focusedItem) {
      const element = document.getElementById(focusedItem)
      element?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [focusedItem])
  return (
    <ThemeProvider theme={theme}>
      {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}> */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ alignItems: 'center' }}
      >
        <Tab label="Weapons" {...a11yProps(0)} />
        <Tab label="Armor" {...a11yProps(1)} />
        <Tab label="Blueprints" {...a11yProps(2)} />
        <Tab label="Maps" {...a11yProps(3)} />
        <Tab label="Loot" {...a11yProps(4)} />
        <Tab label="Enemies" {...a11yProps(5)} />
        <Tab label="Food" {...a11yProps(6)} />
        <Tab label="Quests" {...a11yProps(7)} />
      </Tabs>
      {/* </Box> */}
      <CustomTabPanel value={tabIndex} index={0}>
        <TableContainer>
          <WeaponTable
            itemsArray={itemArrays.weaponsArray}
            itemNameMap={itemArrays.itemNameMap}
            goTo={goTo}
          />
        </TableContainer>
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={1}>
        <TableContainer component={Card}>
          <ArmorTable
            itemsArray={itemArrays.armorArray}
            itemNameMap={itemArrays.itemNameMap}
            goTo={goTo}
          />
        </TableContainer>
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={2}>
        <TableContainer component={Card}>
          <BlueprintTable
            itemNameMap={itemArrays.itemNameMap}
            itemsArray={itemArrays.blueprintArray}
            goTo={goTo}
          />
        </TableContainer>
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={3}>
        <TableContainer component={Card}>
          <MapTable
            itemsArray={itemArrays.mapArray}
            itemNameMap={itemArrays.itemNameMap}
            goTo={goTo}
          />
        </TableContainer>
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={4}>
        <LootTable itemNameMap={itemArrays.itemNameMap} goTo={goTo} />
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={5}>
        <TableContainer component={Paper}>
          <EnemyTable itemNamesMap={itemArrays.itemNameMap} goTo={goTo} />
        </TableContainer>
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={6}>
        <TableContainer component={Paper}>
          <FoodTable itemNamesMap={itemArrays.itemNameMap} />
        </TableContainer>
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={7}>
        <TableContainer component={Paper}>
          <QuestsTable itemNamesMap={itemArrays.itemNameMap} />
        </TableContainer>
      </CustomTabPanel>
      <Typography>
        <a href="https://www.reddit.com/r/SwordAndSupperGame/">
          r/SwordAndSupperGame
        </a>
      </Typography>
      <Typography>
        <a href="https://www.reddit.com/user/Thats_a_movie/">u/Thats_a_movie</a>
      </Typography>
      <Typography>
        <a href="https://github.com/asufyani/sword_supper_data_viewer">
          github
        </a>
      </Typography>
    </ThemeProvider>
  )
}

export default App
