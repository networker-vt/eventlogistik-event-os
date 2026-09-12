import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapPin, ShieldCheck, Star } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Select, Textarea } from '../components/ui/Input'
import { BOOKING_STATUS_LABELS, VERTICAL_META } from '../data/constants'
import { useAuth } from '../lib/auth'
import { store } from '../lib/store'
import { useStoreVersion } from '../hooks/useStore'
import { formatDate, formatPrice, verificationLabel } from '../lib/utils'

export function ListingDetailPage() {
  const { id } = useParams()
  useStoreVersion()
  const listing = store.getListing(id!)
  const { user, loginDemo } = useAuth()
  const navigate = useNavigate()
  const [note, setNote] = useState('Hallo! Ich interessiere mich für dieses Inserat und würde gerne Details klären.')
  const [projectId, setProjectId] = useState('')
  const [done, setDone] = useState<{ bookingId: string; threadId: string } | null>(null)

  const projects = useMemo(
    () => (user ? store.listProjects(user.id) : []),
    [user],
  )

  if (!listing) {
    return (
      <div className="rounded-2xl border border-border p-8 text-center">
        <p>Inserat nicht gefunden.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          Zur Discovery
        </Button>
      </div>
    )
  }

  const meta = VERTICAL_META[listing.vertical]
  const owner = store.getProfile(listing.ownerId)

  const submitInquiry = () => {
    if (!user) {
      loginDemo()
      return
    }
    if (user.id === listing.ownerId) {
      alert('Du kannst dein eigenes Inserat nicht anfragen.')
      return
    }
    const { booking, thread } = store.createInquiry({
      listing,
      requesterId: user.id,
      requesterName: user.name,
      note,
      projectId: projectId || undefined,
    })
    setDone({ bookingId: booking.id, threadId: thread.id })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-border bg-surface-2 p-6">
        <div className="flex flex-wrap gap-2">
          <Badge tone={listing.kind === 'offer' ? 'cyan' : 'amber'}>
            {listing.kind === 'offer' ? 'Angebot' : 'Gesuch'}
          </Badge>
          <Badge tone="teal">{meta.label}</Badge>
          {listing.featured && <Badge>Featured</Badge>}
        </div>
        <div className="mt-4 flex gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-3 text-3xl">
            {listing.imageEmoji}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} /> {listing.city}
              </span>
              {listing.rating != null && (
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <Star size={14} fill="currentColor" /> {listing.rating.toFixed(1)}
                </span>
              )}
              {listing.dateFrom && (
                <span>
                  {formatDate(listing.dateFrom)}
                  {listing.dateTo ? ` – ${formatDate(listing.dateTo)}` : ''}
                </span>
              )}
            </p>
          </div>
        </div>
        <p className="mt-5 whitespace-pre-wrap text-neutral-300">{listing.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {listing.crafts.map((c) => (
            <Badge key={c}>{c}</Badge>
          ))}
          {listing.tags.map((t) => (
            <Badge key={t} tone="default">
              #{t}
            </Badge>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div>
            <div className="text-xl font-semibold text-cyan">
              {formatPrice(listing.priceFrom ?? listing.priceTo, listing.priceUnit)}
            </div>
            {listing.capacity && <div className="text-sm text-muted">{listing.capacity}</div>}
          </div>
          <Link to={`/profiles/${listing.ownerId}`} className="text-sm text-neutral-300 hover:text-cyan">
            {listing.ownerName} · {verificationLabel(listing.ownerVerified)}
          </Link>
        </div>
      </div>

      {owner && (
        <div className="rounded-2xl border border-border bg-surface-2 p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-teal" size={20} />
            <div>
              <div className="font-medium">{owner.name}</div>
              <div className="text-sm text-muted">
                {verificationLabel(owner.verified)} · ⭐ {owner.rating.toFixed(1)} ({owner.reviewCount}{' '}
                Bewertungen)
              </div>
            </div>
          </div>
        </div>
      )}

      {done ? (
        <div className="rounded-2xl border border-cyan/30 bg-cyan/10 p-5">
          <h2 className="font-semibold text-cyan">Anfrage gesendet</h2>
          <p className="mt-1 text-sm text-neutral-300">
            Status: {BOOKING_STATUS_LABELS.inquiry}. Du kannst jetzt im Chat nachfassen oder das Angebot
            im Booking-Flow weiterführen.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => navigate(`/messages/${done.threadId}`)}>Zum Chat</Button>
            <Button variant="secondary" onClick={() => navigate(`/bookings/${done.bookingId}`)}>
              Booking öffnen
            </Button>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-border bg-surface-2 p-5">
          <h2 className="font-semibold">Anfrage senden</h2>
          <Textarea label="Nachricht" value={note} onChange={(e) => setNote(e.target.value)} />
          {user && projects.length > 0 && (
            <Select
              label="Optional: an Event/Projekt anhängen"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">Kein Projekt</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          )}
          <Button onClick={submitInquiry}>
            {user ? 'Anfrage stellen' : 'Demo-Login & Anfrage stellen'}
          </Button>
          <p className="text-xs text-muted">
            Nächster Schritt nach der Anfrage: Angebot → Annahme → Buchung (im Booking-Screen).
          </p>
        </div>
      )}
    </div>
  )
}
