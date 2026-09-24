import { LEGAL } from './legal'
import { uid } from './utils'
import { isSupabaseConfigured, supabase } from './supabase'

const KEY = 'orbit_reports_v1'

export const REPORT_REASONS = [
  { id: 'illegal', de: 'Rechtswidriger Inhalt', en: 'Illegal content' },
  { id: 'scam', de: 'Betrug', en: 'Scam' },
  { id: 'hate', de: 'Hass oder Belästigung', en: 'Hate or harassment' },
  { id: 'ip', de: 'Urheber- oder Markenrecht', en: 'Copyright or trademark' },
  { id: 'minor', de: 'Minderjährige betroffen', en: 'Involves a minor' },
  { id: 'spam', de: 'Spam', en: 'Spam' },
  { id: 'other', de: 'Sonstiges', en: 'Other' },
] as const

export type ReportReason = (typeof REPORT_REASONS)[number]['id']
export type ReportTargetKind = 'listing' | 'profile' | 'message'

export interface ContentReportInput {
  targetKind: ReportTargetKind
  targetId: string
  reason: ReportReason | ''
  description: string
  name?: string
  email?: string
  truthful: boolean
}

export interface ContentReport extends ContentReportInput {
  id: string
  createdAt: string
  reason: ReportReason
  stored: 'local' | 'local+supabase'
}

export function validateReport(input: ContentReportInput): string | null {
  if (!input.reason) return 'Bitte einen Grund wählen.'
  if (input.description.trim().length < 8) return 'Bitte kurz beschreiben, was nicht stimmt (mindestens ein Satz).'
  if (!input.truthful) return 'Bitte bestätigen, dass deine Angaben stimmen.'
  const email = input.email?.trim()
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Die E-Mail sieht nicht gültig aus.'
  if (!input.targetId.trim() || !input.targetKind) return 'Es fehlt, was gemeldet wird.'
  return null
}

function readAll(): ContentReport[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as ContentReport[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function listContentReports(): ContentReport[] {
  return readAll()
}

export async function submitContentReport(input: ContentReportInput): Promise<ContentReport> {
  const error = validateReport(input)
  if (error) throw new Error(error)
  const report: ContentReport = {
    ...input,
    reason: input.reason as ReportReason,
    name: input.name?.trim() || undefined,
    email: input.email?.trim() || undefined,
    description: input.description.trim(),
    id: uid('rpt'),
    createdAt: new Date().toISOString(),
    stored: 'local',
  }
  const next = [report, ...readAll()].slice(0, 200)
  localStorage.setItem(KEY, JSON.stringify(next))
  if (isSupabaseConfigured && supabase) {
    const { error: dbError } = await supabase.from('content_reports').insert({
      id: report.id,
      target_kind: report.targetKind,
      target_id: report.targetId,
      reason: report.reason,
      description: report.description,
      name: report.name ?? null,
      email: report.email ?? null,
      created_at: report.createdAt,
    })
    if (!dbError) report.stored = 'local+supabase'
  }
  return report
}

/** Prefilled operator mail so a report arrives even without Supabase. */
export function reportMailto(report: Pick<ContentReport, 'targetKind' | 'targetId' | 'reason' | 'description' | 'name' | 'email'>): string {
  const reasonLabel = REPORT_REASONS.find((item) => item.id === report.reason)?.de ?? report.reason
  const subject = `Inhalt melden: ${reasonLabel}`
  const body = [
    `Art: ${report.targetKind}`,
    `ID: ${report.targetId}`,
    `Grund: ${reasonLabel}`,
    `Beschreibung: ${report.description}`,
    report.name?.trim() ? `Name: ${report.name.trim()}` : '',
    report.email?.trim() ? `E-Mail: ${report.email.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n')
  return `mailto:${LEGAL.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function __resetReportsForTests() {
  localStorage.removeItem(KEY)
}
