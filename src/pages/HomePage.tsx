import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { WorldRow } from '../components/listings/WorldRow'
import { Button } from '../components/ui/Button'
import { SpeakButton } from '../components/a11y/SpeakButton'
import { useListings } from '../hooks/useStore'
import { useAuth } from '../lib/auth'
import { getPrefs, subscribePrefs } from '../lib/prefs'
import { rankForWorld, subscribeBehavior } from '../lib/behavior'
import { getCredits, subscribeCredits } from '../lib/credits'
import { useI18n } from '../lib/i18n'

export function HomePage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState(getPrefs)
  const [behaviorTick, setBehaviorTick] = useState(0)
  const [credits, setCredits] = useState(getCredits)
  const { listings: raw } = useListings({ vertical: 'job', kind: 'offer' })

  useEffect(() => {
    const u1 = subscribePrefs(() => setPrefs(getPrefs()))
    const u2 = subscribeBehavior(() => setBehaviorTick((n) => n + 1))
    const u3 = subscribeCredits(() => setCredits(getCredits()))
    return () => {
      u1()
      u2()
      u3()
    }
  }, [])

  const world = useMemo(
    () => rankForWorld(raw, prefs).filter((l) => l.vertical === 'job').slice(0, 4),
    [raw, prefs, behaviorTick],
  )

  const first = user?.name.split(' ')[0]
  const greeting = first ? `${t('home.hello')}, ${first}.` : `${t('home.hello')}.`
  const primaryTo = prefs.completed ? '/match' : '/prefs'
  const primaryLabel = prefs.completed ? t('home.ctaMatch') : t('home.ctaPrefs')
  const speak = `${greeting} ${t('home.sub')} ${primaryLabel}.`

  return (
    <div className="mx-auto max-w-lg space-y-12 pb-scroll-chrome pt-6 md:pt-12">
      <header className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">Orbit</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-[2rem]">{greeting}</h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{t('home.sub')}</p>
          </div>
          <SpeakButton compact text={speak} />
        </div>

        <Button className="w-full" size="lg" onClick={() => navigate(primaryTo)}>
          {primaryLabel} <ArrowRight size={18} />
        </Button>
      </header>

      <section className="space-y-4" aria-labelledby="world-heading">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="world-heading" className="text-base font-semibold text-white">
            {t('home.world')}
          </h2>
          <Link
            to="/match"
            className="text-sm text-[var(--theme-accent)] hover:underline"
          >
            {t('home.toMatch')}
          </Link>
        </div>
        {world.length === 0 ? (
          <p className="text-sm text-muted">
            {t('home.worldEmpty')}{' '}
            <button type="button" className="text-[var(--theme-accent)] hover:underline" onClick={() => navigate('/mein')}>
              {t('nav.mein')}
            </button>
          </p>
        ) : (
          <ul className="space-y-2">
            {world.map((l) => (
              <li key={l.id}>
                <WorldRow listing={l} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-muted">
        <Link to="/wallet" className="hover:text-[var(--theme-accent)]">
          {credits.balance} Credits
        </Link>
        <span className="text-neutral-600"> · {t('home.creditsDemo')}</span>
      </p>
    </div>
  )
}
