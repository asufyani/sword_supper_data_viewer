import { useEffect, useRef } from 'react'
import { SpinePlayer } from '@esotericsoftware/spine-player'
import type { Enemy } from './types'

function getBaseHref(assetKey: string) {
  // Assuming images are in a 'dir' subdirectory relative to the current module
  return new URL(`${window.location}spine/${assetKey}`).href
}

export const EnemyAnimationViewer = ({
  spineAssetKey,
  spineScale,
  showControls,
}: {
  spineAssetKey: string
  spineScale?: number
  showControls?: boolean
}) => {
  const spineRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<SpinePlayer | null>(null)

  useEffect(() => {
    const spineRoot = spineRef.current

    if (!spineRoot) {
      return
    }

    const player = new SpinePlayer(spineRoot, {
      preserveDrawingBuffer: true,
      skeleton: `${getBaseHref(spineAssetKey)}.skel`,
      atlas: `${getBaseHref(spineAssetKey)}.atlas`,
      showControls: showControls || false,
      animation: 'idle',
      alpha: true,
      scale: spineScale ?? 1,
      viewport: {
        padLeft: 80,
        padRight: 80,
        padTop: 60,
        padBottom: 20,
      },
    })

    playerRef.current = player

    return () => {
      player.dispose()
      playerRef.current = null
      spineRoot.replaceChildren()
    }
  }, [showControls, spineAssetKey, spineScale])

  return (
    <div
      className="spine-player enemy-viewer"
      style={{
        overflow: 'hidden',
        margin: 'auto',
      }}
      ref={spineRef}
    ></div>
  )
}

export const EnemyViewer = ({ enemy }: { enemy: Enemy }) => {
  return (
    <EnemyAnimationViewer
      spineAssetKey={enemy.spineAssetKey}
      spineScale={enemy.spineScale}
    />
  )
}
