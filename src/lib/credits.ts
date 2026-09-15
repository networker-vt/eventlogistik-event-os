/**
 * Orbit Credits — user wallet on top of the 21M protocol (demo ledger).
 * Core discovery stays free. Credits buy boosts only.
 * All grants debit a pre-allocated pool or fail — never mint above MAX_SUPPLY.
 */
import {
  EARLY_TESTER_GRANT,
  P2P_ORDERS,
  WELCOME_GRANT,
  ensureSignupIdentity,
  holdFromUser,
  isPackMarketP2P,
  getProtocol,
  mintFromPool,
  packsRemain,
  peerTransferOut,
  simulatePacksSoldOut as protocolSimulatePacksSoldOut,
  takeFromP2P,
  welcomeGrantFor,
  type CreditPoolId,
} from './creditProtocol'
import { getReferral, spendFeaturedCredits, simulateReferralSignup } from './referral'
import { getWallet, mockAdjustBalance } from './wallet'
import { uid } from './utils'

export {
  MAX_SUPPLY,
  EARLY_TESTER_CAP,
  EARLY_TESTER_GRANT,
  WELCOME_GRANT,
  SPONSOR_FEE,
  ALLOCATION_TABLE,
  P2P_ORDERS,
  POOL_ALLOCATION,
  formatSupplyLine,
  getProtocol,
  getSignupIdentity,
  ensureSignupIdentity,
  isPackMarketP2P,
  remainingReserve,
  supplyMeterPct,
  wertIndex,
  P2P_TAKE_RATE,
  type ProtocolState,
  type SignupIdentity,
  type P2POrder,
} from './creditProtocol'

const KEY = 'orbit_credits_v2'
const EVT = 'orbit-credits-changed'

/** Indicative: 10 Credits ≈ 1 EUR (demo only). */
export const CREDITS_PER_EUR = 10

export const FREE_SWIPES_PER_DAY = 20
export const EXTRA_SWIPES_PACK = 20

export type CreditPackId = 'small' | 'medium' | 'large'

export type CreditSpendKind =
  | 'featured'
  | 'extra_swipes'
  | 'travel_scan'
  | 'social_boost'
  | 'interview_slot'
  | 'booking'
  | 'unlock_message'
  | 'demo_gig'
  | 'sponsor_fee'
  | 'look_tryon'
  | 'look_shop'
  | 'assist_priority'

export type CreditTxType = 'earn' | 'spend' | 'exchange_in' | 'exchange_out' | 'purchase' | 'gift' | 'p2p' | 'welcome'

export interface CreditTx {
  id: string
  type: CreditTxType
  amount: number
  label: string
  kind?: CreditSpendKind
  createdAt: string
}

export interface CreditsState {
  balance: number
  txs: CreditTx[]
  swipeDay: string
  swipesUsed: number
  extraSwipes: number
  travelScanDay?: string
  lookTryOnDay?: string
  assistDay?: string
  assistUsed?: number
  boostMonth?: string
  freeBoostUsed?: boolean
  meaningfulAt?: string
}

export interface CreditPack {
  id: CreditPackId
  credits: number
  priceEur: number
  priceLabel: string
  labelDe: string
  labelEn: string
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: 'small', credits: 100, priceEur: 9.9, priceLabel: '9,90 €', labelDe: 'Klein', labelEn: 'Small' },
  { id: 'medium', credits: 300, priceEur: 24.9, priceLabel: '24,90 €', labelDe: 'Mittel', labelEn: 'Medium' },
  { id: 'large', credits: 800, priceEur: 59.9, priceLabel: '59,90 €', labelDe: 'Groß', labelEn: 'Large' },
]

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function defaultState(): CreditsState {
  return {
    balance: 0,
    txs: [],
    swipeDay: todayKey(),
    swipesUsed: 0,
    extraSwipes: 0,
  }
}

