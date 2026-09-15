import { HOME_NEWS, type HomeNewsCat, type HomeNewsItem } from '../data/homeNews'
import type { Listing, Profile } from '../types'
import { getBehavior, recentAssistQueries } from './behavior'
import { getCompany } from './company'
import { deriveMarketType } from './market'
import { scoreB2bMatch, scoreCandidateMatch, scoreJobMatch } from './match'
import { getPrefs, isCompanySide, type OrbitPrefs } from './prefs'
import { listTravelOffers } from './travel'
import { channelBoostForText } from './channels'

export type SuggestionKind = 'travel' | 'listing' | 'event' | 'person' | 'company'

export interface MatchSuggestion {
  id: string
  kind: SuggestionKind
  title: string
  subtitle: string
  emoji: string
  percent: number
  reason: string
  to: string
}

function clampPct(n: number) {
  return Math.max(42, Math.min(96, Math.round(n)))
}

function queries() {
  return recentAssistQueries()
}

function queryHit(text: string) {
  const t = text.toLowerCase()
  return queries().find((q) => {
    const tokens = q.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
    return tokens.some((w) => t.includes(w))
  })
}

function reasonFrom(
  locale: 'de' | 'en',
  scoreReasons: string[],
  fallback: string,
  hit?: string,
) {
  if (hit) {
    const short = hit.length > 36 ? `${hit.slice(0, 34)}…` : hit
    return locale === 'de' ? `Zu deiner Suche „${short}“` : `From your search “${short}”`
  }
  if (scoreReasons[0]) return scoreReasons[0]
  return fallback
}

function isEventish(l: Listing) {
  const industry = (l.industry || '').toLowerCase()
  if (industry.startsWith('event')) return true
  if (l.vertical === 'hotel') return true
  const hay = [...(l.tags || []), l.title, l.venue || ''].join(' ').toLowerCase()
  return /festival|messe|konzert|gala|event|stadium|stadion/.test(hay)
}

/**
 * Mixed Home Match-Vorschläge — travel, listings, events, people, companies.
 * Diversity first, then score. Max 6.
 */
