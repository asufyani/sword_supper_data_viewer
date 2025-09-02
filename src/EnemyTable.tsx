import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TextField from '@mui/material/TextField'
import {
  damageTypes,
  type Enemy,
  type GoToType,
  type ItemNameMap,
} from './types'
import { useCallback, useMemo, type ChangeEvent } from 'react'
import { z3 } from './utils/enemies'
import React from 'react'
import IconButton from '@mui/material/IconButton'
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import Collapse from '@mui/material/Collapse'
import Accordion from '@mui/material/Accordion'
import {
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Input,
  Slider,
  Typography,
} from '@mui/material'
import { RarityChip } from './RarityChip'
import { damageTypeSymbols } from './utils/constants'
import { useDebounceValue } from 'usehooks-ts'
import { enemyNames } from './utils/enemyNames'
import { getEnemyComparator } from './utils/get_comparator'
import { SortableEnemyHeader } from './SortableEnemyHeader'
import { EnemyAnimationViewer } from './EnemyViewer'

const formatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

export const EnemyTable: React.FC<{
  itemNamesMap: ItemNameMap
  goTo: GoToType
}> = ({ itemNamesMap, goTo }) => {
  const [searchString, setSearchString] = useDebounceValue('', 250)
  const maxLevel = 300
  const [level, setLevel] = React.useState(1)
  const [order, setOrder] = React.useState(1)
  const [orderBy, setOrderBy] = React.useState<keyof Enemy>('name')
  const enemies: Record<string, Enemy> = useMemo(() => {
    return z3
  }, [])

  const enemyNameMap: Record<string, string> = enemyNames
  // const spineAssetURLS: string[] = []
  // Object.keys(enemies).forEach((enemyName) => {
  //   const assetKey = enemies[enemyName].spineAssetKey
  //   if (assetKey) {
  //     spineAssetURLS.push(
  //       `https://cabbageidle-eimoap-0-0-39-webview.devvit.net/assets/spine/${assetKey}.png`
  //     )
  //     spineAssetURLS.push(
  //       `https://cabbageidle-eimoap-0-0-39-webview.devvit.net/assets/spine/${assetKey}.skel`
  //     )
  //     spineAssetURLS.push(
  //       `https://cabbageidle-eimoap-0-0-39-webview.devvit.net/assets/spine/${assetKey}.atlas`
  //     )
  //   }
  // })
  // console.log(spineAssetURLS)

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchString(event.target.value.toLowerCase())
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLevel(event.target.value === '' ? 0 : Number(event.target.value))
  }

  const handleSliderChange = (_event: Event, newValue: number) => {
    setLevel(newValue)
  }

  const handleBlur = () => {
    if (level < 0) {
      setLevel(0)
    } else if (level > maxLevel) {
      setLevel(maxLevel)
    }
  }

  const filterFunction = useCallback(
    (key: string) =>
      key.toLowerCase().includes(searchString.toLowerCase()) ||
      enemyNameMap[key].toLowerCase().includes(searchString.toLowerCase()),
    [searchString]
  )

  const calcScalingValues = useCallback((enemy: Enemy, level: number) => {
    const scaledHp = Math.round(
      enemy.baseHp + enemy.hpGrowth * Math.pow(level, 1.27)
    )
    const scaledDefense = Math.round(
      enemy.baseDefense + enemy.defenseGrowth * Math.pow(level, 1.15)
    )
    const scaledDamage = Math.round(
      enemy.baseDamage + enemy.damageGrowth * Math.pow(level, 1.1)
    )
    return {
      scaledHp,
      scaledDefense,
      scaledDamage,
    }
  }, [])

  const handleHeaderClick = (propName: keyof Enemy) => {
    if (orderBy == propName) {
      setOrder(-1 * order)
    } else {
      setOrder(1)
      setOrderBy(propName)
    }
  }

  function Row(props: { enemy: Enemy }) {
    const { enemy } = props
    const [open, setOpen] = React.useState(false)
    const lootTable = enemy.lootTables[0]

    // const scaledValues = calcScalingValues(enemy, level)

    return (
      <React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <Typography component={'span'}>{enemy.name}</Typography>
          </TableCell>
          <TableCell>{`${enemy.scaledDamage} ${damageTypeSymbols[enemy.damageType]}`}</TableCell>
          <TableCell>{enemy.scaledHp}</TableCell>
          <TableCell>{enemy.scaledDefense}</TableCell>
          <TableCell>
            {damageTypes.map((damageType) => {
              const resistType: keyof Enemy =
                `${damageType}Resist` as keyof Enemy
              if (enemy[resistType]) {
                const resistAmount: number = enemy[resistType] as number
                return (
                  <div
                    className={resistAmount < 0 ? 'bonus' : 'penalty'}
                    key={resistType}
                  >{`${damageTypeSymbols[damageType]}: ${formatter.format(resistAmount)}`}</div>
                )
              }
            })}
          </TableCell>
          <TableCell>{formatter.format(enemy.crit)}</TableCell>
          <TableCell>{formatter.format(enemy.dodge)}</TableCell>
          <TableCell>{enemy.speed}</TableCell>
          <TableCell align="center">
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <EnemyAnimationViewer
                spineAssetKey={enemy.spineAssetKey}
                showControls={true}
              />
              {lootTable.tiers.map((tier) => {
                const levels = tier.maxLevel
                  ? `${tier.minLevel}-${tier.maxLevel}`
                  : `${tier.minLevel}+`
                const totalWeight: number = tier.items.reduce((total, item) => {
                  return total + (item.weight || 0)
                }, 0)
                return (
                  <Accordion>
                    <AccordionSummary>
                      <Typography component={'span'}>{levels}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {tier.items.map((itemData) => {
                        if (itemData.id) {
                          const item = itemNamesMap[itemData.id]

                          const quantities = !itemData.quantity
                            ? ''
                            : typeof itemData.quantity === 'number'
                              ? itemData.quantity == 1
                                ? ''
                                : `: ${itemData.quantity}`
                              : `: ${itemData.quantity?.join('-')}`

                          return (
                            <RarityChip
                              item={item}
                              goTo={goTo}
                              showPopover={item.tags.includes('equipment')}
                              quantityString={quantities}
                              showIcon={true}
                              weight={
                                itemData.weight
                                  ? formatter.format(
                                      itemData.weight / totalWeight
                                    )
                                  : undefined
                              }
                            />
                          )
                        }
                      })}
                    </AccordionDetails>
                  </Accordion>
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
      <Box sx={{ width: '50%', margin: 5, alignItems: 'center' }}>
        <Typography id="input-slider" gutterBottom>
          Enemy Level
        </Typography>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size="grow">
            <Slider
              value={typeof level === 'number' ? level : 0}
              max={maxLevel}
              onChange={handleSliderChange}
              aria-labelledby="input-slider"
            />
          </Grid>
          <Grid>
            <Input
              value={level}
              size="small"
              onChange={handleInputChange}
              onBlur={handleBlur}
              inputProps={{
                step: 10,
                min: 1,
                max: maxLevel,
                type: 'number',
                'aria-labelledby': 'input-slider',
              }}
            />
          </Grid>
        </Grid>
      </Box>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <SortableEnemyHeader
              handleHeaderClick={handleHeaderClick}
              order={order}
              orderBy={orderBy}
              label="Name"
              property="name"
            />
            <SortableEnemyHeader
              handleHeaderClick={handleHeaderClick}
              order={order}
              orderBy={orderBy}
              label="Damage"
              property="scaledDamage"
            />
            <SortableEnemyHeader
              handleHeaderClick={handleHeaderClick}
              order={order}
              orderBy={orderBy}
              label="HP"
              property="scaledHp"
            />
            <SortableEnemyHeader
              handleHeaderClick={handleHeaderClick}
              order={order}
              orderBy={orderBy}
              label="Defense"
              property="scaledDefense"
            />
            <TableCell>Resistances</TableCell>
            <SortableEnemyHeader
              handleHeaderClick={handleHeaderClick}
              order={order}
              orderBy={orderBy}
              label="Crit Rate"
              property="crit"
            />
            <SortableEnemyHeader
              handleHeaderClick={handleHeaderClick}
              order={order}
              orderBy={orderBy}
              label="Dodge"
              property="dodge"
            />
            <SortableEnemyHeader
              handleHeaderClick={handleHeaderClick}
              order={order}
              orderBy={orderBy}
              label="Speed"
              property="speed"
            />
            <TableCell>Loot/Appearance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(enemies)
            .filter(filterFunction)
            .map((enemyKey) => {
              const scaledValues = calcScalingValues(enemies[enemyKey], level)
              return (enemies[enemyKey] = {
                name: enemyNameMap[enemyKey],
                ...enemies[enemyKey],
                ...scaledValues,
              })
            })
            .sort(getEnemyComparator(orderBy, order))
            .map((enemy) => {
              return <Row key={enemy.id} enemy={enemy} />
            })}
        </TableBody>
      </Table>
    </>
  )
}

export default EnemyTable
