import type { Listing } from '../../types'
import { useI18n } from '../../lib/i18n'
import { resolveSeller, SELLER_HINT_DE, SELLER_HINT_EN } from '../../lib/seller'

export function SellerLabel({ listing }: { listing: Pick<Listing, 'sellerKind' | 'trader'> }) {
  const { resolved } = useI18n()
  const de = resolved === 'de'
  const seller = resolveSeller(listing)
  const hint = de ? SELLER_HINT_DE[seller.kind] : SELLER_HINT_EN[seller.kind]
  return (
    <div className="rounded-xl border border-border bg-surface-3/60 px-3 py-2 text-sm">
      <p className="font-medium text-ink">{seller.kind === 'commercial' ? (de ? 'Gewerblich' : 'Commercial') : de ? 'Privat' : 'Private'}</p>
      {seller.trader && (
        <p className="mt-1 text-neutral-300">
          {seller.trader.name}
          <br />
          {seller.trader.address}
          <br />
          {seller.trader.email} · {seller.trader.phone}
        </p>
      )}
      <p className="mt-1 text-muted">{hint}</p>
    </div>
  )
}
