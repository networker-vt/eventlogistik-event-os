import { useState } from 'react'
import { MessageCircle, Share2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { useI18n } from '../../lib/i18n'
import { shareOrCopy, whatsappShareHref, type SharePayload } from '../../lib/share'

const externalClass =
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border-2 border-[var(--theme-accent,#0f766e)] bg-transparent px-4 text-base font-semibold text-[var(--theme-accent,#0f766e)] touch-manipulation'

export function ShareActions({ title, text, url }: SharePayload) {
  const { t } = useI18n()
  const [toast, setToast] = useState(false)
  const [manual, setManual] = useState<string | null>(null)
  const whatsapp = whatsappShareHref({ text, url })

  const onShare = async () => {
    const result = await shareOrCopy({ title, text, url })
    if (result.status === 'copied') {
      setManual(null)
      setToast(true)
      window.setTimeout(() => setToast(false), 2000)
      return
    }
    if (result.status === 'manual') {
      setToast(false)
      setManual(result.url)
      return
    }
    setManual(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="min-w-11 text-base" onClick={() => void onShare()}>
          <Share2 size={18} aria-hidden /> {t('share.action')}
        </Button>
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={externalClass}>
            <MessageCircle size={18} aria-hidden /> {t('share.whatsapp')}
          </a>
        )}
      </div>
      {toast && (
        <p
          role="status"
          aria-live="polite"
          className="fixed bottom-[calc(var(--el-nav-stack)+0.75rem)] left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--theme-accent)] px-4 py-3 text-base text-[var(--theme-on-accent)] shadow-lg"
        >
          {t('share.copied')}
        </p>
      )}
      {manual != null && (
        <label className="block text-sm text-ink">
          {t('share.manual')}
          <input
            readOnly
            value={manual}
            aria-label={t('share.manual')}
            onFocus={(event) => event.currentTarget.select()}
            className="mt-1 w-full min-h-11 rounded-xl border border-border bg-surface-2 px-3 text-base text-ink"
          />
        </label>
      )}
    </div>
  )
}
