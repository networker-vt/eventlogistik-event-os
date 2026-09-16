import { describe, expect, it } from 'vitest'
import {
  TAGESKARTE_POOL,
  dailySeed,
  pickFromPool,
  pickTageskarte,
  poolForSlot,
  slotFromHour,
  tageskarteCopy,
} from './tageskarte'

describe('Tageskarte Money Boy rotation', () => {
  it('maps Berlin-style hours to Morgen Job/Laune, Tag Alltag/Familie/Kids, Abend Look/Laune/Freizeit', () => {
    expect(slotFromHour(5)).toBe('morgen')
    expect(slotFromHour(10)).toBe('morgen')
    expect(slotFromHour(11)).toBe('tag')
    expect(slotFromHour(16)).toBe('tag')
    expect(slotFromHour(17)).toBe('abend')
    expect(slotFromHour(23)).toBe('abend')
    expect(slotFromHour(0)).toBe('abend')
    expect(slotFromHour(4)).toBe('abend')

    const morgenThemes = new Set(poolForSlot('morgen').flatMap((i) => i.themes))
    expect([...morgenThemes].every((t) => t === 'job' || t === 'laune')).toBe(true)
    const tagThemes = new Set(poolForSlot('tag').flatMap((i) => i.themes))
    expect([...tagThemes].every((t) => t === 'alltag' || t === 'familie' || t === 'kids')).toBe(true)
    const abendThemes = new Set(poolForSlot('abend').flatMap((i) => i.themes))
    expect([...abendThemes].every((t) => t === 'look' || t === 'laune' || t === 'freizeit' || t === 'kids')).toBe(
      true,
    )
    expect(abendThemes.has('look')).toBe(true)
    expect(abendThemes.has('freizeit')).toBe(true)
  })

  it('keeps parent/kids tips in the pool', () => {
    const kids = TAGESKARTE_POOL.filter((i) => i.parentKids || i.themes.includes('kids'))
    expect(kids.length).toBeGreaterThanOrEqual(4)
    expect(poolForSlot('tag').some((i) => i.parentKids)).toBe(true)
  })

  it('uses a daily seed so the same day+slot is stable and another day can differ', () => {
    const a = dailySeed('2026-09-16', 'morgen')
    const b = dailySeed('2026-09-16', 'morgen')
    const c = dailySeed('2026-09-17', 'morgen')
    expect(a).toBe(b)
    expect(c).not.toBe(a)
    const pool = poolForSlot('tag')
    expect(pickFromPool(pool, a).id).toBe(pickFromPool(pool, a).id)
  })

  it('picks exactly one card for a given instant', () => {
    const morning = pickTageskarte(new Date('2026-09-16T07:30:00+02:00'))
    expect(morning.slot).toBe('morgen')
    expect(morning.item.slot).toBe('morgen')
    expect(morning.zone === 'Europe/Berlin' || morning.zone === 'local').toBe(true)
    const copy = tageskarteCopy(morning.item, 'de')
    expect(copy.title.length).toBeGreaterThan(0)
    expect(copy.prompt.length).toBeGreaterThan(0)
  })

  it('rotates across the week instead of locking one line', () => {
    const ids = new Set(
      Array.from({ length: 14 }, (_, i) => {
        const day = String(i + 1).padStart(2, '0')
        return pickTageskarte(new Date(`2026-09-${day}T12:00:00+02:00`)).item.id
      }),
    )
    expect(ids.size).toBeGreaterThan(1)
  })
})
