import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import type { Item, ItemsTableProps } from './types'
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
  const mapKeys: Set<string> = new Set()
  const mapsByKey: Record<string, Item[]> = {}

  itemsArray.forEach((map) => {
    const mapKey = map.assetName.replace('map_', '')
    mapKeys.add(mapKey)
    mapsByKey[mapKey] ||= []
    mapsByKey[mapKey].push(map)
  })
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
          {[...mapKeys].map((mapKey) => {
            return (
              <TableRow key={mapKey}>
                <TableCell id={mapKey}>
                  {mapsByKey[mapKey].map((map) => (
                    <div>
                      <RarityChip item={itemNameMap[map.id]} />
                    </div>
                  ))}
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
