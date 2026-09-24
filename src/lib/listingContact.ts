import { mailUrl, profileLinkHref, telUrl } from './links'
import type { Listing, ListingPublicContact, Profile, ProfileLinkInput } from '../types'
import { resolveSeller } from './seller'

export type ListingContactView = {
  phone?: string
  email?: string
  address?: string
  links?: ProfileLinkInput[]
  /** Mail, phone, or a profile link can be shown. A map pin alone does not count. */
  hasDirectContact: boolean
}

type ContactListing = Pick<Listing, 'sellerKind' | 'trader' | 'showContact' | 'publicContact'> &
  Partial<Pick<Listing, 'venue' | 'city'>>

function place(listing: { venue?: string; city?: string }): string | undefined {
  const value = [listing.venue, listing.city].filter(Boolean).join(', ')
  return value || undefined
}

function reachable(phone?: string, email?: string, links?: ProfileLinkInput[]): boolean {
  if (phone && telUrl(phone)) return true
  if (email && mailUrl(email)) return true
  return Boolean(links?.some((link) => profileLinkHref(link.kind, link.input)))
}

/**
 * Contact shown on a listing. Private account email and phone are never read here.
 * A private listing contributes a snapshot only after an explicit opt-in.
 */
export function listingContactView(listing: ContactListing): ListingContactView {
  const seller = resolveSeller(listing)
  if (seller.kind === 'commercial' && seller.trader) {
    return {
      phone: seller.trader.phone,
      email: seller.trader.email,
      address: seller.trader.address || place(listing),
      hasDirectContact: reachable(seller.trader.phone, seller.trader.email),
    }
  }
  if (listing.showContact === true && listing.publicContact) {
    const phone = listing.publicContact.phone?.trim() || undefined
    const email = listing.publicContact.email?.trim() || undefined
    const links = listing.publicContact.links?.filter((link) => link.input.trim())
    return {
      phone,
      email,
      address: place(listing),
      links: links?.length ? links : undefined,
      hasDirectContact: reachable(phone, email, links),
    }
  }
  return { hasDirectContact: false }
}

export type ContactOptInError = 'missing' | 'invalid'

export type ContactOptInResult =
  | { ok: true; showContact: false }
  | { ok: true; showContact: true; publicContact: ListingPublicContact }
  | { ok: false; error: ContactOptInError }

export type ContactOptInInput = {
  showContact: boolean
  reuseProfile: boolean
  email: string
  phone: string
  profile?: Pick<Profile, 'email' | 'phone' | 'profileLinks'> | null
}

function takeContact(email: string, phone: string, links?: ProfileLinkInput[]): ContactOptInResult {
  const emailTrim = email.trim()
  const phoneTrim = phone.trim()
  const keptLinks = (links ?? []).filter((link) => link.input.trim())
  if (!emailTrim && !phoneTrim && keptLinks.length === 0) return { ok: false, error: 'missing' }
  if (emailTrim && !mailUrl(emailTrim)) return { ok: false, error: 'invalid' }
  if (phoneTrim && !telUrl(phoneTrim)) return { ok: false, error: 'invalid' }
  if (keptLinks.some((link) => !profileLinkHref(link.kind, link.input))) {
    return { ok: false, error: 'invalid' }
  }
  const publicContact: ListingPublicContact = {}
  if (emailTrim) publicContact.email = emailTrim
  if (phoneTrim) publicContact.phone = phoneTrim
  if (keptLinks.length) {
    publicContact.links = keptLinks.map((link) => ({ kind: link.kind, input: link.input.trim() }))
  }
  return { ok: true, showContact: true, publicContact }
}

/** Builds the listing snapshot. Off by default, and never reads the account unless reuse is checked. */
export function publicContactFromOptIn(input: ContactOptInInput): ContactOptInResult {
  if (!input.showContact) return { ok: true, showContact: false }
  if (input.reuseProfile) {
    return takeContact(input.profile?.email ?? '', input.profile?.phone ?? '', input.profile?.profileLinks)
  }
  return takeContact(input.email, input.phone)
}
