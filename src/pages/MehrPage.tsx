import { useEffect, type ComponentType } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Building2,
  Camera,
  FileText,
  Gift,
  Hash,
  Lightbulb,
  Plane,
  Plus,
  Scale,
  Sparkles,
  Star,
  Store,
  UserRound,
  Users,
  Video,
  Wallet,
  Cable,
} from 'lucide-react'
import { useI18n } from '../lib/i18n'

type HubLink = {
  to: string
  label: string
  hint?: string
  icon: ComponentType<{ size?: number; className?: string }>
}

type HubSection = {
  id: string
  title: string
  subtitle: string
  accent: string
  links: HubLink[]
}

export function MehrPage() {
  const { t } = useI18n()
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const id = hash.replace(/^#/, '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  const sections: HubSection[] = [
    {
      id: 'entdecken',
      title: 'Entdecken',
      subtitle: 'Everything App — ohne Katalog-Spam',
      accent: 'border-[var(--theme-accent)]/35 bg-[var(--theme-accent)]/5',
      links: [
        { to: '/look', label: t('look.nav'), hint: t('look.hint'), icon: Sparkles },
        { to: '/firma', label: t('firma.nav'), hint: t('firma.hint'), icon: Building2 },
        { to: '/marktplatz', label: t('market.nav'), hint: t('market.hint'), icon: Store },
        { to: '/reise', label: t('travel.nav'), hint: t('travel.lead'), icon: Plane },
        { to: '/social', label: t('social.title'), hint: t('social.kicker'), icon: Users },
        { to: '/channels', label: t('channels.nav'), hint: t('channels.hint'), icon: Hash },
        { to: '/mein', label: t('nav.mein'), hint: t('mein.lead'), icon: UserRound },
        { to: '/listings/new', label: t('nav.create'), hint: t('create.lead'), icon: Plus },
        { to: '/foto', label: t('photo.title'), hint: 'Kamera · Demo-Vision', icon: Camera },
        { to: '/interview', label: t('interview.title'), hint: 'Chat · Slot · Video-Stub', icon: Video },
        { to: '/erfahrungen', label: t('reviews.title'), hint: 'Sterne + Kurztext', icon: Star },
        { to: '/quellen', label: 'Quellen', hint: 'LinkedIn, StepStone… Stubs', icon: Cable },
      ],
    },
    {
      id: 'ideen',
      title: 'Ideen & Credits',
      subtitle: 'Feedback, Referral, Wallet · Cap 21M',
      accent: 'border-violet-500/35 bg-violet-500/5',
      links: [
        { to: '/ideen', label: 'Ideen-Box', hint: 'Feedback an den Operator', icon: Lightbulb },
        { to: '/empfehlen', label: 'Empfehlen', hint: 'Referral aus dem Rewards-Pool', icon: Gift },
        { to: '/wallet', label: 'Wallet & Credits', hint: '21M Cap · Demo-Ledger', icon: Wallet },
      ],
    },
    {
      id: 'legal',
      title: 'Legal',
      subtitle: 'Impressum Mirco Küßner · Datenschutz · AGB',
      accent: 'border-border bg-surface-2/60',
      links: [
        { to: '/impressum', label: t('footer.impressum'), icon: FileText },
        { to: '/datenschutz', label: t('footer.privacy'), icon: Scale },
        { to: '/agb', label: t('footer.terms'), icon: FileText },
      ],
    },
  ]

  return (
    <div className="space-y-6 pb-scroll-chrome">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t('mehr.title')}</h1>
        <p className="text-sm text-muted">{t('mehr.lead')}</p>
      </header>

      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className={`scroll-mt-20 rounded-2xl border p-4 md:p-5 ${section.accent}`}
        >
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            <p className="text-xs text-neutral-400">{section.subtitle}</p>
          </div>
          <HubLinkGrid links={section.links} />
        </section>
      ))}
    </div>
  )
}

function HubLinkGrid({ links }: { links: HubLink[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {links.map((link) => (
        <Link
          key={link.to + link.label}
          to={link.to}
          className="card-hover flex min-h-12 items-center gap-3 rounded-xl border border-border/80 bg-black/25 px-3 py-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-[var(--theme-accent)]">
            <link.icon size={18} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-white">{link.label}</span>
            {link.hint && <span className="block truncate text-[11px] text-muted">{link.hint}</span>}
          </span>
        </Link>
      ))}
    </div>
  )
}
