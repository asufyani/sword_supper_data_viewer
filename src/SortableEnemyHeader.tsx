import TableCell from '@mui/material/TableCell'
import TableSortLabel from '@mui/material/TableSortLabel'
import Tooltip from '@mui/material/Tooltip'
import type { Enemy } from './types'

interface SortableEnemyHeaderProps {
  handleHeaderClick: (property: keyof Enemy) => void
  orderBy: keyof Enemy
  order: number
  label: string
  property: keyof Enemy
}

export const SortableEnemyHeader: React.FC<SortableEnemyHeaderProps> = ({
  handleHeaderClick,
  orderBy,
  order,
  label,
  property,
}) => {
  return (
    <TableCell
      className="sortable"
      onClick={() => {
        handleHeaderClick(property)
      }}
    >
      <Tooltip title="Click to sort">
        <span>
          {label}
          <TableSortLabel
            active={orderBy == property}
            direction={order > 0 ? 'asc' : 'desc'}
          />
        </span>
      </Tooltip>
    </TableCell>
  )
}
