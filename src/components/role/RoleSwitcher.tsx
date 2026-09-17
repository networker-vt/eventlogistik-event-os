import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useI18n } from '../../lib/i18n'
import { getPrefs, savePrefs, type PrefsSide } from '../../lib/prefs'

const SIDES: { id: PrefsSide; titleKey: 'role.seeker' | 'role.company' | 'role.both'; hintKey: 'role.seekerHint' | 'role.companyHint' | 'role.bothHint' }[] = [
  { id: 'seeker', titleKey: 'role.seeker', hintKey: 'role.seekerHint' },
  { id: 'employer', titleKey: 'role.company', hintKey: 'role.companyHint' },
  { id: 'both', titleKey: 'role.both', hintKey: 'role.bothHint' },
]

export function RoleSwitcher({
  compact = false,
  onChange,
}: {
  compact?: boolean
  onChange?: (side: PrefsSide) => void
}) {
  const { t } = useI18n()
  const [side, setSide] = useState(() => getPrefs().side)

  const pick = (id: PrefsSide) => {
    setSide(id)
    savePrefs({ side: id })
    onChange?.(id)
  }

  const current = useMemo(() => SIDES.find((s) => s.id === side) ?? SIDES[0], [side])

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t('role.label')}>
        {SIDES.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={side === opt.id}
            onClick={() => pick(opt.id)}
            className={cn(
              'min-h-10 rounded-full border px-3 py-1.5 text-xs font-medium',
              side === opt.id
                ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/15 text-ink'
                : 'border-border bg-black/20 text-neutral-300',
            )}
          >
            {t(opt.titleKey)}
          </button>
        ))}
      </div>
    )
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-surface-2 p-4">
      <div className="flex items-center gap-2">
        <Building2 size={18} className="text-[var(--theme-accent)]" />
        <h2 className="text-lg font-semibold">{t('role.label')}</h2>
      </div>
      <p className="text-xs text-muted">{t('role.hint')}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {SIDES.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => pick(opt.id)}
            className={cn(
              'rounded-2xl border p-3 text-left transition',
              side === opt.id
                ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/10'
                : 'border-border bg-black/20 hover:border-[var(--theme-accent)]/40',
            )}
          >
            <div className="font-semibold text-ink">{t(opt.titleKey)}</div>
            <p className="mt-1 text-[11px] text-muted">{t(opt.hintKey)}</p>
            {side === opt.id && <Check size={14} className="mt-2 text-[var(--theme-accent)]" />}
          </button>
        ))}
      </div>
      {current.id !== 'seeker' && (
        <Link to="/firma" className="inline-block text-sm text-[var(--theme-accent)] hover:underline">
          {t('firma.openHub')}
        </Link>
      )}
    </section>
  )
}
