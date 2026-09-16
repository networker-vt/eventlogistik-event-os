/**
 * Credit ledger adapter.
 *
 * demo  — localStorage append-only events; balance = sum(delta); idempotent txn_id.
 * prod  — same local cache, plus read/write intents against Supabase RPC / Edge Function.
 *         Missing keys → graceful demo fallback (never throws).
 */
import { APP_MODE, isProd } from './flags'
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

export function isProdLedgerEnabled(): boolean {
  return isProd && isSupabaseConfigured && Boolean(supabase)
}

/** Append-only. Duplicate txn_id is a no-op success. Never updates or deletes. */
export function appendLocalIntent(intent: CreditIntent): IntentResult {
  const txn_id = intent.txn_id.trim()
  const delta = Math.round(intent.delta)
  if (!txn_id) return { ok: false, duplicate: false, balance: ledgerBalance(), txn_id, reason: 'txn_id' }

  const existing = findLedgerEvent(txn_id)
  if (existing) {
    return { ok: true, duplicate: true, balance: ledgerBalance(), txn_id }
  }

  const next: LedgerEvent = {
    ...intent,
    txn_id,
    delta,
    created_at: new Date().toISOString(),
    source: 'local',
  }
  persist([next, ...events()].slice(0, 400))
  return { ok: true, duplicate: false, balance: ledgerBalance(), txn_id }
}

function pending(): CreditIntent[] {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    return raw ? (JSON.parse(raw) as CreditIntent[]) : []
  } catch {
    return []
  }
}

function savePending(list: CreditIntent[]) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(0, 80)))
}

async function pushProdIntent(intent: CreditIntent): Promise<IntentResult | null> {
  if (!isProdLedgerEnabled() || !supabase) return null
  try {
    const rpc = await supabase.rpc('apply_credit_intent', {
      p_txn_id: intent.txn_id,
      p_delta: Math.round(intent.delta),
      p_kind: intent.kind,
      p_label: intent.label,
      p_pool: intent.pool ?? null,
      p_metadata: intent.metadata ?? {},
    })
    if (!rpc.error && rpc.data) {
      const data = rpc.data as IntentResult
      return {
        ok: Boolean(data.ok),
        duplicate: Boolean(data.duplicate),
        balance: Number(data.balance ?? ledgerBalance()),
        txn_id: String(data.txn_id ?? intent.txn_id),
        reason: data.reason,
      }
    }

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
      console.info('[orbit] credit-intent fallback local:', fn.error.message)
      return null
    }
    const data = (fn.data ?? {}) as IntentResult
    return {
      ok: Boolean(data.ok),
      duplicate: Boolean(data.duplicate),
      balance: Number(data.balance ?? ledgerBalance()),
      txn_id: String(data.txn_id ?? intent.txn_id),
      reason: data.reason,
    }
  } catch (e) {
    console.info('[orbit] credit intent skip:', e)
    return null
  }
}

/**
 * Write path: always append locally (demo source of truth).
 * Prod additionally posts the same txn_id to Supabase; unique violation = idempotent hit.
 */
export function submitCreditIntent(intent: CreditIntent): IntentResult {
  const local = appendLocalIntent(intent)
  if (!local.ok) return local
  if (isProdLedgerEnabled() && !local.duplicate) {
    const queued = [...pending().filter((p) => p.txn_id !== intent.txn_id), intent]
    savePending(queued)
    void flushPendingIntents()
  }
  return local
}

export async function flushPendingIntents() {
  if (!isProdLedgerEnabled()) return
  const list = pending()
  if (!list.length) return
  const remain: CreditIntent[] = []
  for (const intent of list) {
    const remote = await pushProdIntent(intent)
    if (!remote || !remote.ok) remain.push(intent)
  }
  savePending(remain)
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
    const byId = new Map<string, LedgerEvent>()
    for (const e of [...remote, ...events()]) {
      if (!byId.has(e.txn_id)) byId.set(e.txn_id, e)
    }
    persist([...byId.values()].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)))
    return ledgerBalance(userId)
  } catch (e) {
    console.info('[orbit] credit hydrate failed — demo ledger:', e)
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
  localStorage.removeItem(KEY)
  localStorage.removeItem(PENDING_KEY)
}

export const LEDGER_MODE_LINE =
  APP_MODE === 'prod'
    ? isProdLedgerEnabled()
      ? 'prod · Supabase credit_events'
      : 'prod requested · keys missing → demo localStorage'
    : 'demo · localStorage ledger'
