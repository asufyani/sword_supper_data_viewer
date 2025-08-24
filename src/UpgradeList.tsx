import { Typography } from '@mui/material'
import { AssetIcon } from './AssetIcon'
import { RarityChip } from './RarityChip'
import type { ItemNameMap, TabName, Upgrade } from './types'

interface UpgradeListProps {
  itemId: string
  upgrades: Upgrade[]
  itemNameMap: ItemNameMap
  goTo?: (tab: TabName, id: string) => void
  upgradeMaterialsList?: Record<string, string[]>
}

export const UpgradeList: React.FC<UpgradeListProps> = ({
  itemId,
  upgrades,
  itemNameMap,
  goTo,
  upgradeMaterialsList,
}) => {
  let upgradesTo = <></>
  {
    if (upgradeMaterialsList && upgradeMaterialsList[itemId]) {
      upgradesTo = (
        <>
          <Typography component={'h3'}>Required by:</Typography>
          {upgradeMaterialsList[itemId].map((upgradeResult) => (
            <div>
              <RarityChip
                item={itemNameMap[upgradeResult]}
                goTo={goTo}
                showIcon={true}
                key={upgradeResult}
              />
            </div>
          ))}
        </>
      )
    }
  }
  return (
    <>
      {upgradesTo}
      {upgrades.map((upgrade, idx) => (
        <>
          {idx === 0 && <Typography component={'h3'}>Upgrades to:</Typography>}
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
        </>
      ))}
    </>
  )
}
