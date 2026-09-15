import type { WorkMode } from '../data/industries'
import type { Listing, Profile } from '../types'
import { getCompany, type CompanyProfile } from './company'
import { deriveMarketType, listingHaystack, overlapCount } from './market'
import { getPrefs, type OrbitPrefs } from './prefs'
import { uid } from './utils'

const KEY = 'orbit_swipes_v1'
const EVT = 'orbit-swipes-changed'
const DECK_KEY = 'orbit_match_deck_v1'

export type SwipeAction = 'interested' | 'skip'

export type MatchTargetKind = 'job' | 'candidate' | 'company'

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
  /** Labels for explainable rows (DE stored; UI can swap via i18n keys). */
  labels: [string, keyof MatchBreakdown][]
}

export interface SwipeRecord {
  id: string
  targetId: string
  targetKind: MatchTargetKind
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

const JOB_LABELS: [string, keyof MatchBreakdown][] = [
  ['Skills', 'skills'],
  ['Land', 'land'],
  ['Sprache', 'sprache'],
  ['Gehalt', 'gehalt'],
  ['Typ', 'typ'],
]

const B2B_LABELS: [string, keyof MatchBreakdown][] = [
  ['Skills', 'skills'],
  ['Branche', 'typ'],
  ['Land', 'land'],
  ['Sprache', 'sprache'],
  ['Angebot↔Bedarf', 'gehalt'],
]

const CAND_LABELS: [string, keyof MatchBreakdown][] = [
  ['Skills', 'skills'],
  ['Land', 'land'],
  ['Sprache', 'sprache'],
  ['Rolle', 'typ'],
  ['Passung', 'gehalt'],
]

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

  let skills = 12
  if (s.mustHaveSkills.length) {
    const hay = listingHaystack(listing)
    const hits = s.mustHaveSkills.filter((sk) => hay.includes(sk.toLowerCase())).length
    skills = clamp((hits / s.mustHaveSkills.length) * 30)
    if (hits) reasons.push(`Skills ${hits}/${s.mustHaveSkills.length}`)
  } else if ((listing.crafts || []).length) {
    skills = 22
    reasons.push(`Gewerk: ${listing.crafts.slice(0, 2).join(', ')}`)
  }

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

  let sprache = 8
  const langs = L.languages || ['Deutsch']
  if (s.languages.some((l) => langs.includes(l))) {
    sprache = 15
    reasons.push(`Sprache passt`)
  }

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
    labels: JOB_LABELS,
  }
}

