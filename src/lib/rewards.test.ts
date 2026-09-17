import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { __resetCreditsForTests, earnCredits, getCredits, spendCredits } from './credits'
import { __resetProtocolForTests, getProtocol } from './creditProtocol'
import { __setAppModeForTests } from './flags'
import { __resetKidsForTests, enableKids } from './kids'
import {
  CONTRIBUTOR_REWARDS,
  __resetRewardsForTests,
  grantContributorMergedPr,
  grantIdeaReward,
  isVerbesserer,
} from './rewards'

describe('Contributor rewards', () => {
  beforeEach(() => {
    localStorage.clear()
    __setAppModeForTests(null)
    __resetProtocolForTests()
    __resetCreditsForTests()
    __resetRewardsForTests()
    __resetKidsForTests()
  })

  afterEach(() => {
    __resetRewardsForTests()
    __resetKidsForTests()
  })

  it('grants only after a merged PR, 1/PR, server-ordinal op, fail-closed in the rewards pool', async () => {
    expect(CONTRIBUTOR_REWARDS.find((r) => r.id === 'pr')?.amount).toBe(120)
    expect(CONTRIBUTOR_REWARDS.find((r) => r.id === 'pr')?.cap).toBe(1)
    const idea = await grantIdeaReward()
    expect(idea).not.toBeNull()
    expect(isVerbesserer()).toBe(false)
    const unmerged = await grantContributorMergedPr(15, { merged: false as unknown as true })
    expect(unmerged).toBeNull()
    const first = await grantContributorMergedPr(15, { merged: true, serverOrdinal: 15 })
    expect(first).not.toBeNull()
    expect(isVerbesserer()).toBe(true)
    expect(getCredits().txs.some((t) => t.id === 'contributor:pr:15')).toBe(true)
    expect(getProtocol().seenOpIds).toContain('contributor:pr:15')
    const farm = await grantContributorMergedPr(15, { merged: true })
    expect(farm).toBeNull()
    expect(getCredits().balance).toBe(8 + 120)
  })

  it('never mints or spends credits in kids mode', async () => {
    await earnCredits(50, 'test float — Rewards-Pool')
    enableKids('under13', '1234')
    expect(await spendCredits(5, 'featured', 'Boost')).toBeNull()
    expect(await earnCredits(10, 'should not mint')).toBeNull()
    expect(await grantContributorMergedPr(2, { merged: true })).toBeNull()
    expect(await grantIdeaReward()).toBeNull()
  })
})