function normalize(raw: Partial<CreditsState> & { balance: number; txs: CreditTx[] }): CreditsState {
  const day = todayKey()
  const swipeDay = raw.swipeDay || day
  const rolled = swipeDay !== day
  return {
    balance: Math.max(0, raw.balance),
    txs: Array.isArray(raw.txs) ? raw.txs : [],
    swipeDay: rolled ? day : swipeDay,
    swipesUsed: rolled ? 0 : Math.max(0, raw.swipesUsed ?? 0),
    extraSwipes: rolled ? 0 : Math.max(0, raw.extraSwipes ?? 0),
    travelScanDay: raw.travelScanDay,
    lookTryOnDay: raw.lookTryOnDay,
    assistDay: raw.assistDay,
    assistUsed: raw.assistDay === day ? Math.max(0, raw.assistUsed ?? 0) : 0,
    boostMonth: raw.boostMonth,
    freeBoostUsed: raw.boostMonth === day.slice(0, 7) ? Boolean(raw.freeBoostUsed) : false,
    meaningfulAt: raw.meaningfulAt,
  }
}

function load(): CreditsState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<CreditsState>
    if (typeof parsed.balance !== 'number') return defaultState()
    return normalize({ ...parsed, balance: parsed.balance, txs: parsed.txs ?? [] })
  } catch {
    return defaultState()
  }
}

let cache: CreditsState | null = null
function get(): CreditsState {
  if (!cache) cache = load()
  const day = todayKey()
  if (cache.swipeDay !== day) {
    cache = {
      ...cache,
      swipeDay: day,
      swipesUsed: 0,
      extraSwipes: 0,
    }
    localStorage.setItem(KEY, JSON.stringify(cache))
  }
  return cache
}
function commit(next: CreditsState) {
  const seen = new Set<string>()
  next.txs = next.txs.filter((tx) => {
    if (seen.has(tx.id)) return false
    seen.add(tx.id)
    return true
  })
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
}

export function subscribeCredits(cb: () => void) {
  const h = () => cb()
  window.addEventListener(EVT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(EVT, h)
    window.removeEventListener('storage', h)
  }
}

export function getCredits(): CreditsState {
  return structuredClone(get())
}

/** Test helper — not used in UI. */
export function __resetCreditsForTests() {
  cache = null
  localStorage.removeItem(KEY)
}

export function creditsToEur(credits: number) {
  return credits / CREDITS_PER_EUR
}

export function eurToCredits(eur: number) {
  return Math.round(eur * CREDITS_PER_EUR)
}

/**
 * Local wallet credit only. Never call except after a successful protocol
 * mutation (mintFromPool / takeFromP2P). Client cap is a UX guardrail — it is
 * not a source of supply; P0 server ledger replaces this.
 */
function creditWallet(
  amount: number,
  type: CreditTxType,
  label: string,
  kind?: CreditSpendKind,
  opId?: string,
): CreditsState {
  const next = structuredClone(get())
  const id = opId || uid('cr')
  if (next.txs.some((t) => t.id === id)) return next
  const amt = Math.max(0, Math.round(amount))
  next.balance += amt
  next.txs.unshift({
    id,
    type,
    amount: amt,
    label,
    kind,
    createdAt: new Date().toISOString(),
  })
  commit(next)
  return next
}

/**
 * Debit a protocol pool then credit this device.
 * TODO(P0 server ledger): mintFromPool + creditWallet are not atomic. If the
 * wallet write fails after mint, circulating has moved without a user credit.
 * Production must apply both in one server/chain transaction with rollback.
 */
export function mintFromPoolToWallet(
  pool: CreditPoolId,
  amount: number,
  label: string,
  type: CreditTxType = 'earn',
): CreditsState | null {
  const amt = Math.max(0, Math.round(amount))
  if (amt === 0) return getCredits()
  if (!mintFromPool(pool, amt)) return null
  return creditWallet(amt, type, label)
}

/** Performance / contribution — always the pre-allocated rewards pool. */
export function earnCredits(amount: number, label: string): CreditsState | null {
  return mintFromPoolToWallet('rewards', amount, label, 'earn')
}

