import { beforeEach, describe, expect, it } from 'vitest'
import {
  __resetLedgerForTests,
  appendLocalIntent,
  findLedgerEvent,
  ledgerBalance,
  listLedgerEvents,
  submitCreditIntent,
} from './creditLedger'
import {
  __resetCreditsForTests,
  creditsLedgerSum,
  getCredits,
  giftCredits,
  grantWelcomeAllocation,
  spendCredits,
} from './credits'
import { __resetProtocolForTests, protocolInvariantHolds, getProtocol, MAX_SUPPLY } from './creditProtocol'

describe('credit_events ledger', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetProtocolForTests()
    __resetCreditsForTests()
    __resetLedgerForTests()
  })

  it('is append-only and idempotent on txn_id', () => {
    const a = appendLocalIntent({ txn_id: 'txn-1', delta: 10, kind: 'earn', label: 'A' })
    expect(a.ok).toBe(true)
    expect(a.duplicate).toBe(false)
    expect(a.balance).toBe(10)

    const dup = appendLocalIntent({ txn_id: 'txn-1', delta: 99, kind: 'earn', label: 'hack' })
    expect(dup.ok).toBe(true)
    expect(dup.duplicate).toBe(true)
    expect(dup.balance).toBe(10)
    expect(listLedgerEvents()).toHaveLength(1)
    expect(findLedgerEvent('txn-1')?.delta).toBe(10)
  })

  it('balance equals the sum of signed deltas', () => {
    submitCreditIntent({ txn_id: 'in', delta: 40, kind: 'earn', label: 'in' })
    submitCreditIntent({ txn_id: 'out', delta: -12, kind: 'featured', label: 'boost' })
    expect(ledgerBalance()).toBe(28)
    expect(listLedgerEvents().reduce((n, e) => n + e.delta, 0)).toBe(28)
  })

  it('welcome + spend keep wallet and ledger in lockstep; cap holds', () => {
    expect(grantWelcomeAllocation()).not.toBeNull()
    const bal = getCredits().balance
    expect(creditsLedgerSum()).toBe(bal)
    expect(spendCredits(5, 'featured', 'Boost')).not.toBeNull()
    expect(getCredits().balance).toBe(bal - 5)
    expect(creditsLedgerSum()).toBe(bal - 5)
    expect(protocolInvariantHolds(getProtocol())).toBe(true)
    expect(getProtocol().circulating + getProtocol().remainingReserve + getProtocol().burned).toBe(
      MAX_SUPPLY,
    )
  })

  it('refuses a second apply of the same welcome txn_id', () => {
    grantWelcomeAllocation()
    const n = listLedgerEvents().filter((e) => e.txn_id.startsWith('welcome:')).length
    expect(n).toBe(1)
    grantWelcomeAllocation()
    expect(listLedgerEvents().filter((e) => e.txn_id.startsWith('welcome:'))).toHaveLength(1)
  })

  it('gift never mints; ledger debit matches wallet', () => {
    grantWelcomeAllocation()
    const before = getCredits().balance
    expect(giftCredits(before + 1, 'Nope')).toBeNull()
    expect(giftCredits(10, 'Peer')).not.toBeNull()
    expect(getCredits().balance).toBe(before - 10)
    expect(creditsLedgerSum()).toBe(before - 10)
  })
})
