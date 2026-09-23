import { beforeEach, describe, expect, it } from 'vitest'
import { __resetCreditsForTests } from './credits'
import { __resetProtocolForTests } from './creditProtocol'
import { __setAppModeForTests } from './flags'
import {
  HEUTE_ACTIONS,
  HEUTE_DAILY_CAP,
  __resetHeuteForTests,
  claimHeute,
  heuteStatus,
} from './heuteVerdienen'
import { __resetKidsForTests, enableKids } from './kids'
import { __resetRewardsForTests } from './rewards'

describe('Heute verdienen', () => {
  beforeEach(() => {
    localStorage.clear()
    __setAppModeForTests(null)
    __resetProtocolForTests()
    __resetCreditsForTests()
    __resetRewardsForTests()
    __resetHeuteForTests()
    __resetKidsForTests()
  })

  it('lists one to three actions under a daily cap', () => {
    expect(HEUTE_ACTIONS.length).toBeGreaterThanOrEqual(1)
    expect(HEUTE_ACTIONS.length).toBeLessThanOrEqual(3)
    expect(HEUTE_DAILY_CAP).toBe(20)
    expect(heuteStatus().cap).toBe(20)
  })

  it('earns from the rewards pool until the daily cap', async () => {
    expect(await claimHeute('search')).not.toBeNull()
    expect(heuteStatus().earned).toBe(5)
    expect(await claimHeute('idea')).not.toBeNull()
    expect(heuteStatus().earned).toBe(13)
    expect(await claimHeute('review')).toBeNull()
    expect(heuteStatus().earned).toBe(13)
  })

  it('stays at 0 for kids', async () => {
    expect(enableKids('under13', '1234')).not.toBeNull()
    expect(heuteStatus()).toEqual({ earned: 0, cap: 0, done: [] })
    expect(await claimHeute('search')).toBeNull()
    expect(await claimHeute('idea')).toBeNull()
    expect(await claimHeute('review')).toBeNull()
  })
})
