import type { HomeNewsItem } from '../../data/homeNews'
import { newsTitle } from '../../lib/homeSuggestions'
import { useI18n } from '../../lib/i18n'

/** Compact Home rail — not a CTA. Assist submit stays the only filled primary. */
export function NewsStrip({ items }: { items: HomeNewsItem[] }) {
  const { t, resolved } = useI18n()
  if (items.length === 0) return null
  return (
    <section className="space-y-1" aria-label={t('news.title')}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
        {t('news.title')} · {t('news.demo')}
      </p>
      <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-baseline gap-2 px-2.5 py-1.5 hover:bg-ink/5"
            >
              <span className="shrink-0 text-[10px] text-muted">{item.source}</span>
              <span className="min-w-0 truncate text-xs text-neutral-300">
                {newsTitle(item, resolved)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
