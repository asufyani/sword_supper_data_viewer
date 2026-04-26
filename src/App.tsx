import './App.css'
// import items from './items.json'
import { items } from './utils/items'

import type {
  Item,
  Rarity,
  statModifier,
  Slot,
  ItemNameMap,
  TabName,
  LootTable,
} from './types'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import React, { Suspense, useCallback, useEffect, useMemo } from 'react'
import { ThemeProvider } from '@emotion/react'
import { createTheme } from '@mui/material/styles'
import { TableContainer, Card, Paper, Typography } from '@mui/material'
import { ItemDetailsPopoverProvider } from './ItemDetailsPopover'
import { et } from './utils/loot'
import { vaultLootTables } from './utils/vaultLoot'
import {
  buildEnemyNamesByLootTable,
  buildItemDropLocations,
} from './utils/itemDropLocations'
import { z3 } from './utils/enemies'
import { enemyNames } from './utils/enemyNames'

const WeaponTable = React.lazy(() => import('./WeaponTable'))
const ArmorTable = React.lazy(() => import('./ArmorTable'))
const BlueprintTable = React.lazy(() => import('./BlueprintTable'))
const MapTable = React.lazy(() => import('./MapTable'))
const LootTable = React.lazy(() => import('./LootTable'))
const VaultLootTable = React.lazy(() => import('./VaultLootTable'))
const EnemyTable = React.lazy(() => import('./EnemyTable'))
const FoodTable = React.lazy(() => import('./FoodTable'))
const QuestsTable = React.lazy(() => import('./QuestsTable'))
const AbilityTable = React.lazy(() => import('./AbilityTable'))
const LevelCostTable = React.lazy(() => import('./LevelCostTable'))
const HelpPanel = React.lazy(() =>
  import('./HelpPanel').then((module) => ({ default: module.HelpPanel }))
)

