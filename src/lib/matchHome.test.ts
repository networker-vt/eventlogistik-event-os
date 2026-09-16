import { describe, expect, it } from 'vitest'
import { seedListings } from '../data/seed'
import { rankForWorld } from './behavior'
import { isSeekerFeedListing } from './market'
import { defaultPrefs } from './prefs'

describe('Prefs → Match no dead end', () => {
  it('default completed seeker prefs still yield a job deck', () => {
    const prefs = { ...defaultPrefs(), completed: true }
    const pool = seedListings.filter((l) => isSeekerFeedListing(l) && l.kind === 'offer' && l.status === 'active')
    const ranked = rankForWorld(pool, prefs)
    expect(pool.length).toBeGreaterThan(0)
    expect(ranked.length).toBeGreaterThan(0)
  })
})
