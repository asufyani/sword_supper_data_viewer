import type { ability } from '../types'
import { abilityNameMap, abilityParamDescriptionMap } from './abilityNames'

type AbilityParams = NonNullable<ability['params']>

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

function formatParamValue(key: string, value: number) {
  if (
    key.endsWith('Chance') ||
    key === 'threshold' ||
    (key.endsWith('Amount') && value > -1 && value < 1)
  ) {
    return percentFormatter.format(value)
  }

  if (key === 'multiplier') {
    return `${numberFormatter.format(value)}x`
  }

  return numberFormatter.format(value)
}

function formatParamName(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (firstLetter) => firstLetter.toUpperCase())
    .toLowerCase()
    .replace(/^./, (firstLetter) => firstLetter.toUpperCase())
}

function formatAbilityParamSummary(params: AbilityParams | undefined) {
  if (!params || Object.keys(params).length === 0) {
    return ''
  }

  return Object.entries(params)
    .map(
      ([key, value]) => `${formatParamName(key)}: ${formatParamValue(key, value)}`
    )
    .join('; ')
}

function abilityParamKey(params: AbilityParams) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(params).sort(([left], [right]) => left.localeCompare(right))
    )
  )
}

export function formatAbilityTooltip(itemAbility: ability) {
  const abilityDefinition =
    abilityNameMap[itemAbility.id as keyof typeof abilityNameMap]
  const paramDescription = itemAbility.params
    ? abilityParamDescriptionMap[itemAbility.id]?.[
        abilityParamKey(itemAbility.params)
      ]
    : undefined
  const description =
    paramDescription ?? abilityDefinition?.description ?? itemAbility.id
  const paramSummary = formatAbilityParamSummary(itemAbility.params)

  return paramSummary ? `${description}\n\nParams: ${paramSummary}` : description
}
