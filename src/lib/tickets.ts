import type { TravelKind, TravelOffer } from './travel'
import { addLocalCalendarItem } from './calendar'
import { CREDITS_COSTS, getCredits, spendCredits } from './credits'
import { store } from './store'
import { uid } from './utils'
import { mockPayBooking, type WalletMethodId } from './wallet'

const KEY = 'orbit_tickets_v1'
const EVT = 'orbit-tickets-changed'

export type TicketKind = TravelKind | 'marketplace'
export type TicketPay = 'credits' | 'fiat'

export interface OrbitTicket {
  id: string
  kind: TicketKind
  title: string
  subtitle: string
  ref: string
  qr: string
  status: 'confirmed' | 'cancelled'
  paidWith: TicketPay
  priceEur: number
  whenIso: string
  location?: string
  threadId?: string
  offerId?: string
  createdAt: string
}

function load(): OrbitTicket[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as OrbitTicket[]) : []
  } catch {
    return []
  }
}

let cache: OrbitTicket[] | null = null
function get(): OrbitTicket[] {
  if (!cache) cache = load()
  return cache
}
function commit(next: OrbitTicket[]) {
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
}

export function subscribeTickets(cb: () => void) {
  const h = () => cb()
  window.addEventListener(EVT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(EVT, h)
    window.removeEventListener('storage', h)
  }
}

export function listTickets(): OrbitTicket[] {
  return [...get()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getTicket(id: string): OrbitTicket | undefined {
  return get().find((t) => t.id === id)
}

export function creditsNeeded(_priceEur?: number) {
  return CREDITS_COSTS.booking.credits
}

export async function bookTravelOffer(input: {
  offer: TravelOffer
  payerId: string
  payerName: string
  pay: TicketPay
  methodId?: WalletMethodId
}): Promise<{ ticket: OrbitTicket; ok: true } | { ok: false; reason: string }> {
  const offer = input.offer
  if (input.pay === 'credits') {
    const need = creditsNeeded(offer.priceEur)
    if (getCredits().balance < need) return { ok: false, reason: 'credits' }
    const spent = await spendCredits(need, 'booking', `Reise ${offer.title} (Demo)`)
    if (!spent) return { ok: false, reason: 'credits' }
  } else {
    mockPayBooking({
      amountEur: offer.priceEur,
      methodId: input.methodId || 'sepa',
      bookingId: offer.id,
      label: `Reise · ${offer.title} (Demo, kein Geld)`,
    })
  }

  const thread = store.createDirectThread({
    participantIds: [input.payerId, 'orbit-support'],
    participantNames: [input.payerName, 'Orbit Support'],
    listingTitle: offer.title,
    senderId: 'orbit-support',
    senderName: 'Orbit Support',
    body: `Buchung bestätigt (Demo). ${offer.provider} · ${offer.title}. Kein echtes Ticket, kein GDS.`,
    kind: 'booking',
  })

  const ticket: OrbitTicket = {
    id: uid('tkt'),
    kind: offer.kind,
    title: offer.title,
    subtitle: `${offer.provider} · ${offer.to}`,
    ref: `ORB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    qr: `ORBIT-DEMO-${Date.now().toString(36).toUpperCase()}`,
    status: 'confirmed',
    paidWith: input.pay,
    priceEur: offer.priceEur,
    whenIso: `${offer.dateFrom}T09:00:00`,
    location: offer.to,
    threadId: thread.id,
    offerId: offer.id,
    createdAt: new Date().toISOString(),
  }
  commit([ticket, ...get()])
  addLocalCalendarItem({
    title: `Orbit: ${offer.title}`,
    startIso: ticket.whenIso,
    location: offer.to,
    kind: 'plan',
  })
  return { ticket, ok: true }
}

export function cancelTicket(id: string) {
  commit(get().map((t) => (t.id === id ? { ...t, status: 'cancelled' as const } : t)))
}
