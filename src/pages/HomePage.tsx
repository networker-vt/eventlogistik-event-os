import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Camera,
  Heart,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from 'lucide-react'
import { ListingCard } from '../components/listings/ListingCard'
import { Button } from '../components/ui/Button'
import { SpeakButton } from '../components/a11y/SpeakButton'
import { useListings } from '../hooks/useStore'
import { useAuth } from '../lib/auth'
import { store } from '../lib/store'
import { getPrefs, subscribePrefs } from '../lib/prefs'
import { rankForWorld, subscribeBehavior } from '../lib/behavior'
import { getRewardFlags, subscribeRewards } from '../lib/rewards'
import { getCredits, subscribeCredits } from '../lib/credits'
import { useI18n } from '../lib/i18n'

export function HomePage() {
  const { t } = useI18n()
  const { user, loginDemo } = useAuth()
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState(getPrefs)
  const [flags, setFlags] = useState(getRewardFlags)
  const [behaviorTick, setBehaviorTick] = useState(0)
  const [credits, setCredits] = useState(getCredits)
  const { listings: raw } = useListings({ vertical: 'job', kind: 'offer' })

  useEffect(() => {
    const u1 = subscribePrefs(() => setPrefs(getPrefs()))
    const u2 = subscribeBehavior(() => setBehaviorTick((n) => n + 1))
    const u3 = subscribeRewards(() => setFlags(getRewardFlags()))
    const u4 = subscribeCredits(() => setCredits(getCredits()))
    return () => {
      u1()
      u2()
      u3()
      u4()
    }
  }, [])

  const world = useMemo(
    () => rankForWorld(raw, prefs).filter((l) => l.vertical === 'job').slice(0, 8),
    [raw, prefs, behaviorTick],
  )
  const stats = useMemo(() => store.stats(), [raw])

  return (
    <div className="space-y-8 pb-scroll-chrome">
      {flags.welcome && (
        <aside className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--theme-accent)]/35 bg-[var(--theme-accent)]/10 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-white">{t('rewards.welcome')}</p>
            <p className="text-xs text-muted">{t('rewards.welcomeHint')}</p>
          </div>
          <Link to="/wallet" className="text-sm font-medium text-[var(--theme-accent)]">
            {credits.balance} Credits →
          </Link>
        </aside>
      )}

      <section className="relative overflow-hidden rounded-3xl border border-border surface-shine p-5 md:p-10 motion-fade-up">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[var(--theme-accent)]/20 blur-3xl motion-orb" />
        <div className="pointer-events-none absolute -bottom-16 left-6 h-44 w-44 rounded-full bg-[var(--theme-accent-2)]/15 blur-3xl motion-orb-delay" />

        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--theme-accent)]/35 bg-[var(--theme-accent)]/10 px-3 py-1 text-xs font-medium text-[var(--theme-accent)]">
          <Sparkles size={14} /> {t('home.kicker')}
        </p>
        <h1 className="max-w-2xl text-[1.75rem] font-bold leading-[1.15] tracking-tight md:text-4xl">
          {t('home.title')}{' '}
          <span className="text-shimmer">{t('home.titleAccent')}</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-300 md:text-base">{t('home.lead')}</p>
        <div className="mt-3">
          <SpeakButton text={`${t('home.title')} ${t('home.titleAccent')}. ${t('home.lead')}`} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate(prefs.completed ? '/match' : '/prefs')}
            className="group relative overflow-hidden rounded-2xl border border-[var(--theme-accent)]/45 bg-[var(--theme-accent)]/10 p-4 text-left transition hover:border-[var(--theme-accent)]"
          >
            <div className="mb-2 flex items-center gap-2 text-[var(--theme-accent)]">
              <Heart size={20} />
              <span className="text-xs font-semibold uppercase tracking-wider">{t('nav.match')}</span>
            </div>
            <div className="text-lg font-bold text-white">{t('home.matchOpen')}</div>
            <p className="mt-1 text-sm text-neutral-300">{t('home.matchHint')}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--theme-accent)]">
              {t('home.swipe')} <ArrowRight size={14} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/mein')}
            className="group relative overflow-hidden rounded-2xl border border-[var(--theme-accent-2)]/45 bg-[var(--theme-accent-2)]/10 p-4 text-left transition hover:border-[var(--theme-accent-2)]"
          >
            <div className="mb-2 flex items-center gap-2 text-[var(--theme-accent-2)]">
              <SlidersHorizontal size={20} />
              <span className="text-xs font-semibold uppercase tracking-wider">{t('nav.mein')}</span>
            </div>
            <div className="text-lg font-bold text-white">
              {prefs.completed ? t('home.prefsAdjust') : t('home.prefsSetup')}
            </div>
            <p className="mt-1 text-sm text-neutral-300">{t('home.prefsHint')}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--theme-accent-2)]">
              {t('nav.mein')} <ArrowRight size={14} />
            </span>
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {!user ? (
            <Button
              onClick={() => {
                loginDemo()
                navigate('/match')
              }}
            >
              {t('home.demo')}
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              {t('home.dashboard')}
            </Button>
          )}
          <Button variant="ghost" onClick={() => navigate('/foto')}>
            <Camera size={16} /> {t('home.photoJobs')}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/listings/new?vertical=job')}>
            {t('home.postJob')}
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: t('home.stats.jobs'), value: stats.offers },
            { label: t('home.stats.requests'), value: stats.requests },
            { label: t('home.stats.bookings'), value: stats.bookings },
            { label: 'Prefs', value: prefs.completed ? '✓' : '—' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border/80 bg-black/35 px-3 py-3 backdrop-blur-sm"
            >
              <div className="text-xl font-bold tabular-nums text-[var(--theme-accent)] md:text-2xl">{s.value}</div>
              <div className="text-[11px] text-muted md:text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{t('home.world')}</h2>
          <Link to="/match" className="text-sm font-medium text-[var(--theme-accent)] hover:underline">
            {t('home.toMatch')}
          </Link>
        </div>
        <p className="text-xs text-muted">{t('home.worldHint')}</p>
        <div className="stagger-in grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {world.map((l) => (
            <ListingCard key={l.id} listing={l} highlightRate />
          ))}
        </div>
        {world.length === 0 && (
          <p className="rounded-2xl border border-border bg-surface-2 p-6 text-center text-sm text-muted">
            {t('home.worldEmpty')}{' '}
            <button type="button" className="text-[var(--theme-accent)]" onClick={() => navigate('/mein')}>
              {t('home.loosen')}
            </button>
          </p>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          { icon: Zap, title: t('feat.prefs'), text: t('feat.prefsText') },
          { icon: Heart, title: t('feat.match'), text: t('feat.matchText') },
          { icon: ShieldCheck, title: t('feat.sources'), text: t('feat.sourcesText') },
        ].map((f) => (
          <div key={f.title} className="card-elevated rounded-2xl border border-border p-5">
            <f.icon className="mb-3 text-[var(--theme-accent)]" size={22} />
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
