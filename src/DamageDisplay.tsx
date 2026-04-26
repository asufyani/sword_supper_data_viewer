import type { Item, damageType } from './types'
import { damageTypeSymbols } from './utils/constants'

interface DamageDisplayProps {
  damage: Item['damage']
}

export function DamageDisplay({ damage }: DamageDisplayProps) {
  if (!damage) {
    return null
  }

  return (
    <>
      {(Object.keys(damage) as damageType[]).map((typeString) => (
        <span key={typeString}>
          {damage[typeString]}
          {damageTypeSymbols[typeString]}
        </span>
      ))}
    </>
  )
}
