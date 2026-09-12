export const CITIES = [
  'Berlin',
  'Hamburg',
  'München',
  'Köln',
  'Frankfurt',
  'Stuttgart',
  'Düsseldorf',
  'Leipzig',
  'Hannover',
  'Dortmund',
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