type itemsKey = keyof typeof items

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  loaded: boolean
  value: number
}
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, loaded, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {loaded && (
        <Box sx={{ display: value === index ? 'block' : 'none', p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

function App() {
  // const assetsArray = []
  const itemArrays = useMemo(() => {
    const itemNameMap: ItemNameMap = {}
    const weaponsArray: Item[] = []
    const armorArray: Item[] = []
    const blueprintArray: Item[] = []
    const mapArray: Item[] = []
    // const assetsArray: string[] = []
    const upgradeMaterialItems: Record<string, string[]> = {}
    Object.keys(items).forEach((key) => {
      const item = {
        ...items[key as itemsKey],
        rarity: items[key as itemsKey].rarity as Rarity,
        statModifiers: items[key as itemsKey].statModifiers as statModifier[],
        equipSlots: items[key as itemsKey].equipSlots as Slot[],
        id: key,
      }
      // if (item.assetName) {
      //   assetsArray.push(
      //     `https://cabbageidle-eimoap-0-0-40-webview.devvit.net/assets/ui/item-icons/${item.assetName}.png`
      //   )
      // }

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

      item.upgrades.forEach((upgrade) => {
        upgrade.requires.forEach((requirement) => {
          upgradeMaterialItems[requirement.id] ||= []
          upgradeMaterialItems[requirement.id].push(item.id)
        })
      })
    })

    const enemyNamesByLootTable = buildEnemyNamesByLootTable(
      et,
      z3,
      enemyNames
    )
    const itemDropLocations = buildItemDropLocations(
      itemNameMap,
      [et, vaultLootTables as Record<string, LootTable>],
      enemyNamesByLootTable
    )

    // console.log(assetsArray)
    return {
      itemNameMap,
      weaponsArray,
      armorArray,
      blueprintArray,
      mapArray,
      upgradeMaterialItems,
      itemDropLocations,
    }
  }, [])

  const [tabIndex, setTabIndex] = React.useState(0)
  const [focusedItem, setFocusedItem] = React.useState('')
  const [loadedTabs, setLoadedTabs] = React.useState(() => new Set([0]))

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setLoadedTabs((current) => new Set(current).add(newValue))
  }

  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: 'Poppins',
        },
      }),
    []
  )

  const goTo = useCallback(
    (tab: TabName, id: string) => {
      const tabToIndex = {
        Weapons: 0,
        Armor: 1,
        Blueprints: 2,
        Maps: 3,
      }
      setTabIndex(tabToIndex[tab])
      setLoadedTabs((current) => new Set(current).add(tabToIndex[tab]))
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
      <ItemDetailsPopoverProvider>
        <Box component="header" className="app-tab-header">
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
            <Tab label="Abilities" {...a11yProps(8)} />
            <Tab label="Vault Loot" {...a11yProps(9)} />
            <Tab label="Level Costs" {...a11yProps(10)} />
            <Tab label="Help" {...a11yProps(11)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={tabIndex} index={0} loaded={loadedTabs.has(0)}>
          <Suspense fallback={<Typography>Loading weapons...</Typography>}>
            <TableContainer>
              <WeaponTable
                itemsArray={itemArrays.weaponsArray}
                itemNameMap={itemArrays.itemNameMap}
                goTo={goTo}
                upgradeMaterialsList={itemArrays.upgradeMaterialItems}
                itemDropLocations={itemArrays.itemDropLocations}
              />
            </TableContainer>
          </Suspense>
        </CustomTabPanel>
        <CustomTabPanel value={tabIndex} index={1} loaded={loadedTabs.has(1)}>
          <Suspense fallback={<Typography>Loading armor...</Typography>}>
            <TableContainer component={Card}>
              <ArmorTable
                itemsArray={itemArrays.armorArray}
                itemNameMap={itemArrays.itemNameMap}
                goTo={goTo}
                upgradeMaterialsList={itemArrays.upgradeMaterialItems}
                itemDropLocations={itemArrays.itemDropLocations}
              />
            </TableContainer>
          </Suspense>
        </CustomTabPanel>
        <CustomTabPanel value={tabIndex} index={2} loaded={loadedTabs.has(2)}>
          <Suspense fallback={<Typography>Loading blueprints...</Typography>}>
            <TableContainer component={Card}>
              <BlueprintTable
                itemNameMap={itemArrays.itemNameMap}
                itemsArray={itemArrays.blueprintArray}
                itemDropLocations={itemArrays.itemDropLocations}
                goTo={goTo}
              />
            </TableContainer>
          </Suspense>
        </CustomTabPanel>
        <CustomTabPanel value={tabIndex} index={3} loaded={loadedTabs.has(3)}>
          <Suspense fallback={<Typography>Loading maps...</Typography>}>
            <TableContainer component={Card}>
              <MapTable
                itemsArray={itemArrays.mapArray}
                itemNameMap={itemArrays.itemNameMap}
                itemDropLocations={itemArrays.itemDropLocations}
                goTo={goTo}
              />
            </TableContainer>
          </Suspense>
        </CustomTabPanel>
        <CustomTabPanel value={tabIndex} index={4} loaded={loadedTabs.has(4)}>
          <Suspense fallback={<Typography>Loading loot...</Typography>}>
            <LootTable itemNameMap={itemArrays.itemNameMap} goTo={goTo} />
          </Suspense>
        </CustomTabPanel>
        <CustomTabPanel value={tabIndex} index={5} loaded={loadedTabs.has(5)}>
          <Suspense fallback={<Typography>Loading enemies...</Typography>}>
            <TableContainer component={Paper}>
              <EnemyTable itemNamesMap={itemArrays.itemNameMap} goTo={goTo} />
            </TableContainer>
          </Suspense>
        </CustomTabPanel>
        <CustomTabPanel value={tabIndex} index={6} loaded={loadedTabs.has(6)}>
          <Suspense fallback={<Typography>Loading food...</Typography>}>
            <TableContainer component={Paper}>
              <FoodTable itemNamesMap={itemArrays.itemNameMap} />
            </TableContainer>
          </Suspense>
        </CustomTabPanel>
        <CustomTabPanel value={tabIndex} index={7} loaded={loadedTabs.has(7)}>
          <Suspense fallback={<Typography>Loading quests...</Typography>}>
            <TableContainer component={Paper}>
              <QuestsTable itemNamesMap={itemArrays.itemNameMap} />
            </TableContainer>
          </Suspense>
        </CustomTabPanel>
        <CustomTabPanel value={tabIndex} index={8} loaded={loadedTabs.has(8)}>
          <Suspense fallback={<Typography>Loading abilities...</Typography>}>
            <AbilityTable itemNamesMap={itemArrays.itemNameMap} />
          </Suspense>
        </CustomTabPanel>
        <CustomTabPanel value={tabIndex} index={9} loaded={loadedTabs.has(9)}>
          <Suspense fallback={<Typography>Loading vault loot...</Typography>}>
            <VaultLootTable itemNameMap={itemArrays.itemNameMap} goTo={goTo} />
          </Suspense>
        </CustomTabPanel>
        <CustomTabPanel value={tabIndex} index={10} loaded={loadedTabs.has(10)}>
          <Suspense fallback={<Typography>Loading level costs...</Typography>}>
            <LevelCostTable />
          </Suspense>
        </CustomTabPanel>
        <CustomTabPanel value={tabIndex} index={11} loaded={loadedTabs.has(11)}>
          <Suspense fallback={<Typography>Loading help...</Typography>}>
            <HelpPanel />
          </Suspense>
        </CustomTabPanel>
        <Typography>
          <a href="https://www.reddit.com/r/SwordAndSupperGame/">
            r/SwordAndSupperGame
          </a>
        </Typography>
        <Typography>
          <a href="https://www.reddit.com/user/Thats_a_movie/">
            u/Thats_a_movie
          </a>
        </Typography>
        <Typography>
          <a href="https://github.com/asufyani/sword_supper_data_viewer">
            github
          </a>
        </Typography>
      </ItemDetailsPopoverProvider>
    </ThemeProvider>
  )
}

export default App
