import { useEffect, useState } from 'react'
import type { HomeNewsItem } from '../../data/homeNews'
import { newsTitle } from '../../lib/homeSuggestions'
import { useI18n } from '../../lib/i18n'
import { cn } from '../../lib/utils'

function reduceMotionNow() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** One Home banner. Headlines scroll right → left and pause on hover, focus, or reduced motion. */
export function NewsStrip({ items }: { items: HomeNewsItem[] }) {
  const { t, resolved } = useI18n()
  const [reduceMotion, setReduceMotion] = useState(reduceMotionNow)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduceMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  if (items.length === 0) return null
  const loop = reduceMotion ? items : [...items, ...items]

  return (
    <section className="news-ticker overflow-hidden rounded-2xl border border-border bg-surface-2" aria-label={t('news.title')} data-news-ticker="1">
      <div className="flex min-h-14 items-stretch">
        <div className="flex shrink-0 items-center gap-2 border-r border-border px-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-accent)]">{t('news.title')}</span>
          <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted">
            {t('home.demoBadge')}
          </span>
        </div>
        <div className={cn('min-w-0 flex-1', reduceMotion ? 'overflow-x-auto' : 'overflow-hidden')}>
          <ul className={cn('news-ticker-track flex w-max items-center', reduceMotion && 'news-ticker-static')}>
            {loop.map((item, index) => {
              const title = newsTitle(item, resolved)
              const demo = /demo/i.test(item.source)
              const duplicate = index >= items.length
              return (
                <li key={`${item.id}-${index}`} aria-hidden={duplicate || undefined}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    tabIndex={duplicate ? -1 : undefined}
                    className="inline-flex min-h-14 items-center gap-2 px-4 text-base font-medium text-ink hover:text-[var(--theme-accent)]"
                  >
                    <span className="rounded-full bg-[var(--theme-accent)]/12 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--theme-accent)]">
                      {t(`news.cat.${item.cat}`)}
                    </span>
                    <span className="whitespace-nowrap">{title}</span>
                    {demo && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">{t('home.demoBadge')}</span>
                    )}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
