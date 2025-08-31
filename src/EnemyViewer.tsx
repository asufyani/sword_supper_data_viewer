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
      new SpinePlayer(spineRoot, {
        preserveDrawingBuffer: false,
        skeleton: `./spine/${spineAssetKey}.skel`,
        atlas: `./spine/${spineAssetKey}.atlas`,
        animation: 'idle',
        backgroundColor: '#ffffff',
      })
    }
  }, [spineAssetKey])
  return (
    <div
      style={{
        height: '400px',
        overflow: 'hidden',
        left: 'auto',
        right: 'auto',
      }}
      ref={spineRef}
    ></div>
  )
}

export const EnemyViewer = ({ enemy }: { enemy: Enemy }) => {
  return <EnemyAnimationViewer spineAssetKey={enemy.spineAssetKey} />
}
