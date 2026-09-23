import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { DEMO_USER_ID } from '../../data/seed'
import { useI18n } from '../../lib/i18n'
import { kidsHideTravel } from '../../lib/kids'
import { canListen, captureConsentedVoice } from '../../lib/speech'
import { grantVoiceConsent, voiceConsentGranted } from '../../lib/voiceConsent'
import { VoiceConsentAsk } from '../voice/VoiceConsentAsk'
import { bookTripOption } from '../../lib/tickets'
import {
  TRIP_DEMO_DISCLAIMER_DE,
  TRIP_DEMO_DISCLAIMER_EN,
  localizeTripOption,
  matchSpokenTripChoice,
  tripOptionAt,
  type TripOption,
} from '../../lib/trip'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

/**
 * Assist *result* only — max 3 hairline cards.
 * Whole card is the tap surface (no parallel filled primaries).
 * Voice whitelist selects; Bestätigen is the only booking step.
 */
export function TripOptionCards({
  options,
  pendingVoice,
  onConsumedVoice,
}: {
  options: TripOption[]
  pendingVoice?: 1 | 2 | 3 | null
  onConsumedVoice?: () => void
}) {
  const { t, resolved } = useI18n()
  const { user, loginDemo } = useAuth()
  const navigate = useNavigate()
  const kids = kidsHideTravel()
  const cards = useMemo(() => options.slice(0, 3), [options])
  const [tapped, setTapped] = useState<TripOption | null>(null)
  const [listening, setListening] = useState(false)
  const [voiceAsk, setVoiceAsk] = useState(false)
  const [voiceNote, setVoiceNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const voicePick = !kids && pendingVoice ? tripOptionAt(cards, pendingVoice) : null
  const picked = tapped ?? voicePick

  const open = (opt: TripOption | null) => {
    if (kids || !opt) return
    setErr(null)
    setTapped(opt)
    onConsumedVoice?.()
  }

  const closeSheet = () => {
    setTapped(null)
    setErr(null)
    onConsumedVoice?.()
  }

  const startVoice = async () => {
    if (kids || !canListen() || listening) return
    if (!voiceConsentGranted()) return
    setListening(true)
    setVoiceNote(null)
    const said = await captureConsentedVoice(resolved === 'de' ? 'de-DE' : 'en-GB')
    setListening(false)
    if (!said) return
    const n = matchSpokenTripChoice(said)
    if (!n) {
      setVoiceNote(t('trip.voiceReject'))
      return
    }
    open(tripOptionAt(cards, n))
  }

  const onVoice = () => {
    if (kids || !canListen() || listening) return
    if (!voiceConsentGranted()) {
      setVoiceAsk(true)
      return
    }
    void startVoice()
  }

  const confirm = async () => {
    if (kids || !picked || busy) return
    setBusy(true)
    setErr(null)
    if (!user) loginDemo()
    const result = await bookTripOption({
      option: picked,
      payerId: user?.id ?? DEMO_USER_ID,
      payerName: user?.name ?? 'Alex Müller',
    })
    setBusy(false)
    if (!result.ok) {
      setErr(t('trip.fail'))
      return
    }
    closeSheet()
    navigate(`/tickets/${result.ticket.id}`)
  }

  if (!cards.length) return null
  const disclaimer = resolved === 'de' ? TRIP_DEMO_DISCLAIMER_DE : TRIP_DEMO_DISCLAIMER_EN

  return (
    <div className="assist-result space-y-5" data-trip-options={cards.length} data-orbi-trip="1">
      <div className="space-y-2">
        <p className="text-[13px] font-medium tracking-wide text-muted">{t('trip.orbi')}</p>
        <p className="text-[15px] leading-relaxed text-ink-soft">{t('trip.lead')}</p>
        <p className="text-[12px] leading-relaxed text-amber-200">{t('trip.demo')}</p>
      </div>

      {kids && <p className="text-[13px] text-muted">{t('trip.kids')}</p>}

      <ul className="space-y-4">
        {cards.map((opt, i) => {
          const copy = localizeTripOption(opt, resolved)
          const body = (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted">
                  {i + 1} · {copy.label}
                </p>
                <p className="text-xl font-semibold tabular-nums tracking-tight text-ink">{copy.priceHint}</p>
              </div>
              <p className="mt-3 text-[17px] font-medium leading-snug tracking-tight text-ink">{copy.flightSketch}</p>
              <dl className="mt-4 space-y-2 text-[15px] leading-relaxed text-ink-soft">
                <div>
                  <dt className="sr-only">{t('trip.hotel')}</dt>
                  <dd>{copy.hotelHint}</dd>
                </div>
                <div>
                  <dt className="sr-only">{t('trip.transfer')}</dt>
                  <dd>{copy.transferHint}</dd>
                </div>
                <div>
                  <dt className="sr-only">{t('trip.duration')}</dt>
                  <dd>{copy.durationHint}</dd>
                </div>
              </dl>
              {!kids && <p className="mt-5 text-[15px] text-ink-soft">{t('trip.choose')}</p>}
            </>
          )
          return (
            <li key={opt.id}>
              {kids ? (
                <div className="trip-card">{body}</div>
              ) : (
                <button
                  type="button"
                  className="trip-card trip-card-tap w-full text-left"
                  onClick={() => open(opt)}
                  data-trip-axis={opt.axis}
                  aria-label={`${i + 1}. ${copy.label}. ${t('trip.choose')}`}
                >
                  {body}
                </button>
              )}
            </li>
          )
        })}
      </ul>

      {!kids && canListen() && (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onVoice}
            className={cn('self-start', listening && 'bg-[var(--theme-accent)]/10')}
            aria-label={t('trip.voice')}
          >
            <Mic size={16} /> {t('trip.voice')}
          </Button>
          {voiceAsk && (
            <VoiceConsentAsk
              onAllow={() => {
                grantVoiceConsent()
                setVoiceAsk(false)
                void startVoice()
              }}
              onCancel={() => setVoiceAsk(false)}
            />
          )}
          <p className="text-[12px] text-muted">{t('trip.voiceHint')}</p>
          {voiceNote && <p className="text-[12px] text-amber-200">{voiceNote}</p>}
        </div>
      )}

      <p className="text-[12px] leading-relaxed text-muted">{disclaimer}</p>

      {picked && !kids && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/25 p-4 md:items-center"
          role="presentation"
          onClick={closeSheet}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-confirm-title"
            className="assist-result w-full max-w-md space-y-5 rounded-[1.25rem] border border-border/80 bg-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted">{t('trip.confirmKicker')}</p>
            <h2 id="trip-confirm-title" className="text-2xl font-semibold tracking-tight text-ink">
              {localizeTripOption(picked, resolved).label}
            </h2>
            <p className="text-[17px] leading-snug text-ink">{localizeTripOption(picked, resolved).flightSketch}</p>
            <p className="text-[15px] text-ink-soft">{localizeTripOption(picked, resolved).priceHint}</p>
            <p className="text-[13px] leading-relaxed text-amber-200">{t('trip.confirmLead')}</p>
            {err && <p className="text-[13px] text-rose-300">{err}</p>}
            <div className="flex flex-col gap-2 pt-1">
              <Button type="button" className="w-full" disabled={busy} onClick={() => void confirm()} data-trip-confirm="1">
                {busy ? t('trip.working') : t('trip.confirm')}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={closeSheet}>
                {t('trip.back')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
