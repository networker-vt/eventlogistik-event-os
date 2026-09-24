import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  FREE_ASSIST_PER_DAY,
  __resetCreditsForTests,
  consumeAssistTurn,
  earnCredits,
  getCredits,
  giftCredits,
  grantWelcomeAllocation,
  spendProAssist,
} from './credits'
import { __resetProtocolForTests } from './creditProtocol'
import { __setFlagForTests } from './flags'

describe('credits flag fail-closed', () => {
  beforeEach(() => {
    localStorage.clear()
    __setFlagForTests('credits', false)
    __resetProtocolForTests()
    __resetCreditsForTests()
  })

  afterEach(() => {
    __setFlagForTests(null)
  })

  it('does not mint, gift, or book assist burns 5/25/40', async () => {
    expect(await earnCredits(20, 'Heute verdienen')).toBeNull()
    expect(await grantWelcomeAllocation()).toBeNull()
    expect(await giftCredits(5, 'peer')).toBeNull()
    expect(await spendProAssist(5)).toBeNull()
    expect(await spendProAssist(25)).toBeNull()
    expect(await spendProAssist(40)).toBeNull()
    expect(getCredits().balance).toBe(0)
    expect(getCredits().txs).toHaveLength(0)
  })

  it('keeps assist free up to the daily limit and then stops without a charge', async () => {
    for (let i = 0; i < FREE_ASSIST_PER_DAY; i += 1) {
      expect(await consumeAssistTurn()).toBe('ok')
    }
    expect(await consumeAssistTurn()).toBe('limit')
    expect(getCredits().balance).toBe(0)
    expect(getCredits().txs).toHaveLength(0)
  })
})
