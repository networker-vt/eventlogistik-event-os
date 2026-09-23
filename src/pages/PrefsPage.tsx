import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic } from 'lucide-react'
import { OrbitRobot } from '../components/home/OrbitRobot'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { LANGUAGES } from '../data/industries'
import { useI18n } from '../lib/i18n'
import { isKidsMode } from '../lib/kids'
import { buildPrefsFromSetup, parseMarketplaceIntent } from '../lib/parseIntent'
import { completePrefs, getPrefs, MARKETPLACE_INTERESTS, savePrefs, type MarketplaceInterest } from '../lib/prefs'
import { canListen, listenOnce } from '../lib/speech'
import { cn } from '../lib/utils'

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition',
        active
          ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/15 text-[var(--theme-accent)]'
          : 'border-border bg-surface-2 text-neutral-300 hover:border-[var(--theme-accent)]/40',
      )}
    >
      {children}
    </button>
  )
}

function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value]
}

export function PrefsPage() {
  const navigate = useNavigate()
  const { t, resolved } = useI18n()
  const initial = useMemo(() => getPrefs(), [])
  const kids = useMemo(() => isKidsMode(), [])
  const [step, setStep] = useState(0)
  const [note, setNote] = useState(initial.todayNote)
  const [languages, setLanguages] = useState<string[]>(initial.seeker.languages)
  const [radiusKm, setRadiusKm] = useState(initial.seeker.radiusKm || 50)
  const [cities, setCities] = useState<string[]>(initial.seeker.cities)
  const [interests, setInterests] = useState<MarketplaceInterest[]>(initial.interests)
  const [languagesTouched, setLanguagesTouched] = useState(false)
  const [radiusTouched, setRadiusTouched] = useState(false)
  const [citiesTouched, setCitiesTouched] = useState(false)
  const [interestsTouched, setInterestsTouched] = useState(initial.interests.length > 0)
  const [cityDraft, setCityDraft] = useState('')
  const [listening, setListening] = useState(false)
  const [voiceConsent, setVoiceConsent] = useState<'idle' | 'ask' | 'yes'>('idle')
  const speechOk = canListen()
  const parsed = useMemo(() => parseMarketplaceIntent(note), [note])
  const interestChoices = MARKETPLACE_INTERESTS.filter((id) => !(kids && id === 'social'))
  const steps = ['prefs.stepToday', 'prefs.stepLocale', 'prefs.stepInterests'] as const

  const resolvedLanguages = languagesTouched
    ? languages
    : parsed.languages.length
      ? parsed.languages
      : languages
  const resolvedRadius = radiusTouched ? radiusKm : (parsed.radiusKm ?? radiusKm)
  const resolvedCities = citiesTouched ? cities : parsed.cities.length ? parsed.cities : cities
  const resolvedInterests = interestsTouched ? interests : parsed.interests

  const finish = () => {
    const next = buildPrefsFromSetup({
      note,
      languages: resolvedLanguages.length ? resolvedLanguages : ['Deutsch', 'Englisch'],
      radiusKm: resolvedRadius,
      cities: resolvedCities,
      interests: kids ? resolvedInterests.filter((id) => id !== 'social') : resolvedInterests,
      currentSide: initial.side,
      kids,
    })
    savePrefs(next)
    completePrefs(next.side)
    navigate('/')
  }

  const goNext = () => {
    if (step === 0) {
      if (!languagesTouched && parsed.languages.length) setLanguages(parsed.languages)
      if (!radiusTouched && parsed.radiusKm != null) setRadiusKm(parsed.radiusKm)
      if (!citiesTouched && parsed.cities.length) setCities(parsed.cities)
      if (!interestsTouched) setInterests(parsed.interests.filter((id) => !(kids && id === 'social')))
    }
    setStep((current) => Math.min(current + 1, steps.length - 1))
  }

  const startVoice = async () => {
    if (!speechOk || listening) return
    setListening(true)
    const said = await listenOnce(resolved === 'de' ? 'de-DE' : 'en-GB')
    setListening(false)
    if (said) setNote((prev) => (prev.trim() ? `${prev.trim()} ${said}` : said))
  }

  const onVoice = () => {
    if (!speechOk || listening) return
    if (voiceConsent !== 'yes') {
      setVoiceConsent('ask')
      return
    }
    void startVoice()
  }

  const heard = (kids ? parsed.interests.filter((id) => id !== 'social') : parsed.interests)
    .map((id) => t(`interest.${id}`))
    .join(' · ')

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-scroll-chrome" data-setup="orbi">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <OrbitRobot size="lg" label={t('prefs.kicker')} />
          <p className="text-sm font-semibold text-[var(--theme-accent)]">{t('prefs.kicker')}</p>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t('prefs.title')}</h1>
        <p className="text-sm text-muted">{t('prefs.lead')}</p>
        <p className="text-xs text-neutral-400">{t('prefs.privacy')}</p>
      </header>

      <div className="flex gap-1" aria-hidden>
        {steps.map((label, index) => (
          <div
            key={label}
            className={cn('h-1.5 flex-1 rounded-full', index <= step ? 'bg-[var(--theme-accent)]' : 'bg-surface-3')}
          />
        ))}
      </div>
      <p className="text-xs text-muted">
        {t('prefs.stepWord')} {step + 1}/{steps.length}: {t(steps[step])}
      </p>

      {step === 0 && (
        <section className="space-y-3">
          <label className="block">
            <span className="sr-only">{t('prefs.stepToday')}</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              placeholder={t('prefs.placeholder')}
              className="w-full resize-none rounded-2xl border border-border bg-surface-2 px-3 py-3 text-base text-ink placeholder:text-muted outline-none focus:border-[var(--theme-accent)]/50"
            />
          </label>
          <p className="text-xs text-muted">{t('prefs.hint')}</p>
          {heard && (
            <p className="text-xs text-ink" data-orbi-heard="1">
              {t('prefs.heard')}: {heard}
            </p>
          )}
          {speechOk ? (
            <div className="space-y-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onVoice}
                disabled={listening}
                aria-pressed={listening}
              >
                <Mic size={16} /> {listening ? t('prefs.voiceListening') : t('prefs.voice')}
              </Button>
              {voiceConsent === 'ask' && (
                <div className="rounded-2xl border border-border bg-surface-2 p-3 text-sm" data-voice-consent="1">
                  <p>{t('prefs.voiceConsent')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setVoiceConsent('yes')
                        void startVoice()
                      }}
                    >
                      {t('prefs.voiceAllow')}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setVoiceConsent('idle')}>
                      {t('prefs.voiceCancel')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted">{t('prefs.voiceFallback')}</p>
          )}
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4">
          <div>
            <h2 className="mb-2 text-sm font-semibold">{t('prefs.languages')}</h2>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((language) => (
                <Chip
                  key={language}
                  active={resolvedLanguages.includes(language)}
                  onClick={() => {
                    setLanguagesTouched(true)
                    setLanguages(toggle(resolvedLanguages, language))
                  }}
                >
                  {language}
                </Chip>
              ))}
            </div>
          </div>
          <label className="block text-sm font-semibold">
            {t('prefs.radius')}
            <Input
              type="number"
              className="mt-1"
              min={0}
              value={resolvedRadius}
              onChange={(event) => {
                setRadiusTouched(true)
                setRadiusKm(Number(event.target.value) || 0)
              }}
            />
          </label>
          <div>
            <h2 className="mb-2 text-sm font-semibold">{t('prefs.cities')}</h2>
            {resolvedCities.length === 0 ? (
              <p className="text-xs text-muted">{t('prefs.noCity')}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {resolvedCities.map((city) => (
                  <Chip
                    key={city}
                    active
                    onClick={() => {
                      setCitiesTouched(true)
                      setCities(resolvedCities.filter((item) => item !== city))
                    }}
                  >
                    {city}
                  </Chip>
                ))}
              </div>
            )}
            <Input
              className="mt-2"
              value={cityDraft}
              placeholder={t('prefs.cityPh')}
              onChange={(event) => setCityDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return
                event.preventDefault()
                const value = cityDraft.trim()
                if (!value || resolvedCities.includes(value)) return
                setCitiesTouched(true)
                setCities([...resolvedCities, value])
                setCityDraft('')
              }}
            />
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-3">
          {note.trim() && (
            <p className="text-sm text-muted">
              <span className="font-medium text-ink">{t('prefs.note')}: </span>
              {note.trim()}
            </p>
          )}
          <h2 className="text-sm font-semibold">{t('prefs.interests')}</h2>
          <p className="text-xs text-muted">{t('prefs.interestsHint')}</p>
          <div className="flex flex-wrap gap-2">
            {interestChoices.map((id) => (
              <Chip
                key={id}
                active={resolvedInterests.includes(id)}
                onClick={() => {
                  setInterestsTouched(true)
                  const next = resolvedInterests.includes(id)
                    ? resolvedInterests.filter((item) => item !== id)
                    : [...resolvedInterests, id]
                  setInterests(next)
                }}
              >
                {t(`interest.${id}`)}
              </Chip>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep((current) => current - 1)}>
            {t('prefs.back')}
          </Button>
        )}
        <Button variant="secondary" onClick={finish}>
          {t('prefs.skip')}
        </Button>
        <div className="flex-1" />
        {step < steps.length - 1 ? (
          <Button onClick={goNext}>{t('prefs.next')}</Button>
        ) : (
          <Button onClick={finish}>{t('prefs.finish')}</Button>
        )}
      </div>
    </div>
  )
}
