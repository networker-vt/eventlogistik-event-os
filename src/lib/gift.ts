/**
 * Gift / sponsoring — peer transfer of Orbit Credits (demo).
 * No new mint. Recipient is a listing, company or profile on this device.
 */
import { giftCredits } from './credits'
import { store } from './store'
import { uid } from './utils'

const KEY = 'orbit_gifts_v1'
const EVT = 'orbit-gifts-changed'

export type GiftKind = 'listing' | 'company' | 'profile'

export interface GiftTarget {
  kind: GiftKind
  id: string
  label: string
  hint?: string
  to?: string
}

export interface GiftRecord {
  id: string
  target: GiftTarget
  amount: number
  message: string
  createdAt: string
}

function loadHistory(): GiftRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as GiftRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

let historyCache: GiftRecord[] | null = null
function history(): GiftRecord[] {
  if (!historyCache) historyCache = loadHistory()
  return historyCache
}
function commitHistory(next: GiftRecord[]) {
  historyCache = next
  localStorage.setItem(KEY, JSON.stringify(next.slice(0, 40)))
  window.dispatchEvent(new CustomEvent(EVT))
}

export function listGifts(): GiftRecord[] {
  return structuredClone(history())
}

export function subscribeGifts(cb: () => void) {
  const h = () => cb()
  window.addEventListener(EVT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(EVT, h)
    window.removeEventListener('storage', h)
  }
}

export function listGiftRecipients(): GiftTarget[] {
  const out: GiftTarget[] = []
  const seen = new Set<string>()
  const push = (t: GiftTarget) => {
    const key = `${t.kind}:${t.id}`
    if (seen.has(key)) return
    seen.add(key)
    out.push(t)
  }

  for (const l of store.listListings({}).filter((x) => x.status === 'active').slice(0, 24)) {
    push({
      kind: 'listing',
      id: l.id,
      label: l.title,
      hint: [l.ownerName, l.city].filter(Boolean).join(' · '),
      to: `/listings/${l.id}`,
    })
    if (l.ownerName) {
      push({
        kind: 'company',
        id: `co-${l.ownerId}`,
        label: l.ownerName,
        hint: l.city,
        to: `/listings/${l.id}`,
      })
    }
  }

  for (const p of store.listProfiles()) {
    if (p.role === 'admin') continue
    if (p.companyName) {
      push({
        kind: 'company',
        id: p.id,
        label: p.companyName,
        hint: [p.name, p.city].filter(Boolean).join(' · '),
        to: `/profiles/${p.id}`,
      })
    }
    push({
      kind: 'profile',
      id: p.id,
      label: p.name,
      hint: [p.role, p.city].filter(Boolean).join(' · '),
      to: `/profiles/${p.id}`,
    })
  }
  return out.slice(0, 48)
}

export function findGiftTarget(kind: string, id: string, labelFallback?: string): GiftTarget | null {
  const list = listGiftRecipients()
  const hit = list.find((t) => t.kind === kind && t.id === id)
  if (hit) return hit
  if (!id) return null
  const kindSafe: GiftKind = kind === 'company' || kind === 'listing' || kind === 'profile' ? kind : 'profile'
  return {
    kind: kindSafe,
    id,
    label: labelFallback || id,
  }
}

export function giftWalletHref(target: GiftTarget) {
  const p = new URLSearchParams()
  p.set('gift', `${target.kind}:${target.id}`)
  p.set('label', target.label)
  return `/wallet?${p.toString()}#gift`
}

export function sendGift(input: {
  target: GiftTarget
  amount: number
  message?: string
}): GiftRecord | null {
  const amt = Math.max(0, Math.round(input.amount))
  if (amt <= 0) return null
  const msg = (input.message || '').trim()
  const label = msg
    ? `Sponsoring ${input.target.label}: ${msg}`
    : `Sponsoring ${input.target.label}`
  const next = giftCredits(amt, label)
  if (!next) return null
  const rec: GiftRecord = {
    id: uid('gift'),
    target: input.target,
    amount: amt,
    message: msg,
    createdAt: new Date().toISOString(),
  }
  commitHistory([rec, ...history()])
  return rec
}
