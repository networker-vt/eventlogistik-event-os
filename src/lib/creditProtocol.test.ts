import { beforeEach, describe, expect, it } from 'vitest'
import {
  MAX_SUPPLY,
  __resetProtocolForTests,
  getProtocol,
  isPackMarketP2P,
  mintFromPool,
  protocolInvariantHolds,
  restoreProtocolSnapshot,
  simulatePacksSoldOut,
  snapshotProtocol,
} from './creditProtocol'
import {
  __resetCreditsForTests,
  boostCost,
  CREDITS_COSTS,
  getCredits,
  giftCredits,
  grantWelcomeAllocation,
  purchaseCreditPack,
} from './credits'
import { __setAppModeForTests } from './flags'

describe('Orbit Credits protocol', () => {
  beforeEach(() => {
    localStorage.clear()
    __setAppModeForTests(null)
    __resetProtocolForTests()
    __resetCreditsForTests()
  })

  it('add-at-cap: refuses a mint that would exceed the 21M cap / empty pool', () => {
    const p = getProtocol()
    expect(mintFromPool('packs', p.pools.packs.remaining + 1)).toBe(false)
    expect(mintFromPool('rewards', MAX_SUPPLY)).toBe(false)
    expect(protocolInvariantHolds(getProtocol())).toBe(true)
    expect(getProtocol().circulating + getProtocol().remainingReserve + getProtocol().burned).toBe(
      MAX_SUPPLY,
    )
  })

  it('gift-at-cap: refuses oversize gifts and never mints', async () => {
    expect(getCredits().balance).toBe(0)
    expect(await giftCredits(25, 'Demo')).toBeNull()

    expect(await grantWelcomeAllocation()).not.toBeNull()
    const bal = getCredits().balance
    const circulatingBefore = getProtocol().circulating
    expect(await giftCredits(bal + 1, 'Over cap')).toBeNull()
    expect(getCredits().balance).toBe(bal)
    expect(getProtocol().circulating).toBe(circulatingBefore)

    const sent = Math.min(25, bal)
    expect(await giftCredits(sent, 'Peer')).not.toBeNull()
    const after = getProtocol()
    expect(after.circulating).toBeLessThan(circulatingBefore)
    expect(after.burned).toBeGreaterThan(0)
    expect(protocolInvariantHolds(after)).toBe(true)
    expect(after.circulating + after.remainingReserve + after.burned).toBe(MAX_SUPPLY)
  })

  it('double-apply: blocks a second welcome grant (idempotent op id)', async () => {
    const first = await grantWelcomeAllocation()
    expect(first).not.toBeNull()
    const bal = getCredits().balance
    expect(bal).toBeGreaterThan(0)
    const second = await grantWelcomeAllocation()
    expect(second).not.toBeNull()
    expect(getCredits().balance).toBe(bal)
    expect(getCredits().txs.filter((t) => t.type === 'welcome')).toHaveLength(1)
    expect(protocolInvariantHolds(getProtocol())).toBe(true)
  })

  it('switches to P2P only after packs are sold out', async () => {
    expect(await purchaseCreditPack('small')).not.toBeNull()
    __resetCreditsForTests()
    expect(simulatePacksSoldOut()).toBe(true)
    expect(isPackMarketP2P()).toBe(true)
    expect(await purchaseCreditPack('small')).toBeNull()
    expect(protocolInvariantHolds(getProtocol())).toBe(true)
  })

  it('keeps the circulating + reserve + burned invariant', async () => {
    await grantWelcomeAllocation()
    const p = getProtocol()
    expect(protocolInvariantHolds(p)).toBe(true)
    expect(p.circulating + p.remainingReserve + p.burned).toBe(MAX_SUPPLY)
  })

  it('gives Early-50 a −20% boost price forever', async () => {
    await grantWelcomeAllocation()
    expect(boostCost('featured')).toBe(Math.round(CREDITS_COSTS.featured.credits * 0.8))
    expect(boostCost('extra_swipes')).toBeLessThan(CREDITS_COSTS.extra_swipes.credits)
  })

  it('restoreProtocolSnapshot undoes a pool debit (atomic mint rollback)', () => {
    const snap = snapshotProtocol()
    expect(mintFromPool('rewards', 40)).toBe(true)
    expect(getProtocol().circulating).toBe(snap.circulating + 40)
    expect(restoreProtocolSnapshot(snap)).toBe(true)
    expect(getProtocol().circulating).toBe(snap.circulating)
    expect(getProtocol().pools.rewards.remaining).toBe(snap.pools.rewards.remaining)
    expect(protocolInvariantHolds(getProtocol())).toBe(true)
  })
})
