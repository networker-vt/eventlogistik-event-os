import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mic, Send } from 'lucide-react'
import { TileGrid } from '../components/ui/TileGrid'
import { HOME_PRIMARY_COUNT, splitAdaptiveHome } from '../lib/hubTiles'
import { TripOptionCards } from '../components/assist/TripOptionCards'
import { OrbitRobot } from '../components/home/OrbitRobot'
import { OrbiPresence } from '../components/home/OrbiPresence'
import { Tageskarte } from '../components/home/Tageskarte'
import { Button } from '../components/ui/Button'
import { useAuth } from '../lib/auth'
import { buildAssistPlan, getLastPlan, subscribeAssist, type AssistPlan } from '../lib/assist'
import { getCompany, subscribeCompany } from '../lib/company'
import { isCompanySide, getPrefs, subscribePrefs } from '../lib/prefs'
import { getBehavior, subscribeBehavior } from '../lib/behavior'
import { subscribeChannels } from '../lib/channels'
import { NewsStrip } from '../components/home/NewsStrip'
import {
  ASSIST_PRO_BURNS,
  consumeAssistTurn,
  spendProAssist,
  type AssistProBurn,
} from '../lib/credits'
import { isDemo } from '../lib/flags'
import { getResume, subscribeResume } from '../lib/resume'
import { dueReminders, subscribeReminders, tapReminder } from '../lib/reminders'
import { rankHomeNews } from '../lib/homeSuggestions'
import { useI18n } from '../lib/i18n'
import { pickAdaptiveRobotAsk, robotAskCopy, type RobotAsk } from '../lib/robotAsk'
import { dismissOrbiTour, markOrbiIntroSeen, orbiIntroSeen, orbiTourOff } from '../lib/orbiPresence'
import { getWidgetTaps, subscribeWidgetTaps } from '../lib/widgetUsage'
import { canListen, listenOnce } from '../lib/speech'
import { matchSpokenTripChoice } from '../lib/trip'
import { pickTageskarte } from '../lib/tageskarte'
import { cn } from '../lib/utils'
import { isKidsMode, kidsHideTravel, kidsHideWallet, subscribeKids } from '../lib/kids'

