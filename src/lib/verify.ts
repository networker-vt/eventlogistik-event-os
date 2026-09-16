/**
 * Soft verify: email → phone (required to offer) → ID/business (required before payout).
 * Demo stubs — no real SMS, no KYC vendor.
 */
import type { VerificationLevel } from '../types'

const KEY = 'orbit_verify_v1'
const EVT = 'orbit-verify-changed'

export type VerifyStep = 'email' | 'phone' | 'id' | 'business'

export interface VerifyState {
  email: boolean
  phone: boolean
  phoneValue?: string
  id: boolean
  business: boolean
  updatedAt?: string
}

function defaultState(): VerifyState {
  return { email: false, phone: false, id: false, business: false }
}

function load(): VerifyState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...(JSON.parse(raw) as Partial<VerifyState>) }
  } catch {
    return defaultState()
  }
}

let cache: VerifyState | null = null
function get(): VerifyState {
  if (!cache) cache = load()
  return cache
}
function commit(next: VerifyState) {
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
}

export function subscribeVerify(cb: () => void) {
  const h = () => cb()
  window.addEventListener(EVT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(EVT, h)
    window.removeEventListener('storage', h)
  }
}

export function getVerify(): VerifyState {
  return { ...get() }
}

export function markEmailVerified() {
  const next = { ...get(), email: true, updatedAt: new Date().toISOString() }
  commit(next)
  return next
}

/** SMS stub — stores a local flag, no carrier. */
export function stubVerifyPhone(phone: string) {
  const cleaned = phone.replace(/\s+/g, '')
  if (cleaned.replace(/\D/g, '').length < 6) return get()
  const next = {
    ...get(),
    email: true,
    phone: true,
    phoneValue: cleaned,
    updatedAt: new Date().toISOString(),
  }
  commit(next)
  return next
}

/** ID upload stub — filename only. */
export function stubVerifyId() {
  const next = { ...get(), email: true, phone: get().phone, id: true, updatedAt: new Date().toISOString() }
  commit(next)
  return next
}

export function stubVerifyBusiness() {
  const next = {
    ...get(),
    email: true,
    phone: get().phone,
    id: true,
    business: true,
    updatedAt: new Date().toISOString(),
  }
  commit(next)
  return next
}

export function canOffer(): boolean {
  const s = get()
  return s.email && s.phone
}

export function canPayout(): boolean {
  const s = get()
  return s.id || s.business
}

export function verifyLevel(): VerificationLevel {
  const s = get()
  if (s.business) return 'business'
  if (s.id) return 'id'
  if (s.email) return 'email'
  return 'none'
}

export function nextVerifyStep(): VerifyStep | null {
  const s = get()
  if (!s.email) return 'email'
  if (!s.phone) return 'phone'
  if (!s.id && !s.business) return 'id'
  return null
}

export function __resetVerifyForTests() {
  cache = null
  localStorage.removeItem(KEY)
}
