import Chip from "@mui/material/Chip";
import type { Rarity } from "./types"

interface RarityChipProps {
    key: string;
    rarity: Rarity;
    label: string;
}
const colorMap: Record<Rarity, string>= {
  common: 'gray',
  uncommon: 'limegreen',
  rare: 'blue',
  epic: 'blueviolet',
  legendary: 'orange',
}
export const RarityChip: React.FC<RarityChipProps> = ({key, rarity, label}) => {
    return <Chip key={key} color='primary' style={{backgroundColor:colorMap[rarity]}} label={label} />
}