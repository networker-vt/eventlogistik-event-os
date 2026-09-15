import type { Listing } from '../types'
import { deriveMarketType, isMarketplaceLane } from './market'
import { filterListingsByPrefs, getPrefs, type OrbitPrefs } from './prefs'
import { grantSearchActivity } from './rewards'

const KEY = 'orbit_behavior_v1'
const EVT = 'orbit-behavior-changed'
const MAX_EVENTS = 220

export type BehaviorKind = 'view' | 'swipe_skip' | 'swipe_interest' | 'apply' | 'search'

export interface BehaviorEvent {
  kind: BehaviorKind
  listingId?: string
  industry?: string
  jobType?: string
  city?: string
  at: string
}

export interface BehaviorState {
  events: BehaviorEvent[]
}

function defaultState(): BehaviorState {
  return { events: [] }
}

function load(): BehaviorState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as BehaviorState
    return { events: Array.isArray(parsed.events) ? parsed.events : [] }
  } catch {
    return defaultState()
  }
}

let cache: BehaviorState | null = null
function get(): BehaviorState {
  if (!cache) cache = load()
  return cache
}
function commit(next: BehaviorState) {
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
}

export function subscribeBehavior(cb: () => void) {
  const h = () => cb()
  window.addEventListener(EVT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(EVT, h)
    window.removeEventListener('storage', h)
  }
}

export function getBehavior(): BehaviorState {
  return structuredClone(get())
}

export function trackBehavior(partial: Omit<BehaviorEvent, 'at'>) {
  const next = structuredClone(get())
  next.events.unshift({ ...partial, at: new Date().toISOString() })
  next.events = next.events.slice(0, MAX_EVENTS)
  commit(next)
  if (partial.kind === 'view' || partial.kind === 'swipe_interest' || partial.kind === 'search') {
    grantSearchActivity()
  }
}

export function isEventSectorListing(listing: Listing): boolean {
  const industry = listing.industry || ''
  if (industry.toLowerCase().startsWith('event')) return true
  if (listing.vertical !== 'job') return true
  const hay = [...(listing.crafts || []), ...(listing.tags || []), listing.title]
    .join(' ')
    .toLowerCase()
  return ['lichttechnik', 'tontechnik', 'rigging', 'grandma', 'stagehand', 'veranstaltungstechnik', 'foh /'].some(
    (k) => hay.includes(k),
  )
}

export function inferredSectors(events?: BehaviorEvent[]): Record<string, number> {
  const src = events ?? get().events
  const counts: Record<string, number> = {}
  for (const e of src) {
    if (!e.industry) continue
    const w = e.kind === 'apply' || e.kind === 'swipe_interest' ? 3 : e.kind === 'view' ? 1 : e.kind === 'swipe_skip' ? -1 : 1
    counts[e.industry] = (counts[e.industry] || 0) + w
  }
  return counts
}

export function rankForWorld(listings: Listing[], prefs?: OrbitPrefs): Listing[] {
  const p = prefs ?? getPrefs()
  const events = get().events
  const sectors = inferredSectors(events)
  const skipped = new Set(
    events.filter((e) => e.kind === 'swipe_skip' && e.listingId).map((e) => e.listingId as string),
  )
  const applied = new Set(
    events.filter((e) => e.kind === 'apply' && e.listingId).map((e) => e.listingId as string),
  )
  const viewed = new Set(
    events.filter((e) => e.kind === 'view' && e.listingId).map((e) => e.listingId as string),
  )
  const eventInterest =
    (p.seeker.industries || []).some((i) => i.startsWith('Event')) ||
    (p.employer.industries || []).some((i) => i.startsWith('Event')) ||
    Object.entries(sectors).some(([k, v]) => k.startsWith('Event') && v > 0)

  const filtered = filterListingsByPrefs(listings, p).filter((l) => l.status === 'active')

  const scored = filtered.map((l) => {
    let score = 12
    const industry = l.industry || ''
    if (industry && (p.seeker.industries || []).includes(industry as never)) score += 28
    if (industry && sectors[industry]) score += Math.min(24, sectors[industry] * 4)
    if (l.jobType && (p.seeker.jobTypes || []).includes(l.jobType as never)) score += 8
    if (l.featured) score += 4
    if (l.jobType === 'Minijob' && (p.seeker.jobTypes || []).includes('Minijob')) score += 6
    if (l.country && l.country !== 'Deutschland') score += 3
    if (l.workMode === 'remote') score += 2
    if (isEventSectorListing(l) && !eventInterest) score -= 70
    if (skipped.has(l.id)) score -= 40
    if (applied.has(l.id)) score -= 25
    if (viewed.has(l.id) && !applied.has(l.id)) score -= 6
    if (l.vertical !== 'job') score -= 50
    return { l, score }
  })

  const kept = scored.filter((x) => x.score > -15)
  const pool = kept.length >= 3 ? kept : scored
  return pool.sort((a, b) => b.score - a.score).map((x) => x.l)
}

export function hideNoise(listings: Listing[]): Listing[] {
  return rankForWorld(listings).filter((l) => l.vertical === 'job')
}

/** Calm Home world for company mode — complementary B2B/partners/services, still ≤4 at call site. */
export function rankForCompanyWorld(listings: Listing[], prefs?: OrbitPrefs): Listing[] {
  const p = prefs ?? getPrefs()
  const eventOk = (p.employer.industries || []).some((i) => i.startsWith('Event'))
  const scored = listings
    .filter((l) => l.status === 'active')
    .map((l) => {
      const lane = deriveMarketType(l)
      let score = 8
      const industry = l.industry || ''
      if (industry && (p.employer.industries || []).includes(industry as never)) score += 24
      if (lane === 'partnership') score += 10
      if (lane === 'b2b') score += 8
      if (lane === 'service') score += 6
      if (lane === 'asset') score += 3
      if (l.kind === 'request') score += 5
      if (l.featured) score += 3
      if (isMarketplaceLane(l)) score += 4
      if (isEventSectorListing(l) && !eventOk) score -= 55
      return { l, score }
    })
  return scored.sort((a, b) => b.score - a.score).map((x) => x.l)
}
