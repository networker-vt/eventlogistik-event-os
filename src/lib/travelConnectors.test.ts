import { describe, expect, it } from 'vitest'
import { listTravelOffers, searchTravel } from './travel'
import {
  bahnSearchUrl,
  flightSearchUrl,
  hotelSearchUrl,
  offerOutboundHref,
  parseRailJourneys,
  travelSearchLinks,
} from './travelConnectors'

describe('travel connectors', () => {
  it('does not treat the old stub catalog as live search', () => {
    expect(listTravelOffers()).toEqual([])
    expect(searchTravel({ to: 'Berlin', kind: 'flight' })).toEqual([])
    expect(searchTravel({ to: 'Berlin', kind: 'rail' })).toEqual([])
  })

  it('fills flight and rail search links and never invents a fare', () => {
    const flights = flightSearchUrl('Frankfurt', 'Berlin', '2026-10-16', 'de')
    expect(flights).toContain('google.com/travel/flights')
    expect(decodeURIComponent(flights)).toContain('Frankfurt')
    expect(decodeURIComponent(flights)).toContain('Berlin')
    expect(decodeURIComponent(flights)).toContain('2026-10-16')

    const bahn = bahnSearchUrl('Frankfurt Hbf', 'Berlin Hbf', '2026-10-16')
    expect(bahn.startsWith('https://www.bahn.de/buchung/fahrplan/suche#')).toBe(true)
    expect(bahn).toContain('Frankfurt')
    expect(bahn).toContain('Berlin')
    expect(bahn).toContain('2026-10-16')

    const hotel = hotelSearchUrl('Berlin', '2026-10-16')
    expect(hotel).toContain('booking.com/searchresults.html')
    expect(hotel).toContain('checkin=2026-10-16')
    expect(hotel).toContain('ss=Berlin')

    const links = travelSearchLinks({ from: 'Frankfurt', to: 'Berlin', dateIso: '2026-10-16' })
    expect(links.every((link) => link.mode === 'empty-cta' && link.href.startsWith('https://'))).toBe(true)
    expect(links.map((link) => link.kind)).toEqual(['flight', 'hotel', 'car', 'package'])
  })

  it('turns an old demo offer into a public search, not a fare', () => {
    const href = offerOutboundHref(
      { kind: 'flight', from: 'Frankfurt', to: 'Berlin', dateFrom: '2026-10-16' },
      'de',
    )
    expect(href).toContain('google.com/travel/flights')
    expect(href).not.toMatch(/€|priceEur/)
    const rail = offerOutboundHref({ kind: 'rail', from: 'Köln Hbf', to: 'Berlin Hbf', dateFrom: '2026-10-16' })
    expect(rail).toContain('bahn.de')
  })

  it('parses transport.rest journeys and keeps a missing price empty', () => {
    const parsed = parseRailJourneys({
      journeys: [
        {
          legs: [
            {
              origin: { name: 'Berlin Hbf' },
              destination: { name: 'Hamburg Hbf' },
              departure: '2026-10-16T08:04:00+02:00',
              arrival: '2026-10-16T09:52:00+02:00',
              line: { name: 'ICE 123', productName: 'ICE' },
            },
            { walking: true, origin: { name: 'Hamburg Hbf' }, destination: { name: 'Hamburg Hbf' } },
          ],
        },
        {
          legs: [
            {
              origin: { name: 'Berlin Hbf' },
              destination: { name: 'Leipzig Hbf' },
              departure: '2026-10-16T08:30:00+02:00',
              arrival: '2026-10-16T09:48:00+02:00',
              line: { name: 'ICE 1001' },
            },
          ],
          price: { amount: 29.9, currency: 'EUR' },
        },
      ],
    })
    expect(parsed).toHaveLength(2)
    expect(parsed[0].priceEur).toBeNull()
    expect(parsed[0].lines).toEqual(['ICE 123'])
    expect(parsed[0].transfers).toBe(0)
    expect(parsed[0].from).toBe('Berlin Hbf')
    expect(parsed[0].to).toBe('Hamburg Hbf')
    expect(parsed[1].priceEur).toBe(29.9)
    expect(parsed[1].currency).toBe('EUR')
  })
})
