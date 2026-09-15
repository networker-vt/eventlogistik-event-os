import { useI18n } from '../../lib/i18n'

export function SkipLink() {
  const { t } = useI18n()
  return (
    <a href="#main-content" className="skip-link">
      {t('skip.toContent')}
    </a>
  )
}
