import { useEffect, useRef } from 'react'
import { SpinePlayer } from '@esotericsoftware/spine-player'
import type { Enemy } from './types'

function getBaseHref(assetKey: string) {
  // Assuming images are in a 'dir' subdirectory relative to the current module
  return new URL(`${window.location}spine/${assetKey}`).href
}

export const EnemyAnimationViewer = ({
  spineAssetKey,
  showControls,
}: {
  spineAssetKey: string
  showControls?: boolean
}) => {
  const spineRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<SpinePlayer>(null)
  useEffect(() => {
    const spineRoot = spineRef.current
    if (spineRoot && !playerRef.current) {
      playerRef.current = new SpinePlayer(spineRoot, {
        preserveDrawingBuffer: true,
        skeleton: `${getBaseHref(spineAssetKey)}.skel`,
        atlas: `${getBaseHref(spineAssetKey)}.atlas`,
        showControls: showControls || false,
        animation: 'idle',
        backgroundColor: '#ffffff',
        viewport: {
          width: 600,
          height: 400,
        },
      })
    }
  }, [spineAssetKey])
  return (
    <div
      style={{
        width: '50%',
        height: '400px',
        overflow: 'hidden',
        margin: 'auto',
      }}
      ref={spineRef}
    ></div>
  )
}

export const EnemyViewer = ({ enemy }: { enemy: Enemy }) => {
  return <EnemyAnimationViewer spineAssetKey={enemy.spineAssetKey} />
}
