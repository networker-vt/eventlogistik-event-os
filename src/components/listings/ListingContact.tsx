import { MessageCircle } from 'lucide-react'
import { ContactButtons } from '../contact/ContactButtons'
import { useI18n } from '../../lib/i18n'
import { listingContactView } from '../../lib/listingContact'
import type { Listing } from '../../types'

const messageClass =
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-3 text-base text-ink touch-manipulation hover:border-[var(--theme-accent)]/50'

type ListingContactProps = {
  listing: Pick<Listing, 'sellerKind' | 'trader' | 'showContact' | 'publicContact' | 'venue' | 'city'>
  /** True when this view can open the in-app inquiry or interest form. */
  canMessage: boolean
}

/** Contact actions for one listing. Does not accept an account email or phone. */
export function ListingContact({ listing, canMessage }: ListingContactProps) {
  const { t } = useI18n()
  const view = listingContactView(listing)

  return (
    <div className="space-y-2">
      <ContactButtons phone={view.phone} email={view.email} address={view.address} links={view.links} />
      {!view.hasDirectContact && canMessage && (
        <a href="#listing-inquiry" className={messageClass}>
          <MessageCircle size={18} aria-hidden />
          {t('listing.message')}
        </a>
      )}
      {!view.hasDirectContact && !canMessage && (
        <p className="text-sm text-muted">{t('listing.noMessage')}</p>
      )}
    </div>
  )
}
