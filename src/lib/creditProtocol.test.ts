import { beforeEach, describe, expect, it } from 'vitest'
import {
  MAX_SUPPLY,
  __resetProtocolForTests,
  getProtocol,
  isPackMarketP2P,
  mintFromPool,
  protocolInvariantHolds,
  simulatePacksSoldOut,
} from './creditProtocol'
import {
  __resetCreditsForTests,
  getCredits,
  giftCredits,
  grantWelcomeAllocation,
  purchaseCreditPack,
} from './credits'

describe('Orbit Credits protocol', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetProtocolForTests()
    __resetCreditsForTests()
  })

  it('refuses a mint that would exceed the 21M cap / empty pool', () => {
    const p = getProtocol()
    expect(mintFromPool('packs', p.pools.packs.remaining + 1)).toBe(false)
    expect(mintFromPool('rewards', MAX_SUPPLY)).toBe(false)
    expect(protocolInvariantHolds(getProtocol())).toBe(true)
    expect(getProtocol().circulating + getProtocol().remainingReserve + getProtocol().burned).toBe(
      MAX_SUPPLY,
    )
  })

  it('refuses a gift when the wallet is empty', () => {
    expect(getCredits().balance).toBe(0)
    expect(giftCredits(25, 'Demo')).toBeNull()
    expect(protocolInvariantHolds(getProtocol())).toBe(true)
  })

  it('blocks a second welcome grant (idempotent op id)', () => {
    const first = grantWelcomeAllocation()
    expect(first).not.toBeNull()
    const bal = getCredits().balance
    expect(bal).toBeGreaterThan(0)
    const second = grantWelcomeAllocation()
    expect(second).not.toBeNull()
    expect(getCredits().balance).toBe(bal)
    expect(getCredits().txs.filter((t) => t.type === 'welcome')).toHaveLength(1)
    expect(protocolInvariantHolds(getProtocol())).toBe(true)
  })

  it('switches to P2P only after packs are sold out', () => {
    expect(purchaseCreditPack('small')).not.toBeNull()
    __resetCreditsForTests()
    expect(simulatePacksSoldOut()).toBe(true)
    expect(isPackMarketP2P()).toBe(true)
    expect(purchaseCreditPack('small')).toBeNull()
    expect(protocolInvariantHolds(getProtocol())).toBe(true)
  })

  it('keeps the circulating + reserve + burned invariant', () => {
    grantWelcomeAllocation()
    const p = getProtocol()
    expect(protocolInvariantHolds(p)).toBe(true)
    expect(p.circulating + p.remainingReserve + p.burned).toBe(MAX_SUPPLY)
  })
})
