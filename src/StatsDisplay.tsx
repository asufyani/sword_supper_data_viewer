import Tooltip from '@mui/material/Tooltip'
import type { ability, statModifier } from './types'
import { abilityNameMap } from './utils/abilityNames'
import { Chip } from '@mui/material'

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
        <Tooltip
          key={ability.id}
          title={
            abilityNameMap[ability.id as keyof typeof abilityNameMap]
              .description
          }
        >
          <Chip
            variant="outlined"
            key={ability.id}
            label={
              abilityNameMap[ability.id as keyof typeof abilityNameMap].name
            }
            style={{ cursor: 'pointer' }}
          />
        </Tooltip>
      ))}
    </>
  )
}
