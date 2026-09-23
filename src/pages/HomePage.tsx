import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mic, Send } from 'lucide-react'
import { TileGrid } from '../components/ui/TileGrid'
import { homeDiscoverTiles } from '../lib/hubTiles'
import { TripOptionCards } from '../components/assist/TripOptionCards'
import { FuerDichCard } from '../components/home/FuerDichCard'
import { OrbitRobot } from '../components/home/OrbitRobot'
import { Tageskarte } from '../components/home/Tageskarte'
import { Button } from '../components/ui/Button'
import { Empty } from '../components/ui/Empty'
import { useListings, useStoreVersion } from '../hooks/useStore'
import { useAuth } from '../lib/auth'
import {
  buildAssistPlan,
  getLastPlan,
  subscribeAssist,
  type AssistPlan,
} from '../lib/assist'
import { getCompany, subscribeCompany } from '../lib/company'
import { isCompanySide, getPrefs, savePrefs, subscribePrefs, type PrefsSide } from '../lib/prefs'
import { subscribeBehavior } from '../lib/behavior'
import { subscribeChannels } from '../lib/channels'
import { rankFuerDich } from '../lib/fuerDich'
import { NewsStrip } from '../components/home/NewsStrip'
import { consumeAssistTurn, formatSupplyLine, getCredits, getSignupIdentity, subscribeCredits } from '../lib/credits'
import { isDemo } from '../lib/flags'
import { getResume, subscribeResume } from '../lib/resume'
import { dueReminders, subscribeReminders, tapReminder } from '../lib/reminders'
import { rankHomeNews } from '../lib/homeSuggestions'
import { useI18n } from '../lib/i18n'
import { pickRobotAsk, robotAskCopy, type RobotAsk } from '../lib/robotAsk'
import { canListen, listenOnce } from '../lib/speech'
import { matchSpokenTripChoice } from '../lib/trip'
import { pickTageskarte, tageskarteCopy } from '../lib/tageskarte'
import { cn } from '../lib/utils'
import {
  isKidsMode,
  kidsHideTravel,
  kidsHideWallet,
  kidsMaySeeJobs,
  subscribeKids,
} from '../lib/kids'

type WarmChip = 'seek' | 'offer' | 'resume'

