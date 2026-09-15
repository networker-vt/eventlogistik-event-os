import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Mic, Send } from 'lucide-react'
import { WorldRow } from '../components/listings/WorldRow'
import { FuerDichCard } from '../components/home/FuerDichCard'
import { TravelCard } from '../components/travel/TravelCard'
import { LaneBadge } from '../components/credits/LaneBadge'
import { Button } from '../components/ui/Button'
import { Empty } from '../components/ui/Empty'
import { useListings, useStoreVersion } from '../hooks/useStore'
import { useAuth } from '../lib/auth'
import {
  buildAssistPlan,
  clearPlan,
  getLastPlan,
  listingsForPlan,
  subscribeAssist,
  togglePlanStep,
  travelForPlan,
  type AssistPlan,
} from '../lib/assist'
import { getCompany, subscribeCompany } from '../lib/company'
import { isCompanySide, getPrefs, savePrefs, subscribePrefs } from '../lib/prefs'
import { subscribeBehavior } from '../lib/behavior'
import { rankFuerDich } from '../lib/fuerDich'
import { formatSupplyLine, getCredits, getSignupIdentity, subscribeCredits } from '../lib/credits'
import { useI18n } from '../lib/i18n'
import { canListen, listenOnce } from '../lib/speech'
import { cn } from '../lib/utils'

type WarmChip = 'seek' | 'offer' | 'think'

