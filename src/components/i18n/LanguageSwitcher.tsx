import { LOCALES, useI18n } from '../../lib/i18n'

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t, stub } = useI18n()
  return (
    <div className="space-y-1.5">
      {!compact && (
        <label htmlFor="orbit-lang" className="block text-sm font-semibold">
          {t('mein.language')}
        </label>
      )}
      <select
        id="orbit-lang"
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        aria-label={t('mein.language')}
        className="min-h-11 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-base text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] md:text-sm"
      >
        {LOCALES.map((l) => (
          <option key={l.id} value={l.id}>
            {l.native}
            {l.stub ? ' (stub)' : ''}
          </option>
        ))}
      </select>
      {stub && !compact && <p className="text-xs text-amber-200/90">{t('stub.banner')}</p>}
    </div>
  )
}
