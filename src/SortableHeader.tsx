import TableCell from "@mui/material/TableCell"
import TableSortLabel from "@mui/material/TableSortLabel"
import Tooltip from "@mui/material/Tooltip"

type PropName = 'name' | 'requiredLevel' | 'dmg'

interface SortableHeaderProps {
    handleHeaderClick: (property: PropName) => void
    orderBy: PropName
    order: number
    label: string
    property: PropName
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({handleHeaderClick, orderBy, order, label, property}) => {

    return <TableCell className='sortable' onClick={()=>{handleHeaderClick(property)}}>
        <Tooltip title="Click to sort">
            <span>
                {label}
                <TableSortLabel active={orderBy == property} direction={(order > 0) ? 'asc' : 'desc'}/>
            </span>
        </Tooltip>
    </TableCell>
}