import Chip from '@mui/material/Chip'
import type { Item, TabName } from './types'
import { getItemType, useItemDetailsPopover } from './ItemDetailsPopover'
import { getRarityColor } from './utils/rarityColors'

interface RarityChipProps {
  item: Item
  showPopover?: boolean
  goTo?: (tab: TabName, id: string) => void
  weight?: string
  quantityString?: string
  showIcon?: boolean
}
export const RarityChip: React.FC<RarityChipProps> = ({
  item,
  showPopover,
  goTo,
  weight,
  quantityString,
  showIcon,
}) => {
  const { openPopover, closePopover } = useItemDetailsPopover()

  function getImageIconUrl(name: string) {
    // Assuming images are in a 'dir' subdirectory relative to the current module
    return new URL(`${window.location}/itemIcons/${name}.png`, import.meta.url)
      .href
  }

  const itemType = getItemType(item)
  const handleClick = () => {
    if (goTo) {
      goTo(itemType, item.id)
    }
  }
  let label = weight ? item.name + ' - ' + weight : item.name
  if (quantityString) {
    label += ' ' + quantityString
  }
  const chipIcon = showIcon ? (
    <img
      src={getImageIconUrl(item.assetName || item.id)}
      className="chipIcon"
    />
  ) : undefined

  return (
    <span
      onMouseEnter={
        showPopover
          ? (event) => {
              openPopover(item, event.currentTarget)
            }
          : undefined
      }
      onMouseLeave={showPopover ? closePopover : undefined}
      onClick={handleClick}
      className={goTo ? 'interactive' : ''}
    >
      <Chip
        {...(chipIcon ? { icon: chipIcon } : {})}
        key={item.id}
        color="primary"
        style={{
          backgroundColor: getRarityColor(item.rarity),
          margin: '3px',
          padding: '4px 2px 4px 2px',
        }}
        label={label}
        className="rarityChip"
      />
    </span>
  )
}
