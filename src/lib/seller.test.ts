import { describe, expect, it } from 'vitest'
import { commercialTraderComplete, resolveSeller } from './seller'

describe('seller labeling', () => {
  it('treats a listing without a complete trader as private', () => {
    expect(resolveSeller({}).kind).toBe('private')
    expect(
      resolveSeller({
        sellerKind: 'commercial',
        trader: { name: 'Nordlicht', address: '', email: 'a@example.invalid', phone: '1' },
      }).kind,
    ).toBe('private')
  })

  it('requires name, address, email and phone for a commercial listing', () => {
    const trader = {
      name: 'Nordlicht Events',
      address: 'Beispielweg 1, 10115 Berlin',
      email: 'hallo@example.invalid',
      phone: '030 000',
    }
    expect(commercialTraderComplete(trader)).toBe(true)
    const resolved = resolveSeller({ sellerKind: 'commercial', trader })
    expect(resolved.kind).toBe('commercial')
    expect(resolved.trader?.email).toBe('hallo@example.invalid')
  })
})
