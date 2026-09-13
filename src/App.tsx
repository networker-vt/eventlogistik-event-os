import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AuthProvider } from './lib/auth'
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
import { VerticalPage } from './pages/VerticalPage'
import { AgbPage } from './pages/legal/AgbPage'
import { DatenschutzPage } from './pages/legal/DatenschutzPage'
import { ImpressumPage } from './pages/legal/ImpressumPage'
import type { Vertical } from './types'
import { KatalogLayout } from './pages/katalog/KatalogLayout'
import { FirmenPage } from './pages/katalog/FirmenPage'
import { LocationsPage } from './pages/katalog/LocationsPage'
import { TransporteurePage } from './pages/katalog/TransporteurePage'
import { PlattformenPage } from './pages/katalog/PlattformenPage'
import { FahrzeuggroessenPage } from './pages/katalog/FahrzeuggroessenPage'
import { InnovationPage } from './pages/innovation/InnovationPage'
import { MedienPage } from './pages/wissen/MedienPage'
import { FortbildungPage } from './pages/wissen/FortbildungPage'
import { MehrPage } from './pages/MehrPage'
import { MeinPage } from './pages/MeinPage'
import { WalletPage } from './pages/WalletPage'
import { IdeenPage } from './pages/IdeenPage'
import { IntegrationenPage } from './pages/IntegrationenPage'
import { EmpfehlenPage } from './pages/EmpfehlenPage'
import { captureRefFromSearch } from './lib/referral'
import { hydrateSafeTweaks } from './lib/ideas'

function V({ vertical }: { vertical: Vertical }) {
  return <VerticalPage vertical={vertical} />
}

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    hydrateSafeTweaks()
    captureRefFromSearch(window.location.search)
    void initStore().finally(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-surface">
        <div className="h-10 w-10 rounded-2xl border border-cyan/30 bg-cyan/10 skeleton-shimmer" />
        <p className="text-sm text-muted">LoadIn wird geladen…</p>
      </div>
    )
  }

  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="freelancer" element={<V vertical="freelancer" />} />
            <Route path="firmen" element={<V vertical="company" />} />
            <Route path="material" element={<V vertical="material" />} />
            <Route path="transporter" element={<V vertical="transporter" />} />
            <Route path="kuriere" element={<V vertical="courier" />} />
            <Route path="hotels" element={<V vertical="hotel" />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="jobs/compare/:listingId" element={<CompareOffersPage />} />
            <Route path="listings/new" element={<CreateListingPage />} />
            <Route path="listings/:id" element={<ListingDetailPage />} />
            <Route path="auth" element={<AuthPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="mehr" element={<MehrPage />} />
            <Route path="mein" element={<MeinPage />} />
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
            <Route path="katalog" element={<KatalogLayout />}>
              <Route index element={<Navigate to="firmen" replace />} />
              <Route path="firmen" element={<FirmenPage />} />
              <Route path="locations" element={<LocationsPage />} />
              <Route path="transporteure" element={<TransporteurePage />} />
              <Route path="plattformen" element={<PlattformenPage />} />
              <Route path="fahrzeuggroessen" element={<FahrzeuggroessenPage />} />
            </Route>
            <Route path="innovation" element={<InnovationPage />} />
            <Route path="news" element={<Navigate to="/innovation" replace />} />
            <Route path="wissen/medien" element={<MedienPage />} />
            <Route path="wissen/fortbildung" element={<FortbildungPage />} />
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
