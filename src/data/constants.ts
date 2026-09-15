export const CITIES = [
  'Berlin',
  'Hamburg',
  'München',
  'Köln',
  'Frankfurt',
  'Amsterdam',
  'London',
  'Paris',
  'Warsaw',
  'Wien',
  'Zürich',
  'Madrid',
  'Remote',
] as const

export const CRAFTS = [
  'Lichttechnik',
  'Tontechnik',
  'Rigging',
  'Video / LED',
  'Stage / Bühne',
  'Strom / Generator',
  'Dekoration',
  'Catering Support',
  'Security',
  'Kameratechnik',
  'Pyrotechnik',
  'Logistik / Fahrer',
  'Medienserver',
  'FOH / Systemtech',
] as const

export const VERTICAL_META: Record<
  string,
  { label: string; labelPlural: string; emoji: string; path: string }
> = {
  freelancer: { label: 'Freelancer', labelPlural: 'Freelancer', emoji: '👷', path: '/freelancer' },
  company: { label: 'Firma', labelPlural: 'Firmen', emoji: '🏢', path: '/firmen' },
  material: { label: 'Material', labelPlural: 'Material', emoji: '🎛️', path: '/material' },
  transporter: { label: 'Transporter', labelPlural: 'Transporter', emoji: '🚛', path: '/transporter' },
  courier: { label: 'Kurier', labelPlural: 'Kuriere', emoji: '🏍️', path: '/kuriere' },
  hotel: { label: 'Hotel', labelPlural: 'Hotels', emoji: '🏨', path: '/hotels' },
  job: { label: 'Job', labelPlural: 'Jobs', emoji: '💼', path: '/jobs' },
}

export const ROLE_LABELS: Record<string, string> = {
  freelancer: 'Freelancer',
  company: 'Technikfirma',
  hotel: 'Hotel',
  transporter: 'Transporter',
  courier: 'Kurierdienst',
  material: 'Materialanbieter',
  agency: 'Eventagentur',
  admin: 'Admin',
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  inquiry: 'Anfrage',
  offer: 'Angebot',
  accepted: 'Angenommen',
  booked: 'Gebucht',
  completed: 'Abgeschlossen',
  cancelled: 'Storniert',
}

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  done: 'Abgeschlossen',
}

export type TravelCoverKey = 'included' | 'per_km' | 'self' | 'tbd'
export type OvernightCoverKey = 'provided' | 'hotel' | 'none' | 'tbd'
export type ExpensesCoverKey = 'receipts' | 'flat' | 'included' | 'none' | 'tbd'

export const TRAVEL_OPTIONS: Record<TravelCoverKey, string> = {
  included: 'Anfahrt gestellt / inkl.',
  per_km: 'Anfahrt nach km',
  self: 'Anfahrt selbst',
  tbd: 'Anfahrt nach Absprache',
}

export const OVERNIGHT_OPTIONS: Record<OvernightCoverKey, string> = {
  provided: 'Übernachtung gestellt',
  hotel: 'Hotel buchbar / gestellt',
  none: 'Keine Übernachtung',
  tbd: 'Übernachtung nach Absprache',
}

export const EXPENSES_OPTIONS: Record<ExpensesCoverKey, string> = {
  receipts: 'Spesen nach Beleg',
  flat: 'Spesenpauschale',
  included: 'Spesen inkl. im Tagessatz',
  none: 'Keine Spesen',
  tbd: 'Spesen nach Absprache',
}

/** DE 2026 Orientierung — keine Garantie, 10h-Tag */
export const MARKET_RATE = {
  fachkraftFrom: 400,
  fachkraftTo: 500,
  specialistFrom: 600,
  specialistTo: 800,
  dayHours: 10,
  short: '400–800 € Orientierung (10h-Tag)',
  full:
    'Marktwert-Orientierung DE 2026 (10h-Tag): Fachkraft ca. 400–500 € · Spezialist (FOH, grandMA, Medienserver) ca. 600–800 € · Corporate oft über Club. Keine Garantie — nur Orientierung, Markt schwankt.',
}
