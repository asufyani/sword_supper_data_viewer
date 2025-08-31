import { useEffect, useRef } from 'react'
import { SpinePlayer } from '@esotericsoftware/spine-player'
import type { Enemy } from './types'

export const EnemyAnimationViewer = ({
  spineAssetKey,
}: {
  spineAssetKey: string
}) => {
  const spineRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const spineRoot = spineRef.current
    if (spineRoot) {
      const sp = new SpinePlayer(spineRoot, {
        preserveDrawingBuffer: true,
        skeleton: `./spine/${spineAssetKey}.skel`,
        showControls: true,
        animation: 'idle',
        atlas: `./spine/${spineAssetKey}.atlas`,
        backgroundColor: '#ffffff',
      })
    }
  }, [spineAssetKey])
  return (
    <div
      style={{
        width: '600px',
        height: '400px',
        overflow: 'hidden',
        left: 'auto',
        right: 'auto',
        margin: 'auto',
      }}
      ref={spineRef}
    ></div>
  )
}

export const EnemyViewer = ({ enemy }: { enemy: Enemy }) => {
  return <EnemyAnimationViewer spineAssetKey={enemy.spineAssetKey} />
}
