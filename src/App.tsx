import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AuthProvider } from './lib/auth'
import { AuthPage } from './pages/AuthPage'
import { BookingPage } from './pages/BookingPage'
import { CreateListingPage } from './pages/CreateListingPage'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { ListingDetailPage } from './pages/ListingDetailPage'
import { MessagesPage } from './pages/MessagesPage'
import { ProfilePage, PublicProfilePage } from './pages/ProfilePage'
import { ProjectCreatePage, ProjectDetailPage } from './pages/ProjectPage'
import { VerticalPage } from './pages/VerticalPage'
import type { Vertical } from './types'

function V({ vertical }: { vertical: Vertical }) {
  return <VerticalPage vertical={vertical} />
}

export default function App() {
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
            <Route path="jobs" element={<V vertical="job" />} />
            <Route path="listings/new" element={<CreateListingPage />} />
            <Route path="listings/:id" element={<ListingDetailPage />} />
            <Route path="auth" element={<AuthPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:threadId" element={<MessagesPage />} />
            <Route path="bookings/:id" element={<BookingPage />} />
            <Route path="projects/new" element={<ProjectCreatePage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profiles/:id" element={<PublicProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
