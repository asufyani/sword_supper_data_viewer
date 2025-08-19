import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import type { ItemsTableProps } from './types'
import { RarityChip } from './RarityChip'
import { Z0, $0 } from './utils/mapEnemies'
import { enemyNames } from './utils/enemyNames'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material'

type MapEnemy = {
  id: string
  weight: number
}

type MapTier = {
  minLevel: number
  maxLevel?: number
  items: MapEnemy[]
}
const enemiesByMap: Record<string, { tiers: MapTier[] }> = Z0
const bossesByMap: Record<string, { tiers: MapTier[] }> = $0

const formatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
})

export const MapTable: React.FC<ItemsTableProps> = ({
  itemsArray,
  itemNameMap,
}) => {
  return (
    <>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Enemies</TableCell>
            <TableCell>Bosses</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itemsArray.map((item) => {
            const mapKey = item.assetName.replace('map_', '')
            return (
              <TableRow key={item.id}>
                <TableCell id={item.id}>
                  <RarityChip item={itemNameMap[item.id]} />
                </TableCell>
                <TableCell>
                  {enemiesByMap[mapKey].tiers.map((tier) => {
                    const totalWeight: number = tier.items.reduce(
                      (total, item) => {
                        return total + (item.weight || 0)
                      },
                      0
                    )
                    const levels = tier.maxLevel
                      ? `${tier.minLevel}-${tier.maxLevel}`
                      : `${tier.minLevel}+`
                    return (
                      <Accordion>
                        <AccordionSummary>
                          <Typography component={'span'}>{levels}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {tier.items.map((enemy) => {
                            const enemyName =
                              enemyNames[enemy.id as keyof typeof enemyNames]
                            return (
                              <Typography component="div">{`${enemyName}: ${formatter.format(enemy.weight / totalWeight)}`}</Typography>
                            )
                          })}
                        </AccordionDetails>
                      </Accordion>
                    )
                  })}
                </TableCell>
                <TableCell>
                  {bossesByMap[mapKey].tiers.map((tier) => {
                    const totalWeight: number = tier.items.reduce(
                      (total, item) => {
                        return total + (item.weight || 0)
                      },
                      0
                    )
                    return (
                      <>
                        {tier.items.map((enemy) => {
                          const enemyName =
                            enemyNames[enemy.id as keyof typeof enemyNames]
                          return (
                            <Typography component="div">{`${enemyName}: ${formatter.format(enemy.weight / totalWeight)}`}</Typography>
                          )
                        })}
                      </>
                    )
                  })}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </>
  )
}

export default MapTable
