import type { Listing } from '../types'
import type { RankedDeal } from './behavior'
import { rankTopDeals } from './behavior'
import { newsTitle, rankHomeNews, rankMatchSuggestions } from './homeSuggestions'
import { store } from './store'
import type { OrbitPrefs } from './prefs'

export type FuerDichLane = 'deal' | 'match' | 'news' | 'look'

export interface FuerDichItem {
  id: string
  lane: FuerDichLane
  title: string
  kicker: string
  reason: string
  emoji: string
  to?: string
  href?: string
  percent?: number
}

/** One mixed rail — deals, match picks, news, Look — so Home stays a single glance. */
export function rankFuerDich(
  listings: Listing[],
  prefs: OrbitPrefs,
  locale: 'de' | 'en',
  limit = 8,
): FuerDichItem[] {
  const de = locale === 'de'
  const deals: RankedDeal[] = rankTopDeals(listings, prefs, locale, 3)
  const suggestions = rankMatchSuggestions(
    listings,
    store.listProfiles(),
    prefs,
    locale,
    3,
    deals.map((d) => d.id),
  )
  const news = rankHomeNews(prefs, locale, 2)

  const items: FuerDichItem[] = [
    {
      id: 'look-cta',
      lane: 'look',
      title: de ? 'Neuer Look?' : 'New look?',
      kicker: de ? 'Style · Demo' : 'Style · demo',
      reason: de ? 'Foto oder Video — Orbit schlägt Varianten + Shops vor.' : 'Photo or video — Orbit suggests variants + shops.',
      emoji: '🪞',
      to: '/look',
    },
  ]

  for (const d of deals) {
    if (d.kind === 'travel' && d.offer) {
      items.push({
        id: `deal-${d.id}`,
        lane: 'deal',
        title: d.offer.title,
        kicker: de ? 'Top Deal' : 'Top deal',
        reason: d.reason,
        emoji: d.offer.imageEmoji,
        to: `/reise/${d.offer.id}`,
      })
    } else if (d.listing) {
      items.push({
        id: `deal-${d.id}`,
        lane: 'deal',
        title: d.listing.title,
        kicker: de ? 'Top Deal' : 'Top deal',
        reason: d.reason,
        emoji: d.listing.imageEmoji || '💼',
        to: `/listings/${d.listing.id}`,
      })
    }
  }

  for (const s of suggestions) {
    items.push({
      id: `sg-${s.id}`,
      lane: 'match',
      title: s.title,
      kicker: s.subtitle || (de ? 'Match' : 'Match'),
      reason: s.reason,
      emoji: s.emoji,
      to: s.to,
      percent: s.percent,
    })
  }

  for (const n of news) {
    items.push({
      id: `news-${n.id}`,
      lane: 'news',
      title: newsTitle(n, locale),
      kicker: n.source,
      reason: de ? 'Kuratiert / Demo' : 'Curated / demo',
      emoji: '📰',
      href: n.href,
    })
  }

  return items.slice(0, limit)
}