export function grantWelcomeAllocation(): CreditsState | null {
  const identity = ensureSignupIdentity()
  const grant = welcomeGrantFor(identity)
  const op = `welcome:${identity.ordinal}`
  // Already applied (protocol op or wallet tx) — never creditWallet without a new mint.
  if (get().txs.some((t) => t.id === op) || getProtocol().seenOpIds.includes(op)) {
    return getCredits()
  }
  const minted = mintFromPool(grant.pool, grant.amount, op)
    ? creditWallet(grant.amount, 'welcome', grant.label, undefined, op)
    : null
  if (minted) return minted
  if (grant.pool === 'early') {
    return mintFromPoolToWallet(
      'welcome',
      WELCOME_GRANT,
      `Willkommen (Early-Pool leer) · Signup #${identity.ordinal} — ${WELCOME_GRANT} Credits`,
      'welcome',
    )
  }
  return null
}

function applySpendSideEffects(next: CreditsState, kind: CreditSpendKind) {
  if (kind === 'extra_swipes') {
    next.extraSwipes += EXTRA_SWIPES_PACK
  }
  if (kind === 'travel_scan') {
    next.travelScanDay = todayKey()
  }
  if (kind === 'look_tryon') {
    next.lookTryOnDay = todayKey()
  }
}

export function spendCredits(
  amount: number,
  kind: CreditSpendKind,
  label: string,
): CreditsState | null {
  const next = structuredClone(get())
  const amt = Math.max(0, Math.round(amount))
  if (next.balance < amt) return null
  if (!holdFromUser(amt)) return null
  next.balance -= amt
  next.txs.unshift({
    id: uid('cr'),
    type: 'spend',
    amount: amt,
    kind,
    label,
    createdAt: new Date().toISOString(),
  })
  if (!next.meaningfulAt) next.meaningfulAt = new Date().toISOString()
  applySpendSideEffects(next, kind)
  try {
    spendFeaturedCredits(Math.min(amt, getReferral().featuredCredits))
  } catch {
    /* ignore */
  }
  commit(next)
  return next
}

/** Gift / sponsoring: peer transfer, no mint. Tiny fee burned. */
export function giftCredits(amount: number, toLabel = 'Orbit-Nutzer (Demo)'): CreditsState | null {
  const next = structuredClone(get())
  const amt = Math.max(0, Math.round(amount))
  if (amt <= 0 || next.balance < amt) return null
  const moved = peerTransferOut(amt)
  if (!moved) return null
  next.balance -= amt
  next.txs.unshift({
    id: uid('cr'),
    type: 'gift',
    amount: amt,
    kind: 'sponsor_fee',
    label: `Geschenk / Sponsoring an ${toLabel} · ${moved.net} an Peer, ${moved.burned} gebbrannt`,
    createdAt: new Date().toISOString(),
  })
  commit(next)
  return next
}

/** Mock exchange: Wallet EUR → Credits. Draws from the packs pool (system mint) or fails. */
export function exchangeEurToCredits(eur: number): CreditsState | null {
  const wallet = getWallet()
  const amt = Math.max(0, eur)
  if (wallet.balanceEur < amt) return null
  const credits = eurToCredits(amt)
  if (credits <= 0) return getCredits()
  if (!packsRemain(credits) || isPackMarketP2P()) return null
  mockAdjustBalance('payout', amt, 'sepa')
  const minted = mintFromPoolToWallet(
    'packs',
    credits,
    `Umtausch ${amt.toFixed(2)} € → ${credits} Credits (Demo, aus Pack-Reserve)`,
    'exchange_in',
  )
  if (!minted) {
    mockAdjustBalance('topup', amt, 'sepa')
    return null
  }
  return minted
}

export function exchangeCreditsToEur(credits: number): CreditsState | null {
  const next = structuredClone(get())
  const amt = Math.max(0, Math.round(credits))
  if (next.balance < amt) return null
  if (!holdFromUser(amt)) return null
  next.balance -= amt
  const eur = creditsToEur(amt)
  mockAdjustBalance('topup', eur, 'sepa')
  next.txs.unshift({
    id: uid('cr'),
    type: 'exchange_out',
    amount: amt,
    label: `Umtausch ${amt} Credits → ${eur.toFixed(2)} € (Demo, indikativ)`,
    createdAt: new Date().toISOString(),
  })
  commit(next)
  return next
}

