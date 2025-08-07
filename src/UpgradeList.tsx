import { RarityChip } from "./RarityChip"
import type { ItemNameMap, Upgrade } from "./types"

interface UpgradeListProps {
    upgrades: Upgrade[],
    itemNameMap: ItemNameMap
}

export const UpgradeList: React.FC<UpgradeListProps> = ({upgrades, itemNameMap}) => {
  return <>{upgrades.map(upgrade => <div>
    <RarityChip 
      label={itemNameMap[upgrade.yields].name} 
      rarity={itemNameMap[upgrade.yields].rarity}
      key={itemNameMap[upgrade.yields].id}
    />
    <ul>
      {upgrade.requires.map(requirement => <li>{itemNameMap[requirement.id].name}: {requirement.amount}</li>)}
    </ul>
    </div>)}
    </>
  }
