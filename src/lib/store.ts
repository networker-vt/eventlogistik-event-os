import {
  seedBookings,
  seedListings,
  seedMessages,
  seedProfiles,
  seedProjects,
  seedThreads,
} from '../data/seed'
import type {
  Booking,
  BookingStatus,
  Listing,
  ListingFilters,
  Message,
  Profile,
  Project,
  Thread,
} from '../types'
import { uid } from './utils'

const KEY = 'el_store_v2'

interface StoreData {
  listings: Listing[]
  bookings: Booking[]
  threads: Thread[]
  messages: Message[]
  projects: Project[]
  profiles: Profile[]
}

function defaultData(): StoreData {
  return {
    listings: [...seedListings],
    bookings: [...seedBookings],
    threads: [...seedThreads],
    messages: [...seedMessages],
    projects: [...seedProjects],
    profiles: [...seedProfiles],
  }
}

function load(): StoreData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultData()
    const parsed = JSON.parse(raw) as StoreData
    if (!parsed.listings?.length) return defaultData()
    return parsed
  } catch {
    return defaultData()
  }
}

function save(data: StoreData) {
  localStorage.setItem(KEY, JSON.stringify(data))
  window.dispatchEvent(new CustomEvent('el-store-changed'))
}

let cache: StoreData | null = null

function getData(): StoreData {
  if (!cache) cache = load()
  return cache
}

function mutate(fn: (data: StoreData) => void) {
  const data = structuredClone(getData())
  fn(data)
  cache = data
  save(data)
  return data
}

export function resetStore() {
  cache = defaultData()
  save(cache)
}

export function subscribeStore(cb: () => void) {
  const handler = () => cb()
  window.addEventListener('el-store-changed', handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener('el-store-changed', handler)
    window.removeEventListener('storage', handler)
  }
}

