import { Hash, MessageCircle, Plane, Briefcase, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { useI18n } from '../lib/i18n'

const CHANNELS = [
  {
    id: 'general',
    title: 'Orbit General',
    hint: 'Alles-App, Ankündigungen, Hilfe',
    icon: Hash,
    to: '/',
  },
  {
    id: 'match',
    title: 'Jobs & Match',
    hint: 'Suchen, anbieten, Mutuals',
    icon: Briefcase,
    to: '/match',
  },
  {
    id: 'reise',
    title: 'Reise',
    hint: 'Flüge, Hotels, Trips — Demo',
    icon: Plane,
    to: '/abflug',
  },
  {
    id: 'firma',
    title: 'Firma / B2B',
    hint: 'Partner, Hiring, Angebote',
    icon: Building2,
    to: '/firma',
  },
  {
    id: 'social',
    title: 'Social',
    hint: 'Leute treffen, leichte Posts',
    icon: MessageCircle,
    to: '/social',
  },
] as const

export function ChannelsPage() {
  const { t } = useI18n()
  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-scroll-chrome">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-cyan">Community</p>
        <h1 className="text-2xl font-bold tracking-tight">Channels</h1>
        <p className="text-sm text-muted">
          Link-Stubs — connected-Flag only. {t('channels.flagOnly')}
        </p>
      </header>

      <ul className="space-y-2">
        {CHANNELS.map((ch) => (
          <li key={ch.id}>
            <Link
              to={ch.to}
              className="card-hover flex min-h-12 items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-[var(--theme-accent)]">
                <ch.icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink">{ch.title}</span>
                  <Badge tone="amber">Stub</Badge>
                </span>
                <span className="block text-[11px] text-muted">{ch.hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
