import { clsx, type ClassValue } from 'clsx'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`
}

export function formatPrice(amount?: number, unit?: string) {
  if (amount == null) return 'Preis auf Anfrage'
  const formatted = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: amount < 10 ? 2 : 0,
  }).format(amount)
  return unit ? `${formatted} / ${unit}` : formatted
}

export function formatDate(iso?: string) {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), 'dd.MM.yyyy', { locale: de })
  } catch {
    return iso
  }
}

export function formatDateTime(iso?: string) {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), 'dd.MM.yyyy HH:mm', { locale: de })
  } catch {
    return iso
  }
}

export function verificationLabel(level: string) {
  switch (level) {
    case 'business':
      return 'Business verifiziert'
    case 'id':
      return 'ID verifiziert'
    case 'email':
      return 'E-Mail verifiziert'
    default:
      return 'Nicht verifiziert'
  }
}