export function HomePage() {
  useStoreVersion()
  const { t, resolved } = useI18n()
  const { user } = useAuth()
  const navigate = useNavigate()
  const askRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [prefs, setPrefs] = useState(getPrefs)
  const [company, setCompany] = useState(getCompany)
  const [behaviorTick, setBehaviorTick] = useState(0)
  const [credits, setCredits] = useState(getCredits)
  const [plan, setPlan] = useState<AssistPlan | null>(getLastPlan)
  const [ask, setAsk] = useState('')
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const [warm, setWarm] = useState<WarmChip>('seek')
  const [pendingSide, setPendingSide] = useState<PrefsSide | null>(null)
  const [resume, setResume] = useState(getResume)
  const [reminders, setReminders] = useState(dueReminders)
  const [assistNote, setAssistNote] = useState<string | null>(null)
  const [robotTapped, setRobotTapped] = useState(false)
  const [robotAsk, setRobotAsk] = useState<RobotAsk | null>(null)
  const [kids, setKids] = useState(isKidsMode)
  const [tripVoicePick, setTripVoicePick] = useState<1 | 2 | 3 | null>(null)
  const companyView = isCompanySide(prefs.side) && prefs.side !== 'both'
  const { listings: raw } = useListings({})
  const daily = useMemo(() => pickTageskarte(new Date(), { kids }), [kids])
  const dailyCopy = tageskarteCopy(daily.item, resolved)
  const robotCopy = robotAsk ? robotAskCopy(robotAsk, resolved) : null
  const hideWallet = kidsHideWallet()

  useEffect(() => {
    const u1 = subscribePrefs(() => setPrefs(getPrefs()))
    const u2 = subscribeBehavior(() => setBehaviorTick((n) => n + 1))
    const u3 = subscribeCredits(() => setCredits(getCredits()))
    const u4 = subscribeCompany(() => setCompany(getCompany()))
    const u5 = subscribeAssist(() => setPlan(getLastPlan()))
    const u6 = subscribeChannels(() => setBehaviorTick((n) => n + 1))
    const u7 = subscribeResume(() => setResume(getResume()))
    const u8 = subscribeReminders(() => setReminders(dueReminders()))
    const u9 = subscribeKids(() => setKids(isKidsMode()))
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

  const fuerDich = useMemo(() => {
    const ranked = rankFuerDich(raw, prefs, resolved, 8)
    if (!kids) return ranked
    if (!kidsMaySeeJobs()) return []
    return ranked.filter((item) => item.action !== 'look' && item.action !== 'book')
  }, [raw, prefs, behaviorTick, resolved, kids])
  const newsItems = useMemo(() => rankHomeNews(prefs, resolved, 2), [prefs, behaviorTick, resolved])

  const first = companyView && company.firmName ? company.firmName : user?.name.split(' ')[0]
  const greeting = first ? `${t('home.hello')}, ${first}.` : `${t('home.hello')}.`
  const stems: Record<WarmChip, string> = {
    seek: t('home.stemSeek'),
    offer: t('home.stemOffer'),
    resume: resume ? `${t('home.stemResume')}${resume.title}` : t('home.stemThink'),
  }
  const placeholder =
    warm === 'offer' ? t('home.phOffer') : warm === 'resume' ? t('home.phResume') : companyView ? t('assist.phCompany') : t('home.phSeek')

  const pickWarm = (id: WarmChip) => {
    setWarm(id)
    setPendingSide(id === 'seek' ? 'seeker' : id === 'offer' ? 'employer' : null)
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

  const submitAsk = async (text: string) => {
    const q = text.trim() || dailyCopy.prompt
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
      setAssistNote(t('home.assistNeedCredits'))
      return
    }
    if (gate === 'paid') setAssistNote(t('home.assistPaid'))
    else setAssistNote(null)
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setBusy(true)
    try {
      const next = await buildAssistPlan(q, resolved, ac.signal)
      if (next) {
        setPlan(next)
        if (pendingSide) savePrefs({ side: pendingSide })
      }
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

  const onRobotTap = () => {
    const next = pickRobotAsk(new Date(), { kids }).item
    setRobotAsk(next)
    setRobotTapped(true)
    window.setTimeout(() => setRobotTapped(false), 700)
  }

  const chips: { id: WarmChip; title: string }[] = [
    { id: 'seek', title: t('home.tileSeek') },
    { id: 'offer', title: t('home.tileOffer') },
    { id: 'resume', title: t('home.tileResume') },
  ]

  const discover = homeDiscoverTiles(t, {
    kids,
    hideTravel: kidsHideTravel(),
    hideWallet,
  })

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-scroll-chrome pt-6 md:pt-10">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Orbit{isDemo ? ` · ${t('home.demoBadge')}` : ''}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink md:text-[2rem]">{greeting}</h1>
          <p className="mt-1 max-w-sm text-sm text-muted">{t('home.need')}</p>
          <div className="flex flex-col items-center px-2 pt-2 text-center" data-orbi-primary="1">
            <OrbitRobot
              tapped={robotTapped}
              onTap={onRobotTap}
              label={t('home.robotAria')}
              stage="kind"
              busy={busy}
            />
            <p className="mt-1 text-sm font-semibold text-ink">{t('home.orbiKind')}</p>
            <p className="text-xs text-muted">{t('home.orbiTap')}</p>
          </div>
        </div>

        {robotAsk && robotCopy && (
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

        <nav aria-label={t('home.chipsAria')} className="flex flex-wrap gap-2">
          {chips
            .filter((chip) => !(kids && chip.id === 'offer'))
            .map((chip) => (
            <Button
              key={chip.id}
              type="button"
              size="sm"
              variant={warm === chip.id ? 'tonal' : 'secondary'}
              onClick={() => pickWarm(chip.id)}
            >
              {chip.title}
            </Button>
          ))}
        </nav>

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
              className="w-full resize-none rounded-2xl border border-border bg-surface-2 px-3 py-3 text-base text-ink placeholder:text-muted outline-none focus:border-[var(--theme-accent)]/50"
            />
          </label>
          {assistNote && <p className="text-[11px] text-amber-200">{assistNote}</p>}
          <div className="flex items-center gap-2">
            {canListen() && (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => void onMic()}
                aria-label={t('assist.voice')}
                className={cn('h-11 w-11 shrink-0 px-0', listening && 'bg-[var(--theme-accent)]/15')}
              >
                <Mic size={18} />
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={busy} data-home-primary="1">
              {busy ? t('assist.thinking') : t('assist.submit')} <Send size={16} />
            </Button>
          </div>
        </form>
      </header>

      <div className={plan ? 'assist-result space-y-6' : undefined} data-assist-result={plan ? '1' : undefined}>
        <Tageskarte item={daily.item} slot={daily.slot} plan={plan} onUsePrompt={fillPrompt} />
        {plan?.tripOptions && plan.tripOptions.length > 0 && (
          <TripOptionCards
            options={plan.tripOptions}
            pendingVoice={tripVoicePick}
            onConsumedVoice={() => setTripVoicePick(null)}
          />
        )}
      </div>

      <section className="space-y-3 pt-2" aria-labelledby="mehr-entdecken">
        <h2 id="mehr-entdecken" className="text-xs font-medium uppercase tracking-wider text-muted">
          {t('home.mehrEntdecken')}
        </h2>
        <TileGrid tiles={discover} label={t('home.mehrEntdecken')} />
        {resume && (
          <Link
            to={resume.path}
            className="inline-flex min-h-11 items-center text-sm text-ink-soft hover:text-ink"
          >
            {t('home.tileResume')}: {resume.title}
          </Link>
        )}

        <NewsStrip items={newsItems} />

        {fuerDich.length === 0 ? (
          <Empty emoji="✨" title={t('home.dealsEmpty')} hint={t('home.dealsEmptyHint')} className="py-6" />
        ) : (
          <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
            <ul className="flex snap-x snap-mandatory gap-2">
              {fuerDich.map((item) => (
                <li key={item.id}>
                  <FuerDichCard item={item} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {!hideWallet && (
          <p className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
            <Link to="/wallet" className="tabular-nums text-ink hover:text-[var(--theme-accent)]">
              {credits.balance} Credits
            </Link>
            <span>{formatSupplyLine()}</span>
            {getSignupIdentity()?.earlyTester && (
              <span className="text-amber-200/80">Early Tester #{getSignupIdentity()?.ordinal}</span>
            )}
            <span>· {t('home.creditsPeek')}</span>
          </p>
        )}
      </section>
    </div>
  )
}
