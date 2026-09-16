/**
 * Credit ledger adapter.
 *
 * demo (`VITE_APP_MODE=demo`) — optimistic localStorage append; balance = sum(delta).
 * prod + keys — RPC / Edge FIRST; local mirror only after ok:true (R1).
 * prod without Supabase — HARD FAIL credit mutations (no silent local mint).
 *
 * Server source of truth: `credit_events`. Wallet `CreditsState.balance` is a cache
 * of `ledgerBalance()` after hydrate / successful intents (R2).
 */
import { isAllowedCreditKind } from './creditKinds'
import { getAppMode, isDemoMode, isProdMode } from './flags'
import { isSupabaseConfigured, supabase } from './supabase'

const KEY = 'orbit_credit_events_v1'
const PENDING_KEY = 'orbit_credit_intents_pending_v1'
const EVT = 'orbit-credits-changed'

export interface CreditIntent {
  txn_id: string
  delta: number
  kind: string
  label: string
  pool?: string
  user_id?: string
  metadata?: Record<string, unknown>
}

export interface LedgerEvent extends CreditIntent {
  created_at: string
  source: 'local' | 'supabase'
}

export type IntentResult = {
  ok: boolean
  duplicate: boolean
  balance: number
  txn_id: string
  reason?: string
}

export type ProdCreditTransport = (intent: CreditIntent) => Promise<IntentResult>

let prodTransport: ProdCreditTransport | null = null

function loadEvents(): LedgerEvent[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LedgerEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

let cache: LedgerEvent[] | null = null

function events(): LedgerEvent[] {
  if (!cache) cache = loadEvents()
  return cache
}

function persist(next: LedgerEvent[]) {
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
}

function fail(txn_id: string, reason: string): IntentResult {
  return { ok: false, duplicate: false, balance: ledgerBalance(), txn_id, reason }
}

function discardPendingIntents() {
  try {
    localStorage.removeItem(PENDING_KEY)
  } catch {
    /* ignore */
  }
}

export function listLedgerEvents(): LedgerEvent[] {
  return [...events()]
}

export function ledgerBalance(userId?: string): number {
  return events()
    .filter((e) => !userId || e.user_id === userId)
    .reduce((n, e) => n + e.delta, 0)
}

export function findLedgerEvent(txn_id: string): LedgerEvent | undefined {
  return events().find((e) => e.txn_id === txn_id)
}

/** Prod write path is live (keys or test transport). Demo never uses this. */
export function isProdLedgerEnabled(): boolean {
  if (!isProdMode()) return false
  if (prodTransport) return true
  return isSupabaseConfigured && Boolean(supabase)
}

export function creditMutationsBlockedReason(): string | null {
  if (isDemoMode()) return null
  if (isProdLedgerEnabled()) return null
  return 'prod_unconfigured'
}

/** Append-only. Duplicate txn_id is a no-op success. Never updates or deletes. */
export function appendLocalIntent(
  intent: CreditIntent,
  source: LedgerEvent['source'] = 'local',
): IntentResult {
  const txn_id = intent.txn_id.trim()
  const delta = Math.round(intent.delta)
  if (!txn_id) return fail(txn_id, 'txn_id')

  const existing = findLedgerEvent(txn_id)
  if (existing) {
    return { ok: true, duplicate: true, balance: ledgerBalance(), txn_id }
  }

  const next: LedgerEvent = {
    ...intent,
    txn_id,
    delta,
    created_at: new Date().toISOString(),
    source,
  }
  persist([next, ...events()].slice(0, 400))
  return { ok: true, duplicate: false, balance: ledgerBalance(), txn_id }
}

function normalizeRemote(data: IntentResult, intent: CreditIntent): IntentResult {
  return {
    ok: Boolean(data.ok),
    duplicate: Boolean(data.duplicate),
    balance: Number(data.balance ?? ledgerBalance()),
    txn_id: String(data.txn_id ?? intent.txn_id),
    reason: data.reason,
  }
}

async function invokeEdge(intent: CreditIntent): Promise<IntentResult> {
  if (!supabase) return fail(intent.txn_id, 'prod_unconfigured')
  const fn = await supabase.functions.invoke('credit-intent', {
    body: {
      txn_id: intent.txn_id,
      delta: Math.round(intent.delta),
      kind: intent.kind,
      label: intent.label,
      pool: intent.pool ?? null,
      metadata: intent.metadata ?? {},
    },
  })
  if (fn.error) {
    return fail(intent.txn_id, fn.error.message || 'edge_failed')
  }
  const data = (fn.data ?? {}) as IntentResult
  if (!data.ok) {
    return {
      ok: false,
      duplicate: Boolean(data.duplicate),
      balance: Number(data.balance ?? ledgerBalance()),
      txn_id: String(data.txn_id ?? intent.txn_id),
      reason: data.reason || 'edge_rejected',
    }
  }
  return normalizeRemote(data, intent)
}

/**
 * Prod transport: mints (delta>0) go to Edge/service_role only.
 * Spends may use the user JWT RPC, then Edge.
 * Never falls back to a local append.
 */
async function pushProdIntent(intent: CreditIntent): Promise<IntentResult> {
  if (prodTransport) return prodTransport(intent)
  if (!isProdLedgerEnabled() || !supabase) return fail(intent.txn_id, 'prod_unconfigured')

  const delta = Math.round(intent.delta)
  try {
    if (delta > 0) {
      return await invokeEdge(intent)
    }

    const rpc = await supabase.rpc('apply_credit_intent', {
      p_txn_id: intent.txn_id,
      p_delta: delta,
      p_kind: intent.kind,
      p_label: intent.label,
      p_pool: intent.pool ?? null,
      p_metadata: intent.metadata ?? {},
    })
    if (!rpc.error && rpc.data) {
      const data = rpc.data as IntentResult
      if (!data.ok) return normalizeRemote(data, intent)
      return normalizeRemote(data, intent)
    }

    const edge = await invokeEdge(intent)
    if (edge.ok) return edge
    return fail(intent.txn_id, rpc.error?.message || edge.reason || 'rpc_failed')
  } catch (e) {
    const message = e instanceof Error ? e.message : 'rpc_failed'
    return fail(intent.txn_id, message)
  }
}

/**
 * Write path.
 * Demo: optimistic local append (source of truth on this device).
 * Prod: server first; local mirror only on ok:true. Cap / RPC / Edge reject → HARD
 * fail with no local event and no pending queue that later credits the wallet (R1).
 */
export async function submitCreditIntent(intent: CreditIntent): Promise<IntentResult> {
  const txn_id = intent.txn_id.trim()
  const delta = Math.round(intent.delta)
  const kind = intent.kind.trim()
  const normalized: CreditIntent = { ...intent, txn_id, delta, kind }

  if (!txn_id) return fail(txn_id, 'txn_id')
  if (!isAllowedCreditKind(kind)) return fail(txn_id, 'kind_not_allowed')

  discardPendingIntents()

  if (isDemoMode()) {
    return appendLocalIntent(normalized, 'local')
  }

  if (!isProdLedgerEnabled()) {
    return fail(txn_id, 'prod_unconfigured')
  }

  const existing = findLedgerEvent(txn_id)
  if (existing) {
    return { ok: true, duplicate: true, balance: ledgerBalance(), txn_id }
  }

  const remote = await pushProdIntent(normalized)
  if (!remote.ok) {
    // HARD rollback: do not append, do not queue. Leftover pending mints are discarded.
    discardPendingIntents()
    return remote
  }

  const mirror = appendLocalIntent(normalized, 'supabase')
  return {
    ok: true,
    duplicate: remote.duplicate || mirror.duplicate,
    balance: remote.balance,
    txn_id,
    reason: remote.reason,
  }
}

/** @deprecated Pending mint queue removed (R1). Kept as a discard no-op. */
export async function flushPendingIntents() {
  discardPendingIntents()
}

/**
 * Replace the local cache with server rows (do not merge leftover client mints).
 * Balance = sum(delta) of the hydrated events (R2).
 */
export function applyHydratedEvents(remote: LedgerEvent[], userId?: string): number {
  persist(
    [...remote].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 400),
  )
  discardPendingIntents()
  return ledgerBalance(userId)
}

