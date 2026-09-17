import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mic, Send } from 'lucide-react'
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
import { pickTageskarte, tageskarteCopy } from '../lib/tageskarte'
import { cn } from '../lib/utils'
import {
  AGE_BANDS,
  isKidsMode,
  kidsAgeBand,
  kidsHideTravel,
  kidsMaySeeJobs,
  setAgeBand,
  subscribeKids,
} from '../lib/kids'
import { getCampusProgress, getCourse } from '../lib/campus'

type WarmChip = 'seek' | 'offer' | 'resume' | 'campus'

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
  const [ageBand, setAge] = useState(kidsAgeBand)
  const companyView = isCompanySide(prefs.side) && prefs.side !== 'both'
  const { listings: raw } = useListings({})
  const daily = useMemo(() => pickTageskarte(new Date(), { kids }), [kids])
  const dailyCopy = tageskarteCopy(daily.item, resolved)
  const robotCopy = robotAsk ? robotAskCopy(robotAsk, resolved) : null

  useEffect(() => {
    const u1 = subscribePrefs(() => setPrefs(getPrefs()))
    const u2 = subscribeBehavior(() => setBehaviorTick((n) => n + 1))
    const u3 = subscribeCredits(() => setCredits(getCredits()))
    const u4 = subscribeCompany(() => setCompany(getCompany()))
    const u5 = subscribeAssist(() => setPlan(getLastPlan()))
    const u6 = subscribeChannels(() => setBehaviorTick((n) => n + 1))
    const u7 = subscribeResume(() => setResume(getResume()))
    const u8 = subscribeReminders(() => setReminders(dueReminders()))
    const u9 = subscribeKids(() => {
      setKids(isKidsMode())
      setAge(kidsAgeBand())
    })
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
  const matchTo = prefs.completed ? (companyView ? '/crew' : '/treffer') : '/prefs'
  const matchLabel = prefs.completed
    ? companyView
      ? t('home.ctaCrew')
      : t('home.ctaMatch')
    : t('home.ctaPrefs')
  const stems: Record<WarmChip, string> = {
    seek: t('home.stemSeek'),
    offer: t('home.stemOffer'),
    resume: resume ? `${t('home.stemResume')}${resume.title}` : t('home.stemThink'),
    campus: t('home.stemCampus'),
  }
  const placeholder =
    warm === 'offer'
      ? t('home.phOffer')
      : warm === 'resume'
        ? t('home.phResume')
        : warm === 'campus'
          ? t('home.phCampus')
        : companyView
          ? t('assist.phCompany')
          : t('home.phSeek')

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
    { id: 'campus', title: t('home.tileCampus') },
  ]

  const campusResume = getCampusProgress()
  const campusCourse = campusResume ? getCourse(campusResume.courseId) : null

  const discover = [
    { to: matchTo, label: matchLabel, hint: t('home.discoverTrefferHint') },
    ...(!kidsHideTravel()
      ? [{ to: '/abflug', label: t('travel.nav'), hint: t('home.discoverAbflugHint') }]
      : []),
    ...(!kids ? [{ to: '/crew', label: t('nav.crew'), hint: t('home.discoverCrewHint') }] : []),
    { to: '/campus', label: t('campus.nav'), hint: t('home.discoverCampusHint') },
    { to: '/wallet', label: t('nav.wallet'), hint: t('home.discoverWalletHint') },
    ...(!kids
      ? [
          { to: '/firma', label: t('firma.nav'), hint: t('firma.hint') },
          { to: '/social', label: t('social.title'), hint: t('social.kicker') },
        ]
      : [{ to: '/kids', label: t('kids.title'), hint: t('kids.settings') }]),
  ]

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-scroll-chrome pt-6 md:pt-10">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Orbit{isDemo ? ` · ${t('home.demoBadge')}` : ''}
          </p>
          <div className="mt-2 flex items-start gap-3">
            <OrbitRobot
              tapped={robotTapped}
              onTap={onRobotTap}
              label={t('home.robotAria')}
            />
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-ink md:text-[2rem]">{greeting}</h1>
              <p className="mt-1 max-w-sm text-sm text-muted">{t('home.need')}</p>
            </div>
          </div>
        </div>

        {ageBand === null && (
          <section className="rounded-2xl border-2 border-[var(--theme-accent)]/40 bg-surface-2/80 p-4" data-kids-age="1">
            <p className="text-sm font-semibold text-ink">{t('kids.ageTitle')}</p>
            <p className="mt-1 text-xs text-muted">{t('kids.agePrompt')}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {AGE_BANDS.map((id) => (
                <Button
                  key={id}
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setAgeBand(id)
                    setAge(id)
                    setKids(id !== '18+')
                  }}
                >
                  {t(`kids.band.${id}`)}
                </Button>
              ))}
            </div>
          </section>
        )}

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
            <Button type="submit" className="flex-1" disabled={busy}>
              {busy ? t('assist.thinking') : t('assist.submit')} <Send size={16} />
            </Button>
          </div>
        </form>
      </header>

      <Tageskarte item={daily.item} slot={daily.slot} plan={plan} onUsePrompt={fillPrompt} />

      <section className="space-y-3 pt-2" aria-labelledby="mehr-entdecken">
        <div>
          <h2 id="mehr-entdecken" className="text-xs font-medium uppercase tracking-wider text-muted">
            {t('home.mehrEntdecken')}
          </h2>
          <p className="mt-1 text-[11px] text-muted">{t('home.mehrHint')}</p>
        </div>
        <ul className="divide-y divide-border/70">
          {discover.map((item) => (
            <li key={item.to + item.label}>
              <Link
                to={item.to}
                className="flex items-baseline justify-between gap-3 py-2.5 text-sm text-ink-soft hover:text-ink"
              >
                <span>{item.label}</span>
                <span className="min-w-0 truncate text-[11px] text-muted">{item.hint}</span>
              </Link>
            </li>
          ))}
          {campusCourse && (
            <li>
              <Link
                to="/campus"
                className="flex items-baseline justify-between gap-3 py-2.5 text-sm text-ink-soft hover:text-ink"
              >
                <span>
                  {t('campus.resume')}: {resolved === 'de' ? campusCourse.titleDe : campusCourse.titleEn}
                </span>
                <span className="text-[11px] text-muted">{t('home.tileCampusHint')}</span>
              </Link>
            </li>
          )}
          {resume && (
            <li>
              <Link
                to={resume.path}
                className="flex items-baseline justify-between gap-3 py-2.5 text-sm text-ink-soft hover:text-ink"
              >
                <span>
                  {t('home.tileResume')}: {resume.title}
                </span>
                <span className="text-[11px] text-muted">{t('home.tileResumeHint')}</span>
              </Link>
            </li>
          )}
        </ul>

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
      </section>
    </div>
  )
}
