import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, SkipForward, Sparkles, SlidersHorizontal, MessageSquare } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SpeakButton } from '../components/a11y/SpeakButton'
import { useStoreVersion } from '../hooks/useStore'
import { useAuth } from '../lib/auth'
import { store } from '../lib/store'
import { useI18n } from '../lib/i18n'
import { applyInterest } from '../lib/apply'
import { rankForWorld, trackBehavior } from '../lib/behavior'
import { listingSpeech } from '../lib/tts'
import { cn, formatPrice } from '../lib/utils'
import {
  filterCandidatesByEmployerPrefs,
  getPrefs,
  subscribePrefs,
} from '../lib/prefs'
import {
  getSwipes,
  recordSwipe,
  scoreCandidateMatch,
  scoreJobMatch,
  subscribeSwipes,
  swipedIds,
  type MatchScore,
  type MutualMatch,
} from '../lib/match'
import type { Listing, Profile } from '../types'

export function MatchPage() {
  useStoreVersion()
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user, loginDemo, profile } = useAuth()
  const [prefs, setPrefs] = useState(getPrefs)
  const [, setSwipeTick] = useState(0)
  const [toast, setToast] = useState<MutualMatch | null>(null)
  const [explain, setExplain] = useState(false)

  useEffect(() => {
    const u1 = subscribePrefs(() => setPrefs(getPrefs()))
    const u2 = subscribeSwipes(() => setSwipeTick((n) => n + 1))
    return () => {
      u1()
      u2()
    }
  }, [])

  const seekerMode = !prefs.completed || prefs.side === 'seeker'

  const deck = useMemo(() => {
    if (seekerMode) {
      const done = swipedIds('job')
      const jobs = rankForWorld(
        store.listListings({ vertical: 'job', kind: 'offer' }),
        prefs,
      ).filter((l) => !done.has(l.id) && l.status === 'active')
      return jobs.map((l) => ({ kind: 'job' as const, listing: l, score: scoreJobMatch(l, prefs) }))
    }
    const done = swipedIds('candidate')
    const candidates = filterCandidatesByEmployerPrefs(
      store.listProfiles().filter((p) => p.role === 'freelancer' || p.role === 'courier'),
      prefs,
    ).filter((p) => !done.has(p.id))
    return candidates.map((p) => ({
      kind: 'candidate' as const,
      profile: p,
      score: scoreCandidateMatch(p, prefs),
    }))
  }, [prefs, seekerMode, toast])

  const current = deck[0]

  const swipe = (action: 'interested' | 'skip') => {
    if (!current) return
    if (current.kind === 'job') {
      trackBehavior({
        kind: action === 'skip' ? 'swipe_skip' : 'swipe_interest',
        listingId: current.listing.id,
        industry: current.listing.industry,
        jobType: current.listing.jobType,
        city: current.listing.city,
      })
      const { mutual } = recordSwipe({
        targetId: current.listing.id,
        targetKind: 'job',
        action,
        title: current.listing.title,
        listingId: current.listing.id,
      })
      if (action === 'interested') {
        let actor = user
        if (!actor) {
          loginDemo()
          actor = { id: 'user-demo-1', name: 'Alex Müller', email: '', role: 'agency' }
        }
        if (actor.id !== current.listing.ownerId) {
          try {
            applyInterest({
              listing: current.listing,
              requesterId: actor.id,
              requesterName: actor.name,
              city: profile?.city,
            })
          } catch {
            /* demo best-effort */
          }
        }
        if (mutual) {
          setToast(mutual)
          window.setTimeout(() => setToast(null), 4200)
        }
      }
    } else {
      const { mutual } = recordSwipe({
        targetId: current.profile.id,
        targetKind: 'candidate',
        action,
        title: current.profile.name,
        candidateId: current.profile.id,
      })
      if (mutual) {
        setToast(mutual)
        window.setTimeout(() => setToast(null), 4200)
      }
    }
    setSwipeTick((n) => n + 1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'ArrowLeft') swipe('skip')
      if (e.key === 'ArrowRight' || e.key === 'Enter') swipe('interested')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  if (!prefs.completed) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <Sparkles className="text-[var(--theme-accent)]" size={32} />
        <h1 className="text-xl font-bold">{t('match.needPrefs')}</h1>
        <p className="text-sm text-muted">{t('match.needPrefsHint')}</p>
        <Button onClick={() => navigate('/prefs')}>{t('match.openPrefs')}</Button>
      </div>
    )
  }

  const mutuals = getSwipes().mutuals

  return (
    <div className="relative mx-auto flex min-h-[70dvh] max-w-lg flex-col gap-4 pb-scroll-chrome">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--theme-accent)]">{t('match.kicker')}</p>
          <h1 className="text-xl font-bold tracking-tight">
            {seekerMode ? t('match.jobs') : t('match.candidates')}
          </h1>
          <p className="text-xs text-muted">
            {deck.length} Karten · Prefs hard-gefiltert
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => navigate('/prefs')}>
          <SlidersHorizontal size={16} /> Prefs
        </Button>
      </header>

      {!current ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-surface-2 p-8 text-center">
          <p className="text-4xl">🛰️</p>
          <h2 className="text-lg font-semibold">{t('match.empty')}</h2>
          <p className="text-sm text-muted">{t('match.emptyHint')}</p>
          <Button variant="secondary" onClick={() => navigate('/prefs')}>
            Prefs anpassen
          </Button>
          <Link to="/quellen" className="text-sm text-cyan hover:underline">
            Quellen / Aggregatoren →
          </Link>
        </div>
      ) : current.kind === 'job' ? (
        <JobCard
          listing={current.listing}
          score={current.score}
          explain={explain}
          onToggleExplain={() => setExplain((v) => !v)}
        />
      ) : (
        <CandidateCard
          profile={current.profile}
          score={current.score}
          explain={explain}
          onToggleExplain={() => setExplain((v) => !v)}
        />
      )}

      {current && (
        <div className="sticky bottom-20 z-10 flex items-center justify-center gap-4 md:bottom-4">
          <button
            type="button"
            aria-label={t('match.skip')}
            onClick={() => swipe('skip')}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-2 text-neutral-300 shadow-lg hover:border-rose-400/50 hover:text-rose-300"
          >
            <SkipForward size={24} />
          </button>
          <button
            type="button"
            aria-label={t('match.interest')}
            onClick={() => swipe('interested')}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--theme-accent)] text-black shadow-[0_0_28px_color-mix(in_oklab,var(--theme-accent)_40%,transparent)]"
          >
            <Heart size={28} fill="currentColor" />
          </button>
        </div>
      )}

      <div className="flex justify-center gap-6 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <SkipForward size={12} /> {t('match.skip')}
        </span>
        <span className="inline-flex items-center gap-1 text-[var(--theme-accent)]">
          <Heart size={12} /> {t('match.interest')}
        </span>
      </div>

      {mutuals.length > 0 && (
        <section className="rounded-2xl border border-teal/30 bg-teal/5 p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal">
            <MessageSquare size={16} /> Mutual Matches ({mutuals.length})
          </h2>
          <ul className="space-y-2">
            {mutuals.slice(0, 5).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-neutral-200">{m.title}</span>
                <Link
                  to={m.listingId ? `/listings/${m.listingId}` : '/messages'}
                  className="shrink-0 text-cyan hover:underline"
                >
                  Öffnen
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {toast && (
        <div className="fixed inset-x-4 bottom-28 z-40 mx-auto max-w-sm rounded-2xl border border-cyan/40 bg-surface-2 p-4 shadow-xl md:bottom-8">
          <p className="text-sm font-semibold text-[var(--theme-accent)]">✨ {t('match.mutual')}</p>
          <p className="mt-1 text-sm text-neutral-200">{toast.title}</p>
          <p className="mt-1 text-xs text-muted">{t('apply.sentHint')}</p>
          <Button
            size="sm"
            className="mt-3 w-full"
            onClick={() => navigate(toast.listingId ? `/listings/${toast.listingId}` : '/messages')}
          >
            {t('apply.chat')}
          </Button>
        </div>
      )}
    </div>
  )
}

function ScoreRing({ score }: { score: MatchScore }) {
  return (
    <div
      className={cn(
        'flex h-16 w-16 flex-col items-center justify-center rounded-full border-2',
        score.percent >= 75
          ? 'border-cyan bg-cyan/15 text-cyan'
          : score.percent >= 50
            ? 'border-teal bg-teal/15 text-teal'
            : 'border-amber-400/50 bg-amber-400/10 text-amber-200',
      )}
    >
      <span className="text-lg font-bold tabular-nums leading-none">{score.percent}</span>
      <span className="text-[9px] uppercase tracking-wider opacity-80">%</span>
    </div>
  )
}

function Breakdown({ score, open }: { score: MatchScore; open: boolean }) {
  if (!open) return null
  const rows: [string, number][] = [
    ['Skills', score.breakdown.skills],
    ['Land', score.breakdown.land],
    ['Sprache', score.breakdown.sprache],
    ['Gehalt', score.breakdown.gehalt],
    ['Typ', score.breakdown.typ],
  ]
  return (
    <div className="mt-3 space-y-1 rounded-xl border border-border/80 bg-black/30 p-3 text-xs">
      {rows.map(([label, v]) => (
        <div key={label} className="flex items-center justify-between gap-2">
          <span className="text-muted">{label}</span>
          <span className="tabular-nums text-neutral-200">{v}</span>
        </div>
      ))}
      <ul className="mt-2 list-disc space-y-0.5 pl-4 text-neutral-300">
        {score.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  )
}

function JobCard({
  listing,
  score,
  explain,
  onToggleExplain,
}: {
  listing: Listing
  score: MatchScore
  explain: boolean
  onToggleExplain: () => void
}) {
  const L = listing as Listing & { industry?: string; jobType?: string; workMode?: string; source?: string }
  return (
    <article className="relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-cyan/30 bg-gradient-to-b from-surface-2 to-black p-5 shadow-[0_0_40px_rgba(0,240,255,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {L.industry && <Badge tone="cyan">{L.industry}</Badge>}
            {L.jobType && <Badge tone="teal">{L.jobType}</Badge>}
            {L.workMode && <Badge>{L.workMode}</Badge>}
            {L.source && <Badge tone="violet">{L.source}</Badge>}
          </div>
          <h2 className="text-xl font-bold leading-snug text-white">{listing.title}</h2>
          <p className="mt-1 text-sm text-muted">
            {listing.city}
            {listing.ownerName ? ` · ${listing.ownerName}` : ''}
          </p>
        </div>
        <ScoreRing score={score} />
      </div>
      <p className="mt-4 line-clamp-5 flex-1 text-sm leading-relaxed text-neutral-300">
        {listing.description}
      </p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          {listing.priceFrom != null && (
            <p className="text-lg font-semibold text-cyan">
              {formatPrice(listing.priceFrom)}
              {listing.priceUnit ? ` / ${listing.priceUnit}` : ''}
            </p>
          )}
          <div className="mt-1 flex flex-wrap gap-1">
            {(listing.crafts || []).slice(0, 3).map((c) => (
              <span key={c} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-neutral-400">
                {c}
              </span>
            ))}
          </div>
        </div>
        <button type="button" onClick={onToggleExplain} className="text-xs text-[var(--theme-accent)] hover:underline">
          {explain ? 'Score ausblenden' : 'Match erklären'}
        </button>
      </div>
      <div className="mt-3">
        <SpeakButton
          compact
          text={listingSpeech({
            title: listing.title,
            city: listing.city,
            ownerName: listing.ownerName,
            description: listing.description,
            rate:
              listing.priceFrom != null
                ? `${formatPrice(listing.priceFrom)}${listing.priceUnit ? ' / ' + listing.priceUnit : ''}`
                : undefined,
            industry: L.industry,
          })}
        />
      </div>
      <Breakdown score={score} open={explain} />
      <div className="pointer-events-none absolute -right-8 -top-8 text-7xl opacity-20">
        {listing.imageEmoji || '💼'}
      </div>
    </article>
  )
}

function CandidateCard({
  profile,
  score,
  explain,
  onToggleExplain,
}: {
  profile: Profile
  score: MatchScore
  explain: boolean
  onToggleExplain: () => void
}) {
  return (
    <article className="relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-teal/30 bg-gradient-to-b from-surface-2 to-black p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge tone="teal">{profile.role}</Badge>
          <h2 className="mt-2 text-xl font-bold text-white">{profile.name}</h2>
          <p className="text-sm text-muted">
            {profile.city} · ★ {profile.rating.toFixed(1)} ({profile.reviewCount})
          </p>
        </div>
        <ScoreRing score={score} />
      </div>
      <p className="mt-4 line-clamp-5 flex-1 text-sm text-neutral-300">{profile.bio}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {profile.crafts.map((c) => (
          <span key={c} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-neutral-400">
            {c}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={onToggleExplain}
        className="mt-3 self-end text-xs text-cyan hover:underline"
      >
        {explain ? 'Score ausblenden' : 'Match erklären'}
      </button>
      <Breakdown score={score} open={explain} />
    </article>
  )
}
