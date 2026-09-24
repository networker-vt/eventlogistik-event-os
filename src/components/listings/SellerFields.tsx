import type { SellerKind, TraderDetails } from '../../lib/seller'

const empty = { name: '', address: '', email: '', phone: '' }

export function emptyTrader(): TraderDetails {
  return { ...empty }
}

export function SellerFields({
  kind,
  onKind,
  trader,
  onTrader,
}: {
  kind: SellerKind
  onKind: (kind: SellerKind) => void
  trader: TraderDetails
  onTrader: (trader: TraderDetails) => void
}) {
  return (
    <fieldset className="space-y-2 rounded-2xl border border-border p-3">
      <legend className="px-1 text-sm font-semibold">Privat oder gewerblich</legend>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="radio" name="seller-kind" checked={kind === 'private'} onChange={() => onKind('private')} />
        Privat
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="radio" name="seller-kind" checked={kind === 'commercial'} onChange={() => onKind('commercial')} />
        Gewerblich
      </label>
      {kind === 'commercial' && (
        <div className="space-y-2">
          <p className="text-xs text-muted">Pflicht: Name, Anschrift, E-Mail, Telefon.</p>
          {(
            [
              ['name', 'Name'],
              ['address', 'Anschrift'],
              ['email', 'E-Mail'],
              ['phone', 'Telefon'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm">
              {label}
              <input
                className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface-3 px-3"
                value={trader[key]}
                onChange={(e) => onTrader({ ...trader, [key]: e.target.value })}
              />
            </label>
          ))}
        </div>
      )}
    </fieldset>
  )
}
