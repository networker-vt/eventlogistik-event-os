import type { WorkMode } from '../data/industries'
import type { Listing, Profile } from '../types'
import { getPrefs, type OrbitPrefs } from './prefs'
import { uid } from './utils'

const KEY = 'orbit_swipes_v1'
const EVT = 'orbit-swipes-changed'

export type SwipeAction = 'interested' | 'skip'

export interface MatchBreakdown {
  skills: number
  land: number
  sprache: number
  gehalt: number
  typ: number
}

export interface MatchScore {
  percent: number
  breakdown: MatchBreakdown
  reasons: string[]
}

export interface SwipeRecord {
  id: string
  targetId: string
  targetKind: 'job' | 'candidate'
  action: SwipeAction
  at: string
}

export interface MutualMatch {
  id: string
  listingId?: string
  candidateId?: string
  title: string
  at: string
  threadSeeded: boolean
}

interface SwipeState {
  swipes: SwipeRecord[]
  mutuals: MutualMatch[]
}

function defaultState(): SwipeState {
  return { swipes: [], mutuals: [] }
}

function load(): SwipeState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...(JSON.parse(raw) as SwipeState) }
  } catch {
    return defaultState()
  }
}

let cache: SwipeState | null = null
function get(): SwipeState {
  if (!cache) cache = load()
  return cache
}
function commit(next: SwipeState) {
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
}

export function subscribeSwipes(cb: () => void) {
  const h = () => cb()
  window.addEventListener(EVT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(EVT, h)
    window.removeEventListener('storage', h)
  }
}

export function getSwipes(): SwipeState {
  return structuredClone(get())
}

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, Math.round(n)))
}

export function scoreJobMatch(listing: Listing, prefs?: OrbitPrefs): MatchScore {
  const p = prefs ?? getPrefs()
  const s = p.seeker
  const reasons: string[] = []
  const L = listing as Listing & {
    industry?: string
    jobType?: string
    workMode?: WorkMode
    country?: string
    languages?: string[]
  }

  // Skills 0–30
  let skills = 12
  if (s.mustHaveSkills.length) {
    const hay = [...(listing.crafts || []), ...(listing.requirements || []), ...(listing.tags || [])]
      .join(' ')
      .toLowerCase()
    const hits = s.mustHaveSkills.filter((sk) => hay.includes(sk.toLowerCase())).length
    skills = clamp((hits / s.mustHaveSkills.length) * 30)
    if (hits) reasons.push(`Skills ${hits}/${s.mustHaveSkills.length}`)
  } else if ((listing.crafts || []).length) {
    skills = 22
    reasons.push(`Gewerk: ${listing.crafts.slice(0, 2).join(', ')}`)
  }

  // Land 0–20
  let land = 10
  const country = L.country || 'Deutschland'
  if (!s.countries.length || s.countries.includes(country) || s.countries.includes('Remote / Global')) {
    land = 20
    reasons.push(`Land: ${country}`)
  } else if (s.cities.some((c) => c.toLowerCase() === listing.city.toLowerCase())) {
    land = 16
    reasons.push(`Stadt: ${listing.city}`)
  } else {
    land = 4
  }

  // Sprache 0–15
  let sprache = 8
  const langs = L.languages || ['Deutsch']
  if (s.languages.some((l) => langs.includes(l))) {
    sprache = 15
    reasons.push(`Sprache passt`)
  }

  // Gehalt 0–20
  let gehalt = 10
  const pay = listing.priceFrom ?? listing.priceTo ?? 0
  if (s.salaryMin <= 0) {
    gehalt = 14
    if (pay) reasons.push(`Gehalt angegeben`)
  } else if (pay > 0) {
    const u = (listing.priceUnit || '').toLowerCase()
    let monthly = pay
    if (u.includes('stunde') || u === 'h' || u === 'std') monthly = pay * 160
    else if (u.includes('tag')) monthly = pay * 20
    else if (u.includes('woche')) monthly = pay * 4
    if (monthly >= s.salaryMin) {
      gehalt = 20
      reasons.push(`Gehalt ≥ Minimum`)
    } else if (monthly >= s.salaryMin * 0.85) {
      gehalt = 12
      reasons.push(`Gehalt nah am Minimum`)
    } else gehalt = 3
  }

  // Typ 0–15 (job type + work mode)
  let typ = 8
  if (L.jobType && s.jobTypes.includes(L.jobType as never)) {
    typ += 4
    reasons.push(`Typ: ${L.jobType}`)
  }
  if (L.workMode && s.workModes.includes(L.workMode)) {
    typ += 3
    reasons.push(`Modus: ${L.workMode}`)
  }
  typ = clamp(typ, 0, 15)

  const percent = clamp(skills + land + sprache + gehalt + typ)
  if (listing.matchReason) reasons.unshift(listing.matchReason)
  return {
    percent,
    breakdown: { skills, land, sprache, gehalt, typ },
    reasons: reasons.slice(0, 5),
  }
}

