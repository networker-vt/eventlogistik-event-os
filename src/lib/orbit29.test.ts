import { describe, expect, it } from 'vitest'
import { ORBIT_TAGLINE_DE } from '../data/industries'
import { tStatic } from './i18n'

describe('Orbit 2.9.0 marketplace copy', () => {
  it('drops the job-only tagline in DE and EN', () => {
    for (const locale of ['de', 'en'] as const) {
      expect(tStatic('brand.tagline', locale)).not.toMatch(/Spam|Arbeit|jobs only/i)
      expect(tStatic('brand.taglineLong', locale)).toMatch(/Marktplatz|marketplace/i)
      expect(tStatic('nav.match', locale)).toBe('Match')
      expect(tStatic('match.deckLead', locale)).toMatch(/Reise|travel/)
      expect(tStatic('match.deckLead', locale)).toMatch(/Kabine/)
      expect(tStatic('orbi.tourHide', locale)).toMatch(/tour/i)
    }
    expect(ORBIT_TAGLINE_DE).not.toMatch(/Arbeit/)
    expect(tStatic('prefs.title', 'de')).toBe('Dein Orbit einrichten')
    expect(tStatic('prefs.voiceConsent', 'de')).toMatch(/Mikrofon/)
  })
})
