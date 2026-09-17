import { useEffect, useMemo, useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Empty } from '../components/ui/Empty'
import { SoftPaywall } from '../components/credits/SoftPaywall'
import { useI18n } from '../lib/i18n'
import {
  CAMPUS_LEVELS,
  campusCopy,
  campusFreeLessonRemaining,
  filterCourses,
  getCampusPath,
  getCampusProgress,
  getCampusState,
  getCourse,
  pickCampusPath,
  selectCampusCourse,
  startLesson,
  subscribeCampus,
  type CampusLevel,
} from '../lib/campus'
import { CREDITS_COSTS, spendCredits } from '../lib/credits'
import { isKidsMode, subscribeKids } from '../lib/kids'
import { cn } from '../lib/utils'

export function CampusPage() {
  const { t, resolved } = useI18n()
  const [kids, setKids] = useState(isKidsMode)
  const [path, setPath] = useState<CampusLevel | null>(getCampusPath)
  const [selectedId, setSelectedId] = useState<string | null>(getCampusState().selectedCourseId)
  const [progress, setProgress] = useState(getCampusProgress)
  const [freeLeft, setFreeLeft] = useState(campusFreeLessonRemaining)
  const [paywall, setPaywall] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const sync = () => {
    const state = getCampusState()
    setPath(state.path)
    setSelectedId(state.selectedCourseId)
    setProgress(state.progress)
    setFreeLeft(campusFreeLessonRemaining())
  }

  useEffect(() => subscribeKids(() => setKids(isKidsMode())), [])
  useEffect(() => subscribeCampus(sync), [])

  const courses = useMemo(() => (path ? filterCourses(path, kids) : []), [path, kids])
  const selected = selectedId ? getCourse(selectedId) : null
  const selectedCopy = selected ? campusCopy(selected, resolved) : null
  const resume = progress ? getCourse(progress.courseId) : null

  const runStart = async (paid = false) => {
    if (!selectedId) return
    const result = startLesson(selectedId, { paid })
    if (result === 'started') {
      setPaywall(false)
      setNote(t('campus.started'))
      sync()
      return
    }
    if (result === 'kids_quota') {
      setNote(t('campus.kidsQuota'))
      return
    }
    if (result === 'need_credits') {
      if (kids) {
        setNote(t('campus.kidsQuota'))
        return
      }
      setPaywall(true)
      return
    }
    if (result === 'no_path') setNote(t('campus.pickPathFirst'))
  }

  const buyExtra = () => {
    void spendCredits(
      CREDITS_COSTS.assist_priority.credits,
      'assist_priority',
      t('campus.extraHint'),
    ).then((ok) => {
      if (!ok) {
        setNote(t('credits.notEnough'))
        return
      }
      void runStart(true)
    })
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-scroll-chrome">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--theme-accent)]">{t('campus.kicker')}</p>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <GraduationCap size={22} /> {t('campus.title')}
        </h1>
        <p className="text-sm text-muted">{t('campus.leadVeto')}</p>
      </header>

      <nav aria-label={t('campus.pickPath')} className="flex flex-wrap gap-2">
        {CAMPUS_LEVELS.map((id) => (
          <Button
            key={id}
            size="sm"
            variant={path === id ? 'tonal' : 'secondary'}
            onClick={() => {
              pickCampusPath(id)
              sync()
              setNote(null)
            }}
          >
            {t(`campus.level.${id}`)}
          </Button>
        ))}
      </nav>

      {!path ? (
        <Empty emoji="📚" title={t('campus.pickPathFirst')} hint={t('campus.pickPathHint')} />
      ) : courses.length === 0 ? (
        <Empty emoji="📚" title={t('campus.empty')} hint={t('campus.emptyHint')} />
      ) : (
        <>
          <ul className="space-y-2">
            {courses.map((course) => {
              const copy = campusCopy(course, resolved)
              const open = selectedId === course.id
              return (
                <li key={course.id}>
                  <button
                    type="button"
                    onClick={() => {
                      selectCampusCourse(course.id)
                      sync()
                    }}
                    className={cn(
                      'btn-press w-full rounded-2xl border bg-surface-2/60 p-4 text-left',
                      open ? 'border-[var(--theme-accent)]' : 'border-border',
                    )}
                  >
                    <h2 className="text-base font-semibold text-ink">
                      {course.emoji} {copy.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted">{copy.blurb}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge>{t(`campus.level.${course.level}`)}</Badge>
                      <Badge>{copy.duration}</Badge>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>

          {selected && selectedCopy && (
            <section className="rounded-2xl border border-border bg-surface-2/80 p-4" data-campus-cta="1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                {t('campus.freeToday')}: {freeLeft}
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink">
                {selected.emoji} {selectedCopy.title}
              </h2>
              {resume && progress?.courseId === selected.id && (
                <p className="mt-1 text-sm text-muted">
                  {t('campus.resumeStep')} {progress.step}
                </p>
              )}
              <Button className="mt-3 w-full" onClick={() => void runStart(false)}>
                {t('campus.start')}
              </Button>
              {note && <p className="mt-2 text-xs text-muted">{note}</p>}
            </section>
          )}
        </>
      )}

      {paywall && !kids && (
        <SoftPaywall
          title={t('campus.extraTitle')}
          hint={t('campus.extraHint')}
          cost={CREDITS_COSTS.assist_priority.credits}
          onBuy={buyExtra}
          onClose={() => setPaywall(false)}
        />
      )}
    </div>
  )
}
