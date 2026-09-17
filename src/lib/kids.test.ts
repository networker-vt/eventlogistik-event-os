import { afterEach, describe, expect, it } from 'vitest'
import {
  __resetKidsForTests,
  AGE_BANDS,
  checkParentalAnswer,
  isKidsMode,
  isUnder18,
  kidsHideAdultTryOn,
  kidsHideSoftPaywall,
  kidsHideSocialChat,
  kidsHideTravel,
  kidsMaySeeJobs,
  leaveKidsMode,
  listingIsSafeForKids,
  makeParentalChallenge,
  needsParentalGate,
  setAgeBand,
  unlockParentalSession,
} from './kids'

describe('Orbit Kids', () => {
  afterEach(() => {
    __resetKidsForTests()
  })

  it('treats under-18 bands as kids mode and 18+ as adult', () => {
    expect(AGE_BANDS).toEqual(['under13', '13-15', '16-17', '18+'])
    expect(isUnder18('under13')).toBe(true)
    expect(isUnder18('13-15')).toBe(true)
    expect(isUnder18('16-17')).toBe(true)
    expect(isUnder18('18+')).toBe(false)
    setAgeBand('under13')
    expect(isKidsMode()).toBe(true)
    expect(kidsMaySeeJobs()).toBe(false)
    expect(kidsHideTravel()).toBe(true)
    expect(kidsHideSocialChat()).toBe(true)
    expect(kidsHideAdultTryOn()).toBe(true)
    expect(kidsHideSoftPaywall()).toBe(true)
    setAgeBand('13-15')
    expect(kidsMaySeeJobs()).toBe(true)
    setAgeBand('18+')
    expect(isKidsMode()).toBe(false)
    expect(kidsHideTravel()).toBe(false)
  })

  it('requires a parental session before leaving kids mode (fail-closed)', () => {
    setAgeBand('under13')
    expect(leaveKidsMode()).toBe(false)
    expect(isKidsMode()).toBe(true)
    unlockParentalSession()
    expect(leaveKidsMode()).toBe(true)
    expect(isKidsMode()).toBe(false)
  })

  it('gates credits spend and external/social while in kids mode without a session', () => {
    setAgeBand('16-17')
    expect(needsParentalGate('credits_spend')).toBe(true)
    expect(needsParentalGate('external_social')).toBe(true)
    expect(needsParentalGate('leave_kids')).toBe(true)
    unlockParentalSession()
    expect(needsParentalGate('credits_spend')).toBe(false)
  })

  it('accepts the adult math challenge and flags age-safe listings', () => {
    const ch = makeParentalChallenge(42)
    expect(checkParentalAnswer(ch, String(ch.answer))).toBe(true)
    expect(checkParentalAnswer(ch, '0')).toBe(false)
    expect(
      listingIsSafeForKids({
        safeForKids: true,
        title: 'Nachhilfe Mathe Klasse 5',
        marketType: 'minijob',
      }),
    ).toBe(true)
    expect(
      listingIsSafeForKids({
        safeForKids: false,
        title: 'Nachtbar 18+',
        marketType: 'job',
      }),
    ).toBe(false)
  })
})
