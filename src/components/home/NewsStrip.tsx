import type { HomeNewsItem } from '../../data/homeNews'
import { newsTitle } from '../../lib/homeSuggestions'
import { useI18n } from '../../lib/i18n'
import { Badge } from '../ui/Badge'

export function NewsStrip({ items }: { items: HomeNewsItem[] }) {
  const { t, resolved } = useI18n()
  if (items.length === 0) return null
  return (
    <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/80 bg-surface-2/40">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-12 items-start gap-3 px-3 py-2.5 hover:bg-white/5"
          >
            <Badge tone="default" className="mt-0.5 shrink-0">
              {t(`news.cat.${item.cat}`)}
            </Badge>
            <span className="min-w-0 flex-1">
              <span className="block text-sm leading-snug text-white">{newsTitle(item, resolved)}</span>
              <span className="mt-0.5 block truncate text-[11px] text-muted">
                {item.source} · {t('news.demo')}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
