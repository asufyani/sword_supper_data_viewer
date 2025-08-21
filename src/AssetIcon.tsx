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
}: {
  rarity: Rarity
  assetName: string
}) => {
  return (
    <span
      className="assetIconContainer"
      style={{
        backgroundImage: `url(${getRarityBgUrl(rarity)})`,
        backgroundSize: '50px',
        height: '50px',
        width: '50px',
        display: 'inline-block',
      }}
    >
      <img className="assetIcon" src={getImageIconUrl(assetName)} />
    </span>
  )
}
