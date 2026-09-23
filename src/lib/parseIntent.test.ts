import { describe, expect, it } from 'vitest'
import { buildPrefsFromSetup, parseMarketplaceIntent } from './parseIntent'

describe('parseMarketplaceIntent', () => {
  it('reads a mixed marketplace sentence without forcing a job role', () => {
    const parsed = parseMarketplaceIntent('Flug nach Wien und neue Schuhe, dazu Spanisch lernen')
    expect(parsed.interests).toEqual(['travel', 'kabine', 'learning'])
    expect(parsed.cities).toContain('Wien')
    expect(parsed.languages).toContain('Spanisch')
    expect(parsed.side).toBeNull()
    expect(parsed.industries).toEqual([])
  })

  it('picks up a job note with place, radius and language', () => {
    const parsed = parseMarketplaceIntent('Ich suche einen Minijob in Berlin, 20 km, Deutsch')
    expect(parsed.interests).toContain('jobs')
    expect(parsed.cities).toEqual(['Berlin'])
    expect(parsed.radiusKm).toBe(20)
    expect(parsed.languages).toEqual(['Deutsch'])
    expect(parsed.side).toBe('seeker')
    expect(parsed.industries).toContain('Minijob / Nebenjob')
  })

  it('treats hiring language as company side', () => {
    const parsed = parseMarketplaceIntent('Wir stellen Lagerhelfer ein und suchen einen Partner')
    expect(parsed.interests).toEqual(expect.arrayContaining(['jobs', 'b2b']))
    expect(parsed.side).toBe('employer')
    expect(parsed.industries).toContain('Logistik / Lager')
  })

  it('keeps offer-plus-travel as both, not a job card', () => {
    const parsed = parseMarketplaceIntent('Ich biete UX-Sprints und suche einen Flug nach Paris')
    expect(parsed.side).toBe('both')
    expect(parsed.interests).toContain('travel')
  })

  it('returns an empty read for blank text', () => {
    const parsed = parseMarketplaceIntent('   ')
    expect(parsed.interests).toEqual([])
    expect(parsed.side).toBeNull()
    expect(parsed.radiusKm).toBeNull()
  })
})

describe('buildPrefsFromSetup', () => {
  it('stores marketplace interests and clears stale job industries', () => {
    const next = buildPrefsFromSetup({
      note: 'Hotel in Hamburg diese Woche',
      languages: ['Deutsch', 'Englisch'],
      radiusKm: 40,
      cities: ['Hamburg'],
      interests: ['travel'],
      currentSide: 'seeker',
    })
    expect(next.interests).toEqual(['travel'])
    expect(next.side).toBe('seeker')
    expect(next.seeker.industries).toEqual([])
    expect(next.seeker.cities).toEqual(['Hamburg'])
    expect(next.seeker.radiusKm).toBe(40)
    expect(next.todayNote).toMatch(/Hamburg/)
  })

  it('drops social interests in kids mode', () => {
    const next = buildPrefsFromSetup({
      note: 'Freunde treffen',
      languages: ['Deutsch'],
      radiusKm: 15,
      cities: [],
      interests: ['social', 'learning'],
      currentSide: 'seeker',
      kids: true,
    })
    expect(next.interests).toEqual(['learning'])
  })
})