export function scoreCandidateMatch(profile: Profile, prefs?: OrbitPrefs): MatchScore {
  const p = prefs ?? getPrefs()
  const e = p.employer
  const reasons: string[] = []
  let skills = 15
  if (e.mustHaveSkills.length) {
    const hay = [...(profile.crafts || []), ...(profile.certifications || []), profile.bio]
      .join(' ')
      .toLowerCase()
    const hits = e.mustHaveSkills.filter((sk) => hay.includes(sk.toLowerCase())).length
    skills = clamp((hits / e.mustHaveSkills.length) * 35)
    if (hits) reasons.push(`Skills ${hits}/${e.mustHaveSkills.length}`)
  } else if (profile.crafts.length) {
    skills = 28
    reasons.push(profile.crafts.slice(0, 2).join(', '))
  }
  const land = profile.city ? 18 : 8
  if (profile.city) reasons.push(profile.city)
  const sprache = 12
  const gehalt = 12
  let typ = 10
  if (e.rolesHiring.length) {
    const hay = [...profile.crafts, profile.role].join(' ').toLowerCase()
    if (e.rolesHiring.some((r) => hay.includes(r.toLowerCase()))) {
      typ = 15
      reasons.push('Rolle passt')
    }
  }
  if (profile.verified === 'id' || profile.verified === 'business') reasons.push('Verifiziert')
  const percent = clamp(skills + land + sprache + gehalt + typ)
  return {
    percent,
    breakdown: { skills, land, sprache, gehalt, typ },
    reasons: reasons.slice(0, 5),
  }
}

export function recordSwipe(input: {
  targetId: string
  targetKind: 'job' | 'candidate'
  action: SwipeAction
  title: string
  listingId?: string
  candidateId?: string
}): { state: SwipeState; mutual?: MutualMatch } {
  const next = structuredClone(get())
  next.swipes.unshift({
    id: uid('sw'),
    targetId: input.targetId,
    targetKind: input.targetKind,
    action: input.action,
    at: new Date().toISOString(),
  })
  let mutual: MutualMatch | undefined
  // Demo mutual: interested on either side seeds a match ~ always for interested
  if (input.action === 'interested') {
    mutual = {
      id: uid('mm'),
      listingId: input.listingId || (input.targetKind === 'job' ? input.targetId : undefined),
      candidateId:
        input.candidateId || (input.targetKind === 'candidate' ? input.targetId : undefined),
      title: input.title,
      at: new Date().toISOString(),
      threadSeeded: true,
    }
    next.mutuals.unshift(mutual)
  }
  commit(next)
  return { state: next, mutual }
}

export function swipedIds(kind: 'job' | 'candidate'): Set<string> {
  return new Set(get().swipes.filter((s) => s.targetKind === kind).map((s) => s.targetId))
}