export function rankMatchSuggestions(
  listings: Listing[],
  profiles: Profile[],
  prefs?: OrbitPrefs,
  locale: 'de' | 'en' = 'de',
  limit = 6,
  excludeIds: string[] = [],
): MatchSuggestion[] {
  const p = prefs ?? getPrefs()
  const company = getCompany()
  const skipped = new Set(
    getBehavior()
      .events.filter((e) => e.kind === 'swipe_skip' && e.listingId)
      .map((e) => e.listingId as string),
  )
  const exclude = new Set(excludeIds)
  const de = locale === 'de'
  const buckets: Record<SuggestionKind, MatchSuggestion[]> = {
    travel: [],
    listing: [],
    event: [],
    person: [],
    company: [],
  }

  for (const o of listTravelOffers()) {
    if (exclude.has(o.id)) continue
    const text = `${o.title} ${o.to} ${o.from || ''} ${o.tags.join(' ')}`
    const hit = queryHit(text)
    const cityBoost = (p.seeker.cities || []).some((c) => c.toLowerCase() === o.to.toLowerCase()) ? 12 : 0
    const ch = channelBoostForText(text)
    const percent = clampPct(58 + (hit ? 22 : 0) + cityBoost + ch.score + (o.tags.some((t) => /günstig/i.test(t)) ? 8 : 0))
    buckets.travel.push({
      id: o.id,
      kind: 'travel',
      title: o.title,
      subtitle: `${o.to} · ${o.provider}`,
      emoji: o.imageEmoji,
      percent,
      reason: reasonFrom(
        locale,
        [],
        de ? 'Urlaub / Reise — passend zu Prefs' : 'Travel that fits your prefs',
        hit,
      ),
      to: `/reise/${o.id}`,
    })
  }
  buckets.travel.sort((a, b) => b.percent - a.percent)

  const active = listings.filter((l) => l.status === 'active' && !skipped.has(l.id) && !exclude.has(l.id))
  for (const l of active) {
    const lane = deriveMarketType(l)
    const event = isEventish(l)
    const companyLane = lane === 'b2b' || lane === 'partnership' || l.vertical === 'company'
    const scored = companyLane || event ? scoreB2bMatch(l, p, company) : scoreJobMatch(l, p)
    const hit = queryHit(`${l.title} ${l.city} ${l.industry || ''}`)
    const ch = channelBoostForText(`${l.title} ${l.industry || ''} ${(l.tags || []).join(' ')}`)
    const kind: SuggestionKind = event ? 'event' : companyLane ? 'company' : 'listing'
    const fallback =
      kind === 'event'
        ? de
          ? 'Veranstaltung in deiner Nähe'
          : 'An event near you'
        : kind === 'company'
          ? de
            ? 'Firma / Partner'
            : 'Company / partner'
          : de
            ? 'Angebot aus dem Marktplatz'
            : 'A marketplace listing'
    buckets[kind].push({
      id: l.id,
      kind,
      title: l.title,
      subtitle: [l.city, l.ownerName].filter(Boolean).join(' · '),
      emoji: l.imageEmoji || (kind === 'event' ? '🎟️' : '💼'),
      percent: clampPct(scored.percent + ch.score),
      reason: ch.label
        ? locale === 'de'
          ? `Zu verbundenem Kanal ${ch.label} (Demo-Stub, kein Scraping)`
          : `From linked channel ${ch.label} (demo stub, no scraping)`
        : reasonFrom(locale, scored.reasons, fallback, hit),
      to: `/listings/${l.id}`,
    })
  }
  buckets.listing.sort((a, b) => b.percent - a.percent)
  buckets.event.sort((a, b) => b.percent - a.percent)
  buckets.company.sort((a, b) => b.percent - a.percent)

  const selfName = company.firmName
  for (const prof of profiles) {
    if (exclude.has(prof.id)) continue
    if (prof.role === 'admin') continue
    const isPerson = prof.role === 'freelancer' || prof.role === 'courier' || prof.role === 'agency'
    const isCo = prof.role === 'company' || prof.role === 'hotel' || prof.role === 'transporter'
    if (!isPerson && !isCo) continue
    const scored = isPerson ? scoreCandidateMatch(prof, p, company) : scoreCandidateMatch(prof, p, company)
    const hit = queryHit(`${prof.name} ${prof.bio} ${prof.city} ${(prof.crafts || []).join(' ')}`)
    const ch = channelBoostForText(`${prof.name} ${prof.bio} ${(prof.crafts || []).join(' ')} ${prof.companyName || ''}`)
    const kind: SuggestionKind = isCo ? 'company' : 'person'
    buckets[kind].push({
      id: `p-${prof.id}`,
      kind,
      title: isCo ? prof.companyName || prof.name : prof.name,
      subtitle: [prof.city, isCo ? de ? 'Firma' : 'Company' : de ? 'Person' : 'Person'].join(' · '),
      emoji: isCo ? '🏢' : '👋',
      percent: clampPct(scored.percent + (selfName && isCo ? -4 : 0) + ch.score),
      reason: reasonFrom(
        locale,
        scored.reasons,
        isCo
          ? de
            ? 'Jemand zum Netzwerken'
            : 'Someone to network with'
          : de
            ? 'Jemand zum Treffen'
            : 'Someone to meet',
        hit,
      ),
      to: `/profiles/${prof.id}`,
    })
  }
  buckets.person.sort((a, b) => b.percent - a.percent)

  const order: SuggestionKind[] = isCompanySide(p.side) && p.side !== 'both'
    ? ['company', 'person', 'listing', 'event', 'travel']
    : ['travel', 'person', 'listing', 'event', 'company']

  const picked: MatchSuggestion[] = []
  const used = new Set<string>()
  let guard = 0
  while (picked.length < limit && guard < 24) {
    for (const kind of order) {
      const next = buckets[kind].find((s) => !used.has(s.id))
      if (!next) continue
      used.add(next.id)
      picked.push(next)
      if (picked.length >= limit) break
    }
    guard += 1
  }
  return picked
}

export function rankHomeNews(prefs?: OrbitPrefs, locale: 'de' | 'en' = 'de', limit = 4): HomeNewsItem[] {
  const p = prefs ?? getPrefs()
  const q = queries().join(' ').toLowerCase()
  const industries = [
    ...(p.seeker.industries || []),
    ...(p.employer.industries || []),
  ]
    .join(' ')
    .toLowerCase()
  const scored = HOME_NEWS.map((item) => {
    let score = 8
    if (item.cat === 'tech' && /it|software|tech|ki/.test(industries + q)) score += 18
    if (item.cat === 'wirtschaft' && /logistik|b2b|handel|retail/.test(industries + q)) score += 14
    if (item.cat === 'sport' && /sport|event/.test(industries + q)) score += 12
    if (item.cat === 'politik') score += 4
    if (item.tags.some((t) => industries.includes(t.toLowerCase()) || q.includes(t.toLowerCase()))) score += 16
    const ch = channelBoostForText(`${item.titleDe} ${item.tags.join(' ')}`)
    if (ch.score) score += ch.score
    if (q && queryHit(`${item.titleDe} ${item.titleEn} ${item.tags.join(' ')}`)) score += 20
    return { item, score }
  })
  scored.sort((a, b) => b.score - a.score)
  const cats = new Set<HomeNewsCat>()
  const out: HomeNewsItem[] = []
  for (const row of scored) {
    if (out.length >= 2 && cats.has(row.item.cat) && cats.size < 3) continue
    out.push(row.item)
    cats.add(row.item.cat)
    if (out.length >= limit) break
  }
  if (out.length < limit) {
    for (const row of scored) {
      if (out.some((x) => x.id === row.item.id)) continue
      out.push(row.item)
      if (out.length >= limit) break
    }
  }
  void locale
  return out
}

export function newsTitle(item: HomeNewsItem, locale: 'de' | 'en') {
  return locale === 'de' ? item.titleDe : item.titleEn
}
