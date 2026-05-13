import { useEffect, useMemo, useRef } from 'react'
import { SpinePlayer } from '@esotericsoftware/spine-player'
import {
  getPageEnemySpineAssetPath,
  selectRandomPageEnemy,
} from './utils/pageEnemy'
import type { PageBackground } from './utils/pageBackground'

type PageEnemySpineProps = {
  pageBackground: PageBackground
}

export function PageEnemySpine({ pageBackground }: PageEnemySpineProps) {
  const spineRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<SpinePlayer | null>(null)
  const enemy = useMemo(
    () => selectRandomPageEnemy(pageBackground),
    [pageBackground]
  )

  useEffect(() => {
    const spineRoot = spineRef.current

    if (!spineRoot) {
      return
    }

    const player = new SpinePlayer(spineRoot, {
      skeleton: getPageEnemySpineAssetPath(enemy, 'skel'),
      atlas: getPageEnemySpineAssetPath(enemy, 'atlas'),
      animation: 'idle',
      alpha: true,
      backgroundColor: '00000000',
      preserveDrawingBuffer: false,
      showControls: false,
      showLoading: false,
      interactive: false,
      viewport: {
        padLeft: '10%',
        padRight: '18%',
        padTop: '10%',
        padBottom: '0%',
      },
    })

    playerRef.current = player

    return () => {
      player.dispose()
      playerRef.current = null
      spineRoot.replaceChildren()
    }
  }, [enemy])

  return <div className="page-enemy-spine" ref={spineRef}></div>
}
