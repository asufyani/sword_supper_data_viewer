import Chip from "@mui/material/Chip";
import type { damageType, Item, Rarity, TabName } from "./types"
import { useState } from "react";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";

interface RarityChipProps {
  item: Item,
  showPopover?: boolean,
  goTo?: (tab: TabName, id: string) => void
  amount?: number[]
}
const colorMap: Record<Rarity, string>= {
  common: 'gray',
  uncommon: 'limegreen',
  rare: 'blue',
  epic: 'blueviolet',
  legendary: 'orange',
}
export const RarityChip: React.FC<RarityChipProps> = ({item, showPopover, goTo, amount}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const itemType = item.tags.includes('map') ? 'Maps': item.tags.includes('blueprint') ? 'Blueprints' : (item.tags.includes('equipment') && item.equipSlots.includes('Weapon')) ? 'Weapons' : 'Armor';
  const handleClick = () => {
    if (goTo) {
      goTo(itemType, item.id)
    }
  }
  const label = amount ? item.name + ': ' + amount : item.name;
  return <span onMouseOver={showPopover ? handlePopoverOpen : () => {}} onMouseOut={handlePopoverClose}  onClick={handleClick} className={goTo ? 'interactive' : ''}>
    <Chip key={item.id} color='primary' style={{backgroundColor:colorMap[item.rarity]}} label={label} />
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
      <Typography key={item.id} sx={{ p: 1 }}>
        <span>Required level: {item.requiredLevel}</span>
        <br/>
        <span>{(Object.keys(item.damage || {}) as damageType[]).map(typeString=> <span key={item.id+'-'+typeString}>{typeString} : {item.damage![typeString]} </span>)}</span>
        <br/>
        {item.statModifiers.map(modifier => <><span key={item.id+'-'+modifier.stat}>{modifier.stat}: {modifier.value}</span><br/></>)}
        {item.abilities?.map(ability => <><span key={item.id+'-'+ability.id}>{ability.id}</span><br/></>)}
      </Typography>
    </Popover></span>
}