export function scoreCandidateMatch(profile: Profile, prefs?: OrbitPrefs, company?: CompanyProfile): MatchScore {
  const p = prefs ?? getPrefs()
  const e = p.employer
  const c = company ?? getCompany()
  const reasons: string[] = []
  let skills = 15
  const hay = [...(profile.crafts || []), ...(profile.certifications || []), profile.bio]
    .join(' ')
    .toLowerCase()
  const skillNeed = [...e.mustHaveSkills, ...c.hiringNeeds, ...c.seeks]
  if (skillNeed.length) {
    const hits = skillNeed.filter((sk) => hay.includes(sk.toLowerCase())).length
    skills = clamp((hits / skillNeed.length) * 35)
    if (hits) reasons.push(`Skills ${hits}/${skillNeed.length}`)
  } else if (profile.crafts.length) {
    skills = 28
    reasons.push(profile.crafts.slice(0, 2).join(', '))
  }

  let land = 8
  const locHit =
    (c.locations.length && c.locations.some((loc) => loc.toLowerCase() === profile.city.toLowerCase())) ||
    (profile.city && e.countries.includes('Remote / Global'))
  if (locHit) {
    land = 20
    reasons.push(profile.city)
  } else if (profile.city) {
    land = 14
    reasons.push(profile.city)
  }

  const sprache = e.languages.length ? 12 : 10
  if (e.languages.length) reasons.push(`Sprachen: ${e.languages.slice(0, 2).join(', ')}`)

  let gehalt = 10
  const offerNeedHay = hay
  const offerHits = overlapCount([...c.offers, ...c.seeks, ...c.hiringNeeds], offerNeedHay)
  if (offerHits) {
    gehalt = clamp(8 + offerHits * 4, 0, 20)
    reasons.push('Angebot↔Bedarf')
  }

  let typ = 10
  const roles = [...e.rolesHiring, ...c.hiringNeeds]
  if (roles.length) {
    const rhay = [...profile.crafts, profile.role, profile.bio].join(' ').toLowerCase()
    if (roles.some((r) => rhay.includes(r.toLowerCase()))) {
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
    labels: CAND_LABELS,
  }
}

/** Complementary company listing: offer↔need, industry, land, sprache, skills. */
export function scoreB2bMatch(
  listing: Listing,
  prefs?: OrbitPrefs,
  company?: CompanyProfile,
): MatchScore {
  const p = prefs ?? getPrefs()
  const e = p.employer
  const c = company ?? getCompany()
  const reasons: string[] = []
  const hay = listingHaystack(listing)
  const lane = deriveMarketType(listing)

  const skillNeedles = [...e.mustHaveSkills, ...c.offers, ...c.seeks, ...c.hiringNeeds]
  let skills = 12
  if (skillNeedles.length) {
    const hits = overlapCount(skillNeedles, hay)
    skills = clamp((hits / Math.min(skillNeedles.length, 6)) * 30)
    if (hits) reasons.push(`Skills ${hits}`)
  } else if (listing.crafts?.length) {
    skills = 20
    reasons.push(listing.crafts.slice(0, 2).join(', '))
  }

  let land = 8
  const country = listing.country || 'Deutschland'
  const countries = c.countries.length ? c.countries : e.countries
  if (!countries.length || countries.includes(country) || countries.includes('Remote / Global')) {
    land = 20
    reasons.push(`Land: ${country}`)
  } else if (c.locations.some((loc) => loc.toLowerCase() === listing.city.toLowerCase())) {
    land = 16
    reasons.push(`Standort: ${listing.city}`)
  }

  let sprache = 8
  const langs = listing.languages || ['Deutsch', 'Englisch']
  const wantLangs = c.languages.length ? c.languages : e.languages
  if (wantLangs.some((l) => langs.includes(l))) {
    sprache = 15
    reasons.push('Sprache passt')
  }

  // gehalt slot = offer↔need complementarity (0–20)
  let gehalt = 6
  const listingOffers = [...(listing.offerTags || []), ...(listing.kind === 'offer' ? listing.crafts : []), ...listing.tags]
  const listingNeeds = [...(listing.needTags || []), ...(listing.kind === 'request' ? listing.crafts : [])]
  const weWant = [...c.seeks, ...c.hiringNeeds, ...c.partnershipInterests]
  const weOffer = [...c.offers, ...c.partnershipInterests]
  const theyOfferWhatWeNeed = overlapCount(weWant, listingOffers.join(' ').toLowerCase() + ' ' + hay)
  const weOfferWhatTheyNeed = overlapCount(weOffer, listingNeeds.join(' ').toLowerCase() + ' ' + hay)
  if (listing.kind === 'offer' && theyOfferWhatWeNeed) {
    gehalt = clamp(10 + theyOfferWhatWeNeed * 5, 0, 20)
    reasons.push('Angebot trifft euren Bedarf')
  } else if (listing.kind === 'request' && weOfferWhatTheyNeed) {
    gehalt = clamp(10 + weOfferWhatTheyNeed * 5, 0, 20)
    reasons.push('Euer Angebot trifft deren Bedarf')
  } else if (lane === 'partnership' && (theyOfferWhatWeNeed || weOfferWhatTheyNeed)) {
    gehalt = 16
    reasons.push('Partnerschaft komplementär')
  } else if (c.offers.length || c.seeks.length) {
    gehalt = 8
  } else {
    gehalt = 12
  }

  let typ = 8
  const industries = c.industries.length ? c.industries : e.industries
  if (listing.industry && industries.includes(listing.industry as never)) {
    typ = 15
    reasons.push(`Branche: ${listing.industry}`)
  } else if (listing.industry) {
    typ = 9
    reasons.push(listing.industry)
  } else if (lane === 'b2b' || lane === 'partnership') {
    typ = 12
    reasons.push(lane === 'partnership' ? 'Partnerschaft' : 'B2B')
  }
  typ = clamp(typ, 0, 15)

  const percent = clamp(skills + land + sprache + gehalt + typ)
  if (listing.matchReason) reasons.unshift(listing.matchReason)
  return {
    percent,
    breakdown: { skills, land, sprache, gehalt, typ },
    reasons: reasons.slice(0, 5),
    labels: B2B_LABELS,
  }
}

export function recordSwipe(input: {
  targetId: string
  targetKind: MatchTargetKind
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
  if (input.action === 'interested') {
    mutual = {
      id: uid('mm'),
      listingId: input.listingId || (input.targetKind !== 'candidate' ? input.targetId : undefined),
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

export function swipedIds(kind: MatchTargetKind | MatchTargetKind[]): Set<string> {
  const kinds = Array.isArray(kind) ? kind : [kind]
  return new Set(get().swipes.filter((s) => kinds.includes(s.targetKind)).map((s) => s.targetId))
}

export type MatchDeckMode = 'seeker' | 'company'

export function getMatchDeckMode(fallback: MatchDeckMode): MatchDeckMode {
  try {
    const raw = localStorage.getItem(DECK_KEY)
    if (raw === 'seeker' || raw === 'company') return raw
  } catch {
    /* ignore */
  }
  return fallback
}

export function setMatchDeckMode(mode: MatchDeckMode) {
  try {
    localStorage.setItem(DECK_KEY, mode)
  } catch {
    /* ignore */
  }
}