export function claimReferralCreditsDemo() {
  if (!get().meaningfulAt) return null
  simulateReferralSignup()
  return earnCredits(40, 'Referral-Bonus (Demo) — nach erster sinnvoller Aktion, Rewards-Pool')
}

/** Demo checkout — credits appear only if the packs pool still has room. */
export function purchaseCreditPack(id: CreditPackId): CreditsState | null {
  const pack = CREDIT_PACKS.find((p) => p.id === id)
  if (!pack) return null
  if (!packsRemain(pack.credits) || isPackMarketP2P()) return null
  return mintFromPoolToWallet(
    'packs',
    pack.credits,
    `Pack ${pack.labelDe} · ${pack.credits} Credits · ${pack.priceLabel} (Demo-Checkout, aus Reserve, kein Stripe/PayPal)`,
    'purchase',
  )
}

export function buyP2POrder(orderId: string): CreditsState | null {
  const order = P2P_ORDERS.find((o) => o.id === orderId)
  if (!order) return null
  if (!takeFromP2P(order.credits, order.id)) return null
  return creditWallet(
    order.credits,
    'p2p',
    `P2P von ${order.seller} · ${order.credits} Credits · ${order.priceEur.toFixed(2)} € (kein Mint)`,
  )
}

export function simulatePacksSoldOut(): boolean {
  return protocolSimulatePacksSoldOut()
}

export interface SwipeBudget {
  day: string
  used: number
  extra: number
  remaining: number
  freeCap: number
  atCap: boolean
}

export function getSwipeBudget(): SwipeBudget {
  const s = get()
  const remaining = Math.max(0, FREE_SWIPES_PER_DAY + s.extraSwipes - s.swipesUsed)
  return {
    day: s.swipeDay,
    used: s.swipesUsed,
    extra: s.extraSwipes,
    remaining,
    freeCap: FREE_SWIPES_PER_DAY,
    atCap: remaining <= 0,
  }
}

/** Consume one free/extra swipe. Returns false when today's allowance is exhausted. */
export function consumeSwipe(): boolean {
  const next = structuredClone(get())
  const remaining = FREE_SWIPES_PER_DAY + next.extraSwipes - next.swipesUsed
  if (remaining <= 0) return false
  next.swipesUsed += 1
  if (!next.meaningfulAt) next.meaningfulAt = new Date().toISOString()
  commit(next)
  return true
}

export function hasTravelDeepScan(): boolean {
  return get().travelScanDay === todayKey()
}

export function buyBoost(kind: CreditSpendKind): CreditsState | null {
  if (consumeFreeMonthlyBoost(kind)) return getCredits()
  const meta = CREDITS_COSTS[kind]
  return spendCredits(meta.credits, kind, meta.label)
}

/** Boosts that cost Credits — never core discovery. */
export const CREDITS_BOOST_KINDS: CreditSpendKind[] = [
  'featured',
  'extra_swipes',
  'travel_scan',
  'social_boost',
  'interview_slot',
  'look_tryon',
  'look_shop',
]

export const FREE_ASSIST_PER_DAY = 8

export function markMeaningfulAction() {
  const next = structuredClone(get())
  if (next.meaningfulAt) return
  next.meaningfulAt = new Date().toISOString()
  commit(next)
}

export function hasMeaningfulAction() {
  return Boolean(get().meaningfulAt)
}

/** Extra Assist after the free daily lane — money moment, not while scrolling. */
export function consumeAssistTurn(): 'ok' | 'paid' | 'need_credits' {
  const next = structuredClone(get())
  const day = todayKey()
  if (next.assistDay !== day) {
    next.assistDay = day
    next.assistUsed = 0
  }
  if ((next.assistUsed ?? 0) < FREE_ASSIST_PER_DAY) {
    next.assistUsed = (next.assistUsed ?? 0) + 1
    commit(next)
    return 'ok'
  }
  const paid = spendCredits(
    CREDITS_COSTS.assist_priority.credits,
    'assist_priority',
    CREDITS_COSTS.assist_priority.label,
  )
  return paid ? 'paid' : 'need_credits'
}

