import { useEffect, useState } from 'react'
import type { HomeNewsItem } from '../../data/homeNews'
import { newsTitle } from '../../lib/homeSuggestions'
import { useI18n } from '../../lib/i18n'
import { cn } from '../../lib/utils'

function reduceMotionNow() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Secondary glance rail, not a CTA. Compact type so it does not compete with Orbi.
 * Headlines stay links. Motion pauses on hover, focus, and reduced motion.
 */
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
    <section
      className="news-ticker overflow-hidden border-y border-border/70"
      aria-label={t('news.title')}
      data-news-ticker="1"
      data-news-intent="secondary-not-cta"
    >
      <div className="flex h-8 items-stretch">
        <div className="flex shrink-0 items-center gap-1.5 border-r border-border/70 px-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted">{t('news.title')}</span>
          <span className="text-[9px] font-medium uppercase tracking-wide text-muted">{t('home.demoBadge')}</span>
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
                    className="inline-flex h-8 items-center gap-1.5 px-3 text-xs font-normal text-muted hover:text-ink"
                  >
                    <span className="text-[10px] uppercase tracking-wide">{t(`news.cat.${item.cat}`)}</span>
                    <span className="whitespace-nowrap">{title}</span>
                    {demo && (
                      <span className="text-[9px] font-medium uppercase tracking-wide">{t('home.demoBadge')}</span>
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
