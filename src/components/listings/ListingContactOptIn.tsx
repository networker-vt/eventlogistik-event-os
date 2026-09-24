import { Input } from '../ui/Input'
import { useI18n } from '../../lib/i18n'

type ListingContactOptInProps = {
  showContact: boolean
  onShowContact: (value: boolean) => void
  reuseProfile: boolean
  onReuseProfile: (value: boolean) => void
  email: string
  onEmail: (value: string) => void
  phone: string
  onPhone: (value: string) => void
}

/** Final-step opt-in. Default off. Own fields, or an explicit copy of profile data. */
export function ListingContactOptIn({
  showContact,
  onShowContact,
  reuseProfile,
  onReuseProfile,
  email,
  onEmail,
  phone,
  onPhone,
}: ListingContactOptInProps) {
  const { t } = useI18n()
  return (
    <fieldset className="space-y-2 rounded-2xl border border-border p-3">
      <legend className="px-1 text-sm font-semibold">{t('listing.showContact')}</legend>
      <label className="flex min-h-11 items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={showContact}
          onChange={(event) => onShowContact(event.target.checked)}
        />
        <span>
          {t('listing.showContact')}
          <span className="block text-xs text-muted">{t('listing.showContactHint')}</span>
        </span>
      </label>
      {showContact && (
        <div className="space-y-2">
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={reuseProfile}
              onChange={(event) => onReuseProfile(event.target.checked)}
            />
            {t('listing.reuseProfile')}
          </label>
          {!reuseProfile && (
            <>
              <Input
                label={t('listing.contactEmail')}
                type="email"
                autoComplete="off"
                value={email}
                onChange={(event) => onEmail(event.target.value)}
              />
              <Input
                label={t('listing.contactPhone')}
                type="tel"
                autoComplete="off"
                value={phone}
                onChange={(event) => onPhone(event.target.value)}
              />
            </>
          )}
        </div>
      )}
    </fieldset>
  )
}
