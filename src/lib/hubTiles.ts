/**
 * Orbit 2.8.1 — Home discover vs Mein account tile catalogs.
 * Home never lists Mein / Social / Wallet (those live in bottom nav or Mein).
 * Each tile has a visible emoji (or optional thematic image).
 */
import type { HubTile, TileTone } from '../components/ui/TileGrid'
import { isKidsMode, kidsHideTravel, kidsHideWallet } from './kids'

export type HubSurface = 'discover' | 'account'

export type HubTileId =
  | 'abflug'
  | 'campus'
  | 'entdecker'
  | 'kabine'
  | 'firma'
  | 'crew'
  | 'marktplatz'
  | 'mehr'
  | 'wallet'
  | 'prefs'
  | 'verify'
  | 'create'
  | 'offer'
  | 'ideas'
  | 'channels'
  | 'profile'
  | 'language'
  | 'dashboard'
  | 'kids'
  | 'refer'

export type HubTileDef = {
  id: HubTileId
  to: string
  labelKey: string
  emoji: string
  image?: string
  tone: TileTone
  surface: HubSurface
  demo?: boolean
  hide?: (ctx: HubCtx) => boolean
}

export type HubCtx = {
  kids: boolean
  hideTravel: boolean
  hideWallet: boolean
}

export function hubCtx(): HubCtx {
  return {
    kids: isKidsMode(),
    hideTravel: kidsHideTravel(),
    hideWallet: kidsHideWallet(),
  }
}

/** Home „Mehr entdecken“ — destinations only. No Mein / Social / Wallet. */
export const HOME_DISCOVER_DEFS: HubTileDef[] = [
  { id: 'abflug', to: '/abflug', labelKey: 'travel.nav', emoji: '✈️', tone: 'sky', surface: 'discover', hide: (c) => c.hideTravel },
  { id: 'campus', to: '/campus', labelKey: 'campus.nav', emoji: '🎓', tone: 'indigo', surface: 'discover' },
  { id: 'entdecker', to: '/entdecker', labelKey: 'tile.entdecker', emoji: '🔎', tone: 'lime', surface: 'discover', demo: true },
  { id: 'kabine', to: '/kabine', labelKey: 'look.nav', emoji: '🪞', tone: 'rose', surface: 'discover' },
  { id: 'firma', to: '/firma', labelKey: 'firma.nav', emoji: '🏢', tone: 'slate', surface: 'discover', hide: (c) => c.kids },
  { id: 'crew', to: '/crew', labelKey: 'nav.crew', emoji: '🤝', tone: 'amber', surface: 'discover', hide: (c) => c.kids },
  { id: 'mehr', to: '/mehr', labelKey: 'nav.mehr', emoji: '✨', tone: 'orange', surface: 'discover' },
]

/** Mehr page — fuller discover catalog. Still no Mein / Social / Wallet. */
export const MEHR_DISCOVER_DEFS: HubTileDef[] = [
  ...HOME_DISCOVER_DEFS.filter((d) => d.id !== 'mehr'),
  { id: 'marktplatz', to: '/marktplatz', labelKey: 'mehr.market', emoji: '🛒', tone: 'teal', surface: 'discover' },
]

/**
 * Mein hub — account tools only, sorted: money → identity → create → connect → tools.
 * Discover destinations (Campus, Entdecker, Kabine, Firma, Crew, Abflug) stay off this grid.
 */
