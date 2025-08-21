import Chip from '@mui/material/Chip'
import type { damageType, Item, Rarity, TabName } from './types'
import { useState } from 'react'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import { StatsDisplay } from './StatsDisplay'
import { AssetIcon } from './AssetIcon'
import { Stack } from '@mui/material'

interface RarityChipProps {
  item: Item
  showPopover?: boolean
  goTo?: (tab: TabName, id: string) => void
  weight?: string
  quantityString?: string
  showIcon?: boolean
}
const colorMap: Record<Rarity, string> = {
  common: 'gray',
  uncommon: 'limegreen',
  rare: 'blue',
  epic: 'blueviolet',
  legendary: 'orange',
}
export const RarityChip: React.FC<RarityChipProps> = ({
  item,
  showPopover,
  goTo,
  weight,
  quantityString,
  showIcon,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  function getImageIconUrl(name: string) {
    // Assuming images are in a 'dir' subdirectory relative to the current module
    return new URL(`${window.location}/itemIcons/${name}.png`, import.meta.url)
      .href
  }

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const itemType = item.tags.includes('map')
    ? 'Maps'
    : item.tags.includes('blueprint')
      ? 'Blueprints'
      : item.tags.includes('equipment') && item.equipSlots.includes('Weapon')
        ? 'Weapons'
        : 'Armor'
  const handleClick = () => {
    if (goTo) {
      goTo(itemType, item.id)
    }
  }
  let label = weight ? item.name + ' - ' + weight : item.name
  if (quantityString) {
    label += ' ' + quantityString
  }
  return (
    <span
      onMouseOver={showPopover ? handlePopoverOpen : () => {}}
      onMouseOut={handlePopoverClose}
      onClick={handleClick}
      className={goTo ? 'interactive' : ''}
    >
      <Chip
        icon={
          showIcon ? (
            <img
              src={getImageIconUrl(item.assetName || item.id)}
              className="chipIcon"
            />
          ) : (
            <></>
          )
        }
        key={item.id}
        color="primary"
        style={{
          backgroundColor: colorMap[item.rarity],
          margin: '3px',
          padding: '4px 2px 4px 2px',
        }}
        label={label}
        className="rarityChip"
      />
      <Popover
        id="mouse-over-popover"
        sx={{ pointerEvents: 'none' }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Stack direction="row" spacing={1} style={{ paddingLeft: '10px' }}>
          <AssetIcon
            assetName={item.assetName || item.id}
            rarity={item.rarity}
          />
          <Typography component={'div'} key={item.id} sx={{ padding: 1 }}>
            <span>Required level: {item.requiredLevel}</span>
            <br />
            {item.damage && (
              <>
                <span>
                  {(Object.keys(item.damage || {}) as damageType[]).map(
                    (typeString) => (
                      <span key={item.id + '-' + typeString}>
                        {typeString} : {item.damage![typeString]}{' '}
                      </span>
                    )
                  )}
                </span>
                <br />
              </>
            )}
            <StatsDisplay
              statModifiers={item.statModifiers}
              abilities={item.abilities}
            />
          </Typography>
        </Stack>
      </Popover>
    </span>
  )
}
