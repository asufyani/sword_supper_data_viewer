import type { Rarity } from './types'

function getImageIconUrl(name: string) {
  // Assuming images are in a 'dir' subdirectory relative to the current module
  return new URL(`${window.location}/itemIcons/${name}.png`, import.meta.url)
    .href
}

function getRarityBgUrl(rarity: Rarity) {
  // Assuming images are in a 'dir' subdirectory relative to the current module
  return new URL(
    `${window.location}/backgrounds/equip_bg_${rarity}.png`,
    import.meta.url
  ).href
}

export const AssetIcon = ({
  rarity,
  assetName,
  mini,
}: {
  rarity: Rarity
  assetName: string
  mini?: boolean
}) => {
  return (
    <span
      className={mini ? 'assetIconContainer mini' : 'assetIconContainer'}
      style={{
        backgroundImage: `url(${getRarityBgUrl(rarity)})`,
      }}
    >
      <img
        className={mini ? 'assetIcon mini' : 'assetIcon'}
        src={getImageIconUrl(assetName)}
      />
    </span>
  )
}
