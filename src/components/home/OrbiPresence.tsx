import { Button } from '../ui/Button'
import { useI18n } from '../../lib/i18n'

const TOUR_KEYS = ['orbi.tour1', 'orbi.tour2', 'orbi.tour3'] as const

export function OrbiPresence({
  kind,
  step,
  kids,
  onStart,
  onLater,
  onNext,
  onSkip,
  onHide,
  onDone,
}: {
  kind: 'intro' | 'tour'
  step: number
  kids: boolean
  onStart?: () => void
  onLater?: () => void
  onNext?: () => void
  onSkip?: () => void
  onHide?: () => void
  onDone?: () => void
}) {
  const { t } = useI18n()
  if (kind === 'intro') {
    return (
      <section
        data-orbi-panel="intro"
        className="w-full rounded-2xl border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 px-4 py-3 text-left"
        aria-label={t('orbi.introTitle')}
      >
        <p className="text-sm font-semibold text-ink">{t('orbi.introTitle')}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{kids ? t('orbi.introKids') : t('orbi.introBody')}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={onStart}>
            {t('orbi.introStart')}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onLater}>
            {t('orbi.introLater')}
          </Button>
        </div>
      </section>
    )
  }

  const last = step >= TOUR_KEYS.length - 1
  const copyKey = kids && step === 1 ? 'orbi.tour2Kids' : TOUR_KEYS[Math.min(step, TOUR_KEYS.length - 1)]
  return (
    <section
      data-orbi-panel="tour"
      data-orbi-tour-step={step}
      className="w-full rounded-2xl border border-border/80 bg-surface-2/70 px-4 py-3 text-left"
      aria-label={t('orbi.tourLabel')}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
        {t('orbi.tourKicker')} {step + 1}/{TOUR_KEYS.length}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-ink">{t(copyKey)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {last ? (
          <Button type="button" size="sm" onClick={onDone}>
            {t('orbi.tourDone')}
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={onNext}>
            {t('orbi.tourNext')}
          </Button>
        )}
        <Button type="button" size="sm" variant="ghost" onClick={onSkip}>
          {t('orbi.tourSkip')}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onHide}>
          {t('orbi.tourHide')}
        </Button>
      </div>
    </section>
  )
}
