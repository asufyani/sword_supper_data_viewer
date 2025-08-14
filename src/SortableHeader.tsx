import TableCell from '@mui/material/TableCell'
import TableSortLabel from '@mui/material/TableSortLabel'
import Tooltip from '@mui/material/Tooltip'
import type { SortableProperty } from './types'


interface SortableHeaderProps {
  handleHeaderClick: (property: SortableProperty) => void
  orderBy: SortableProperty
  order: number
  label: string
  property: SortableProperty
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
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