function monthKey() {
  return todayKey().slice(0, 7)
}

function consumeFreeMonthlyBoost(kind: CreditSpendKind): boolean {
  if (!CREDITS_BOOST_KINDS.includes(kind)) return false
  const next = structuredClone(get())
  const month = monthKey()
  if (next.boostMonth !== month) {
    next.boostMonth = month
    next.freeBoostUsed = false
  }
  if (next.freeBoostUsed) return false
  applySpendSideEffects(next, kind)
  next.freeBoostUsed = true
  next.boostMonth = month
  if (!next.meaningfulAt) next.meaningfulAt = new Date().toISOString()
  next.txs.unshift({
    id: uid('cr'),
    type: 'spend',
    amount: 0,
    kind,
    label: `${CREDITS_COSTS[kind].label} · 1. Boost/Monat frei`,
    createdAt: new Date().toISOString(),
  })
  commit(next)
  return true
}

export const CREDITS_COSTS: Record<CreditSpendKind, { credits: number; label: string }> = {
  featured: { credits: 40, label: 'Listing boosten (7 Tage Demo)' },
  extra_swipes: { credits: 25, label: `+${EXTRA_SWIPES_PACK} Extra-Swipes (heute)` },
  travel_scan: { credits: 15, label: 'Reise: beste Preise Deep-Scan (heute)' },
  social_boost: { credits: 20, label: 'Social-Post featured (Demo)' },
  interview_slot: { credits: 30, label: 'Priority-Interview-Slot (Demo)' },
  booking: { credits: 25, label: 'Reise-Buchung (Demo-Pauschale)' },
  unlock_message: { credits: 5, label: 'Nachricht freischalten (Demo)' },
  demo_gig: { credits: 20, label: 'Demo-Gig buchen' },
  sponsor_fee: { credits: 1, label: 'Sponsoring-Gebühr (Burn)' },
  look_tryon: { credits: 15, label: 'Look: Extra-Varianten (heute)' },
  look_shop: { credits: 20, label: 'Look: Nearby-Shop featuren (Demo)' },
  assist_priority: { credits: 8, label: 'Assist extra (nach 8 frei/Tag)' },
}

export const CREDITS_FREE_DE = [
  'Assist fragen',
  `Match browsen + ${FREE_SWIPES_PER_DAY} Swipes / Tag`,
  'Look-Analyse (Basis)',
  'Chat (Match / Booking / Support)',
  'Wallet ansehen',
  'Social lesen',
]

export const CREDITS_FREE_EN = [
  'Assist fragen',
  `Match browsen + ${FREE_SWIPES_PER_DAY} Swipes / Tag`,
  'Look-Analyse (Basis)',
  'Chat (Match / Booking / Support)',
  'Wallet ansehen',
  'Social lesen',
]

export const CREDITS_DISCLAIMER_DE =
  'Orbit Credits sind eine Demo-In-App-Währung mit hartem Cap 21.000.000. Das Ledger läuft client-seitig — echte 21M-Enforcement braucht später Server oder Chain. Dieser Client mint nie über den Cap. Pack-Kauf ist ein Stub (kein Stripe/PayPal). Kern-Entdeckung bleibt kostenlos.'

export const CREDITS_DISCLAIMER_EN =
  'Orbit Credits are a demo in-app currency with a hard cap of 21,000,000. The ledger is client-side — real 21M enforcement needs a server or chain later. This client still never mints above the cap. Pack purchase is a stub (no Stripe/PayPal). Core discovery stays free.'

export const EARLY_TESTER_COPY_DE = `Die ersten ${50} Signups sind Early Testers (${EARLY_TESTER_GRANT.toLocaleString('de-DE')} Credits). Ab Signup 51: ${WELCOME_GRANT} Credits. Alles aus der 21M-Reserve.`
