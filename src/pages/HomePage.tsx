import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Mic, Send, Sparkles } from 'lucide-react'
import { WorldRow } from '../components/listings/WorldRow'
import { Button } from '../components/ui/Button'
import { SpeakButton } from '../components/a11y/SpeakButton'
import { useListings, useStoreVersion } from '../hooks/useStore'
import { useAuth } from '../lib/auth'
import {
  buildAssistPlan,
  clearPlan,
  getLastPlan,
  listingsForPlan,
  subscribeAssist,
  togglePlanStep,
  type AssistPlan,
} from '../lib/assist'
import { addLocalCalendarItem } from '../lib/calendar'
import { getCompany, subscribeCompany } from '../lib/company'
import { isCompanySide, getPrefs, subscribePrefs } from '../lib/prefs'
import { rankForCompanyWorld, rankForWorld, subscribeBehavior } from '../lib/behavior'
import { getCredits, subscribeCredits } from '../lib/credits'
import { useI18n } from '../lib/i18n'
import { canListen, listenOnce } from '../lib/speech'
import { cn } from '../lib/utils'

export function HomePage() {
  useStoreVersion()
  const { t, resolved } = useI18n()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState(getPrefs)
  const [company, setCompany] = useState(getCompany)
  const [behaviorTick, setBehaviorTick] = useState(0)
  const [credits, setCredits] = useState(getCredits)
  const [plan, setPlan] = useState<AssistPlan | null>(getLastPlan)
  const [ask, setAsk] = useState('')
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const companyView = isCompanySide(prefs.side) && prefs.side !== 'both'
  const { listings: raw } = useListings(companyView ? {} : { vertical: 'job', kind: 'offer' })

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

  const world = useMemo(() => {
    if (companyView) return rankForCompanyWorld(raw, prefs).slice(0, 4)
    return rankForWorld(raw, prefs).filter((l) => l.vertical === 'job').slice(0, 4)
  }, [raw, prefs, behaviorTick, companyView])

  const first = companyView && company.firmName ? company.firmName : user?.name.split(' ')[0]
  const greeting = first ? `${t('home.hello')}, ${first}.` : `${t('home.hello')}.`
  const askLine = companyView ? t('assist.askCompany') : t('assist.ask')
  const secondaryTo = prefs.completed ? '/match' : '/prefs'
  const secondaryLabel = prefs.completed ? t('home.ctaMatch') : t('home.ctaPrefs')
  const speak = `${greeting} ${askLine}`

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

  return (
    <div className="mx-auto max-w-lg space-y-10 pb-scroll-chrome pt-6 md:pt-12">
      <header className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">Orbit</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-[2rem]">{greeting}</h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{askLine}</p>
          </div>
          <SpeakButton compact text={speak} />
        </div>

        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            void submitAsk(ask)
          }}
        >
          <label className="block">
            <span className="sr-only">{t('assist.placeholder')}</span>
            <textarea
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              rows={3}
              placeholder={companyView ? t('assist.phCompany') : t('assist.placeholder')}
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
                  'tap-target flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-3',
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

        <Button className="w-full" variant="secondary" size="lg" onClick={() => navigate(secondaryTo)}>
          {secondaryLabel} <ArrowRight size={18} />
        </Button>
      </header>

      {plan && (
        <section className="space-y-4" aria-labelledby="assist-plan">
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
            {plan.steps.map((s, i) => (
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
                    {s.hint && <p className="mt-0.5 text-xs text-muted">{s.hint}</p>}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {s.actionTo && (
                        <Link to={s.actionTo} className="text-xs text-[var(--theme-accent)] hover:underline">
                          {s.actionLabel} →
                        </Link>
                      )}
                      {s.remindable && (
                        <button
                          type="button"
                          className="text-xs text-neutral-400 hover:text-white"
                          onClick={() =>
                            addLocalCalendarItem({
                              title: `Orbit: ${s.title}`,
                              startIso: plan.intent.dateIso
                                ? `${plan.intent.dateIso}T09:00:00`
                                : new Date(Date.now() + 3600000).toISOString(),
                              location: plan.intent.city,
                              kind: 'reminder',
                            })
                          }
                        >
                          {t('assist.remind')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="rounded-2xl border border-[var(--theme-accent)]/25 bg-[var(--theme-accent)]/5 p-3">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles size={14} className="text-[var(--theme-accent)]" /> {t('assist.tips')}
            </h3>
            <ul className="space-y-2">
              {plan.tips.map((tip) => (
                <li key={tip.title}>
                  <p className="text-sm font-medium text-white">{tip.title}</p>
                  <p className="text-xs text-muted">{tip.body}</p>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-neutral-500">
              {plan.source === 'llm' ? t('assist.llm') : t('assist.demoResearch')}
            </p>
          </div>

          {matches.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">{t('assist.matches')}</h3>
              <ul className="space-y-2">
                {matches.map((l) => (
                  <li key={l.id}>
                    <WorldRow listing={l} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {!plan && (
        <section className="space-y-4" aria-labelledby="world-heading">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="world-heading" className="text-base font-semibold text-white">
              {t('home.world')}
            </h2>
            <Link to="/match" className="text-sm text-[var(--theme-accent)] hover:underline">
              {t('home.toMatch')}
            </Link>
          </div>
          {world.length === 0 ? (
            <p className="text-sm text-muted">
              {t('home.worldEmpty')}{' '}
              <button
                type="button"
                className="text-[var(--theme-accent)] hover:underline"
                onClick={() => navigate('/mein')}
              >
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
      )}

      <p className="text-xs text-muted">
        <Link to="/wallet" className="hover:text-[var(--theme-accent)]">
          {credits.balance} Credits
        </Link>
        <span className="text-neutral-600"> · {t('home.creditsDemo')}</span>
      </p>
    </div>
  )
}
