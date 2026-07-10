import type { ability, Item, ItemNameMap } from '../types'
import { abilityNameMap } from './abilityNames'

function splitCamelCase(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
}

function addAbilityTerms(parts: string[], abilityEntry: ability) {
  parts.push(abilityEntry.id, splitCamelCase(abilityEntry.id))

  const abilityDetails =
    abilityNameMap[abilityEntry.id as keyof typeof abilityNameMap]
  if (abilityDetails) {
    parts.push(abilityDetails.name, abilityDetails.description)
  }
}

function collectRelatedItems(item: Item, itemNameMap?: ItemNameMap) {
  const relatedItems = [item]
  if (!itemNameMap) {
    return relatedItems
  }

  const visited = new Set<string>([item.id])
  const queue = item.upgrades.map((upgrade) => upgrade.yields)

  while (queue.length > 0) {
    const itemId = queue.shift()
    if (!itemId || visited.has(itemId)) {
      continue
    }

    visited.add(itemId)
    const relatedItem = itemNameMap[itemId]
    if (!relatedItem) {
      continue
    }

    relatedItems.push(relatedItem)
    relatedItem.upgrades.forEach((upgrade) => queue.push(upgrade.yields))
  }

  return relatedItems
}

export function buildItemSearchText(item: Item, itemNameMap?: ItemNameMap) {
  const parts: string[] = []

  for (const relatedItem of collectRelatedItems(item, itemNameMap)) {
    parts.push(
      relatedItem.name,
      relatedItem.id,
      relatedItem.description,
      relatedItem.rarity,
      ...relatedItem.equipSlots,
      ...relatedItem.tags
    )

    relatedItem.statModifiers.forEach((modifier) => {
      parts.push(modifier.stat, modifier.type, splitCamelCase(modifier.stat))
    })

    if (relatedItem.damage) {
      parts.push(...Object.keys(relatedItem.damage))
    }

    relatedItem.abilities?.forEach((abilityEntry) =>
      addAbilityTerms(parts, abilityEntry)
    )
  }

  return parts.join(' ')
}

export function normalizeItemSearchQuery(query: string) {
  return query.toLowerCase().trim().split(/\s+/).filter(Boolean)
}

export function itemMatchesSearch(
  item: Item,
  searchQuery: string,
  itemNameMap?: ItemNameMap
) {
  const searchTokens = normalizeItemSearchQuery(searchQuery)
  if (searchTokens.length === 0) {
    return true
  }

  const haystack = buildItemSearchText(item, itemNameMap).toLowerCase()
  return searchTokens.every((token) => haystack.includes(token))
}