export const MEIN_ACCOUNT_DEFS: HubTileDef[] = [
  { id: 'wallet', to: '/wallet', labelKey: 'nav.wallet', emoji: '👛', tone: 'teal', surface: 'account', hide: (c) => c.hideWallet },
  { id: 'profile', to: '/profile', labelKey: 'nav.mein', emoji: '👤', tone: 'slate', surface: 'account' },
  { id: 'verify', to: '/mein#verify', labelKey: 'verify.title', emoji: '🛡️', tone: 'lime', surface: 'account' },
  { id: 'prefs', to: '/prefs', labelKey: 'match.tweakPrefs', emoji: '⚙️', tone: 'amber', surface: 'account' },
  { id: 'create', to: '/listings/new', labelKey: 'nav.create', emoji: '➕', tone: 'slate', surface: 'account', demo: true, hide: (c) => c.kids },
  { id: 'offer', to: '/listings/new?kind=offer', labelKey: 'mein.offer', emoji: '📣', tone: 'orange', surface: 'account', demo: true, hide: (c) => c.kids },
  { id: 'channels', to: '/channels', labelKey: 'channels.nav', emoji: '📡', tone: 'violet', surface: 'account' },
  { id: 'ideas', to: '/ideen', labelKey: 'mehr.ideas', emoji: '💡', tone: 'orange', surface: 'account' },
  { id: 'language', to: '/mein#sprache', labelKey: 'mein.language', emoji: '🌐', tone: 'amber', surface: 'account' },
  { id: 'dashboard', to: '/dashboard', labelKey: 'mein.dashboard', emoji: '📊', tone: 'sky', surface: 'account' },
  { id: 'kids', to: '/kids', labelKey: 'kids.title', emoji: '🧒', tone: 'orange', surface: 'account' },
  { id: 'refer', to: '/empfehlen', labelKey: 'mehr.refer', emoji: '🎁', tone: 'sky', surface: 'account', hide: (c) => c.hideWallet },
]

const FORBIDDEN_HOME = new Set(['/mein', '/social', '/wallet', '/social/chat'])
const FORBIDDEN_MEIN_DISCOVER = new Set(['/campus', '/entdecker', '/kabine', '/abflug', '/firma', '/crew', '/social'])

export function visibleDefs(defs: HubTileDef[], ctx: HubCtx): HubTileDef[] {
  return defs.filter((d) => !d.hide?.(ctx))
}

export function resolveHubTiles(
  defs: HubTileDef[],
  ctx: HubCtx,
  t: (key: string) => string,
  labelOverrides?: Partial<Record<HubTileId, string>>,
): HubTile[] {
  return visibleDefs(defs, ctx).map((d) => ({
    id: d.id,
    to: d.to,
    label: labelOverrides?.[d.id] ?? t(d.labelKey),
    emoji: d.emoji,
    image: d.image,
    tone: d.tone,
    demo: d.demo,
  }))
}

export function homeDiscoverTiles(t: (key: string) => string, ctx: HubCtx = hubCtx()): HubTile[] {
  return resolveHubTiles(HOME_DISCOVER_DEFS, ctx, t)
}

export function mehrDiscoverTiles(t: (key: string) => string, ctx: HubCtx = hubCtx()): HubTile[] {
  return resolveHubTiles(MEHR_DISCOVER_DEFS, ctx, t)
}

export function meinAccountTiles(
  t: (key: string) => string,
  ctx: HubCtx = hubCtx(),
  labelOverrides?: Partial<Record<HubTileId, string>>,
): HubTile[] {
  return resolveHubTiles(MEIN_ACCOUNT_DEFS, ctx, t, labelOverrides)
}

export function tilePaths(tiles: { to: string }[]): string[] {
  return tiles.map((tile) => tile.to.split('?')[0].split('#')[0])
}

export function homeDiscoverHasAccountLinks(tiles: { to: string }[]): boolean {
  return tilePaths(tiles).some((path) => FORBIDDEN_HOME.has(path))
}

export function meinHasDiscoverLinks(tiles: { to: string }[]): boolean {
  return tilePaths(tiles).some((path) => FORBIDDEN_MEIN_DISCOVER.has(path))
}

export function everyTileHasEmoji(tiles: { emoji?: string }[]): boolean {
  return tiles.length > 0 && tiles.every((tile) => Boolean(tile.emoji && tile.emoji.trim()))
}
