import { parseMarketplaceIntent } from './parseIntent'
import type { MarketplaceInterest } from './prefs'

export type OrbiFeedId = 'travel' | 'kabine' | 'learning' | 'jobs' | 'services' | 'b2b'

const DEST: Record<OrbiFeedId, { to: string; key: string }> = {
  travel: { to: '/abflug', key: 'orbi.feedTravel' },
  kabine: { to: '/kabine', key: 'orbi.feedKabine' },
  learning: { to: '/campus', key: 'orbi.feedLearn' },
  jobs: { to: '/treffer', key: 'orbi.feedJobs' },
  services: { to: '/treffer', key: 'orbi.feedService' },
  b2b: { to: '/crew', key: 'orbi.feedB2b' },
}

const KIDS_OK = new Set<OrbiFeedId>(['learning', 'jobs', 'services'])

function asFeed(id: string | undefined): OrbiFeedId | undefined {
  if (!id || id === 'social' || !(id in DEST)) return undefined
  return id as OrbiFeedId
}

/** One free reply. No credits, wallet, or dating route. */
export function orbiFeedReply(
  text: string,
  opts?: { kids?: boolean; interests?: string[] },
): { id: OrbiFeedId; to: string; key: string } {
  const fromText = parseMarketplaceIntent(text).interests.map(asFeed).filter((id): id is OrbiFeedId => Boolean(id))
  const fromPrefs = (opts?.interests ?? [])
    .map((id) => asFeed(id as MarketplaceInterest))
    .filter((id): id is OrbiFeedId => Boolean(id))
  let id = fromText[0] || fromPrefs[0] || (opts?.kids ? 'learning' : 'travel')
  if (opts?.kids && !KIDS_OK.has(id)) id = 'learning'
  return { id, ...DEST[id] }
}
