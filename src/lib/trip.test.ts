import { describe, expect, it } from 'vitest'
import { buildAssistPlan } from './assist'
import { LEGAL } from './legal'
import {
  TRIP_AXES,
  TRIP_CARD_MAX,
  detectTripIntent,
  isTripVoiceWhitelist,
  localizeTripOption,
  matchSpokenTripChoice,
  proposeTripOptions,
  tripOptionAt,
} from './trip'

const MIRCO = 'Samstag Köln → Monaco (Messe), Flug + Transfer + Hotel; Sonntag zurück Landsberg am Lech.'

describe('Orbi trip options — Super veto', () => {
  it('seeds Köln–Monaco–Landsberg from Mirco free-text and returns exactly 3 Preis/Balance/Schnell cards', () => {
    const intent = detectTripIntent(MIRCO)
    expect(intent.matched).toBe(true)
    expect(intent.seed).toBe('koeln-monaco-landsberg')
    expect(intent.from).toBe('Köln')
    expect(intent.to).toBe('Monaco')
    expect(intent.returnTo).toBe('Landsberg am Lech')
    const cards = proposeTripOptions(intent)
    expect(cards.length).toBe(3)
    expect(cards.length).toBeLessThanOrEqual(TRIP_CARD_MAX)
    expect(cards.map((c) => c.axis)).toEqual(['preis', 'balance', 'schnell'])
    expect(cards.map((c) => c.labelDe)).toEqual(['Preis', 'Balance', 'Schnell'])
    expect(cards.every((c) => c.demo === true)).toBe(true)
    expect(cards[0].priceEur).toBeLessThan(cards[1].priceEur)
    expect(cards[1].priceEur).toBeLessThan(cards[2].priceEur)
    expect(cards[2].scores.shortest).toBeGreaterThan(cards[0].scores.shortest)
    expect(localizeTripOption(cards[0], 'en').label).toBe('Price')
  })

  it('matches aliases cologne / monaco / landsberg am lech', () => {
    const intent = detectTripIntent('Saturday Cologne to Monaco, flight hotel transfer, Sunday back Landsberg am Lech')
    expect(intent.seed).toBe('koeln-monaco-landsberg')
    expect(proposeTripOptions(intent)).toHaveLength(3)
  })

  it('never returns more than 3 cards and keeps unique axes', () => {
    const cards = proposeTripOptions(detectTripIntent(MIRCO))
    expect(cards.length).toBeGreaterThanOrEqual(2)
    expect(cards.length).toBeLessThanOrEqual(3)
    expect(new Set(cards.map((c) => c.axis)).size).toBe(cards.length)
    expect(TRIP_AXES).toEqual(['preis', 'balance', 'schnell'])
  })

  it('voice whitelist: 1/2/3, eins/zwei/drei, Option eins — never books', () => {
    expect(matchSpokenTripChoice('1')).toBe(1)
    expect(matchSpokenTripChoice('2')).toBe(2)
    expect(matchSpokenTripChoice('3')).toBe(3)
    expect(matchSpokenTripChoice('eins')).toBe(1)
    expect(matchSpokenTripChoice('zwei')).toBe(2)
    expect(matchSpokenTripChoice('drei')).toBe(3)
    expect(matchSpokenTripChoice('Option zwei')).toBe(2)
    expect(matchSpokenTripChoice('option 3')).toBe(3)
    expect(matchSpokenTripChoice('Option eins.')).toBe(1)
    expect(isTripVoiceWhitelist('Option zwei')).toBe(true)
    const cards = proposeTripOptions(detectTripIntent(MIRCO))
    expect(tripOptionAt(cards, 2)?.axis).toBe('balance')
  })

  it('rejects free-form voice and booking verbs (no auto-checkout)', () => {
    expect(matchSpokenTripChoice('buche option zwei')).toBeNull()
    expect(matchSpokenTripChoice('book option 2')).toBeNull()
    expect(matchSpokenTripChoice('zahl option eins')).toBeNull()
    expect(matchSpokenTripChoice('checkout 2')).toBeNull()
    expect(matchSpokenTripChoice('die günstigste bitte buchen')).toBeNull()
    expect(matchSpokenTripChoice('Option zwei bitte')).toBeNull()
    expect(matchSpokenTripChoice(MIRCO)).toBeNull()
    expect(isTripVoiceWhitelist('buche die zweite')).toBe(false)
  })

  it('does not treat a lone Berlin flight as a trip package', () => {
    expect(detectTripIntent('billigster Flug nach Berlin Freitag').matched).toBe(false)
    expect(proposeTripOptions(detectTripIntent('billigster Flug nach Berlin Freitag'))).toEqual([])
  })

  it('worldwide generic package stays at 2–3 cards', () => {
    const intent = detectTripIntent('Saturday Paris → Tokyo, flight + hotel; Sunday back London')
    expect(intent.matched).toBe(true)
    expect(intent.seed).toBe('generic')
    const cards = proposeTripOptions(intent)
    expect(cards.length).toBeGreaterThanOrEqual(2)
    expect(cards.length).toBeLessThanOrEqual(3)
    expect(cards[0].flightSketchEn).toMatch(/Paris/)
    expect(cards[0].flightSketchEn).toMatch(/Tokyo/)
  })

  it('Assist plan for the seed exposes 3 cards and does not auto-book', async () => {
    const plan = await buildAssistPlan(MIRCO, 'de')
    expect(plan?.tripOptions?.length).toBe(3)
    expect(plan?.tripOptions?.map((c) => c.labelDe)).toEqual(['Preis', 'Balance', 'Schnell'])
    expect(plan?.intent.kind).toBe('travel')
    expect(plan?.travelIds).toEqual([])
  })

  it('keeps Impressum Mirco Küßner', () => {
    expect(LEGAL.operatorName).toBe('Mirco Küßner')
  })
})
