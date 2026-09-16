import { beforeEach, describe, expect, it } from 'vitest'
import {
  __resetVerifyForTests,
  canOffer,
  canPayout,
  markEmailVerified,
  stubVerifyBusiness,
  stubVerifyId,
  stubVerifyPhone,
} from './verify'

describe('soft verify', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetVerifyForTests()
  })

  it('requires phone before offering and ID/business before payout', () => {
    expect(canOffer()).toBe(false)
    expect(canPayout()).toBe(false)
    markEmailVerified()
    expect(canOffer()).toBe(false)
    stubVerifyPhone('0171 0000000')
    expect(canOffer()).toBe(true)
    expect(canPayout()).toBe(false)
    stubVerifyId()
    expect(canPayout()).toBe(true)
    stubVerifyBusiness()
    expect(canPayout()).toBe(true)
  })
})
