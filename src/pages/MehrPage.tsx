import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TileGrid } from '../components/ui/TileGrid'
import { mehrDiscoverTiles } from '../lib/hubTiles'
import { useI18n } from '../lib/i18n'
import { isKidsMode, kidsHideTravel, kidsHideWallet } from '../lib/kids'

export function MehrPage() {
  const { t } = useI18n()
  const { hash } = useLocation()
  const kids = isKidsMode()
  useEffect(() => {
    if (!hash) return
    const id = hash.replace(/^#/, '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  const tiles = mehrDiscoverTiles(t, {
    kids,
    hideTravel: kidsHideTravel(),
    hideWallet: kidsHideWallet(),
  })

  return (
    <div className="space-y-6 pb-scroll-chrome">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t('mehr.title')}</h1>
        <p className="text-sm text-muted">{t('mehr.lead')}</p>
      </header>

      <TileGrid tiles={tiles} label={t('mehr.tiles')} />

      <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted" aria-label={t('mehr.legal')}>
        <Link to="/impressum" className="hover:text-ink">
          {t('footer.impressum')}
        </Link>
        <Link to="/datenschutz" className="hover:text-ink">
          {t('footer.privacy')}
        </Link>
        <Link to="/agb" className="hover:text-ink">
          {t('footer.terms')}
        </Link>
      </nav>
    </div>
  )
}
