import type { ability, statModifier } from './types'

const formatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

interface StatsDisplayProps {
  statModifiers: statModifier[]
  abilities?: ability[]
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  statModifiers,
  abilities,
}) => {
  return (
    <>
      {statModifiers.map((modifier) => (
        <div key={modifier.stat}>
          {modifier.stat}:{' '}
          <span className={modifier.value > 0 ? 'bonus' : 'penalty'}>
            {modifier.value > -1 && modifier.value < 1
              ? formatter.format(modifier.value)
              : modifier.value}
          </span>
        </div>
      ))}
      {abilities?.map((ability) => (
        <div key={ability.id}>{ability.id}</div>
      ))}
    </>
  )
}
