import { useEffect, useMemo, useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button, ButtonLink } from '../components/ui/Button'
import { Empty } from '../components/ui/Empty'
import { useI18n } from '../lib/i18n'
import {
  CAMPUS_LEVELS,
  campusCopy,
  filterCourses,
  getCampusProgress,
  getCourse,
  resumeCampus,
  subscribeCampus,
  type CampusLevel,
} from '../lib/campus'
import { isKidsMode, subscribeKids } from '../lib/kids'
import { cn } from '../lib/utils'

export function CampusPage() {
  const { t, resolved } = useI18n()
  const [level, setLevel] = useState<CampusLevel | 'all'>('all')
  const [kids, setKids] = useState(isKidsMode)
  const [progress, setProgress] = useState(getCampusProgress)
  const [openId, setOpenId] = useState<string | null>(progress?.courseId ?? null)

  useEffect(() => subscribeKids(() => setKids(isKidsMode())), [])
  useEffect(() => subscribeCampus(() => setProgress(getCampusProgress())), [])

  const courses = useMemo(() => filterCourses(level, kids), [level, kids])
  const resume = progress ? getCourse(progress.courseId) : null
  const resumeCopy = resume ? campusCopy(resume, resolved) : null

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-scroll-chrome">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--theme-accent)]">{t('campus.kicker')}</p>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <GraduationCap size={22} /> {t('campus.title')}
        </h1>
        <p className="text-sm text-muted">{t('campus.lead')}</p>
      </header>

      {resume && resumeCopy && (
        <section className="rounded-2xl border border-[var(--theme-accent)]/35 bg-[var(--theme-accent)]/8 p-4" data-campus-resume="1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">{t('campus.resume')}</p>
          <h2 className="mt-1 text-base font-semibold text-ink">
            {resume.emoji} {resumeCopy.title}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {t('campus.resumeStep')} {progress?.step ?? 1}
          </p>
          <Button
            className="mt-3"
            variant="secondary"
            onClick={() => {
              setOpenId(resume.id)
              resumeCampus(resume.id, (progress?.step ?? 1) + 1)
            }}
          >
            {t('campus.continue')}
          </Button>
        </section>
      )}

      <nav aria-label={t('campus.filters')} className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={level === 'all' ? 'tonal' : 'secondary'}
          onClick={() => setLevel('all')}
        >
          {t('campus.all')}
        </Button>
        {CAMPUS_LEVELS.map((id) => (
          <Button
            key={id}
            size="sm"
            variant={level === id ? 'tonal' : 'secondary'}
            onClick={() => setLevel(id)}
          >
            {t(`campus.level.${id}`)}
          </Button>
        ))}
      </nav>

      {courses.length === 0 ? (
        <Empty emoji="📚" title={t('campus.empty')} hint={t('campus.emptyHint')} />
      ) : (
        <ul className="space-y-2">
          {courses.map((course) => {
            const copy = campusCopy(course, resolved)
            const open = openId === course.id
            return (
              <li key={course.id}>
                <article
                  className={cn(
                    'rounded-2xl border bg-surface-2/60 p-4',
                    open ? 'border-[var(--theme-accent)]' : 'border-border',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-ink">
                        {course.emoji} {copy.title}
                      </h2>
                      <p className="mt-1 text-sm text-muted">{copy.blurb}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge>{t(`campus.level.${course.level}`)}</Badge>
                        <Badge>{copy.duration}</Badge>
                        {course.premium && <Badge tone="amber">{t('campus.premiumLater')}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setOpenId(course.id)
                        resumeCampus(course.id, 1)
                      }}
                    >
                      {t('campus.start')}
                    </Button>
                    {course.premium && (
                      <ButtonLink to="/wallet" size="sm" variant="ghost">
                        {t('campus.premiumHint')}
                      </ButtonLink>
                    )}
                  </div>
                  {open && (
                    <p className="mt-3 border-t border-border/70 pt-3 text-sm text-ink-soft">{t('campus.lessonStub')}</p>
                  )}
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
