import { Button } from '../ui/Button'
import { useI18n } from '../../lib/i18n'

/** Same consent panel Prefs shows before any SpeechRecognition start. */
export function VoiceConsentAsk({ onAllow, onCancel }: { onAllow: () => void; onCancel: () => void }) {
  const { t } = useI18n()
  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-3 text-sm" data-voice-consent="1">
      <p>{t('prefs.voiceConsent')}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={onAllow}>
          {t('prefs.voiceAllow')}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          {t('prefs.voiceCancel')}
        </Button>
      </div>
    </div>
  )
}
