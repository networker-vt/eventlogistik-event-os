import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Briefcase,
  Building2,
  Camera,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  Plane,
  Scan,
  Share2,
  Shield,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'
import { TileGrid, type HubTile } from '../components/ui/TileGrid'
import { useI18n } from '../lib/i18n'
import { isKidsMode, kidsHidePublicChat, kidsHideTravel, kidsHideWallet } from '../lib/kids'

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

  const tiles: HubTile[] = [
    ...(!kidsHideTravel()
      ? [{ to: '/abflug', label: t('travel.nav'), icon: Plane, tone: 'sky' as const }]
      : []),
    ...(!kids
      ? [
          { to: '/crew', label: t('nav.crew'), icon: Users, tone: 'amber' as const },
          { to: '/firma', label: t('firma.nav'), icon: Building2, tone: 'slate' as const },
          { to: '/social', label: t('nav.social'), icon: Sparkles, tone: 'violet' as const },
        ]
      : []),
    ...(!kidsHideWallet()
      ? [{ to: '/wallet', label: t('nav.wallet'), icon: Wallet, tone: 'teal' as const }]
      : []),
    { to: '/campus', label: t('campus.nav'), icon: GraduationCap, tone: 'indigo' },
    { to: '/kids', label: t('kids.title'), icon: Shield, tone: 'orange' },
    { to: '/entdecker', label: t('tile.entdecker'), icon: Camera, tone: 'lime', demo: true },
    { to: '/kabine', label: t('look.nav'), icon: Scan, tone: 'rose' },
    { to: '/channels', label: t('channels.nav'), icon: Share2, tone: 'violet' },
    { to: '/prefs', label: t('match.tweakPrefs'), icon: SlidersHorizontal, tone: 'amber' },
    { to: '/mein', label: t('nav.mein'), icon: UserRound, tone: 'indigo' },
    ...(!kidsHidePublicChat()
      ? [{ to: '/social/chat', label: t('nav.inbox'), icon: MessageSquare, tone: 'teal' as const }]
      : []),
    ...(!kids ? [{ to: '/listings/new', label: t('nav.create'), icon: Briefcase, tone: 'slate' as const }] : []),
    { to: '/ideen', label: t('mehr.ideas'), icon: Lightbulb, tone: 'orange' },
    ...(!kidsHideWallet()
      ? [{ to: '/empfehlen', label: t('mehr.refer'), icon: Share2, tone: 'sky' as const }]
      : []),
  ]

  return (
    <div className="space-y-6 pb-scroll-chrome">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t('mehr.title')}</h1>
        <p className="text-sm text-muted">{t('mehr.lead')}</p>
      </header>

      <TileGrid tiles={tiles} label={t('mehr.tiles')} />

      <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted" aria-label={t('mehr.legal')}>
        <Link to="/impressum" className="hover:text-ink">
          {t('footer.impressum')}
        </Link>
        <Link to="/datenschutz" className="hover:text-ink">
          {t('footer.privacy')}
        </Link>
        <Link to="/agb" className="hover:text-ink">
          {t('footer.terms')}
        </Link>
      </nav>
    </div>
  )
}
