import { FavoriteButton } from '../../components/favorites/FavoriteButton'
import { Badge } from '../../components/ui/Badge'
import { vehicleSizes } from '../../data/catalog'
import { Link } from 'react-router-dom'

export function FahrzeuggroessenPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-300">
        Referenz-Taxonomie für Event-Transport. Beim Inserieren unter{' '}
        <Link to="/listings/new?vertical=transporter" className="text-cyan hover:underline">
          Transporter anlegen
        </Link>{' '}
        auswählbar.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {vehicleSizes.map((v) => (
          <article key={v.id} className="card-elevated space-y-2 rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">{v.label}</h2>
              <div className="flex items-center gap-1">
                <FavoriteButton catalog={{ kind: 'vehicle', id: v.id }} />
                <Badge tone="cyan">{v.shortLabel}</Badge>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-xs text-neutral-300">
              {v.volumeM3Hint && (
                <>
                  <dt className="text-muted">Volumen</dt>
                  <dd>{v.volumeM3Hint}</dd>
                </>
              )}
              {v.payloadHint && (
                <>
                  <dt className="text-muted">Nutzlast</dt>
                  <dd>{v.payloadHint}</dd>
                </>
              )}
              <dt className="text-muted">Fahrer</dt>
              <dd>
                {v.withDriver === true
                  ? 'mit Fahrer'
                  : v.withDriver === false
                    ? 'ohne Fahrer'
                    : 'optional'}
              </dd>
            </dl>
            {v.notes && <p className="text-xs text-muted">{v.notes}</p>}
          </article>
        ))}
      </div>
    </div>
  )
}
