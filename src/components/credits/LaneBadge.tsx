import { Badge } from '../ui/Badge'
import { useI18n } from '../../lib/i18n'

export function LaneBadge({ lane }: { lane: 'free' | 'credits' }) {
  const { t } = useI18n()
  if (lane === 'free') {
    return <Badge tone="green">{t('credits.badgeFree')}</Badge>
  }
  return <Badge tone="violet">{t('credits.badgePaid')}</Badge>
}
