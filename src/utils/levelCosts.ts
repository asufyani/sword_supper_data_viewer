export function getLevelUpgradeCost(level: number): number {
  if (level === 1) return 40
  if (level === 2) return 85
  if (level === 3) return 140

  const rawCost = Math.ceil(200 + 0.024 * Math.pow(level - 1, 3.03))
  return Math.ceil(rawCost / 5) * 5
}

export function getLevelCostSoFar(level: number): number {
  let total = 0

  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    total += getLevelUpgradeCost(currentLevel)
  }

  return total
}
