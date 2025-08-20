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
  Chip,
  Grid,
  Input,
  Slider,
  Typography,
} from '@mui/material'
import { RarityChip } from './RarityChip'
import { damageTypeSymbols } from './utils/constants'
import { useDebounceValue } from 'usehooks-ts'
import { enemyNames } from './utils/enemyNames'

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
  const enemies: Record<string, Enemy> = useMemo(() => {
    return z3 as Record<string, Enemy>
  }, [])

  const enemyNameMap: Record<string, string> = enemyNames

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
    const health = Math.round(
      enemy.baseHp + enemy.hpGrowth * Math.pow(level, 1.27)
    )
    const defense = Math.round(
      enemy.baseDefense + enemy.defenseGrowth * Math.pow(level, 1.15)
    )
    const damage = Math.round(
      enemy.baseDamage + enemy.damageGrowth * Math.pow(level, 1.1)
    )
    return {
      health,
      defense,
      damage,
    }
  }, [])

  function Row(props: { enemy: Enemy }) {
    const { enemy } = props
    const [open, setOpen] = React.useState(false)
    const lootTable = enemy.lootTables[0]

    const scaledValues = calcScalingValues(enemy, level)

    return (
      <React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <Typography component={'span'}>{enemyNameMap[enemy.id]}</Typography>
          </TableCell>
          <TableCell>{`${scaledValues.damage} ${damageTypeSymbols[enemy.damageType]}`}</TableCell>
          <TableCell>{scaledValues.health}</TableCell>
          <TableCell>{scaledValues.defense}</TableCell>
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
          <TableCell>
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
              {lootTable.tiers.map((tier) => {
                const levels = tier.maxLevel
                  ? `${tier.minLevel}-${tier.maxLevel}`
                  : `${tier.minLevel}+`
                return (
                  <Accordion>
                    <AccordionSummary>
                      <Typography component={'span'}>{levels}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {tier.items.map((itemData) => {
                        const item = itemNamesMap[itemData.id]
                        if (
                          item.tags.includes('resource') ||
                          item.tags.includes('currency')
                        ) {
                          const quantities =
                            typeof itemData.quantity === 'number'
                              ? itemData.quantity
                              : itemData.quantity?.join('-')
                          return <Chip label={`${item.id}: ${quantities}`} />
                        } else {
                          return (
                            <RarityChip
                              item={item}
                              goTo={goTo}
                              showPopover={true}
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
            <TableCell>Name</TableCell>
            <TableCell>Damage</TableCell>
            <TableCell>HP</TableCell>
            <TableCell>Defense</TableCell>
            <TableCell>Resistances</TableCell>
            <TableCell>Crit Rate</TableCell>
            <TableCell>Dodge</TableCell>
            <TableCell>Speed</TableCell>
            <TableCell>Loot</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(enemies)
            .filter(filterFunction)
            .map((enemyKey) => {
              return <Row key={enemyKey} enemy={enemies[enemyKey]} />
            })}
        </TableBody>
      </Table>
    </>
  )
}

export default EnemyTable
