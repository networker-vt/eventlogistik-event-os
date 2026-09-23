import { describe, expect, it } from 'vitest'
import { HOME_NEWS } from '../data/homeNews'
import { rankHomeNews } from './homeSuggestions'

describe('Home news strip', () => {
  it('links only real publisher articles', () => {
    expect(HOME_NEWS.length).toBeGreaterThan(0)
    expect(HOME_NEWS.length).toBeLessThanOrEqual(8)
    for (const item of HOME_NEWS) {
      expect(item.href).toMatch(/^https:\/\/[^/]+\/.+\.html$/)
      expect(item.source).not.toMatch(/demo/i)
      expect(item.titleDe).not.toMatch(/demo/i)
      expect(item.titleDe.length).toBeGreaterThan(20)
      expect(item.titleEn).toBe(item.titleDe)
    }
  })

  it('ranks at most the requested count and stays inside the real set', () => {
    const ranked = rankHomeNews(undefined, 'de', 3)
    expect(ranked.length).toBeLessThanOrEqual(3)
    expect(ranked.length).toBeGreaterThan(0)
    const ids = new Set(HOME_NEWS.map((item) => item.id))
    for (const item of ranked) expect(ids.has(item.id)).toBe(true)
  })
})
