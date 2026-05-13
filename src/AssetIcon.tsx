import type { Rarity } from './types'

function getImageIconUrl(name: string) {
  // Assuming images are in a 'dir' subdirectory relative to the current module
  return new URL(`${window.location}/itemIcons/${name}.png`, import.meta.url)
    .href
}

function getRarityBgUrl(rarity: Rarity) {
  const bgRarity = rarity === 'mythic' ? 'legendary' : rarity
  // Assuming images are in a 'dir' subdirectory relative to the current module
  return new URL(
    `${window.location}/backgrounds/equip_bg_${bgRarity}.png`,
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
      role="img"
      aria-label={`Item icon for ${assetName}`}
      title={`Item icon for ${assetName}`}
      style={{
        backgroundImage: `url(${getRarityBgUrl(rarity)})`,
      }}
    >
      <span
        aria-hidden="true"
        className={mini ? 'assetIconFallback mini' : 'assetIconFallback'}
        hidden
      >
        ?
      </span>
      <img
        key={assetName}
        alt=""
        className={mini ? 'assetIcon mini' : 'assetIcon'}
        onError={(event) => {
          const fallback =
            event.currentTarget.previousElementSibling as HTMLElement | null
          if (fallback) fallback.hidden = false
          event.currentTarget.hidden = true
        }}
        src={getImageIconUrl(assetName)}
      />
    </span>
  )
}
