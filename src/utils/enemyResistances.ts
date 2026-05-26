import type { Enemy, EnemyResistances } from '../types'

export type EnemyResistanceKey = keyof EnemyResistances

export type EnemyResistanceRow = {
  key: EnemyResistanceKey
  value: number
}

export const enemyResistanceKeys = [
  'shadowResist',
  'iceResist',
  'lightningResist',
  'fireResist',
  'poisonResist',
  'weakResist',
  'vulnerableResist',
  'silenceResist',
  'hypnotizeResist',
] as const satisfies readonly EnemyResistanceKey[]

function getActiveLevelOverride(enemy: Enemy, level: number) {
  return enemy.levelOverrides
    ?.filter((override) => override.minLevel <= level)
    .sort((a, b) => b.minLevel - a.minLevel)[0]
}

export function getEnemyResistanceRows(
  enemy: Enemy,
  level: number
): EnemyResistanceRow[] {
  const overrides = getActiveLevelOverride(enemy, level)?.resistOverrides ?? {}

  return enemyResistanceKeys.flatMap((key) => {
    const value = overrides[key] ?? enemy[key]

    return typeof value === 'number' && value !== 0 ? [{ key, value }] : []
  })
}
