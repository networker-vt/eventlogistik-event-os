import { describe, expect, it } from 'vitest'
import { seedListings, seedProfiles } from '../data/seed'
import { defaultPrefs } from './prefs'
import { personalizedKinds, rankPersonalizedMatch } from './personalizedMatch'

describe('personalized Match deck', () => {
  it('mixes more than jobs using prefs + stubs', () => {
    const prefs = { ...defaultPrefs(), completed: true }
    const items = rankPersonalizedMatch({
      listings: seedListings.filter((l) => l.status === 'active'),
      profiles: seedProfiles,
      prefs,
      locale: 'de',
    })
    expect(items.length).toBeGreaterThan(3)
    const kinds = personalizedKinds(items)
    expect(kinds.length).toBeGreaterThanOrEqual(2)
    expect(kinds.some((k) => k !== 'job')).toBe(true)
  })
})
