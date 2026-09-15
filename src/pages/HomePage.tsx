import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mic, Send } from 'lucide-react'
import { FuerDichCard } from '../components/home/FuerDichCard'
import { Button } from '../components/ui/Button'
import { Empty } from '../components/ui/Empty'
import { useListings, useStoreVersion } from '../hooks/useStore'
import { useAuth } from '../lib/auth'
import {
  buildAssistPlan,
  clearPlan,
  getLastPlan,
  listingsForPlan,
  primaryAssistAction,
  subscribeAssist,
  travelForPlan,
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
import { rankHomeNews } from '../lib/homeSuggestions'
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
  const [othersOpen, setOthersOpen] = useState(false)
  const [resume, setResume] = useState(getResume)
  const [assistNote, setAssistNote] = useState<string | null>(null)
  const companyView = isCompanySide(prefs.side) && prefs.side !== 'both'
  const { listings: raw } = useListings({})

  useEffect(() => {
    const u1 = subscribePrefs(() => setPrefs(getPrefs()))
    const u2 = subscribeBehavior(() => setBehaviorTick((n) => n + 1))
    const u3 = subscribeCredits(() => setCredits(getCredits()))
    const u4 = subscribeCompany(() => setCompany(getCompany()))
    const u5 = subscribeAssist(() => setPlan(getLastPlan()))
    const u6 = subscribeChannels(() => setBehaviorTick((n) => n + 1))
    const u7 = subscribeResume(() => setResume(getResume()))
    return () => {
      u1()
      u2()
      u3()
      u4()
      u5()
      u6()
      u7()
      abortRef.current?.abort()
    }
  }, [])

  const fuerDich = useMemo(
    () => rankFuerDich(raw, prefs, resolved, 8),
    [raw, prefs, behaviorTick, resolved],
  )
  const newsItems = useMemo(() => rankHomeNews(prefs, resolved, 2), [prefs, behaviorTick, resolved])

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
    setPendingSide(id === 'seek' ? 'seeker' : id === 'offer' ? 'employer' : 'both')
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
    const gate = consumeAssistTurn()
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

  const assistAction = plan ? primaryAssistAction(plan) : null
  const assistHit = plan ? listingsForPlan(plan)[0] || travelForPlan(plan)[0] : null
  const chips: { id: WarmChip; title: string }[] = [
    { id: 'seek', title: t('home.tileNeed') },
    { id: 'offer', title: t('home.tileOffer') },
    { id: 'think', title: t('home.tileResume') },
  ]

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-scroll-chrome pt-6 md:pt-10">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Orbit{isDemo ? ` · ${t('home.demoBadge')}` : ''}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-[2rem]">{greeting}</h1>
          <p className="mt-1 max-w-sm text-sm text-muted">{t('home.value')}</p>
        </div>

        <nav aria-label={t('home.chipsAria')} className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => pickWarm(chip.id)}
              className={cn(
                'rounded-full border px-3.5 py-2 text-sm',
                warm === chip.id
                  ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/10 text-white'
                  : 'border-border text-neutral-300 hover:text-white',
              )}
            >
              {chip.title}
            </button>
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
              className="w-full resize-none rounded-2xl border border-border bg-surface-2 px-3 py-3 text-base text-white placeholder:text-neutral-600 outline-none focus:border-cyan/50"
            />
          </label>
          {assistNote && <p className="text-[11px] text-amber-200">{assistNote}</p>}
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

      {plan && assistAction && (
        <section className="rounded-2xl border border-border/80 bg-surface-2/40 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">{t('assist.planKicker')}</p>
            <button type="button" className="text-[11px] text-muted hover:underline" onClick={() => clearPlan()}>
              {t('assist.clear')}
            </button>
          </div>
          <h2 className="mt-1 text-base font-semibold text-white">{plan.summary}</h2>
          <p className="mt-1 text-sm text-neutral-300">{assistAction.title}</p>
          {assistAction.actionTo && (
            <Link
              to={assistAction.actionTo}
              className="mt-2 inline-flex text-sm text-[var(--theme-accent)] hover:underline"
            >
              {assistAction.actionLabel || t('home.next')} →
            </Link>
          )}
        </section>
      )}

      {plan && !assistAction && assistHit && (
        <section className="rounded-2xl border border-border/80 bg-surface-2/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">{t('assist.planKicker')}</p>
          <h2 className="mt-1 text-base font-semibold text-white">
            {'title' in assistHit ? assistHit.title : plan.summary}
          </h2>
          <Link
            to={'provider' in assistHit ? `/reise/${assistHit.id}` : `/listings/${assistHit.id}`}
            className="mt-2 inline-flex text-sm text-[var(--theme-accent)] hover:underline"
          >
            {'provider' in assistHit ? t('home.action.book') : t('home.action.contact')} →
          </Link>
        </section>
      )}

      <NewsStrip items={newsItems} />

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <Link to={matchTo} className="text-neutral-300 hover:text-white hover:underline">
          {matchLabel}
        </Link>
        {resume && (
          <Link to={resume.path} className="text-neutral-400 hover:underline">
            {t('home.tileResume')}: {resume.title}
          </Link>
        )}
      </p>

      <details
        className="rounded-2xl border border-border/70 bg-surface-2/40 p-3"
        open={othersOpen}
        onToggle={(e) => setOthersOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer list-none text-sm font-medium text-neutral-200 marker:content-none">
          {t('home.otherOptions')}
        </summary>
        <div className="mt-3 space-y-3">
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
            <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
              <ul className="flex snap-x snap-mandatory gap-2">
                {(fuerDich).map((item) => (
                  <li key={item.id}>
                    <FuerDichCard item={item} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {prefs.completed && (
            <Link to="/match" className="inline-flex text-sm text-[var(--theme-accent)] hover:underline">
              {t('home.ctaMatch')} →
            </Link>
          )}
          <p className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
            <Link to="/wallet" className="tabular-nums text-white hover:text-[var(--theme-accent)]">
              {credits.balance} Credits
            </Link>
            <span>{formatSupplyLine()}</span>
            {getSignupIdentity()?.earlyTester && (
              <span className="text-amber-200/80">Early Tester #{getSignupIdentity()?.ordinal}</span>
            )}
            <span>· {t('home.creditsPeek')}</span>
          </p>
        </div>
      </details>
    </div>
  )
}
