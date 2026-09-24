import { describe, expect, it } from 'vitest'
import {
  catalogContactFields,
  facebookUrl,
  instagramUrl,
  mailUrl,
  mapsUrl,
  profileLinkHref,
  safeExternalUrl,
  telUrl,
  tiktokUrl,
  toE164Digits,
  whatsappShareUrl,
  whatsappUrl,
} from './links'

describe('links', () => {
  describe('whatsappUrl', () => {
    it('normalises a German national mobile to E.164 digits', () => {
      expect(whatsappUrl('01711234567')).toBe('https://wa.me/491711234567')
      expect(whatsappUrl('0171 1234567')).toBe('https://wa.me/491711234567')
      expect(whatsappUrl('0171/1234567')).toBe('https://wa.me/491711234567')
      expect(whatsappUrl('0171-1234567')).toBe('https://wa.me/491711234567')
    })

    it('keeps an existing country code and strips a trunk zero', () => {
      expect(whatsappUrl('+49 171 1234567')).toBe('https://wa.me/491711234567')
      expect(whatsappUrl('0049 171 1234567')).toBe('https://wa.me/491711234567')
      expect(whatsappUrl('+49 (0) 171 1234567')).toBe('https://wa.me/491711234567')
      expect(whatsappUrl('491711234567')).toBe('https://wa.me/491711234567')
    })

    it('does not invent a German prefix when the number has no leading zero', () => {
      expect(toE164Digits('1711234567')).toBe('1711234567')
      expect(whatsappUrl('+1 202 555 0147')).toBe('https://wa.me/12025550147')
    })

    it('appends encoded text and omits an empty note', () => {
      expect(whatsappUrl('0171 1234567', 'Hallo Orbit')).toBe(
        'https://wa.me/491711234567?text=Hallo%20Orbit',
      )
      expect(whatsappUrl('0171 1234567', 'Grüße & mehr')).toBe(
        'https://wa.me/491711234567?text=Gr%C3%BC%C3%9Fe%20%26%20mehr',
      )
      expect(whatsappUrl('0171 1234567', '   ')).toBe('https://wa.me/491711234567')
      expect(whatsappUrl('0171 1234567', null)).toBe('https://wa.me/491711234567')
    })

    it('returns null for invalid numbers', () => {
      expect(whatsappUrl('')).toBeNull()
      expect(whatsappUrl('   ')).toBeNull()
      expect(whatsappUrl(null)).toBeNull()
      expect(whatsappUrl(undefined)).toBeNull()
      expect(whatsappUrl('abc')).toBeNull()
      expect(whatsappUrl('0171')).toBeNull()
      expect(whatsappUrl('0')).toBeNull()
      expect(whatsappUrl('+')).toBeNull()
      expect(whatsappUrl('++491711234567')).toBeNull()
      expect(whatsappUrl('49+1711234567')).toBeNull()
      expect(whatsappUrl('0171abc1234567')).toBeNull()
      expect(whatsappUrl('017112345678901234')).toBeNull()
    })
  })

  describe('telUrl', () => {
    it('uses the same digits with a tel plus prefix', () => {
      expect(telUrl('0171 1234567')).toBe('tel:+491711234567')
      expect(telUrl('+49 (0) 171 1234567')).toBe('tel:+491711234567')
    })

    it('returns null when the phone is unusable', () => {
      expect(telUrl('')).toBeNull()
      expect(telUrl('nope')).toBeNull()
      expect(telUrl('123')).toBeNull()
    })
  })

  describe('mailUrl', () => {
    it('builds mailto links and encodes a subject', () => {
      expect(mailUrl('alex@example.invalid')).toBe('mailto:alex@example.invalid')
      expect(mailUrl('  alex@example.invalid  ')).toBe('mailto:alex@example.invalid')
      expect(mailUrl('alex@example.invalid', 'Hallo Orbit')).toBe(
        'mailto:alex@example.invalid?subject=Hallo%20Orbit',
      )
      expect(mailUrl('alex@example.invalid', '   ')).toBe('mailto:alex@example.invalid')
    })

    it('returns null for addresses that are not emails', () => {
      expect(mailUrl('')).toBeNull()
      expect(mailUrl('not-an-email')).toBeNull()
      expect(mailUrl('a@b')).toBeNull()
      expect(mailUrl('a@b.')).toBeNull()
      expect(mailUrl('alex@example.invalid\nBcc:x@y.z')).toBeNull()
      expect(mailUrl(null)).toBeNull()
    })
  })

  describe('mapsUrl', () => {
    it('encodes the address in a Google maps search URL', () => {
      expect(mapsUrl('Berlin')).toBe('https://www.google.com/maps/search/?api=1&query=Berlin')
      expect(mapsUrl('Köln, Dom')).toBe(
        'https://www.google.com/maps/search/?api=1&query=K%C3%B6ln%2C%20Dom',
      )
    })

    it('returns null for a blank address', () => {
      expect(mapsUrl('')).toBeNull()
      expect(mapsUrl('  ')).toBeNull()
      expect(mapsUrl('x')).toBeNull()
      expect(mapsUrl(null)).toBeNull()
    })
  })

  describe('social profile URLs', () => {
    it('strips @ and spaces and keeps allowed characters', () => {
      expect(instagramUrl('@orbit')).toBe('https://instagram.com/orbit')
      expect(instagramUrl('  @or bit  ')).toBe('https://instagram.com/orbit')
      expect(instagramUrl('hello.world')).toBe('https://instagram.com/hello.world')
      expect(facebookUrl('@My.Page')).toBe('https://www.facebook.com/My.Page')
      expect(facebookUrl('My Page')).toBe('https://www.facebook.com/MyPage')
      expect(tiktokUrl('@orbit')).toBe('https://www.tiktok.com/@orbit')
      expect(tiktokUrl('or bit')).toBe('https://www.tiktok.com/@orbit')
    })

    it('returns null for empty or illegal handles', () => {
      expect(instagramUrl('')).toBeNull()
      expect(instagramUrl('@')).toBeNull()
      expect(instagramUrl('bad!')).toBeNull()
      expect(instagramUrl('.')).toBeNull()
      expect(instagramUrl('..hello')).toBeNull()
      expect(instagramUrl('hello..world')).toBeNull()
      expect(instagramUrl('a'.repeat(31))).toBeNull()
      expect(instagramUrl('https://instagram.com/orbit')).toBeNull()
      expect(facebookUrl('')).toBeNull()
      expect(facebookUrl('bad name!')).toBeNull()
      expect(facebookUrl('a.b')).toBe('https://www.facebook.com/a.b')
      expect(facebookUrl('.page')).toBeNull()
      expect(tiktokUrl('')).toBeNull()
      expect(tiktokUrl('a')).toBeNull()
      expect(tiktokUrl('bad!')).toBeNull()
      expect(tiktokUrl(null)).toBeNull()
    })
  })

  describe('safeExternalUrl', () => {
    it('allows https and normalises the href', () => {
      expect(safeExternalUrl('https://instagram.com/orbit')).toBe('https://instagram.com/orbit')
      expect(safeExternalUrl('HTTPS://instagram.com/orbit')).toBe('https://instagram.com/orbit')
    })

    it('rejects anything that is not a credential-free https URL', () => {
      expect(safeExternalUrl('http://instagram.com/orbit')).toBeNull()
      expect(safeExternalUrl('javascript:alert(1)')).toBeNull()
      expect(safeExternalUrl('https://user:pass@instagram.com/orbit')).toBeNull()
      expect(safeExternalUrl('https://')).toBeNull()
      expect(safeExternalUrl('')).toBeNull()
      expect(safeExternalUrl('not a url')).toBeNull()
      expect(safeExternalUrl(null)).toBeNull()
    })
  })

  describe('whatsappShareUrl', () => {
    it('shares text without a phone number', () => {
      expect(whatsappShareUrl('Orbit https://orbit.invalid/r')).toBe(
        'https://wa.me/?text=Orbit%20https%3A%2F%2Forbit.invalid%2Fr',
      )
    })

    it('returns null for empty text', () => {
      expect(whatsappShareUrl('')).toBeNull()
      expect(whatsappShareUrl('  ')).toBeNull()
      expect(whatsappShareUrl(null)).toBeNull()
    })
  })

  describe('profileLinkHref', () => {
    it('accepts a handle or a matching https URL', () => {
      expect(profileLinkHref('instagram', '@orbit')).toBe('https://instagram.com/orbit')
      expect(profileLinkHref('instagram', 'https://www.instagram.com/orbit/?hl=de')).toBe(
        'https://instagram.com/orbit',
      )
      expect(profileLinkHref('instagram', 'instagram.com/orbit')).toBe('https://instagram.com/orbit')
      expect(profileLinkHref('facebook', 'https://m.facebook.com/My.Page')).toBe(
        'https://www.facebook.com/My.Page',
      )
      expect(profileLinkHref('tiktok', 'https://www.tiktok.com/@orbit')).toBe(
        'https://www.tiktok.com/@orbit',
      )
      expect(profileLinkHref('website', 'https://orbit.invalid/me')).toBe('https://orbit.invalid/me')
    })

    it('returns null for the wrong network, http, or junk', () => {
      expect(profileLinkHref('instagram', 'https://www.facebook.com/My.Page')).toBeNull()
      expect(profileLinkHref('website', 'http://orbit.invalid/me')).toBeNull()
      expect(profileLinkHref('website', '@orbit')).toBeNull()
      expect(profileLinkHref('tiktok', 'a')).toBeNull()
      expect(profileLinkHref('facebook', 'https://www.facebook.com/profile.php?id=1')).toBeNull()
      expect(profileLinkHref('instagram', '')).toBeNull()
      expect(profileLinkHref('instagram', null)).toBeNull()
    })
  })

  describe('catalogContactFields', () => {
    it('drops phone and email from third-party catalog rows', () => {
      expect(
        catalogContactFields({
          website: ' https://orbit.invalid ',
          city: 'Berlin',
          phone: '01711234567',
          email: 'a@b.de',
        }),
      ).toEqual({ website: 'https://orbit.invalid', address: 'Berlin' })
    })
  })
})
