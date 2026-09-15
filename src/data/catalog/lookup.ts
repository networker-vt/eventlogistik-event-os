import { catalogCompanies } from './companies'
import { catalogPlatforms } from './platforms'
import { catalogTransporters } from './transporters'
import { catalogVenues } from './venues'
import { vehicleSizes } from './vehicleSizes'
import type { CatalogKind } from './types'

export const CATALOG_KIND_LABEL: Record<CatalogKind, string> = {
  company: 'Firma',
  venue: 'Location',
  transporter: 'Transporteur',
  platform: 'Plattform',
  vehicle: 'Fahrzeuggröße',
}

export function catalogSectionPath(_kind: CatalogKind): string {
  return '/marktplatz'
}

export interface CatalogLookup {
  id: string
  kind: CatalogKind
  name: string
  city?: string
  hint?: string
}

export function resolveCatalogEntry(kind: CatalogKind, id: string): CatalogLookup | undefined {
  if (kind === 'company') {
    const c = catalogCompanies.find((x) => x.id === id)
    return c ? { id: c.id, kind, name: c.name, city: c.city, hint: c.category } : undefined
  }
  if (kind === 'venue') {
    const c = catalogVenues.find((x) => x.id === id)
    return c ? { id: c.id, kind, name: c.name, city: c.city, hint: c.type } : undefined
  }
  if (kind === 'transporter') {
    const c = catalogTransporters.find((x) => x.id === id)
    return c ? { id: c.id, kind, name: c.name, city: c.city, hint: c.coverage } : undefined
  }
  if (kind === 'platform') {
    const c = catalogPlatforms.find((x) => x.id === id)
    return c ? { id: c.id, kind, name: c.name, hint: c.blurbDe } : undefined
  }
  const c = vehicleSizes.find((x) => x.id === id)
  return c ? { id: c.id, kind, name: c.label, hint: c.shortLabel } : undefined
}