/** Repository interface — later swap implementation for Supabase */
export const store = {
  listListings(filters: ListingFilters = {}): Listing[] {
    let items = getData().listings.filter((l) => l.status === 'active')
    if (filters.vertical && filters.vertical !== 'all') {
      items = items.filter((l) => l.vertical === filters.vertical)
    }
    if (filters.kind && filters.kind !== 'all') {
      items = items.filter((l) => l.kind === filters.kind)
    }
    if (filters.city) {
      items = items.filter((l) => l.city === filters.city)
    }
    if (filters.craft) {
      items = items.filter((l) => l.crafts.includes(filters.craft!))
    }
    if (filters.priceMax != null) {
      items = items.filter(
        (l) => l.priceFrom == null || l.priceFrom <= filters.priceMax!,
      )
    }
    if (filters.priceMin != null) {
      items = items.filter(
        (l) => (l.priceFrom ?? l.priceTo ?? 0) >= filters.priceMin!,
      )
    }
    if (filters.dateFrom) {
      items = items.filter(
        (l) => !l.dateTo || l.dateTo >= filters.dateFrom! || !l.dateFrom || l.dateFrom >= filters.dateFrom!,
      )
    }
    if (filters.q) {
      const q = filters.q.toLowerCase()
      items = items.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)) ||
          l.ownerName.toLowerCase().includes(q),
      )
    }
    return items.sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1))
  },

  getListing(id: string): Listing | undefined {
    return getData().listings.find((l) => l.id === id)
  },

  createListing(listing: Omit<Listing, 'id' | 'createdAt' | 'status'>): Listing {
    const item: Listing = {
      ...listing,
      id: uid('lst'),
      createdAt: new Date().toISOString(),
      status: 'active',
    }
    mutate((d) => {
      d.listings.unshift(item)
    })
    return item
  },

  getProfile(id: string): Profile | undefined {
    return getData().profiles.find((p) => p.id === id)
  },

  upsertProfile(profile: Profile) {
    mutate((d) => {
      const i = d.profiles.findIndex((p) => p.id === profile.id)
      if (i >= 0) d.profiles[i] = profile
      else d.profiles.push(profile)
    })
  },

  listBookingsForUser(userId: string): Booking[] {
    return getData()
      .bookings.filter((b) => b.requesterId === userId || b.providerId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },

  getBooking(id: string): Booking | undefined {
    return getData().bookings.find((b) => b.id === id)
  },

  createInquiry(input: {
    listing: Listing
    requesterId: string
    requesterName: string
    note: string
    projectId?: string
  }): { booking: Booking; thread: Thread } {
    const threadId = uid('thr')
    const bookingId = uid('bk')
    const now = new Date().toISOString()
    const thread: Thread = {
      id: threadId,
      listingId: input.listing.id,
      listingTitle: input.listing.title,
      participantIds: [input.requesterId, input.listing.ownerId],
      participantNames: [input.requesterName, input.listing.ownerName],
      lastMessage: input.note,
      updatedAt: now,
    }
    const booking: Booking = {
      id: bookingId,
      listingId: input.listing.id,
      listingTitle: input.listing.title,
      vertical: input.listing.vertical,
      requesterId: input.requesterId,
      providerId: input.listing.ownerId,
      requesterName: input.requesterName,
      providerName: input.listing.ownerName,
      status: 'inquiry',
      note: input.note,
      projectId: input.projectId,
      threadId,
      dateFrom: input.listing.dateFrom,
      dateTo: input.listing.dateTo,
      createdAt: now,
      updatedAt: now,
    }
    const msg: Message = {
      id: uid('msg'),
      threadId,
      senderId: input.requesterId,
      senderName: input.requesterName,
      body: input.note,
      createdAt: now,
      read: false,
    }
    mutate((d) => {
      d.threads.unshift(thread)
      d.bookings.unshift(booking)
      d.messages.push(msg)
      if (input.projectId) {
        const pr = d.projects.find((p) => p.id === input.projectId)
        if (pr) {
          pr.resources.push({
            bookingId,
            vertical: input.listing.vertical,
            label: `${input.listing.ownerName} — ${input.listing.title}`,
            status: 'inquiry',
          })
        }
      }
    })
    return { booking, thread }
  },

  updateBookingStatus(
    id: string,
    status: BookingStatus,
    extra?: { offerAmount?: number; note?: string },
  ): Booking | undefined {
    let updated: Booking | undefined
    mutate((d) => {
      const b = d.bookings.find((x) => x.id === id)
      if (!b) return
      b.status = status
      b.updatedAt = new Date().toISOString()
      if (extra?.offerAmount != null) b.offerAmount = extra.offerAmount
      if (extra?.note) b.note = extra.note
      updated = b
      d.projects.forEach((p) => {
        p.resources.forEach((r) => {
          if (r.bookingId === id) r.status = status
        })
      })
    })
    return updated
  },

  listThreads(userId: string): Thread[] {
    return getData()
      .threads.filter((t) => t.participantIds.includes(userId))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },

  getThread(id: string): Thread | undefined {
    return getData().threads.find((t) => t.id === id)
  },

  listMessages(threadId: string): Message[] {
    return getData()
      .messages.filter((m) => m.threadId === threadId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  },

  sendMessage(input: {
    threadId: string
    senderId: string
    senderName: string
    body: string
  }): Message {
    const now = new Date().toISOString()
    const msg: Message = {
      id: uid('msg'),
      threadId: input.threadId,
      senderId: input.senderId,
      senderName: input.senderName,
      body: input.body,
      createdAt: now,
      read: false,
    }
    mutate((d) => {
      d.messages.push(msg)
      const t = d.threads.find((x) => x.id === input.threadId)
      if (t) {
        t.lastMessage = input.body
        t.updatedAt = now
      }
    })
    return msg
  },

  listProjects(ownerId: string): Project[] {
    return getData()
      .projects.filter((p) => p.ownerId === ownerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  getProject(id: string): Project | undefined {
    return getData().projects.find((p) => p.id === id)
  },

  createProject(
    input: Omit<Project, 'id' | 'createdAt' | 'resources' | 'status'>,
  ): Project {
    const project: Project = {
      ...input,
      id: uid('prj'),
      resources: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
    }
    mutate((d) => {
      d.projects.unshift(project)
    })
    return project
  },

  attachBookingToProject(projectId: string, booking: Booking) {
    mutate((d) => {
      const p = d.projects.find((x) => x.id === projectId)
      const b = d.bookings.find((x) => x.id === booking.id)
      if (!p || !b) return
      b.projectId = projectId
      if (!p.resources.some((r) => r.bookingId === booking.id)) {
        p.resources.push({
          bookingId: booking.id,
          vertical: booking.vertical,
          label: `${booking.providerName} — ${booking.listingTitle}`,
          status: booking.status,
        })
      }
      if (p.status === 'draft') p.status = 'active'
    })
  },

  stats() {
    const d = getData()
    return {
      offers: d.listings.filter((l) => l.kind === 'offer' && l.status === 'active').length,
      requests: d.listings.filter((l) => l.kind === 'request' && l.status === 'active').length,
      bookings: d.bookings.length,
      projects: d.projects.length,
    }
  },
}

export type Store = typeof store
