import { useState } from 'react'
import { Shield } from 'lucide-react'
import { ParentalGate } from '../components/kids/ParentalGate'
import { ButtonLink } from '../components/ui/Button'
import { useI18n } from '../lib/i18n'
import {
  AGE_BANDS,
  AGE_BAND_COPY,
  getKids,
  isKidsMode,
  kidsAgeBand,
  leaveKidsMode,
  setAgeBand,
  type AgeBand,
} from '../lib/kids'
import { cn } from '../lib/utils'

export function KidsPage() {
  const { t, resolved } = useI18n()
  const [band, setBand] = useState<AgeBand | null>(kidsAgeBand)
  const [kids, setKids] = useState(isKidsMode)
  const [gate, setGate] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  const pick = (next: AgeBand) => {
    if (next === '18+' && isKidsMode()) {
      setGate(true)
      return
    }
    setAgeBand(next)
    setBand(next)
    setKids(isKidsMode())
    setFlash(t('kids.saved'))
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-scroll-chrome">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--theme-accent)]">Orbit Kids</p>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Shield size={22} /> {t('kids.title')}
        </h1>
        <p className="text-sm text-muted">{t('kids.lead')}</p>
      </header>

      {flash && (
        <p className="rounded-xl border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 px-3 py-2 text-xs">
          {flash}
        </p>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">{t('kids.ageTitle')}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {AGE_BANDS.map((id) => {
            const copy = AGE_BAND_COPY[id]
            const active = band === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => pick(id)}
                className={cn(
                  'btn-press rounded-2xl border-2 p-4 text-left',
                  active
                    ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/10'
                    : 'border-border bg-surface-2 hover:border-[var(--theme-accent)]/50',
                )}
              >
                <span className="block font-semibold text-ink">{t(`kids.band.${id}`)}</span>
                <span className="mt-1 block text-xs text-muted">{resolved === 'de' ? copy.hintDe : copy.hintEn}</span>
              </button>
            )
          })}
        </div>
      </section>

      {kids && (
        <p className="text-sm text-muted">
          {t('kids.modeOn')} · {getKids().ageBand ? t(`kids.band.${getKids().ageBand}`) : ''}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <ButtonLink to="/campus" variant="secondary">
          {t('campus.nav')}
        </ButtonLink>
        <ButtonLink to="/treffer" variant="secondary">
          {t('nav.match')}
        </ButtonLink>
        <ButtonLink to="/" variant="ghost">
          {t('nav.home')}
        </ButtonLink>
      </div>

      <ParentalGate
        open={gate}
        reason="leave_kids"
        onClose={() => setGate(false)}
        onUnlocked={() => {
          setGate(false)
          if (leaveKidsMode()) {
            setBand('18+')
            setKids(false)
            setFlash(t('kids.left'))
          }
        }}
      />
    </div>
  )
}
