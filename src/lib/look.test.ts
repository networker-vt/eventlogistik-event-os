import { describe, expect, it } from 'vitest'
import { LOOK_INTENTS, variantsFor } from './look'

describe('Kabine SoftPaywall — base free', () => {
  it('keeps photo + 1–2 variants free for every intent', () => {
    for (const intent of LOOK_INTENTS) {
      const free = variantsFor(intent.id, false)
      expect(free.some((v) => v.id === 'original')).toBe(true)
      const extras = free.filter((v) => v.id !== 'original')
      expect(extras.length).toBeGreaterThanOrEqual(1)
      expect(extras.length).toBeLessThanOrEqual(2)
      expect(free.every((v) => v.free)).toBe(true)
    }
  })

  it('unlocks paid extras only after the credit pack', () => {
    const locked = variantsFor('schuhe', false)
    const open = variantsFor('schuhe', true)
    expect(open.length).toBeGreaterThan(locked.length)
    expect(open.some((v) => !v.free)).toBe(true)
  })
})
