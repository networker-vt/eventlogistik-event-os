import { describe, expect, it } from 'vitest'
import { listingContactView, publicContactFromOptIn } from './listingContact'

describe('listingContactView', () => {
  it('hides private contact when the opt-in is missing or off', () => {
    const hidden = listingContactView({
      sellerKind: 'private',
      city: 'Hamburg',
      publicContact: { email: 'sara@example.invalid', phone: '0171 1234567' },
    })
    expect(hidden.email).toBeUndefined()
    expect(hidden.phone).toBeUndefined()
    expect(hidden.hasDirectContact).toBe(false)

    const off = listingContactView({
      showContact: false,
      publicContact: { email: 'sara@example.invalid' },
    })
    expect(off.email).toBeUndefined()
    expect(off.hasDirectContact).toBe(false)
  })

  it('shows the listing snapshot after an explicit opt-in', () => {
    const view = listingContactView({
      sellerKind: 'private',
      showContact: true,
      city: 'Hamburg',
      publicContact: { email: 'alex@example.invalid', phone: '0171 1234567' },
    })
    expect(view.email).toBe('alex@example.invalid')
    expect(view.phone).toBe('0171 1234567')
    expect(view.hasDirectContact).toBe(true)
  })

  it('keeps commercial trader fields and ignores a private snapshot', () => {
    const view = listingContactView({
      sellerKind: 'commercial',
      showContact: false,
      trader: {
        name: 'Nordlicht',
        address: 'Hafen 1, Hamburg',
        email: 'job@example.invalid',
        phone: '040 123456',
      },
      publicContact: { email: 'private@example.invalid' },
    })
    expect(view.email).toBe('job@example.invalid')
    expect(view.phone).toBe('040 123456')
    expect(view.address).toBe('Hafen 1, Hamburg')
  })
})

describe('publicContactFromOptIn', () => {
  it('stores nothing when the checkbox is off, even if fields are filled', () => {
    const result = publicContactFromOptIn({
      showContact: false,
      reuseProfile: true,
      email: 'alex@example.invalid',
      phone: '0171 1234567',
      profile: { email: 'alex@example.invalid', phone: '0171 1234567' },
    })
    expect(result).toEqual({ ok: true, showContact: false })
  })

  it('copies profile data only when reuse is checked', () => {
    const result = publicContactFromOptIn({
      showContact: true,
      reuseProfile: true,
      email: '',
      phone: '',
      profile: {
        email: 'alex@example.invalid',
        phone: '0171 1234567',
        profileLinks: [{ kind: 'instagram', input: '@orbit' }],
      },
    })
    expect(result).toEqual({
      ok: true,
      showContact: true,
      publicContact: {
        email: 'alex@example.invalid',
        phone: '0171 1234567',
        links: [{ kind: 'instagram', input: '@orbit' }],
      },
    })
  })

  it('keeps the listing fields and does not read the profile', () => {
    const result = publicContactFromOptIn({
      showContact: true,
      reuseProfile: false,
      email: 'only-listing@example.invalid',
      phone: '0171 1234567',
      profile: { email: 'account@example.invalid', phone: '030 999999' },
    })
    expect(result.ok).toBe(true)
    if (result.ok && result.showContact) {
      expect(result.publicContact.email).toBe('only-listing@example.invalid')
      expect(result.publicContact.phone).toBe('0171 1234567')
    }
  })

  it('rejects an opt-in with nothing to show', () => {
    expect(
      publicContactFromOptIn({
        showContact: true,
        reuseProfile: false,
        email: ' ',
        phone: '',
      }),
    ).toEqual({ ok: false, error: 'missing' })
  })
})
