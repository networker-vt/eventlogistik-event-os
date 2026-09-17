import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getScheme, subscribeScheme, toggleScheme } from '../../lib/scheme'
import { useI18n } from '../../lib/i18n'

export function SchemeToggle({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n()
  const [scheme, setSchemeState] = useState(getScheme)

  useEffect(() => subscribeScheme(() => setSchemeState(getScheme())), [])

  const dark = scheme === 'dark'
  return (
    <button
      type="button"
      onClick={() => toggleScheme()}
      aria-label={t('scheme.toggle')}
      title={dark ? t('scheme.light') : t('scheme.dark')}
      className={
        compact
          ? 'tap-target flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-3 text-ink-soft'
          : 'inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-surface-3 px-3 py-2 text-sm text-ink-soft hover:text-ink'
      }
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
      {!compact && <span>{dark ? t('scheme.light') : t('scheme.dark')}</span>}
    </button>
  )
}
