import { useParams } from 'react-router-dom'
import { ButtonLink } from '../components/ui/Button'
import { Empty } from '../components/ui/Empty'
import { HOME_NEWS } from '../data/homeNews'
import { innovationNews } from '../data/innovation/news'
import { fortbildungen } from '../data/wissen/fortbildung'
import { branchenMedien } from '../data/wissen/medien'
import { newsTitle } from '../lib/homeSuggestions'
import { useI18n } from '../lib/i18n'

function httpsOnly(url: string) {
  return url.startsWith('https://')
}

function Lead({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wider text-amber-200">Stub ≠ Live</p>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm text-muted">{lead}</p>
    </header>
  )
}

export function NewsArchivePage() {
  const { t, resolved } = useI18n()
  return (
    <div className="mx-auto max-w-lg space-y-4 pb-scroll-chrome">
      <Lead title={t('archive.newsTitle')} lead={t('archive.newsLead')} />
      <ul className="space-y-2">
        {HOME_NEWS.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-border bg-surface-2 px-3 py-3 hover:border-[var(--theme-accent)]/40"
            >
              <p className="text-[11px] uppercase tracking-wide text-muted">{item.source}</p>
              <p className="mt-1 text-sm font-medium text-ink">{newsTitle(item, resolved)}</p>
            </a>
          </li>
        ))}
      </ul>
      <ButtonLink to="/">{t('archive.homeCta')}</ButtonLink>
    </div>
  )
}

export function InnovationPage() {
  const { t } = useI18n()
  const cards = innovationNews.filter((card) => httpsOnly(card.sourceUrl))
  return (
    <div className="mx-auto max-w-lg space-y-4 pb-scroll-chrome">
      <Lead title={t('archive.innovationTitle')} lead={t('archive.innovationLead')} />
      {cards.length === 0 ? (
        <Empty emoji="📰" title={t('archive.missingTitle')} hint={t('archive.innovationLead')} />
      ) : (
        <ul className="space-y-2">
          {cards.map((card) => (
            <li key={card.id}>
              <a
                href={card.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-border bg-surface-2 px-3 py-3 hover:border-[var(--theme-accent)]/40"
              >
                <p className="text-[11px] uppercase tracking-wide text-muted">
                  {card.sourceName} · {card.date}
                </p>
                <p className="mt-1 text-sm font-medium text-ink">{card.title}</p>
                <p className="mt-1 text-xs text-muted">{card.summaryDe}</p>
                <p className="mt-2 text-xs font-medium text-[var(--theme-accent)]">{t('archive.openSource')}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
      <ButtonLink to="/">{t('archive.homeCta')}</ButtonLink>
    </div>
  )
}

export function WissenPage() {
  const { t } = useI18n()
  const params = useParams()
  const section = (params['*'] || '').split('/').filter(Boolean)[0] || ''
  const showMedia = section === '' || section === 'medien'
  const showCourses = section === '' || section === 'fortbildung'
  const known = section === '' || showMedia || showCourses
  const media = branchenMedien.filter((item) => httpsOnly(item.url))
  const courses = fortbildungen.filter((item) => httpsOnly(item.url))

  if (!known) {
    return (
      <div className="mx-auto max-w-lg space-y-4 pb-scroll-chrome">
        <Empty emoji="📚" title={t('archive.missingTitle')} hint={t('archive.wissenLead')} />
        <div className="flex flex-wrap gap-2">
          <ButtonLink to="/wissen">{t('archive.wissenTitle')}</ButtonLink>
          <ButtonLink to="/campus" variant="ghost">
            {t('campus.nav')}
          </ButtonLink>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-scroll-chrome">
      <Lead title={t('archive.wissenTitle')} lead={t('archive.wissenLead')} />
      {showMedia && (
        <section className="space-y-2" aria-label="Medien">
          <h2 className="text-sm font-semibold">Medien</h2>
          <ul className="space-y-2">
            {media.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-border bg-surface-2 px-3 py-3 hover:border-[var(--theme-accent)]/40"
                >
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  <p className="mt-1 text-xs text-muted">{item.blurbDe}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {showCourses && (
        <section className="space-y-2" aria-label="Fortbildung">
          <h2 className="text-sm font-semibold">Fortbildung</h2>
          <ul className="space-y-2">
            {courses.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-border bg-surface-2 px-3 py-3 hover:border-[var(--theme-accent)]/40"
                >
                  <p className="text-[11px] uppercase tracking-wide text-muted">{item.source}</p>
                  <p className="mt-1 text-sm font-medium text-ink">{item.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {item.provider}
                    {item.datesHint ? ` · ${item.datesHint}` : ''}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <ButtonLink to="/campus">{t('campus.nav')}</ButtonLink>
    </div>
  )
}

export function KatalogPage() {
  const { t } = useI18n()
  return (
    <div className="mx-auto max-w-lg space-y-4 pb-scroll-chrome">
      <Empty emoji="📒" title={t('archive.katalogTitle')} hint={t('archive.katalogLead')} />
      <div className="flex flex-wrap gap-2">
        <ButtonLink to="/marktplatz">{t('archive.katalogCta')}</ButtonLink>
        <ButtonLink to="/" variant="ghost">
          {t('archive.homeCta')}
        </ButtonLink>
      </div>
    </div>
  )
}

export function NotFoundPage() {
  const { t } = useI18n()
  return (
    <div className="mx-auto max-w-lg space-y-4 pb-scroll-chrome">
      <Empty emoji="↗" title={t('archive.missingTitle')} hint={t('archive.missingLead')} />
      <div className="flex flex-wrap gap-2">
        <ButtonLink to="/">{t('archive.homeCta')}</ButtonLink>
        <ButtonLink to="/support" variant="ghost">
          {t('archive.supportCta')}
        </ButtonLink>
      </div>
    </div>
  )
}
