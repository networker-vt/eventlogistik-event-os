/**
 * Orbit Credits — in-app currency.
 * Earn via referral; spend on featured listings, unlock messages, demo gigs.
 * Indicative EUR exchange is mock until payment providers go live.
 */
import { getReferral, spendFeaturedCredits, simulateReferralSignup } from './referral'
import { getWallet, mockAdjustBalance } from './wallet'
import { uid } from './utils'

const KEY = 'orbit_credits_v1'
const EVT = 'orbit-credits-changed'

/** Indicative: 10 Credits ≈ 1 EUR (demo only). */
export const CREDITS_PER_EUR = 10

export type CreditSpendKind = 'featured' | 'unlock_message' | 'demo_gig'

export interface CreditTx {
  id: string
  type: 'earn' | 'spend' | 'exchange_in' | 'exchange_out'
  amount: number
  label: string
  kind?: CreditSpendKind
  createdAt: string
}

export interface CreditsState {
  balance: number
  txs: CreditTx[]
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
  }
}

function load(): CreditsState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as CreditsState
    if (typeof parsed.balance !== 'number') return defaultState()
    return parsed
  } catch {
    return defaultState()
  }
}

let cache: CreditsState | null = null
function get(): CreditsState {
  if (!cache) cache = load()
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
  // keep referral featuredCredits roughly in sync for Empfehlen UI
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
  return earnCredits(25, 'Referral-Bonus (Demo)')
}

export const CREDITS_COSTS: Record<CreditSpendKind, { credits: number; label: string }> = {
  featured: { credits: 40, label: 'Featured Listing (7 Tage Demo)' },
  unlock_message: { credits: 5, label: 'Nachricht freischalten (Demo)' },
  demo_gig: { credits: 20, label: 'Demo-Gig buchen' },
}

export const CREDITS_DISCLAIMER_DE =
  'Orbit Credits sind eine Demo-In-App-Währung. Umtauschkurse zu EUR sind indikativ. Es findet kein echter Fiat-Transfer statt, bis Stripe/PayPal/Banking-Partner + KYC live sind.'
