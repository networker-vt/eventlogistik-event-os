import { CATALOG_DISCLAIMER_DE } from '../../data/catalog'

export function CatalogDisclaimer({ className = '' }: { className?: string }) {
  return (
    <p
      className={`rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100/90 ${className}`}
    >
      {CATALOG_DISCLAIMER_DE}
    </p>
  )
}
