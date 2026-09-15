/**
 * Orbit Credits — freemium in-app currency (demo ledger).
 * Core discovery stays free: Assist ask, Match browse + daily swipe allowance,
 * basic chat, wallet view, social read. Credits buy boosts only.
 * Purchase packs are a stub until Stripe/PayPal go live.
 */
import { getReferral, spendFeaturedCredits, simulateReferralSignup } from './referral'
import { getWallet, mockAdjustBalance } from './wallet'
import { uid } from './utils'

const KEY = 'orbit_credits_v1'
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

export interface CreditTx {
  id: string
  type: 'earn' | 'spend' | 'exchange_in' | 'exchange_out' | 'purchase'
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
  const ref = getReferral()
  return {
    balance: Math.max(0, ref.featuredCredits) + 100,
    txs: [
      {
        id: 'cr-seed',
        type: 'earn',
        amount: 100,
        label: 'Willkommen in Orbit (Demo)',
        createdAt: new Date().toISOString(),
      },
    ],
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
    balance: raw.balance,
    txs: Array.isArray(raw.txs) ? raw.txs : [],
    swipeDay: rolled ? day : swipeDay,
    swipesUsed: rolled ? 0 : Math.max(0, raw.swipesUsed ?? 0),
    extraSwipes: rolled ? 0 : Math.max(0, raw.extraSwipes ?? 0),
    travelScanDay: raw.travelScanDay,
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

export function creditsToEur(credits: number) {
  return credits / CREDITS_PER_EUR
}

export function eurToCredits(eur: number) {
  return Math.round(eur * CREDITS_PER_EUR)
}

export function earnCredits(amount: number, label: string): CreditsState {
  const next = structuredClone(get())
  const amt = Math.max(0, Math.round(amount))
  next.balance += amt
  next.txs.unshift({
    id: uid('cr'),
    type: 'earn',
    amount: amt,
    label,
    createdAt: new Date().toISOString(),
  })
  commit(next)
  return next
}

function applySpendSideEffects(next: CreditsState, kind: CreditSpendKind) {
  if (kind === 'extra_swipes') {
    next.extraSwipes += EXTRA_SWIPES_PACK
  }
  if (kind === 'travel_scan') {
    next.travelScanDay = todayKey()
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
  next.balance -= amt
  next.txs.unshift({
    id: uid('cr'),
    type: 'spend',
    amount: amt,
    kind,
    label,
    createdAt: new Date().toISOString(),
  })
  applySpendSideEffects(next, kind)
  try {
    spendFeaturedCredits(Math.min(amt, getReferral().featuredCredits))
  } catch {
    /* ignore */
  }
  commit(next)
  return next
}

/** Mock exchange: Wallet EUR ↔ Orbit Credits (no real fiat). */
export function exchangeEurToCredits(eur: number): CreditsState | null {
  const wallet = getWallet()
  const amt = Math.max(0, eur)
  if (wallet.balanceEur < amt) return null
  mockAdjustBalance('payout', amt, 'sepa')
  const credits = eurToCredits(amt)
  const next = structuredClone(get())
  next.balance += credits
  next.txs.unshift({
    id: uid('cr'),
    type: 'exchange_in',
    amount: credits,
    label: `Umtausch ${amt.toFixed(2)} € → ${credits} Credits (Demo)`,
    createdAt: new Date().toISOString(),
  })
  commit(next)
  return next
}

export function exchangeCreditsToEur(credits: number): CreditsState | null {
  const next = structuredClone(get())
  const amt = Math.max(0, Math.round(credits))
  if (next.balance < amt) return null
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
  simulateReferralSignup()
  return earnCredits(40, 'Referral-Bonus (Demo)')
}

/** Demo checkout — credits appear, no Stripe/PayPal charge. */
export function purchaseCreditPack(id: CreditPackId): CreditsState | null {
  const pack = CREDIT_PACKS.find((p) => p.id === id)
  if (!pack) return null
  const next = structuredClone(get())
  next.balance += pack.credits
  next.txs.unshift({
    id: uid('cr'),
    type: 'purchase',
    amount: pack.credits,
    label: `Pack ${pack.labelDe} · ${pack.credits} Credits · ${pack.priceLabel} (Demo-Checkout, kein Stripe/PayPal)`,
    createdAt: new Date().toISOString(),
  })
  commit(next)
  return next
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
  commit(next)
  return true
}

export function hasTravelDeepScan(): boolean {
  return get().travelScanDay === todayKey()
}

export function buyBoost(kind: CreditSpendKind): CreditsState | null {
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
]

export const CREDITS_COSTS: Record<CreditSpendKind, { credits: number; label: string }> = {
  featured: { credits: 40, label: 'Listing boosten (7 Tage Demo)' },
  extra_swipes: { credits: 25, label: `+${EXTRA_SWIPES_PACK} Extra-Swipes (heute)` },
  travel_scan: { credits: 15, label: 'Reise: beste Preise Deep-Scan (heute)' },
  social_boost: { credits: 20, label: 'Social-Post featured (Demo)' },
  interview_slot: { credits: 30, label: 'Priority-Interview-Slot (Demo)' },
  booking: { credits: 25, label: 'Reise-Buchung (Demo-Pauschale)' },
  unlock_message: { credits: 5, label: 'Nachricht freischalten (Demo)' },
  demo_gig: { credits: 20, label: 'Demo-Gig buchen' },
}

export const CREDITS_FREE_DE = [
  'Assist fragen',
  `Match browsen + ${FREE_SWIPES_PER_DAY} Swipes / Tag`,
  'Chat (Match / Booking / Support)',
  'Wallet ansehen',
  'Social lesen',
]

export const CREDITS_FREE_EN = [
  'Ask Assist',
  `Browse Match + ${FREE_SWIPES_PER_DAY} swipes / day`,
  'Chat (match / booking / support)',
  'View Wallet',
  'Read social',
]

export const CREDITS_DISCLAIMER_DE =
  'Orbit Credits sind eine Demo-In-App-Währung. Pack-Kauf ist ein Stub — kein Stripe/PayPal, kein echter Fiat-Transfer, bis Payments + KYC live sind. Kern-Entdeckung bleibt kostenlos.'

export const CREDITS_DISCLAIMER_EN =
  'Orbit Credits are a demo in-app currency. Pack purchase is a stub — no Stripe/PayPal, no real fiat until payments + KYC are live. Core discovery stays free.'
