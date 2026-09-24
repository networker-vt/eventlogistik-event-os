import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import * as credits from './credits'
import { __resetCreditsForTests, earnCredits, getCredits, spendCredits } from './credits'
import { __resetProtocolForTests, getProtocol } from './creditProtocol'
import { __setAppModeForTests, __setFlagForTests } from './flags'
import { __resetKidsForTests, enableKids, kidsCreditsFrozen } from './kids'
import {
  CONTRIBUTOR_REWARDS,
  __resetRewardsForTests,
  grantContributorMergedPr,
  grantIdeaReward,
  isVerbesserer,
  type ContributorMergedPrProof,
} from './rewards'

describe('Contributor rewards', () => {
  beforeEach(() => {
    localStorage.clear()
    __setAppModeForTests(null)
    __setFlagForTests('credits', true)
    __resetProtocolForTests()
    __resetCreditsForTests()
    __resetRewardsForTests()
    __resetKidsForTests()
  })

  afterEach(() => {
    __resetRewardsForTests()
    __resetKidsForTests()
    __setFlagForTests(null)
  })

  it('does not publicly export a naked merged-PR mint', () => {
    expect('grantMergedPrFromRewardsPool' in credits).toBe(false)
  })

  it('rejects missing or mismatched serverOrdinal; matching merged ordinal pays 120 once', async () => {
    expect(CONTRIBUTOR_REWARDS.find((r) => r.id === 'pr')?.amount).toBe(120)
    expect(CONTRIBUTOR_REWARDS.find((r) => r.id === 'pr')?.cap).toBe(1)

    const missing = await grantContributorMergedPr(15, { merged: true } as ContributorMergedPrProof)
    expect(missing).toBeNull()
    expect(getCredits().balance).toBe(0)

    const wrong = await grantContributorMergedPr(15, { merged: true, serverOrdinal: 99 })
    expect(wrong).toBeNull()
    expect(getCredits().balance).toBe(0)

    const unmerged = await grantContributorMergedPr(15, {
      merged: false as unknown as true,
      serverOrdinal: 15,
    })
    expect(unmerged).toBeNull()

    const first = await grantContributorMergedPr(15, { merged: true, serverOrdinal: 15 })
    expect(first).not.toBeNull()
    expect(isVerbesserer()).toBe(true)
    expect(getCredits().txs.some((t) => t.id === 'contributor:pr:15')).toBe(true)
    expect(getProtocol().seenOpIds).toContain('contributor:pr:15')
    expect(getCredits().balance).toBe(120)

    const farm = await grantContributorMergedPr(15, { merged: true, serverOrdinal: 15 })
    expect(farm).toBeNull()
    expect(getCredits().balance).toBe(120)
  })

  it('never mints contributor rewards in kids mode via kidsCreditsFrozen', async () => {
    await earnCredits(50, 'test float — Rewards-Pool')
    enableKids('under13', '1234')
    expect(kidsCreditsFrozen()).toBe(true)
    expect(await spendCredits(5, 'featured', 'Boost')).toBeNull()
    expect(await earnCredits(10, 'should not mint')).toBeNull()
    expect(await grantContributorMergedPr(2, { merged: true, serverOrdinal: 2 })).toBeNull()
    expect(await grantIdeaReward()).toBeNull()
  })
})
