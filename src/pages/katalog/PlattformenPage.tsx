import { ExternalLink } from 'lucide-react'
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
          <a
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-elevated block space-y-2 rounded-2xl border border-border p-4 transition hover:border-teal/40"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-white">{p.name}</h2>
              <ExternalLink size={14} className="text-teal" />
            </div>
            <p className="text-xs leading-relaxed text-neutral-300">{p.blurbDe}</p>
            <div className="flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
