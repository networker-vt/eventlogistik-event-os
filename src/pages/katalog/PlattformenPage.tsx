import { ExternalLink } from 'lucide-react'
import { FavoriteButton } from '../../components/favorites/FavoriteButton'
import { Badge } from '../../components/ui/Badge'
import { catalogPlatforms } from '../../data/catalog'

export function PlattformenPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-300">
        Outbound-Discovery — keine gescrapten Nutzerdatenbanken. Links führen zu öffentlichen Portalen.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {catalogPlatforms.map((p) => (
          <article
            key={p.id}
            className="card-elevated relative space-y-2 rounded-2xl border border-border p-4 transition hover:border-teal/40"
          >
            <div className="flex items-start justify-between gap-2">
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 text-sm font-semibold text-white hover:text-teal"
              >
                {p.name}
              </a>
              <div className="flex items-center gap-1">
                <FavoriteButton catalog={{ kind: 'platform', id: p.id }} />
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${p.name} öffnen`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-teal hover:bg-white/5"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-neutral-300">{p.blurbDe}</p>
            <div className="flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
