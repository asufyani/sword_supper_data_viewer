import { AssetIcon } from './AssetIcon'
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
          {/* <AssetIcon
            assetName={itemNameMap[upgrade.yields].assetName}
            rarity={itemNameMap[upgrade.yields].rarity}
          /> */}
          <RarityChip
            item={itemNameMap[upgrade.yields]}
            goTo={goTo}
            showPopover={true}
            showIcon={true}
          />
          <ul>
            {upgrade.requires.map((requirement, idx) => (
              <li key={`${upgrade.yields}-${requirement.id}-${idx}`}>
                {requirement.amount > 1 ? (
                  <>
                    <AssetIcon
                      assetName={requirement.id}
                      rarity={itemNameMap[requirement.id].rarity}
                      mini={true}
                    />
                    {'  '}
                    {itemNameMap[requirement.id].name}: {requirement.amount}
                  </>
                ) : (
                  <RarityChip
                    item={itemNameMap[requirement.id]}
                    showIcon={true}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}
