import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import { Box, Chip, Stack } from '@mui/material'
import type { Item, Rarity, TabName } from './types'
import { StatsDisplay } from './StatsDisplay'
import { AssetIcon } from './AssetIcon'
import { DamageDisplay } from './DamageDisplay'

type ItemDetailsPopoverValue = {
  closePopover: () => void
  openPopover: (item: Item, anchorEl: HTMLElement) => void
}

const rarityBorderMap: Record<Rarity, string> = {
  common: '#617E8A',
  uncommon: '#1DC056',
  rare: '#00A8FF',
  epic: '#B260FD',
  legendary: '#FFC900',
  mythic: '#EB2F47',
}

const ItemDetailsPopoverContext = createContext<ItemDetailsPopoverValue | null>(
  null
)

export function useItemDetailsPopover() {
  const value = useContext(ItemDetailsPopoverContext)

  if (!value) {
    throw new Error(
      'useItemDetailsPopover must be used within ItemDetailsPopoverProvider'
    )
  }

  return value
}

export function getItemType(item: Item): TabName {
  return item.tags.includes('map')
    ? 'Maps'
    : item.tags.includes('blueprint')
      ? 'Blueprints'
      : item.tags.includes('equipment') && item.equipSlots.includes('Weapon')
        ? 'Weapons'
        : 'Armor'
}

export const ItemDetailsPopoverProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [item, setItem] = useState<Item | null>(null)

  const value = useMemo<ItemDetailsPopoverValue>(
    () => ({
      closePopover: () => {
        setAnchorEl(null)
        setItem(null)
      },
      openPopover: (nextItem, nextAnchorEl) => {
        setItem(nextItem)
        setAnchorEl(nextAnchorEl)
      },
    }),
    []
  )

  return (
    <ItemDetailsPopoverContext.Provider value={value}>
      {children}
      <ItemDetailsPopover anchorEl={anchorEl} item={item} />
    </ItemDetailsPopoverContext.Provider>
  )
}

function ItemDetailsPopover({
  anchorEl,
  item,
}: {
  anchorEl: HTMLElement | null
  item: Item | null
}) {
  const open = Boolean(anchorEl && item)

  if (!item) {
    return null
  }

  const rarityAccent = rarityBorderMap[item.rarity]

  return (
    <Popover
      id="item-details-popover"
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
      disableRestoreFocus
      slotProps={{
        root: {
          sx: {
            pointerEvents: { xs: 'auto', sm: 'none' },
          },
        },
        paper: {
          sx: {
            background:
              'linear-gradient(180deg, rgba(251,252,255,0.98) 0%, rgba(241,245,249,0.98) 100%)',
            border: `1px solid ${rarityAccent}`,
            borderTopWidth: 5,
            borderRadius: 3,
            boxShadow: '0 18px 48px rgba(15, 23, 42, 0.18)',
            maxWidth: 420,
            overflow: 'hidden',
          },
        },
      }}
    >
      <Stack direction="row" spacing={2} sx={{ p: 2 }}>
        <Box sx={{ pt: 0.5 }}>
          <AssetIcon assetName={item.assetName || item.id} rarity={item.rarity} />
        </Box>
        <Box sx={{ textAlign: 'left' }}>
          <Chip
            label={item.rarity.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: rarityAccent,
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '0.06em',
              mb: 1,
            }}
          />
          <Typography
            component="div"
            sx={{ color: '#102033', fontSize: '1.1rem', fontWeight: 700 }}
          >
            {item.name}
          </Typography>
          <Typography
            component="div"
            sx={{ color: '#475569', fontSize: '0.9rem', mb: 1.25 }}
          >
            Required level: {item.requiredLevel}
          </Typography>
          {item.description && (
            <Typography
              component="div"
              sx={{ color: '#334155', fontSize: '0.92rem', mb: 1.25 }}
            >
              {item.description}
            </Typography>
          )}
          {item.damage && (
            <Typography component="div" sx={{ color: '#102033', mb: 1 }}>
              Damage: <DamageDisplay damage={item.damage} />
            </Typography>
          )}
          <StatsDisplay statModifiers={item.statModifiers} abilities={item.abilities} />
        </Box>
      </Stack>
    </Popover>
  )
}
