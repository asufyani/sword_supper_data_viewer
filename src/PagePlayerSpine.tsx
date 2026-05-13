import { useEffect, useMemo, useRef } from 'react'
import { SpinePlayer } from '@esotericsoftware/spine-player'
import type { Attachment } from '@esotericsoftware/spine-webgl'
import {
  GLTexture,
  TextureFilter,
  TextureRegion,
} from '@esotericsoftware/spine-webgl'
import {
  getPlayerWeaponAssetPath,
  selectRandomPlayerWeapon,
  type PlayerWeaponAsset,
} from './utils/playerWeapons'

type TextureAttachment = Attachment & {
  copy(): Attachment
  region: TextureRegion | null
  updateRegion(): void
}

function getSpineAssetPath(fileName: string) {
  return `${import.meta.env.BASE_URL}spine/${fileName}`
}

function isTextureAttachment(
  attachment: Attachment | null
): attachment is TextureAttachment {
  return (
    !!attachment &&
    'copy' in attachment &&
    'region' in attachment &&
    'updateRegion' in attachment
  )
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    image.src = src
  })
}

function buildTextureRegion(texture: GLTexture, image: HTMLImageElement) {
  const width = image.naturalWidth || image.width
  const height = image.naturalHeight || image.height
  const region = new TextureRegion()

  region.texture = texture
  region.u = 0
  region.v = 0
  region.u2 = 1
  region.v2 = 1
  region.width = width
  region.height = height
  region.originalWidth = width
  region.originalHeight = height

  return region
}

export async function applyWeaponTexture(
  player: SpinePlayer,
  weapon: PlayerWeaponAsset
) {
  const slot = player.skeleton?.findSlot('weapon')
  const sourceAttachment = slot?.getAttachment() ?? null

  if (!player.context || !slot || !isTextureAttachment(sourceAttachment)) {
    return null
  }

  const image = await loadImage(getPlayerWeaponAssetPath(weapon))
  const texture = new GLTexture(player.context, image)
  texture.setFilters(TextureFilter.Linear, TextureFilter.Linear)

  const weaponAttachment = sourceAttachment.copy()
  if (!isTextureAttachment(weaponAttachment)) {
    texture.dispose()
    return null
  }

  weaponAttachment.region = buildTextureRegion(texture, image)
  weaponAttachment.updateRegion()
  slot.setAttachment(weaponAttachment)

  return texture
}

type PagePlayerSpineProps = {
  selectedWeapon?: PlayerWeaponAsset | null
}

export function PagePlayerSpine({ selectedWeapon }: PagePlayerSpineProps) {
  const spineRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<SpinePlayer | null>(null)
  const weaponTextureRef = useRef<GLTexture | null>(null)
  const randomWeapon = useMemo(() => selectRandomPlayerWeapon(), [])
  const weapon = selectedWeapon ?? randomWeapon

  useEffect(() => {
    const spineRoot = spineRef.current

    if (!spineRoot) {
      return
    }

    let disposed = false
    const disposeWeaponTexture = () => {
      weaponTextureRef.current?.dispose()
      weaponTextureRef.current = null
    }

    const player = new SpinePlayer(spineRoot, {
      skeleton: getSpineAssetPath('frogPlayer.skel'),
      atlas: getSpineAssetPath('frogPlayer.atlas'),
      animation: 'idle',
      alpha: true,
      backgroundColor: '00000000',
      preserveDrawingBuffer: false,
      showControls: false,
      showLoading: false,
      interactive: false,
      viewport: {
        padLeft: '18%',
        padRight: '10%',
        padTop: '10%',
        padBottom: '0%',
      },
      success: (loadedPlayer) => {
        const skeleton = loadedPlayer.skeleton

        if (skeleton) {
          skeleton.scaleX = -1
        }

        void applyWeaponTexture(loadedPlayer, weapon)
          .then((texture) => {
            if (!texture) {
              return
            }

            if (disposed) {
              texture.dispose()
              return
            }

            disposeWeaponTexture()
            weaponTextureRef.current = texture
          })
          .catch((error) => {
            console.warn('Unable to apply player weapon texture', error)
          })
      },
    })

    playerRef.current = player

    return () => {
      disposed = true
      disposeWeaponTexture()
      player.dispose()
      playerRef.current = null
      spineRoot.replaceChildren()
    }
  }, [weapon])

  return <div className="page-player-spine" ref={spineRef}></div>
}
