import type { Enemy } from '../types'
import { z3 } from './enemies'
import { Z0 } from './mapEnemies'
import type { PageBackground } from './pageBackground'

function getPageEnemyPool(pageBackground: Pick<PageBackground, 'key'>) {
  const mapEnemies = Z0[pageBackground.key as keyof typeof Z0]
  const enemyIds = new Set<string>()

  mapEnemies?.tiers.forEach((tier) => {
    tier.items.forEach((item) => {
      if (item.id && z3[item.id]) {
        enemyIds.add(item.id)
      }
    })
  })

  return [...enemyIds].map((id) => z3[id])
}

export function selectRandomPageEnemy(
  pageBackground: Pick<PageBackground, 'key'>,
  random: () => number = Math.random
): Enemy {
  const enemies = getPageEnemyPool(pageBackground)
  const index = Math.max(
    0,
    Math.min(enemies.length - 1, Math.floor(random() * enemies.length))
  )

  return enemies[index] ?? z3.skeleton
}

export function getPageEnemySpineAssetPath(
  enemy: Pick<Enemy, 'spineAssetKey'>,
  extension: 'atlas' | 'skel'
) {
  return `${import.meta.env.BASE_URL}spine/${enemy.spineAssetKey}.${extension}`
}

export function getPageEnemySpineScale(enemy: Pick<Enemy, 'spineScale'>) {
  return enemy.spineScale ?? 1
}
