import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TextField from '@mui/material/TextField'
import { damageTypes, type Enemy, type GoToType, type ItemNameMap } from './types'
import { useMemo, type ChangeEvent } from 'react'
import { z3 } from './utils/enemies'
import React from 'react'
import IconButton from '@mui/material/IconButton'
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import Collapse from '@mui/material/Collapse'
import Accordion from '@mui/material/Accordion'
import { AccordionDetails, AccordionSummary, Chip } from '@mui/material'
import { RarityChip } from './RarityChip'
import { damageTypeSymbols } from './utils/constants'
import { useDebounceValue } from 'usehooks-ts'



const formatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

export const EnemyTable: React.FC<{ itemNamesMap: ItemNameMap, goTo: GoToType}> = ({itemNamesMap, goTo}) => {
  const [searchString, setSearchString] = useDebounceValue('', 250)
  const enemies: Record<string, Enemy> = useMemo(() => {
    return z3 as Record<string, Enemy>
  }, [])
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchString(event.target.value.toLowerCase())
  }

  function Row(props: { enemy: Enemy }) {
    const { enemy } = props
    const [open, setOpen] = React.useState(false)
    const lootTable = enemy.lootTables[0]


    return (
      <React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>{enemy.id}</TableCell>
          <TableCell>{`${enemy.baseDamage} ${damageTypeSymbols[enemy.damageType]}`}</TableCell>
          <TableCell>{enemy.damageGrowth}</TableCell>
          <TableCell>{enemy.baseDefense}</TableCell>
          <TableCell>{enemy.defenseGrowth}</TableCell>
          <TableCell>
            {damageTypes.map((damageType) => {
              const resistType: keyof Enemy = (damageType + 'Resist') as keyof Enemy;
              if (enemy[resistType]) {
                const resistAmount: number = enemy[resistType] as number;
                return <div className={resistAmount < 0 ? 'bonus' : 'penalty'}>{`${damageTypeSymbols[damageType]}: ${formatter.format(resistAmount)}`}</div>
              }
            })}
          </TableCell>
          <TableCell>{enemy.baseHp}</TableCell>
          <TableCell>{enemy.hpGrowth}</TableCell>
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
                    <AccordionSummary>{levels}</AccordionSummary>
                    <AccordionDetails>
                      {tier.items.map((itemData) => {
                        const item = itemNamesMap[itemData.id];
                        if (item.tags.includes('resource') || item.tags.includes('currency')) {
                          const quantities = (typeof itemData.quantity === 'number') ? itemData.quantity : itemData.quantity?.join(' or ');
                          return <Chip label={`${item.id}: ${quantities}`} />
                        }
                        else {
                          return <RarityChip item={item} goTo={goTo} showPopover={true}/>
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
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Base Damage</TableCell>
            <TableCell>Damage Growth</TableCell>
            <TableCell>Base Defense</TableCell>
            <TableCell>Defense Growth</TableCell>
            <TableCell>Resistances</TableCell>
            <TableCell>Base HP</TableCell>
            <TableCell>HP Growth</TableCell>
            <TableCell>Crit Rate</TableCell>
            <TableCell>Dodge</TableCell>
            <TableCell>Speed</TableCell>
            <TableCell>Loot</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(enemies).filter((key) => key.toLowerCase().includes(searchString.toLowerCase())).map((enemyKey) => {
            return <Row enemy={enemies[enemyKey]} />
          })}
        </TableBody>
      </Table>
    </>
  )
}

export default EnemyTable