export async function hydrateLedgerFromSupabase(userId: string): Promise<number | null> {
  if (!isProdLedgerEnabled() || !supabase) return null
  try {
    const { data, error } = await supabase
      .from('credit_events')
      .select('txn_id, user_id, delta, kind, label, pool, metadata, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(400)
    if (error || !data) {
      console.info('[orbit] credit hydrate skip:', error?.message)
      return null
    }
    const remote: LedgerEvent[] = data.map((row) => ({
      txn_id: String(row.txn_id),
      user_id: String(row.user_id),
      delta: Number(row.delta),
      kind: String(row.kind),
      label: String(row.label),
      pool: (row.pool as string) || undefined,
      metadata: (row.metadata as Record<string, unknown>) || undefined,
      created_at: String(row.created_at),
      source: 'supabase',
    }))
    return applyHydratedEvents(remote, userId)
  } catch (e) {
    console.info('[orbit] credit hydrate failed:', e)
    return null
  }
}

export function reconstructFromSignedTxs(
  txs: { id: string; type: string; amount: number; label: string; kind?: string; createdAt: string }[],
) {
  if (events().length) return
  const mapped: LedgerEvent[] = txs.map((tx) => {
    const spend = tx.type === 'spend' || tx.type === 'exchange_out' || tx.type === 'gift'
    return {
      txn_id: tx.id,
      delta: spend ? -Math.abs(tx.amount) : Math.abs(tx.amount),
      kind: tx.kind || tx.type,
      label: tx.label,
      created_at: tx.createdAt,
      source: 'local' as const,
    }
  })
  persist(mapped)
}

export function __resetLedgerForTests() {
  cache = null
  prodTransport = null
  localStorage.removeItem(KEY)
  localStorage.removeItem(PENDING_KEY)
}

export function __setProdCreditTransportForTests(fn: ProdCreditTransport | null) {
  prodTransport = fn
}

export function ledgerModeLine(): string {
  if (getAppMode() !== 'prod') return 'demo · localStorage ledger'
  return isProdLedgerEnabled()
    ? 'prod · Supabase credit_events'
    : 'prod · Supabase not configured · credit mutations hard-fail'
}

export const LEDGER_MODE_LINE = ledgerModeLine()
