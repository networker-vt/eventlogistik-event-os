import { describe, expect, it } from 'vitest'
import { tStatic } from './i18n'
import {
  HOME_DISCOVER_DEFS,
  MEHR_DISCOVER_DEFS,
  MEIN_ACCOUNT_DEFS,
  everyTileHasEmoji,
  homeDiscoverHasAccountLinks,
  homeDiscoverTiles,
  mehrDiscoverTiles,
  meinAccountTiles,
  meinHasDiscoverLinks,
} from './hubTiles'

const adult = { kids: false, hideTravel: false, hideWallet: false }
const kids = { kids: true, hideTravel: true, hideWallet: true }

describe('Orbit 2.8.1 hub split', () => {
  it('Home discover is destinations only — no Mein, Social, Wallet', () => {
    const tiles = homeDiscoverTiles((k) => tStatic(k, 'de'), adult)
    const paths = tiles.map((t) => t.to)
    expect(paths).toContain('/abflug')
    expect(paths).toContain('/campus')
    expect(paths).toContain('/entdecker')
    expect(paths).toContain('/kabine')
    expect(paths).toContain('/firma')
    expect(paths).toContain('/crew')
    expect(homeDiscoverHasAccountLinks(tiles)).toBe(false)
    expect(paths.some((p) => p === '/mein' || p.startsWith('/social') || p === '/wallet')).toBe(false)
  })

  it('Mehr discover also omits Mein / Social / Wallet', () => {
    const tiles = mehrDiscoverTiles((k) => tStatic(k, 'de'), adult)
    expect(homeDiscoverHasAccountLinks(tiles)).toBe(false)
    expect(tiles.some((t) => t.to === '/marktplatz')).toBe(true)
  })

  it('Mein hub is account-only and sorted money → identity → create → connect → tools', () => {
    const tiles = meinAccountTiles((k) => tStatic(k, 'de'), adult)
    const ids = tiles.map((t) => t.id)
    expect(ids).toEqual([
      'wallet',
      'profile',
      'verify',
      'prefs',
      'create',
      'offer',
      'channels',
      'ideas',
      'language',
      'dashboard',
      'kids',
      'refer',
    ])
    expect(meinHasDiscoverLinks(tiles)).toBe(false)
    expect(tiles.some((t) => t.to === '/ideen')).toBe(true)
    expect(tiles.some((t) => t.to === '/channels')).toBe(true)
    expect(tiles.some((t) => t.to === '/listings/new')).toBe(true)
  })

  it('Kids hide Wallet / create / offer on Mein and travel / firma / crew on Home', () => {
    const mein = meinAccountTiles((k) => tStatic(k, 'de'), kids)
    expect(mein.some((t) => t.id === 'wallet' || t.id === 'create' || t.id === 'offer' || t.id === 'refer')).toBe(
      false,
    )
    const home = homeDiscoverTiles((k) => tStatic(k, 'de'), kids)
    expect(home.some((t) => t.id === 'abflug' || t.id === 'firma' || t.id === 'crew')).toBe(false)
    expect(home.some((t) => t.id === 'campus' || t.id === 'entdecker' || t.id === 'kabine')).toBe(true)
  })

  it('every catalog tile has a visible emoji', () => {
    expect(everyTileHasEmoji(HOME_DISCOVER_DEFS)).toBe(true)
    expect(everyTileHasEmoji(MEHR_DISCOVER_DEFS)).toBe(true)
    expect(everyTileHasEmoji(MEIN_ACCOUNT_DEFS)).toBe(true)
    expect(everyTileHasEmoji(homeDiscoverTiles((k) => tStatic(k, 'en'), adult))).toBe(true)
    expect(everyTileHasEmoji(meinAccountTiles((k) => tStatic(k, 'en'), adult))).toBe(true)
  })
})
