import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import type { ItemNameMap } from './types'
import { quests } from './utils/quests'

export const QuestsTable: React.FC<{ itemNamesMap: ItemNameMap }> = ({
  itemNamesMap,
}) => {
  return (
    <>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Description</TableCell>
            <TableCell>Rewards</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(quests).map((questKey) => {
            return (
              <TableRow key={questKey}>
                <TableCell>
                  {quests[questKey as keyof typeof quests].description}
                </TableCell>
                <TableCell>
                  {quests[questKey as keyof typeof quests].rewardTiers.map(
                    (tier) => (
                      <div key={tier.goal}>
                        {`${tier.goal}: ${tier.rewardValue} ${itemNamesMap[tier.rewardItem].name}`}
                      </div>
                    )
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </>
  )
}

export default QuestsTable
