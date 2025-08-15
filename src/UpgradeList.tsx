import { RarityChip } from './RarityChip'
import type { ItemNameMap, TabName, Upgrade } from './types'

interface UpgradeListProps {
  upgrades: Upgrade[]
  itemNameMap: ItemNameMap
  goTo?: (tab: TabName, id: string) => void
}

export const UpgradeList: React.FC<UpgradeListProps> = ({
  upgrades,
  itemNameMap,
  goTo,
}) => {
  return (
    <>
      {upgrades.map((upgrade) => (
        <div key={upgrade.yields + '-upgrade'}>
          <RarityChip
            item={itemNameMap[upgrade.yields]}
            goTo={goTo}
            showPopover={true}
          />
          <ul>
            {upgrade.requires.map((requirement, idx) => (
              <li key={`${upgrade.yields}-${requirement.id}-${idx}`}>
                {itemNameMap[requirement.id].name}: {requirement.amount}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}
