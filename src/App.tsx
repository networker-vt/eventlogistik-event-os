import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AuthProvider } from './lib/auth'
import { I18nProvider, useI18n } from './lib/i18n'
import { initRewards } from './lib/rewards'
import { initStore } from './lib/store'
import { AuthPage } from './pages/AuthPage'
import { BookingPage } from './pages/BookingPage'
import { CompareOffersPage } from './pages/CompareOffersPage'
import { CreateListingPage } from './pages/CreateListingPage'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { JobsPage } from './pages/JobsPage'
import { ListingDetailPage } from './pages/ListingDetailPage'
import { MessagesPage } from './pages/MessagesPage'
import { ProfilePage, PublicProfilePage } from './pages/ProfilePage'
import { ProjectCreatePage, ProjectDetailPage } from './pages/ProjectPage'
import { AgbPage } from './pages/legal/AgbPage'
import { DatenschutzPage } from './pages/legal/DatenschutzPage'
import { ImpressumPage } from './pages/legal/ImpressumPage'
import { LookPage } from './pages/LookPage'
import { MehrPage } from './pages/MehrPage'
import { ChannelsPage } from './pages/ChannelsPage'
import { MeinPage } from './pages/MeinPage'
import { WalletPage } from './pages/WalletPage'
import { IdeenPage } from './pages/IdeenPage'
import { IntegrationenPage } from './pages/IntegrationenPage'
import { EmpfehlenPage } from './pages/EmpfehlenPage'
import { PrefsPage } from './pages/PrefsPage'
import { MatchPage } from './pages/MatchPage'
import { QuellenPage } from './pages/QuellenPage'
import { PhotoJobsPage } from './pages/PhotoJobsPage'
import { InterviewPage } from './pages/InterviewPage'
import { ErfahrungenPage } from './pages/ErfahrungenPage'
import { FirmaPage } from './pages/FirmaPage'
import { MarketplacePage } from './pages/MarketplacePage'
import { TravelPage } from './pages/TravelPage'
import { TravelCheckoutPage } from './pages/TravelCheckoutPage'
import { TicketPage } from './pages/TicketPage'
import { SocialPage } from './pages/SocialPage'
import { captureRefFromSearch } from './lib/referral'
import { hydrateSafeTweaks } from './lib/ideas'

export default function App() {
  return (
    <I18nProvider>
      <AppReady />
    </I18nProvider>
  )
}

function AppReady() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    hydrateSafeTweaks()
    captureRefFromSearch(window.location.search)
    initRewards()
    void initStore().finally(() => setReady(true))
  }, [])

  if (!ready) return <BootScreen />

  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="freelancer" element={<Navigate to="/" replace />} />
            <Route path="firmen" element={<Navigate to="/firma" replace />} />
            <Route path="material" element={<Navigate to="/marktplatz" replace />} />
            <Route path="transporter" element={<Navigate to="/marktplatz" replace />} />
            <Route path="kuriere" element={<Navigate to="/marktplatz" replace />} />
            <Route path="hotels" element={<Navigate to="/reise" replace />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="prefs" element={<PrefsPage />} />
            <Route path="match" element={<MatchPage />} />
            <Route path="firma" element={<FirmaPage />} />
            <Route path="marktplatz" element={<MarketplacePage />} />
            <Route path="reise" element={<TravelPage />} />
            <Route path="reise/:offerId" element={<TravelCheckoutPage />} />
            <Route path="tickets/:id" element={<TicketPage />} />
            <Route path="social" element={<SocialPage />} />
            <Route path="quellen" element={<QuellenPage />} />
            <Route path="jobs/compare/:listingId" element={<CompareOffersPage />} />
            <Route path="listings/new" element={<CreateListingPage />} />
            <Route path="listings/:id" element={<ListingDetailPage />} />
            <Route path="auth" element={<AuthPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="mehr" element={<MehrPage />} />
            <Route path="channels" element={<ChannelsPage />} />
            <Route path="look" element={<LookPage />} />
            <Route path="mein" element={<MeinPage />} />
            <Route path="foto" element={<PhotoJobsPage />} />
            <Route path="interview" element={<InterviewPage />} />
            <Route path="interview/:roomId" element={<InterviewPage />} />
            <Route path="erfahrungen" element={<ErfahrungenPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="ideen" element={<IdeenPage />} />
            <Route path="integrationen" element={<IntegrationenPage />} />
            <Route path="empfehlen" element={<EmpfehlenPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:threadId" element={<MessagesPage />} />
            <Route path="bookings/:id" element={<BookingPage />} />
            <Route path="projects/new" element={<ProjectCreatePage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profiles/:id" element={<PublicProfilePage />} />
            <Route path="katalog/*" element={<Navigate to="/" replace />} />
            <Route path="innovation" element={<Navigate to="/" replace />} />
            <Route path="news" element={<Navigate to="/" replace />} />
            <Route path="wissen/*" element={<Navigate to="/" replace />} />
            <Route path="impressum" element={<ImpressumPage />} />
            <Route path="datenschutz" element={<DatenschutzPage />} />
            <Route path="agb" element={<AgbPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function BootScreen() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-surface">
      <div className="h-10 w-10 rounded-2xl border border-cyan/30 bg-cyan/10 skeleton-shimmer" />
      <p className="text-sm text-muted">{t('brand.loading')}</p>
    </div>
  )
}
