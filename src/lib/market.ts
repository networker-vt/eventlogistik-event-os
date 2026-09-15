import type { CreateIntent, Listing, ListingKind, MarketType, Vertical } from '../types'

export const MARKET_TYPES: MarketType[] = [
  'job',
  'minijob',
  'service',
  'b2b',
  'partnership',
  'asset',
]

export const MARKET_EMOJI: Record<MarketType, string> = {
  job: '💼',
  minijob: '⏱️',
  service: '🛠️',
  b2b: '🤝',
  partnership: '🔗',
  asset: '📦',
}

export const CREATE_INTENTS: CreateIntent[] = ['job', 'service', 'partnership', 'need']

export function deriveMarketType(listing: Pick<Listing, 'marketType' | 'vertical' | 'jobType' | 'industry'>): MarketType {
  if (listing.marketType) return listing.marketType
  if (listing.vertical === 'partnership') return 'partnership'
  if (listing.vertical === 'material') return 'asset'
  if (listing.vertical === 'job') {
    if (listing.jobType === 'Minijob' || listing.industry === 'Minijob / Nebenjob') return 'minijob'
    return 'job'
  }
  if (
    listing.vertical === 'company' ||
    listing.vertical === 'transporter' ||
    listing.vertical === 'hotel'
  ) {
    return 'b2b'
  }
  return 'service'
}

export function verticalForMarket(type: MarketType): Vertical {
  switch (type) {
    case 'job':
    case 'minijob':
      return 'job'
    case 'service':
      return 'freelancer'
    case 'b2b':
      return 'company'
    case 'partnership':
      return 'partnership'
    case 'asset':
      return 'material'
  }
}

export function intentToDraft(intent: CreateIntent): {
  kind: ListingKind
  marketType: MarketType
  vertical: Vertical
} {
  if (intent === 'need') {
    return { kind: 'request', marketType: 'b2b', vertical: 'company' }
  }
  if (intent === 'job') {
    return { kind: 'offer', marketType: 'job', vertical: 'job' }
  }
  if (intent === 'partnership') {
    return { kind: 'offer', marketType: 'partnership', vertical: 'partnership' }
  }
  return { kind: 'offer', marketType: 'service', vertical: 'freelancer' }
}

export function listingHaystack(listing: Listing): string {
  return [
    listing.title,
    listing.description,
    listing.industry,
    listing.jobType,
    ...(listing.crafts || []),
    ...(listing.tags || []),
    ...(listing.requirements || []),
    ...(listing.offerTags || []),
    ...(listing.needTags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function overlapCount(needles: string[], hay: string): number {
  if (!needles.length) return 0
  return needles.filter((n) => n.trim() && hay.includes(n.trim().toLowerCase())).length
}

export function isMarketplaceLane(listing: Listing): boolean {
  const t = deriveMarketType(listing)
  return t === 'service' || t === 'b2b' || t === 'partnership' || t === 'asset'
}

export function isSeekerFeedListing(listing: Listing): boolean {
  const t = deriveMarketType(listing)
  return t === 'job' || t === 'minijob' || t === 'service'
}

export function isCompanyFeedListing(listing: Listing): boolean {
  const t = deriveMarketType(listing)
  return t === 'b2b' || t === 'partnership' || t === 'service' || t === 'job' || t === 'minijob' || t === 'asset'
}
