/** Public business catalog types — GDPR-safe, impressum-style fields only. */

export type DataClass = 'public_business' | 'editorial' | 'demo_fictional'

export type CatalogKind = 'company' | 'venue' | 'transporter' | 'platform' | 'vehicle'

export interface CatalogCompany {
  id: string
  name: string
  city: string
  street?: string
  plz?: string
  phone?: string
  email?: string
  website?: string
  dryHireUrl?: string
  source: string
  dataClass: 'public_business'
  category: 'event_tech' | 'rental' | 'av' | 'staging' | 'other'
}

export interface CatalogVenue {
  id: string
  name: string
  city: string
  street?: string
  plz?: string
  phone?: string
  email?: string
  website?: string
  type: 'messe' | 'arena' | 'halle' | 'kultur' | 'stadion' | 'other'
  source: string
  dataClass: 'public_business'
}

export interface CatalogTransporter {
  id: string
  name: string
  city: string
  street?: string
  plz?: string
  phone?: string
  email?: string
  website?: string
  vehicleSizeIds?: string[]
  coverage?: string
  source: string
  dataClass: 'public_business'
}

export interface VehicleSize {
  id: string
  label: string
  shortLabel: string
  /** Approximate cargo volume m³ */
  volumeM3Hint?: string
  /** Approximate payload */
  payloadHint?: string
  withDriver?: boolean | 'optional'
  notes?: string
}

export interface CatalogPlatform {
  id: string
  name: string
  url: string
  blurbDe: string
  tags: string[]
}

export const CATALOG_DISCLAIMER_DE =
  'Öffentliche Firmendaten · Angaben ohne Gewähr · Korrekturen: info@loadin.event (Betreiber) oder über das jeweilige Impressum der Firma.'
