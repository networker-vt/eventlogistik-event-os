import { useEffect, type ComponentType } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Briefcase,
  Cable,
  Camera,
  FileText,
  Gift,
  GraduationCap,
  Library,
  Lightbulb,
  MessageSquare,
  Plus,
  Scale,
  Sparkles,
  Star,
  Video,
  Wallet,
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
      subtitle: 'Match-Tools ohne Katalog-Spam',
      accent: 'border-[var(--theme-accent)]/35 bg-[var(--theme-accent)]/5',
      links: [
        { to: '/foto', label: t('photo.title'), hint: 'Kamera · Demo-Vision', icon: Camera },
        { to: '/interview', label: t('interview.title'), hint: 'Chat · Slot · Video-Stub', icon: Video },
        { to: '/erfahrungen', label: t('reviews.title'), hint: 'Sterne + Kurztext', icon: Star },
        { to: '/listings/new?vertical=job', label: t('nav.create'), hint: 'Job posten', icon: Plus },
        { to: '/quellen', label: 'Quellen', hint: 'LinkedIn, StepStone… Stubs', icon: Cable },
        { to: '/jobs', label: 'Jobs Liste', hint: 'Klassische Liste', icon: Briefcase },
      ],
    },
    {
      id: 'ideen',
      title: 'Ideen & Credits',
      subtitle: 'Feedback, Referral, Wallet',
      accent: 'border-violet-500/35 bg-violet-500/5',
      links: [
        { to: '/ideen', label: 'Ideen-Box', hint: 'Feedback an den Operator', icon: Lightbulb },
        { to: '/empfehlen', label: 'Empfehlen', hint: 'Referral-Bonus zum Teilen', icon: Gift },
        { to: '/wallet', label: 'Wallet & Credits', hint: 'Demo-Ledger', icon: Wallet },
        { to: '/messages', label: t('nav.inbox'), icon: MessageSquare },
      ],
    },
    {
      id: 'wissen',
      title: 'Wissen',
      subtitle: 'Medien & Fortbildung',
      accent: 'border-amber-500/35 bg-amber-500/5',
      links: [
        { to: '/wissen/medien', label: 'Medien', icon: BookOpen },
        { to: '/wissen/fortbildung', label: 'Fortbildung', icon: GraduationCap },
      ],
    },
    {
      id: 'sektor-event',
      title: t('mehr.event'),
      subtitle: t('mehr.eventHint'),
      accent: 'border-border bg-surface-2/40',
      links: [
        { to: '/katalog/firmen', label: 'Katalog Firmen (DE Event)', hint: 'Nicht primär — Archiv', icon: Library },
        { to: '/katalog/locations', label: 'Locations', icon: Library },
        { to: '/freelancer', label: 'Freelancer VT', icon: Briefcase },
        { to: '/material', label: 'Material / Gear', icon: Briefcase },
        { to: '/transporter', label: 'Transporter', icon: Briefcase },
        { to: '/innovation', label: 'Innovation', hint: 'KI · XR · LED', icon: Sparkles },
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
          <div className="grid gap-2 sm:grid-cols-2">
            {section.links.map((link) => (
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
        </section>
      ))}
    </div>
  )
}
