import { describe, expect, it } from 'vitest'
import { ORBI_TOUR, isOrbiMotion, nextOrbiTour } from './orbiMotion'

describe('Orbi Kind motions', () => {
  it('tours winken, tanzen, arbeiten, and rennen', () => {
    expect(ORBI_TOUR).toEqual(['winken', 'tanzen', 'arbeiten', 'rennen'])
  })

  it('cycles the tour and returns to a wave after a run', () => {
    expect(nextOrbiTour('idle')).toBe('winken')
    expect(nextOrbiTour('winken')).toBe('tanzen')
    expect(nextOrbiTour('tanzen')).toBe('arbeiten')
    expect(nextOrbiTour('arbeiten')).toBe('rennen')
    expect(nextOrbiTour('rennen')).toBe('winken')
  })

  it('accepts only known poses', () => {
    expect(isOrbiMotion('idle')).toBe(true)
    expect(isOrbiMotion('tanzen')).toBe(true)
    expect(isOrbiMotion('stock')).toBe(false)
    expect(isOrbiMotion(null)).toBe(false)
  })
})
