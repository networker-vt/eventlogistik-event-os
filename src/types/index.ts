export type ListingKind = 'offer' | 'request'
export type Vertical =
  | 'freelancer'
  | 'company'
  | 'material'
  | 'transporter'
  | 'courier'
  | 'hotel'
  | 'job'

export type Role =
  | 'freelancer'
  | 'company'
  | 'hotel'
  | 'transporter'
  | 'courier'
  | 'material'
  | 'agency'
  | 'admin'

export type BookingStatus =
  | 'inquiry'
  | 'offer'
  | 'accepted'
  | 'booked'
  | 'completed'
  | 'cancelled'

export type VerificationLevel = 'none' | 'email' | 'id' | 'business'

export interface Profile {
  id: string
  name: string
  email: string
  role: Role
  city: string
  bio: string
  avatarUrl?: string
  crafts: string[]
  verified: VerificationLevel
  rating: number
  reviewCount: number
  phone?: string
  companyName?: string
  createdAt: string
}

export interface Listing {
  id: string
  kind: ListingKind
  vertical: Vertical
  title: string
  description: string
  city: string
  crafts: string[]
  priceFrom?: number
  priceTo?: number
  priceUnit?: string
  currency: 'EUR'
  dateFrom?: string
  dateTo?: string
  ownerId: string
  ownerName: string
  ownerVerified: VerificationLevel
  rating?: number
  tags: string[]
  capacity?: string
  imageEmoji: string
  featured?: boolean
  createdAt: string
  status: 'active' | 'filled' | 'archived'
}

export interface Message {
  id: string
  threadId: string
  senderId: string
  senderName: string
  body: string
  createdAt: string
  read: boolean
}

export interface Thread {
  id: string
  listingId?: string
  listingTitle?: string
  participantIds: string[]
  participantNames: string[]
  lastMessage?: string
  updatedAt: string
}

export interface Booking {
  id: string
  listingId: string
  listingTitle: string
  vertical: Vertical
  requesterId: string
  providerId: string
  requesterName: string
  providerName: string
  status: BookingStatus
  offerAmount?: number
  note?: string
  projectId?: string
  threadId?: string
  dateFrom?: string
  dateTo?: string
  createdAt: string
  updatedAt: string
}

export interface ProjectResource {
  bookingId: string
  vertical: Vertical
  label: string
  status: BookingStatus
}

export interface Project {
  id: string
  title: string
  city: string
  dateFrom: string
  dateTo: string
  ownerId: string
  description: string
  resources: ProjectResource[]
  status: 'draft' | 'active' | 'done'
  createdAt: string
}

export interface ListingFilters {
  q?: string
  city?: string
  craft?: string
  vertical?: Vertical | 'all'
  kind?: ListingKind | 'all'
  priceMax?: number
  dateFrom?: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
}