export function HomePage() {
  useStoreVersion()
  const { t, resolved } = useI18n()
  const { user } = useAuth()
  const navigate = useNavigate()
  const askRef = useRef<HTMLTextAreaElement>(null)
  const [prefs, setPrefs] = useState(getPrefs)
  const [company, setCompany] = useState(getCompany)
  const [behaviorTick, setBehaviorTick] = useState(0)
  const [credits, setCredits] = useState(getCredits)
  const [plan, setPlan] = useState<AssistPlan | null>(getLastPlan)
  const [ask, setAsk] = useState('')
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const [warm, setWarm] = useState<WarmChip>('seek')
  const companyView = isCompanySide(prefs.side) && prefs.side !== 'both'
  const { listings: raw } = useListings({})

  useEffect(() => {
    const u1 = subscribePrefs(() => setPrefs(getPrefs()))
    const u2 = subscribeBehavior(() => setBehaviorTick((n) => n + 1))
    const u3 = subscribeCredits(() => setCredits(getCredits()))
    const u4 = subscribeCompany(() => setCompany(getCompany()))
    const u5 = subscribeAssist(() => setPlan(getLastPlan()))
    return () => {
      u1()
      u2()
      u3()
      u4()
      u5()
    }
  }, [])

  const fuerDich = useMemo(
    () => rankFuerDich(raw, prefs, resolved, 8),
    [raw, prefs, behaviorTick, resolved],
  )

  const first = companyView && company.firmName ? company.firmName : user?.name.split(' ')[0]
  const greeting = first ? `${t('home.hello')}, ${first}.` : `${t('home.hello')}.`
  const matchTo = prefs.completed ? '/match' : '/prefs'
  const matchLabel = prefs.completed ? t('home.ctaMatch') : t('home.ctaPrefs')
  const stems: Record<WarmChip, string> = {
    seek: t('home.stemSeek'),
    offer: t('home.stemOffer'),
    think: t('home.stemThink'),
  }
  const placeholder =
    warm === 'offer'
      ? t('home.phOffer')
      : warm === 'think'
        ? t('home.phThink')
        : companyView
          ? t('assist.phCompany')
          : t('home.phSeek')

  const pickWarm = (id: WarmChip) => {
    setWarm(id)
    if (id === 'seek' && prefs.side !== 'seeker') savePrefs({ side: 'seeker' })
    if (id === 'offer' && prefs.side !== 'employer') savePrefs({ side: 'employer' })
    if (id === 'think' && prefs.side !== 'both') savePrefs({ side: 'both' })
    setAsk((prev) => {
      const trimmed = prev.trim()
      const wasStem = (Object.values(stems) as string[]).some(
        (s) => !trimmed || trimmed === s.trim() || prev === s,
      )
      return wasStem ? stems[id] : prev
    })
    window.requestAnimationFrame(() => {
      const el = askRef.current
      if (!el) return
      el.focus()
      const len = el.value.length
      el.setSelectionRange(len, len)
    })
  }

  const submitAsk = async (text: string) => {
    const q = text.trim()
    if (!q || busy) return
    setBusy(true)
    try {
      const next = await buildAssistPlan(q, resolved)
      setPlan(next)
      setAsk('')
    } finally {
      setBusy(false)
    }
  }

  const onMic = async () => {
    if (!canListen() || listening) return
    setListening(true)
    const said = await listenOnce(resolved === 'de' ? 'de-DE' : 'en-GB')
    setListening(false)
    if (said) {
      setAsk(said)
      await submitAsk(said)
    }
  }

  const matches = plan ? listingsForPlan(plan) : []
  const travelHits = plan ? travelForPlan(plan) : []

  const warmChips: { id: WarmChip; label: string }[] = [
    { id: 'seek', label: t('home.warmSeek') },
    { id: 'offer', label: t('home.warmOffer') },
    { id: 'think', label: t('home.warmThink') },
  ]

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-scroll-chrome pt-6 md:pt-12">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Orbit</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-[2rem]">{greeting}</h1>
        </div>

        <nav aria-label={t('home.chipsAria')} className="flex flex-wrap gap-2">
          {warmChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => pickWarm(chip.id)}
              className={cn(
                'rounded-full border px-3.5 py-2 text-sm',
                warm === chip.id
                  ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/15 text-white'
                  : 'border-border text-neutral-300 hover:text-white',
              )}
            >
              {chip.label}
            </button>
          ))}
        </nav>
        <p className="max-w-sm text-sm leading-relaxed text-muted">{t('home.value')}</p>

        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            void submitAsk(ask)
          }}
        >
          <label className="block">
            <span className="sr-only">{placeholder}</span>
            <textarea
              ref={askRef}
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              rows={2}
              placeholder={placeholder}
              className="w-full resize-none rounded-2xl border border-border bg-surface-2 px-3 py-3 text-base text-white placeholder:text-neutral-600 outline-none focus:border-cyan/50"
            />
          </label>
          <div className="flex items-center gap-2">
            {canListen() && (
              <button
                type="button"
                onClick={() => void onMic()}
                aria-label={t('assist.voice')}
                className={cn(
                  'tap-target flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-3 text-neutral-400',
                  listening && 'border-[var(--theme-accent)] text-[var(--theme-accent)]',
                )}
              >
                <Mic size={18} />
              </button>
            )}
            <Button type="submit" className="flex-1" disabled={busy || !ask.trim()}>
              {busy ? t('assist.thinking') : t('assist.submit')} <Send size={16} />
            </Button>
          </div>
        </form>
      </header>

      {plan && (
        <section className="space-y-3" aria-labelledby="assist-plan">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--theme-accent)]">
                {t('assist.planKicker')}
              </p>
              <h2 id="assist-plan" className="text-base font-semibold text-white">
                {plan.summary}
              </h2>
            </div>
            <button type="button" className="text-xs text-muted hover:underline" onClick={() => clearPlan()}>
              {t('assist.clear')}
            </button>
          </div>
          <ol className="space-y-2">
            {plan.steps.slice(0, 3).map((s, i) => (
              <li
                key={s.id}
                className={cn(
                  'rounded-2xl border border-border/80 bg-surface-2/50 px-3 py-3',
                  s.done && 'opacity-60',
                )}
              >
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => togglePlanStep(s.id)}
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-[11px]"
                    aria-pressed={s.done}
                  >
                    {s.done ? '✓' : i + 1}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{s.title}</p>
                    {s.actionTo && (
                      <Link to={s.actionTo} className="mt-1 inline-block text-xs text-[var(--theme-accent)] hover:underline">
                        {s.actionLabel} →
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          {travelHits.length > 0 && (
            <ul className="space-y-2">
              {travelHits.slice(0, 2).map((o) => (
                <li key={o.id}>
                  <TravelCard offer={o} cheapest={o.cheapest} compact />
                </li>
              ))}
            </ul>
          )}
          {matches.length > 0 && (
            <ul className="space-y-2">
              {matches.slice(0, 2).map((l) => (
                <li key={l.id}>
                  <WorldRow listing={l} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/8 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--theme-accent)]">
          {t('home.swipeKicker')}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">
          {prefs.completed ? t('home.swipePrompt') : t('home.ctaPrefs')}
        </h2>
        <Button className="mt-3 w-full" size="lg" onClick={() => navigate(matchTo)}>
          {matchLabel} <ArrowRight size={18} />
        </Button>
      </section>

      <section className="space-y-2" aria-labelledby="fuer-dich">
        <div>
          <h2 id="fuer-dich" className="text-base font-semibold text-white">
            {t('home.fuerDich')}
          </h2>
          <p className="mt-0.5 text-[11px] text-muted">{t('home.fuerDichHint')}</p>
        </div>
        {fuerDich.length === 0 ? (
          <Empty
            emoji="✨"
            title={t('home.dealsEmpty')}
            hint={t('home.dealsEmptyHint')}
            actionLabel={matchLabel}
            onAction={() => navigate(matchTo)}
            className="py-6"
          />
        ) : (
          <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:thin]">
            <ul className="flex snap-x snap-mandatory gap-2">
              {fuerDich.map((item) => (
                <li key={item.id}>
                  <FuerDichCard item={item} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <Link to="/wallet" className="inline-flex items-center gap-2 hover:text-[var(--theme-accent)]">
          <span className="tabular-nums text-white">{credits.balance} Credits</span>
          <LaneBadge lane="credits" />
        </Link>
        <span className="tabular-nums text-neutral-400">{formatSupplyLine()}</span>
        {getSignupIdentity()?.earlyTester && (
          <span className="text-amber-200/80">Early Tester #{getSignupIdentity()?.ordinal}</span>
        )}
        <span className="text-neutral-600">· {t('home.creditsPeek')}</span>
      </p>
    </div>
  )
}