export function HomePage() {
  const { t, resolved } = useI18n()
  const { user } = useAuth()
  const navigate = useNavigate()
  const askRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const pendingAsk = useRef('')
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [prefs, setPrefs] = useState(getPrefs)
  const [company, setCompany] = useState(getCompany)
  const [behaviorTick, setBehaviorTick] = useState(0)
  const [plan, setPlan] = useState<AssistPlan | null>(getLastPlan)
  const [ask, setAsk] = useState('')
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const [resume, setResume] = useState(getResume)
  const [reminders, setReminders] = useState(dueReminders)
  const [assistNote, setAssistNote] = useState<string | null>(null)
  const [proOpen, setProOpen] = useState(false)
  const [proShort, setProShort] = useState(false)
  const [robotTapped, setRobotTapped] = useState(false)
  const [robotAsk, setRobotAsk] = useState<RobotAsk | null>(null)
  const [orbiIntro, setOrbiIntro] = useState(() => !orbiIntroSeen())
  const [tourOn, setTourOn] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [tourOff, setTourOff] = useState(() => orbiTourOff())
  const [widgetTaps, setWidgetTaps] = useState(getWidgetTaps)
  const [secondaryOn, setSecondaryOn] = useState(false)
  const [kids, setKids] = useState(isKidsMode)
  const [tripVoicePick, setTripVoicePick] = useState<1 | 2 | 3 | null>(null)
  const companyView = isCompanySide(prefs.side) && prefs.side !== 'both'
  const daily = useMemo(() => pickTageskarte(new Date(), { kids }), [kids])
  const robotCopy = robotAsk ? robotAskCopy(robotAsk, resolved) : null
  const hideWallet = kidsHideWallet()

  useEffect(() => {
    const u1 = subscribePrefs(() => setPrefs(getPrefs()))
    const u2 = subscribeBehavior(() => setBehaviorTick((n) => n + 1))
    const u3 = subscribeCompany(() => setCompany(getCompany()))
    const u4 = subscribeAssist(() => setPlan(getLastPlan()))
    const u5 = subscribeChannels(() => setBehaviorTick((n) => n + 1))
    const u6 = subscribeResume(() => setResume(getResume()))
    const u7 = subscribeReminders(() => setReminders(dueReminders()))
    const u8 = subscribeKids(() => setKids(isKidsMode()))
    const u9 = subscribeWidgetTaps(() => setWidgetTaps(getWidgetTaps()))
    return () => {
      u1()
      u2()
      u3()
      u4()
      u5()
      u6()
      u7()
      u8()
      u9()
      abortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (secondaryOn) return
    const node = sentinelRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    let observer: IntersectionObserver | null = null
    const arm = () => {
      if (observer) return
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setSecondaryOn(true)
      })
      observer.observe(node)
    }
    window.addEventListener('scroll', arm, { passive: true })
    return () => {
      window.removeEventListener('scroll', arm)
      observer?.disconnect()
    }
  }, [secondaryOn])

  const newsItems = useMemo(
    () => (secondaryOn ? rankHomeNews(prefs, resolved, 8) : []),
    [secondaryOn, prefs, behaviorTick, resolved],
  )
  const widgets = useMemo(
    () =>
      secondaryOn
        ? splitAdaptiveHome({ kids, hideTravel: kidsHideTravel(), hideWallet }, widgetTaps, t)
        : { primary: [], folded: [] },
    [secondaryOn, kids, hideWallet, widgetTaps, t],
  )

  const first = companyView && company.firmName ? company.firmName : user?.name.split(' ')[0]
  const greeting = first ? `${t('home.hello')}, ${first}.` : `${t('home.hello')}.`

  const fillPrompt = (prompt: string) => {
    setAsk(prompt)
    window.requestAnimationFrame(() => {
      const el = askRef.current
      if (!el) return
      el.focus()
      const len = prompt.length
      el.setSelectionRange(len, len)
    })
  }

  const runPlan = async (q: string) => {
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setBusy(true)
    try {
      const next = await buildAssistPlan(q, resolved, ac.signal)
      if (next) setPlan(next)
    } finally {
      setBusy(false)
    }
  }

  const submitAsk = async (text: string) => {
    const q = text.trim()
    if (!q || busy) return
    const spokenPick = plan?.tripOptions?.length ? matchSpokenTripChoice(q) : null
    if (spokenPick) {
      if (kidsHideTravel()) {
        setAssistNote(t('trip.kids'))
        return
      }
      setTripVoicePick(spokenPick)
      return
    }
    const gate = await consumeAssistTurn()
    if (gate === 'need_credits') {
      pendingAsk.current = q
      setProOpen(true)
      setProShort(false)
      setAssistNote(t('home.assistNeedCredits'))
      return
    }
    setProOpen(false)
    setAssistNote(null)
    await runPlan(q)
  }

  const confirmPro = async (burn: AssistProBurn) => {
    const q = (pendingAsk.current || ask).trim()
    if (!q || busy || kids) return
    const paid = await spendProAssist(burn)
    if (!paid) {
      setProShort(true)
      return
    }
    setProShort(false)
    setProOpen(false)
    setAssistNote(t('home.assistPaid'))
    await runPlan(q)
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

  const onRobotTap = () => {
    setRobotTapped(true)
    window.setTimeout(() => setRobotTapped(false), 700)
    if (orbiIntro) return
    if (!tourOff) {
      setRobotAsk(null)
      setTourStep(0)
      setTourOn(true)
      return
    }
    const recent = getBehavior().events.find((event) => event.query)?.query
    const next = pickAdaptiveRobotAsk({
      kids,
      interests: prefs.interests.filter((id) => id !== 'social'),
      recentText: recent,
    })
    const safe =
      next.item.kind === 'social' || next.item.to.startsWith('/social')
        ? pickAdaptiveRobotAsk({ kids }).item
        : next.item
    setTourOn(false)
    setRobotAsk(safe)
  }

  const dismissIntro = () => {
    markOrbiIntroSeen()
    setOrbiIntro(false)
  }

  const hideTour = () => {
    dismissOrbiTour()
    setTourOff(true)
    setTourOn(false)
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-scroll-chrome pt-6 md:pt-10">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Orbit{isDemo ? ` · ${t('home.demoBadge')}` : ''}
          </p>
          <div
            className="mt-3 flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:text-left"
            data-orbi-hero="1"
            data-orbi-primary="1"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="grid h-36 w-36 place-items-center rounded-full bg-[var(--theme-accent)]/12 ring-1 ring-[var(--theme-accent)]/30">
                <OrbitRobot
                  size="hero"
                  tapped={robotTapped}
                  expanded={orbiIntro || tourOn || Boolean(robotAsk)}
                  onTap={onRobotTap}
                  label={t('home.robotAria')}
                />
              </div>
              <span className="text-xs font-semibold tracking-wide text-[var(--theme-accent)]">Orbi</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-ink md:text-[2rem]">{greeting}</h1>
              <p className="mt-1 max-w-sm text-sm text-muted">{t('home.need')}</p>
            </div>
          </div>
        </div>

        {orbiIntro && (
          <OrbiPresence
            kind="intro"
            step={0}
            kids={kids}
            onStart={() => {
              dismissIntro()
              navigate('/prefs')
            }}
            onLater={dismissIntro}
          />
        )}

        {tourOn && !orbiIntro && (
          <OrbiPresence
            kind="tour"
            step={tourStep}
            kids={kids}
            onNext={() => setTourStep((current) => current + 1)}
            onSkip={() => setTourOn(false)}
            onHide={hideTour}
            onDone={hideTour}
          />
        )}

        {robotAsk && robotCopy && !tourOn && !orbiIntro && (
          <div
            className="rounded-2xl border border-border/80 bg-surface-2/60 px-3 py-3"
            role="status"
            data-robot-ask={robotAsk.kind}
          >
            <p className="text-sm text-ink">{robotCopy.question}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => navigate(robotAsk.to)}>
                {robotCopy.yes}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setRobotAsk(null)}>
                {t('home.robotDismiss')}
              </Button>
            </div>
          </div>
        )}

        {reminders[0] && (
          <p className="text-sm">
            <button
              type="button"
              className="text-[var(--theme-accent)] hover:underline"
              onClick={() => {
                const item = tapReminder(reminders[0].id)
                if (item) navigate(item.actionTo)
              }}
            >
              {reminders[0].actionLabel}: {reminders[0].title} →
            </button>
          </p>
        )}

        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            void submitAsk(ask)
          }}
        >
          <label className="block">
            <span className="sr-only">{t('home.phSeek')}</span>
            <textarea
              ref={askRef}
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              rows={2}
              placeholder={t('home.phSeek')}
              className="w-full resize-none rounded-2xl border border-border bg-surface-2 px-3 py-3 text-base text-ink placeholder:text-muted outline-none focus:border-[var(--theme-accent)]/50"
            />
          </label>
          {assistNote && <p className="text-[11px] text-amber-200">{assistNote}</p>}
          {proOpen && !kids && (
            <div
              className="rounded-2xl border border-violet-400/40 bg-surface-2 p-4"
              data-pro-assist="1"
              role="group"
              aria-label={t('assist.proTitle')}
            >
              <p className="text-sm font-semibold text-ink">{t('assist.proTitle')}</p>
              <p className="mt-1 text-xs text-muted">{t('assist.proHint')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ASSIST_PRO_BURNS.map((burn) => (
                  <Button
                    key={burn}
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => void confirmPro(burn)}
                  >
                    {burn}
                  </Button>
                ))}
              </div>
              {proShort && (
                <p className="mt-3 text-xs text-muted">
                  {t('assist.proShort')}{' '}
                  <Link to="/mein" className="text-[var(--theme-accent)] hover:underline">
                    {t('assist.proMein')}
                  </Link>
                </p>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            {canListen() && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => void onMic()}
                aria-label={t('assist.voice')}
                className={cn('h-11 w-11 shrink-0 px-0', listening && 'bg-[var(--theme-accent)]/15')}
              >
                <Mic size={18} />
              </Button>
            )}
            <Button type="submit" variant="ghost" className="flex-1" disabled={busy || !ask.trim()}>
              {busy ? t('assist.thinking') : t('assist.submit')} <Send size={16} />
            </Button>
          </div>
        </form>
      </header>

      {plan && (
        <div className="assist-result space-y-6" data-assist-result="1">
          <Tageskarte item={daily.item} slot={daily.slot} plan={plan} onUsePrompt={fillPrompt} />
          {plan.tripOptions && plan.tripOptions.length > 0 && (
            <TripOptionCards
              options={plan.tripOptions}
              pendingVoice={tripVoicePick}
              onConsumedVoice={() => setTripVoicePick(null)}
            />
          )}
        </div>
      )}

      <div ref={sentinelRef} className="h-px" data-home-secondary-sentinel="1" />

      {!secondaryOn && (
        <button
          type="button"
          className="min-h-11 text-sm text-muted hover:text-ink"
          onClick={() => setSecondaryOn(true)}
        >
          {t('home.secondaryOpen')}
        </button>
      )}

      {secondaryOn && (
        <section className="space-y-3 pt-2" data-home-secondary="1" aria-labelledby="home-secondary">
          <h2 id="home-secondary" className="text-xs font-medium uppercase tracking-wider text-muted">
            {t('home.mehrEntdecken')}
          </h2>
          <NewsStrip items={newsItems} />
          <TileGrid
            tiles={widgets.primary.slice(0, HOME_PRIMARY_COUNT)}
            label={t('home.mehrEntdecken')}
          />
          {widgets.folded.length > 0 && (
            <Link to="/mehr" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ink">
              {t('home.widgetsMore')}
            </Link>
          )}
          {resume && (
            <Link to={resume.path} className="inline-flex min-h-11 items-center text-sm text-ink-soft hover:text-ink">
              {t('home.tileResume')}: {resume.title}
            </Link>
          )}
        </section>
      )}
    </div>
  )
}
