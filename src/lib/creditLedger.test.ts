import { beforeEach, describe, expect, it } from 'vitest'
import {
  __resetLedgerForTests,
  __setProdCreditTransportForTests,
  appendLocalIntent,
  findLedgerEvent,
  ledgerBalance,
  listLedgerEvents,
  submitCreditIntent,
} from './creditLedger'
import {
  __resetCreditsForTests,
  applyHydratedLedgerForTests,
  creditsLedgerSum,
  earnCredits,
  getCredits,
  giftCredits,
  grantWelcomeAllocation,
  spendCredits,
} from './credits'
import { __setAppModeForTests } from './flags'
import {
  __resetProtocolForTests,
  getProtocol,
  MAX_SUPPLY,
  protocolInvariantHolds,
} from './creditProtocol'

describe('credit_events ledger', () => {
  beforeEach(() => {
    localStorage.clear()
    __setAppModeForTests(null)
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

  it('demo: balance equals the sum of signed deltas (optimistic append)', async () => {
    await submitCreditIntent({ txn_id: 'in', delta: 40, kind: 'earn', label: 'in' })
    await submitCreditIntent({ txn_id: 'out', delta: -12, kind: 'featured', label: 'boost' })
    expect(ledgerBalance()).toBe(28)
    expect(listLedgerEvents().reduce((n, e) => n + e.delta, 0)).toBe(28)
  })

  it('welcome + spend keep wallet and ledger in lockstep; cap holds', async () => {
    expect(await grantWelcomeAllocation()).not.toBeNull()
    const bal = getCredits().balance
    expect(creditsLedgerSum()).toBe(bal)
    expect(await spendCredits(5, 'featured', 'Boost')).not.toBeNull()
    expect(getCredits().balance).toBe(bal - 5)
    expect(creditsLedgerSum()).toBe(bal - 5)
    expect(protocolInvariantHolds(getProtocol())).toBe(true)
    expect(getProtocol().circulating + getProtocol().remainingReserve + getProtocol().burned).toBe(
      MAX_SUPPLY,
    )
  })

  it('refuses a second apply of the same welcome txn_id', async () => {
    await grantWelcomeAllocation()
    const n = listLedgerEvents().filter((e) => e.txn_id.startsWith('welcome:')).length
    expect(n).toBe(1)
    await grantWelcomeAllocation()
    expect(listLedgerEvents().filter((e) => e.txn_id.startsWith('welcome:'))).toHaveLength(1)
  })

  it('gift never mints; ledger debit matches wallet', async () => {
    await grantWelcomeAllocation()
    const before = getCredits().balance
    expect(await giftCredits(before + 1, 'Nope')).toBeNull()
    expect(await giftCredits(10, 'Peer')).not.toBeNull()
    expect(getCredits().balance).toBe(before - 10)
    expect(creditsLedgerSum()).toBe(before - 10)
  })

  it('rejects kinds outside the allowlist', async () => {
    const r = await submitCreditIntent({ txn_id: 'bad', delta: 5, kind: 'arbitrary_mint', label: 'nope' })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('kind_not_allowed')
    expect(findLedgerEvent('bad')).toBeUndefined()
  })
})

describe('prod ledger (R1–R4)', () => {
  beforeEach(() => {
    localStorage.clear()
    __setAppModeForTests('prod')
    __resetProtocolForTests()
    __resetCreditsForTests()
    __resetLedgerForTests()
    __setAppModeForTests('prod')
  })

  it('hard-fails credit mutations when Supabase is not configured (no silent local mint)', async () => {
    const intent = await submitCreditIntent({ txn_id: 'ghost', delta: 100, kind: 'earn', label: 'mint' })
    expect(intent.ok).toBe(false)
    expect(intent.reason).toBe('prod_unconfigured')
    expect(listLedgerEvents()).toHaveLength(0)
    expect(await earnCredits(10, 'nope')).toBeNull()
    expect(getCredits().balance).toBe(0)
    expect(listLedgerEvents()).toHaveLength(0)
  })

  it('does not append locally when the server rejects (cap) — no leftover pending mint', async () => {
    __setProdCreditTransportForTests(async (intent) => ({
      ok: false,
      duplicate: false,
      balance: 0,
      txn_id: intent.txn_id,
      reason: 'cap',
    }))
    const circulating = getProtocol().circulating
    const r = await submitCreditIntent({ txn_id: 'cap-1', delta: 50, kind: 'earn', label: 'cap' })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('cap')
    expect(findLedgerEvent('cap-1')).toBeUndefined()
    expect(localStorage.getItem('orbit_credit_intents_pending_v1')).toBeNull()

    expect(await earnCredits(20, 'blocked')).toBeNull()
    expect(getCredits().balance).toBe(0)
    expect(getProtocol().circulating).toBe(circulating)
    expect(listLedgerEvents()).toHaveLength(0)
  })

  it('mirrors locally only after server ok:true', async () => {
    let serverBal = 0
    __setProdCreditTransportForTests(async (intent) => {
      serverBal += intent.delta
      return { ok: true, duplicate: false, balance: serverBal, txn_id: intent.txn_id }
    })
    const r = await submitCreditIntent({ txn_id: 'ok-1', delta: 25, kind: 'welcome', label: 'hi' })
    expect(r.ok).toBe(true)
    expect(findLedgerEvent('ok-1')?.source).toBe('supabase')
    expect(ledgerBalance()).toBe(25)
  })

  it('rolls back protocol debit if wallet credit fails after mintFromPool (R3)', async () => {
    __setProdCreditTransportForTests(async (intent) => ({
      ok: false,
      duplicate: false,
      balance: 0,
      txn_id: intent.txn_id,
      reason: 'cap',
    }))
    const before = getProtocol()
    expect(await grantWelcomeAllocation()).toBeNull()
    const after = getProtocol()
    expect(after.circulating).toBe(before.circulating)
    expect(after.remainingReserve).toBe(before.remainingReserve)
    expect(getCredits().balance).toBe(0)
    expect(protocolInvariantHolds(after)).toBe(true)
  })

  it('hydrate replaces local leftover mints and syncs wallet balance from ledger (R2)', () => {
    __setAppModeForTests('demo')
    appendLocalIntent({ txn_id: 'local-ghost', delta: 999, kind: 'earn', label: 'stale' })
    expect(ledgerBalance()).toBe(999)

    __setAppModeForTests('prod')
    const wallet = applyHydratedLedgerForTests(
      [
        {
          txn_id: 'srv-1',
          delta: 40,
          kind: 'welcome',
          label: 'server welcome',
          created_at: '2026-09-16T00:00:00.000Z',
          source: 'supabase',
          user_id: 'u1',
        },
        {
          txn_id: 'srv-2',
          delta: -5,
          kind: 'featured',
          label: 'boost',
          created_at: '2026-09-16T01:00:00.000Z',
          source: 'supabase',
          user_id: 'u1',
        },
      ],
      'u1',
    )
    expect(findLedgerEvent('local-ghost')).toBeUndefined()
    expect(ledgerBalance('u1')).toBe(35)
    expect(wallet.balance).toBe(35)
    expect(getCredits().balance).toBe(35)
  })
})
