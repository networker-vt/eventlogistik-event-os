import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { canSpeak, speakText, stopSpeaking } from '../../lib/tts'
import { useI18n } from '../../lib/i18n'
import { cn } from '../../lib/utils'

export function SpeakButton({
  text,
  className,
  compact,
}: {
  text: string
  className?: string
  compact?: boolean
}) {
  const { t, locale } = useI18n()
  const [speaking, setSpeaking] = useState(false)
  const supported = canSpeak()

  useEffect(() => {
    return () => stopSpeaking()
  }, [])

  if (!supported) {
    return (
      <span className="sr-only">{t('speak.unsupported')}</span>
    )
  }

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    const ok = speakText(text, locale === 'de' ? 'de-DE' : locale === 'en' ? 'en-GB' : undefined)
    setSpeaking(Boolean(ok))
    if (ok) {
      window.setTimeout(() => setSpeaking(false), Math.min(60_000, Math.max(4000, text.length * 50)))
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      aria-label={speaking ? t('speak.stop') : t('speak.label')}
      className={cn(
        'tap-target inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-3/80 text-neutral-200 hover:border-[var(--theme-accent)] hover:text-ink',
        compact ? 'h-10 w-10' : 'min-h-10 px-3 py-2 text-xs font-medium',
        className,
      )}
    >
      {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
      {!compact && (speaking ? t('speak.stop') : t('speak.label'))}
    </button>
  )
}
