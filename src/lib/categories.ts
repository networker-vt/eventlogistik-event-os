/**
 * Live categories — 6–10 filled industries. Empty chips stay hidden.
 */
import type { Listing, MarketType } from '../types'
import { INDUSTRIES, type Industry } from '../data/industries'
import { seedListings } from '../data/seed'
import { MARKET_TYPES, deriveMarketType } from './market'

export const MAX_LIVE_CATEGORIES = 10
export const MIN_LIVE_CATEGORIES = 6

export function filledIndustries(listings: Listing[] = seedListings): Industry[] {
  const counts = new Map<string, number>()
  for (const l of listings) {
    if (l.status && l.status !== 'active') continue
    const ind = l.industry
    if (!ind) continue
    counts.set(ind, (counts.get(ind) || 0) + 1)
  }
  const ranked = INDUSTRIES.filter((ind) => (counts.get(ind) || 0) > 0).sort(
    (a, b) => (counts.get(b) || 0) - (counts.get(a) || 0),
  )
  return ranked.slice(0, MAX_LIVE_CATEGORIES)
}

export function filledMarketTypes(listings: Listing[] = seedListings): MarketType[] {
  const counts = new Map<MarketType, number>()
  for (const l of listings) {
    if (l.status && l.status !== 'active') continue
    const t = deriveMarketType(l)
    counts.set(t, (counts.get(t) || 0) + 1)
  }
  return MARKET_TYPES.filter((t) => (counts.get(t) || 0) > 0)
}

export function isLiveIndustry(name: string, listings: Listing[] = seedListings): boolean {
  return filledIndustries(listings).includes(name as Industry)
}
