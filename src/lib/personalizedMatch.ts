import type { Listing, Profile } from '../types'
import { inferredSectors, recentAssistQueries } from './behavior'
import { getCompany } from './company'
import { deriveMarketType } from './market'
import {
  scoreB2bMatch,
  scoreCandidateMatch,
  scoreJobMatch,
  type MatchScore,
} from './match'
import { getPrefs, type OrbitPrefs } from './prefs'
import { listTravelOffers, type TravelOffer } from './travel'

export type PersonalizedKind = 'job' | 'service' | 'travel' | 'person'

export type PersonalizedItem =
  | { kind: 'job' | 'service'; id: string; listing: Listing; score: MatchScore; reason: string }
  | { kind: 'travel'; id: string; offer: TravelOffer; score: MatchScore; reason: string }
  | { kind: 'person'; id: string; profile: Profile; score: MatchScore; reason: string }

function queryHits(text: string, queries: string[]) {
  const t = text.toLowerCase()
  return queries.find((q) => {
    const tokens = q
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2)
    return tokens.some((w) => t.includes(w)) || t.includes(q.toLowerCase())
  })
}

function travelScore(offer: TravelOffer, queries: string[], cities: string[], locale: 'de' | 'en'): MatchScore {
  const de = locale === 'de'
  const reasons: string[] = []
  const text = `${offer.title} ${offer.to} ${offer.from || ''} ${offer.tags.join(' ')}`
  let skills = 14
  const hit = queryHits(text, queries)
  if (hit) {
    skills = 28
    reasons.push(de ? `Suche „${hit.slice(0, 32)}“` : `Search “${hit.slice(0, 32)}”`)
  }
  let land = 10
  if (cities.some((c) => offer.to.toLowerCase() === c.toLowerCase() || (offer.from || '').toLowerCase() === c.toLowerCase())) {
    land = 20
    reasons.push(de ? `Ort ${offer.to}` : `City ${offer.to}`)
  }
  const sprache = 10
  const gehalt = offer.priceEur <= 80 ? 16 : 10
  const typ = 12
  if (!reasons.length) reasons.push(de ? 'Abflug aus Prefs & Verhalten' : 'Travel from prefs & behavior')
  const percent = Math.max(20, Math.min(99, skills + land + sprache + gehalt + typ))
  return {
    percent,
    breakdown: { skills, land, sprache, gehalt, typ },
    reasons: reasons.slice(0, 5),
    labels: [
      ['Fit', 'skills'],
      ['Ort', 'land'],
      ['Sprache', 'sprache'],
      ['Preis', 'gehalt'],
      ['Typ', 'typ'],
    ],
  }
}

/**
 * Algorithmic Match deck — jobs, services, travel, people.
 * Ranked from prefs + recent Assist/search/swipe stubs. Not jobs-only.
 */
export function rankPersonalizedMatch(input: {
  listings: Listing[]
  profiles: Profile[]
  prefs?: OrbitPrefs
  userId?: string
  locale?: 'de' | 'en'
  skipIds?: Set<string>
}): PersonalizedItem[] {
  const prefs = input.prefs ?? getPrefs()
  const locale = input.locale ?? 'de'
  const de = locale === 'de'
  const queries = recentAssistQueries()
  const sectors = inferredSectors()
  const cities = prefs.seeker.cities || []
  const skip = input.skipIds ?? new Set<string>()
  const company = getCompany()
  const travelish = queries.some((q) => /flug|hotel|reise|bahn|mietwagen|abflug|flight|train|stay|trip/i.test(q))
  const peopleish = queries.some((q) => /crew|leute|kandidat|freelancer|hiring|personal|team/i.test(q))
  const scored: Array<PersonalizedItem & { rank: number }> = []

  for (const listing of input.listings) {
    if (listing.status !== 'active' || skip.has(listing.id)) continue
    const lane = deriveMarketType(listing)
    const isJob = lane === 'job' || lane === 'minijob'
    const score = isJob ? scoreJobMatch(listing, prefs) : scoreB2bMatch(listing, prefs, company)
    let rank = score.percent
    const industry = listing.industry || ''
    if (industry && sectors[industry]) rank += Math.min(18, sectors[industry] * 3)
    const hay = [listing.title, listing.description, industry, listing.city, ...(listing.tags || [])].join(' ')
    const hit = queryHits(hay, queries)
    if (hit) rank += 22
    const reason = hit
      ? de
        ? `Zu deiner Suche „${hit.slice(0, 36)}“`
        : `From your search “${hit.slice(0, 36)}”`
      : score.reasons[0] || (isJob ? (de ? 'Passt zu Prefs' : 'Fits prefs') : de ? 'Service / Firma' : 'Service / company')
    scored.push({
      kind: isJob ? 'job' : 'service',
      id: listing.id,
      listing,
      score,
      reason,
      rank,
    })
  }

  const offers = listTravelOffers()
  for (const offer of offers) {
    if (skip.has(offer.id)) continue
    const score = travelScore(offer, queries, cities, locale)
    let rank = score.percent + (travelish ? 16 : 4)
    const hit = queryHits(`${offer.title} ${offer.to}`, queries)
    if (hit) rank += 20
    scored.push({
      kind: 'travel',
      id: offer.id,
      offer,
      score,
      reason: score.reasons[0] || (de ? 'Abflug' : 'Travel'),
      rank,
    })
  }

  const people = input.profiles.filter(
    (p) => (p.role === 'freelancer' || p.role === 'courier' || p.role === 'company') && p.id !== input.userId && !skip.has(p.id),
  )
  for (const profile of people) {
    const score = scoreCandidateMatch(profile, prefs, company)
    let rank = score.percent + (peopleish || prefs.side === 'employer' ? 12 : 2)
    const hit = queryHits(`${profile.name} ${profile.bio} ${profile.crafts.join(' ')} ${profile.city}`, queries)
    if (hit) rank += 18
    scored.push({
      kind: 'person',
      id: profile.id,
      profile,
      score,
      reason: score.reasons[0] || (de ? 'Person / Crew' : 'Person / crew'),
      rank,
    })
  }

  scored.sort((a, b) => b.rank - a.rank)

  const picked: PersonalizedItem[] = []
  const kinds = new Set<PersonalizedKind>()
  for (const row of scored) {
    if (picked.length >= 2 && kinds.has(row.kind) && kinds.size < 3) continue
    picked.push(row)
    kinds.add(row.kind)
    if (picked.length >= 24) break
  }
  if (picked.length < 8) {
    for (const row of scored) {
      if (picked.some((p) => p.id === row.id)) continue
      picked.push(row)
      if (picked.length >= 24) break
    }
  }
  return picked
}

export function personalizedKinds(items: PersonalizedItem[]): PersonalizedKind[] {
  return [...new Set(items.map((i) => i.kind))]
}
