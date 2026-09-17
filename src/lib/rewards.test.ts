import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { __resetCreditsForTests, earnCredits, getCredits } from './credits'
import { __resetProtocolForTests } from './creditProtocol'
import { __setAppModeForTests } from './flags'
import { __resetKidsForTests, setAgeBand, unlockParentalSession } from './kids'
import { spendCredits } from './credits'
import {
  CONTRIBUTOR_REWARDS,
  __resetRewardsForTests,
  grantContributeReward,
  grantIdeaReward,
  grantPrContributeReward,
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

  it('pays more for Verbesserer flows than casual ideas, fail-closed in the 21M pool', async () => {
    expect(CONTRIBUTOR_REWARDS.find((r) => r.id === 'contribute')?.amount).toBe(40)
    expect(CONTRIBUTOR_REWARDS.find((r) => r.id === 'pr')?.amount).toBe(120)
    expect(CONTRIBUTOR_REWARDS.find((r) => r.id === 'idea')?.amount).toBe(8)
    const idea = await grantIdeaReward()
    expect(idea).not.toBeNull()
    expect(isVerbesserer()).toBe(false)
    const contribute = await grantContributeReward()
    expect(contribute).not.toBeNull()
    expect(isVerbesserer()).toBe(true)
    const prBad = await grantPrContributeReward('not-a-url')
    expect(prBad).toBeNull()
    const pr = await grantPrContributeReward('https://github.com/networker-vt/eventlogistik-event-os/pull/1')
    expect(pr).not.toBeNull()
    expect(getCredits().balance).toBe(8 + 40 + 120)
  })

  it('refuses credit spends in kids mode until the parental gate unlocks', async () => {
    await earnCredits(50, 'test float — Rewards-Pool')
    setAgeBand('under13')
    expect(await spendCredits(5, 'featured', 'Boost')).toBeNull()
    unlockParentalSession()
    expect(await spendCredits(5, 'featured', 'Boost')).not.toBeNull()
  })
})
