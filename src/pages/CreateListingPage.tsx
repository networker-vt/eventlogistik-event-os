import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Input'
import { CITIES, CRAFTS, VERTICAL_META } from '../data/constants'
import { DEMO_USER_ID, seedProfiles } from '../data/seed'
import { useAuth } from '../lib/auth'
import { store } from '../lib/store'
import type { ListingKind, Vertical } from '../types'

const EMOJI: Record<Vertical, string> = {
  freelancer: '👷',
  company: '🏢',
  material: '🎛️',
  transporter: '🚛',
  courier: '🏍️',
  hotel: '🏨',
  job: '💼',
}

export function CreateListingPage() {
  const [params] = useSearchParams()
  const { user, profile, loginDemo } = useAuth()
  const navigate = useNavigate()
  const initialVertical = (params.get('vertical') as Vertical) || 'job'
  const initialKind = (params.get('kind') as ListingKind) || 'offer'

  const [kind, setKind] = useState<ListingKind>(initialKind)
  const [vertical, setVertical] = useState<Vertical>(initialVertical)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState(profile?.city ?? 'Berlin')
  const [craft, setCraft] = useState<string>(CRAFTS[0])
  const [priceFrom, setPriceFrom] = useState('')
  const [priceUnit, setPriceUnit] = useState('Tag')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [tags, setTags] = useState('')
  const [venue, setVenue] = useState('')
  const [callTime, setCallTime] = useState('')
  const [requirements, setRequirements] = useState('')

  const meta = useMemo(() => VERTICAL_META[vertical], [vertical])
  const isJob = vertical === 'job'

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    let u = user
    let p = profile
    if (!u || !p) {
      loginDemo()
      const demo = seedProfiles.find((x) => x.id === DEMO_USER_ID)!
      u = { id: demo.id, email: demo.email, name: demo.name, role: demo.role }
      p = demo
    }
    if (!title.trim() || !description.trim()) return
    if (isJob && !priceFrom) {
      alert('Bitte Tagessatz / Budget angeben — Rates gehören upfront ins Inserat.')
      return
    }

    const reqs = requirements
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)

    const listing = store.createListing({
      kind,
      vertical,
      title: title.trim(),
      description: description.trim(),
      city,
      crafts: craft ? [craft] : [],
      priceFrom: priceFrom ? Number(priceFrom) : undefined,
      priceUnit,
      currency: 'EUR',
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      ownerId: u.id,
      ownerName: p.companyName || u.name,
      ownerVerified: p.verified,
      rating: p.rating,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      imageEmoji: EMOJI[vertical],
      featured: false,
      venue: venue || undefined,
      callTime: callTime || undefined,
      requirements: reqs.length ? reqs : undefined,
      matchReason: isJob
        ? `Tagessatz ${priceFrom ? `${priceFrom} €` : 'klar'} · ${city} · ${p.verified !== 'none' ? 'Verifiziertes Profil' : 'Neu'}`
        : undefined,
    })
    navigate(`/listings/${listing.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">
          {isJob ? (kind === 'offer' ? 'Job posten' : 'Verfügbarkeit / Gesuch') : 'Inserat erstellen'}
        </h1>
        <p className="text-sm text-muted">
          {isJob
            ? 'Strukturiert in unter 2 Minuten: Datum, Ort, Rolle, Budget, Call-Zeiten, Requirements.'
            : `Dual Marketplace: als Angebot oder Gesuch für ${meta.labelPlural}.`}
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-surface-2 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Typ" value={kind} onChange={(e) => setKind(e.target.value as ListingKind)}>
            <option value="offer">{isJob ? 'Job-Angebot (ich suche Crew)' : 'Angebot'}</option>
            <option value="request">{isJob ? 'Gesuch (ich suche Arbeit)' : 'Gesuch'}</option>
          </Select>
          <Select
            label="Vertikale"
            value={vertical}
            onChange={(e) => setVertical(e.target.value as Vertical)}
          >
            {Object.entries(VERTICAL_META).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Select>
        </div>
        <Input
          label="Titel"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            isJob
              ? kind === 'offer'
                ? 'z.B. Job: Licht-Ops Berlin — 480 €/Tag'
                : 'z.B. Verfügbar: Rigger NRW ab 350 €/Tag'
              : `z.B. ${meta.label} …`
          }
        />
        <Textarea
          label="Beschreibung"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Leistungen, Zeitraum, Besonderheiten…"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Stadt" value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select label="Gewerk / Rolle" value={craft} onChange={(e) => setCraft(e.target.value)}>
            {CRAFTS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        {isJob && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Venue / Ort"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Halle, Festivalgelände…"
            />
            <Input
              label="Call-Zeiten"
              value={callTime}
              onChange={(e) => setCallTime(e.target.value)}
              placeholder="07:00 Call / Load-in"
            />
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            label={isJob ? 'Tagessatz / Budget (€) *' : 'Preis ab (€)'}
            type="number"
            min="0"
            step="1"
            required={isJob}
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
          />
          <Input
            label="Einheit"
            value={priceUnit}
            onChange={(e) => setPriceUnit(e.target.value)}
            placeholder="Tag / km / Zimmer"
          />
          <Input label="Tags (Komma)" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Datum von"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            required={isJob}
          />
          <Input
            label="Datum bis"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {isJob && (
          <Textarea
            label="Requirements (eine pro Zeile)"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder={'GrandMA3\nSicherheitsschuhe S3\nschwarze Showkleidung'}
          />
        )}

        {!user && (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            Nicht eingeloggt — beim Speichern starten wir die Demo-Session (Agentur) und veröffentlichen
            sofort.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="submit">
            {isJob
              ? kind === 'offer'
                ? 'Job veröffentlichen'
                : 'Gesuch veröffentlichen'
              : kind === 'offer'
                ? 'Angebot veröffentlichen'
                : 'Gesuch veröffentlichen'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Abbrechen
          </Button>
        </div>
      </form>
    </div>
  )
}
