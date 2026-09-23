import { beforeEach, describe, expect, it } from 'vitest'
import { __resetLedgerForTests } from './creditLedger'
import { __resetProtocolForTests, getProtocol } from './creditProtocol'
import {
  __resetCreditsForTests,
  ASSIST_PRO_BURNS,
  consumeAssistTurn,
  FREE_ASSIST_PER_DAY,
  getCredits,
  grantWelcomeAllocation,
  spendProAssist,
} from './credits'
import { __resetKidsForTests, enableKids } from './kids'

describe('Calm Home Pro Assist', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetProtocolForTests()
    __resetCreditsForTests()
    __resetLedgerForTests()
    __resetKidsForTests()
  })

  it('burns only the explicit tiers 5, 25, and 40', () => {
    expect([...ASSIST_PRO_BURNS]).toEqual([5, 25, 40])
  })

  it('does not auto-spend once the free lane is used', async () => {
    expect(await grantWelcomeAllocation()).not.toBeNull()
    const balance = getCredits().balance
    const reserve = getProtocol().remainingReserve
    const circulating = getProtocol().circulating
    for (let i = 0; i < FREE_ASSIST_PER_DAY; i += 1) {
      expect(await consumeAssistTurn()).toBe('ok')
    }
    expect(await consumeAssistTurn()).toBe('need_credits')
    expect(getCredits().balance).toBe(balance)
    expect(getProtocol().remainingReserve).toBe(reserve)
    expect(getProtocol().circulating).toBe(circulating)
  })

  it('spends a chosen tier from the balance and does not mint the 21M reserve', async () => {
    expect(await grantWelcomeAllocation()).not.toBeNull()
    const balance = getCredits().balance
    const reserve = getProtocol().remainingReserve
    const circulating = getProtocol().circulating
    const next = await spendProAssist(5)
    expect(next?.balance).toBe(balance - 5)
    expect(getProtocol().remainingReserve).toBe(reserve)
    expect(getProtocol().circulating).toBe(circulating)
    expect(await spendProAssist(25)).not.toBeNull()
    expect(getCredits().balance).toBe(balance - 30)
    expect(await spendProAssist(40)).not.toBeNull()
    expect(getCredits().balance).toBe(balance - 70)
    expect(getProtocol().remainingReserve).toBe(reserve)
    expect(getProtocol().circulating).toBe(circulating)
  })

  it('refuses a burn the balance cannot cover', async () => {
    expect(await spendProAssist(5)).toBeNull()
    expect(await spendProAssist(25)).toBeNull()
    expect(await spendProAssist(40)).toBeNull()
  })

  it('costs kids nothing and never opens a burn', async () => {
    expect(await grantWelcomeAllocation()).not.toBeNull()
    const balance = getCredits().balance
    const reserve = getProtocol().remainingReserve
    expect(enableKids('under13', '1234')).not.toBeNull()
    expect(await consumeAssistTurn()).toBe('ok')
    expect(await spendProAssist(5)).toBeNull()
    expect(await spendProAssist(25)).toBeNull()
    expect(await spendProAssist(40)).toBeNull()
    expect(getCredits().balance).toBe(balance)
    expect(getProtocol().remainingReserve).toBe(reserve)
  })
})
