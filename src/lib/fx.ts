export type FxCode = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'USDT'

export const FX_CODES: FxCode[] = ['EUR', 'USD', 'GBP', 'CHF', 'USDT']

/** Indicative fallback (EUR base). Not a live quote. */
export const FX_FALLBACK: Record<FxCode, number> = {
  EUR: 1,
  USD: 1.09,
  GBP: 0.85,
  CHF: 0.94,
  USDT: 1.09,
}

const EVT = 'el-fx-changed'
const KEY = 'el_fx_cache_v1'

export interface FxSnapshot {
  base: 'EUR'
  rates: Record<FxCode, number>
  source: 'static' | 'frankfurter+static-usdt'
  fetchedAt: string
  indicative: true
}

function defaultSnap(): FxSnapshot {
  return {
    base: 'EUR',
    rates: { ...FX_FALLBACK },
    source: 'static',
    fetchedAt: new Date().toISOString(),
    indicative: true,
  }
}

let cache: FxSnapshot | null = null

export function getFx(): FxSnapshot {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as FxSnapshot
      if (parsed?.rates?.EUR === 1) {
        cache = parsed
        return parsed
      }
    }
  } catch {
    /* ignore */
  }
  cache = defaultSnap()
  return cache
}

export function subscribeFx(cb: () => void) {
  const h = () => cb()
  window.addEventListener(EVT, h)
  return () => window.removeEventListener(EVT, h)
}

export function convertFx(amountEur: number, to: FxCode, rates = getFx().rates) {
  return amountEur * (rates[to] ?? 1)
}

export async function refreshFx(): Promise<FxSnapshot> {
  const next = defaultSnap()
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,CHF')
    if (res.ok) {
      const data = (await res.json()) as { rates?: Record<string, number> }
      if (data.rates?.USD) next.rates.USD = data.rates.USD
      if (data.rates?.GBP) next.rates.GBP = data.rates.GBP
      if (data.rates?.CHF) next.rates.CHF = data.rates.CHF
      next.rates.USDT = next.rates.USD
      next.source = 'frankfurter+static-usdt'
      next.fetchedAt = new Date().toISOString()
    }
  } catch {
    /* keep static */
  }
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVT))
  return next
}

export function formatFx(amount: number, code: FxCode) {
  if (code === 'USDT') {
    return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(amount)} USDT`
  }
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 2,
  }).format(amount)
}
