import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { kidsAgeBand } from '../../lib/kids'

export function KidsBanner() {
  const { t } = useI18n()
  const band = kidsAgeBand()
  return (
    <div
      className="border-b border-[var(--theme-accent)]/25 bg-[var(--theme-accent)]/8 px-4 py-2 text-center text-xs text-ink-soft"
      data-kids-banner="1"
    >
      <span className="font-semibold text-ink">{t('kids.modeOn')}</span>
      {band ? <span> · {t(`kids.band.${band}`)}</span> : null}
      <span> · </span>
      <Link to="/kids" className="font-medium text-[var(--theme-accent)] hover:underline">
        {t('kids.settings')}
      </Link>
    </div>
  )
}
