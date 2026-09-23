import { Link, useParams } from 'react-router-dom'
import { ButtonLink } from '../components/ui/Button'
import { Empty } from '../components/ui/Empty'
import { KidsBlocked } from '../components/kids/KidsBlocked'
import { emitParentalRequired, kidsHideTravel } from '../lib/kids'
import { useI18n } from '../lib/i18n'
import { TRAVEL_DISCLAIMER_DE, TRAVEL_DISCLAIMER_EN, TRAVEL_KIND_META, getTravelOffer } from '../lib/travel'
import { offerOutboundHref } from '../lib/travelConnectors'

/**
 * Old /abflug/:id and /reise/:id links.
 * The stub catalog is not a live fare. This page only opens a public search.
 */
export function TravelCheckoutPage() {
  const { offerId } = useParams()
  const { t, resolved } = useI18n()
  const offer = offerId ? getTravelOffer(offerId) : undefined

  if (kidsHideTravel()) {
    return (
      <div className="mx-auto max-w-lg space-y-5 pb-scroll-chrome">
        <KidsBlocked title={t('kids.travelBlocked')} onAskParent={() => emitParentalRequired('leave_kids')} />
      </div>
    )
  }

  const disclaimer = resolved === 'de' ? TRAVEL_DISCLAIMER_DE : TRAVEL_DISCLAIMER_EN

  if (!offer) {
    return (
      <div className="mx-auto max-w-lg space-y-4 pb-scroll-chrome">
        <Empty
          emoji="✈️"
          title={t('checkout.missing')}
          hint={t('checkout.stubHint')}
          className="py-8"
        />
        <ButtonLink to="/abflug">{t('travel.title')}</ButtonLink>
      </div>
    )
  }

  const meta = TRAVEL_KIND_META[offer.kind]
  const href = offerOutboundHref(
    { kind: offer.kind, from: offer.from, to: offer.to, dateFrom: offer.dateFrom },
    resolved,
  )

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-scroll-chrome" data-travel-source="empty-cta">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-amber-200">{t('badge.demo')}</p>
        <h1 className="text-2xl font-bold tracking-tight">{t('checkout.stubTitle')}</h1>
        <p className="text-sm text-muted">{t('checkout.stubHint')}</p>
      </header>

      <p className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
        {disclaimer}
      </p>

      <section className="rounded-2xl border border-border bg-surface-2 p-4">
        <p className="text-sm font-semibold text-ink">
          {meta.emoji} {offer.title}
        </p>
        <p className="mt-1 text-xs text-muted">
          {resolved === 'de' ? meta.de : meta.en}
          {offer.from ? ` · ${offer.from}` : ''} → {offer.to}
        </p>
        <p className="mt-2 text-xs uppercase tracking-wide text-amber-200">Stub ≠ Live</p>
      </section>

      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--theme-accent)] px-4 text-sm font-semibold text-[var(--theme-on-accent)]"
        data-travel-outbound="1"
      >
        {t('checkout.openSearch')}
      </a>
      <Link to="/abflug" className="inline-flex min-h-11 items-center text-sm text-[var(--theme-accent)] hover:underline">
        {t('travel.title')}
      </Link>
    </div>
  )
}
