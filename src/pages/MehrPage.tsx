import { useEffect, type ComponentType } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GraduationCap, Shield } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { isKidsMode, kidsHidePublicChat, kidsHideTravel, kidsHideWallet } from '../lib/kids'

type QuietLink = {
  to: string
  label: string
  hint?: string
}

export function MehrPage() {
  const { t } = useI18n()
  const { hash } = useLocation()
  const kids = isKidsMode()
  useEffect(() => {
    if (!hash) return
    const id = hash.replace(/^#/, '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  const tiles: { to: string; label: string; hint: string; icon: ComponentType<{ size?: number }> }[] = [
    { to: '/campus', label: t('campus.nav'), hint: t('campus.lead'), icon: GraduationCap },
    { to: '/kids', label: t('kids.title'), hint: t('kids.lead'), icon: Shield },
  ]

  const rest: QuietLink[] = [
    { to: '/kabine', label: t('look.nav'), hint: t('look.hint') },
    { to: '/firma', label: t('firma.nav'), hint: t('firma.hint') },
    { to: '/marktplatz', label: t('market.nav'), hint: t('market.hint') },
    ...(!kidsHideTravel() ? [{ to: '/abflug', label: t('travel.nav'), hint: t('travel.lead') }] : []),
    ...(!kids ? [{ to: '/social', label: t('social.title'), hint: t('social.kicker') }] : []),
    { to: '/channels', label: t('channels.nav'), hint: t('channels.hint') },
    { to: '/mein', label: t('nav.mein'), hint: t('mein.lead') },
    ...(!kids ? [{ to: '/listings/new', label: t('nav.create'), hint: t('create.lead') }] : []),
    { to: '/ideen', label: t('mehr.ideas'), hint: t('mehr.ideasHint') },
    ...(!kidsHideWallet()
      ? [
          { to: '/empfehlen', label: t('mehr.refer'), hint: t('mehr.referHint') },
          { to: '/wallet', label: t('nav.wallet'), hint: t('mehr.walletHint') },
        ]
      : []),
    ...(!kidsHidePublicChat() ? [{ to: '/messages', label: t('nav.inbox'), hint: t('mehr.chatHint') }] : []),
    { to: '/impressum', label: t('footer.impressum') },
    { to: '/datenschutz', label: t('footer.privacy') },
    { to: '/agb', label: t('footer.terms') },
  ]

  return (
    <div className="space-y-6 pb-scroll-chrome">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t('mehr.title')}</h1>
        <p className="text-sm text-muted">{t('mehr.leadQuiet')}</p>
      </header>

      <section aria-label={t('mehr.quietTiles')} data-mehr-quiet-tiles="2">
        <ul className="grid gap-2 sm:grid-cols-2">
          {tiles.map((tile) => (
            <li key={tile.to}>
              <Link
                to={tile.to}
                className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-surface-2/60 px-3 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-ink-soft">
                  <tile.icon size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{tile.label}</span>
                  <span className="block truncate text-[11px] text-muted">{tile.hint}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ul className="divide-y divide-border/70">
        {rest.map((item) => (
          <li key={item.to + item.label}>
            <Link
              to={item.to}
              className="flex items-baseline justify-between gap-3 py-2.5 text-sm text-ink-soft hover:text-ink"
            >
              <span>{item.label}</span>
              {item.hint && <span className="min-w-0 truncate text-[11px] text-muted">{item.hint}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
