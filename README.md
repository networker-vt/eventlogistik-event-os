# EventLogistik Event-OS

**Das All-in-One Event-OS für die deutsche Eventbranche** — Marketplace + Matching + Ops Lite + Trust.

Dual Marketplace (Angebot ↔ Gesuch) für Freelancer, Firmen, Material, Transporter, Kuriere, Hotels und Jobs. Mobil-first PWA mit dunklem Premium-UI (#0a0a0a + Cyan/Teal).

Repo: https://github.com/networker-vt/eventlogistik-event-os

## Quick Start

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

Die App startet mit reichhaltigen **Seed-Daten** (`src/data/seed.ts`) und einem lokalen Store — **ohne** Supabase-Keys.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router
- Lucide Icons
- Supabase JS Client (Stub / optional live)
- PWA Manifest

## Architektur

```
src/
  components/   # layout, ui, listings
  data/         # seed.ts, constants (Städte, Gewerke)
  hooks/        # useStore
  lib/          # store.ts (Repository), auth.tsx, supabase.ts, utils
  pages/        # Feature-Screens
  types/        # Listing, Booking, Message, Profile, Project
supabase/
  migrations/   # SQL Schema + RLS Starter
```

### Store-Interface

`src/lib/store.ts` kapselt Listings, Bookings, Threads, Messages und Projects hinter einer klaren API (localStorage + Seed). Später kann die Implementierung 1:1 gegen Supabase getauscht werden, ohne die UI umzubauen.

### Auth

Mock-Auth in `src/lib/auth.tsx` (localStorage). Demo-Login als Eventagentur „Alex Müller / Nordlicht Events“. Rollen: Freelancer, Technikfirma, Hotel, Transporter, Kurier, Material, Agentur, Admin.

## Routen / Screens

| Route | Beschreibung |
|-------|----------------|
| `/` | Unified Discovery (Stadt, Gewerk, Datum, Preis, Vertikale) |
| `/freelancer` `/firmen` `/material` `/transporter` `/kuriere` `/hotels` `/jobs` | Vertikal-Marketplaces |
| `/listings/:id` | Detail + Anfrage-Flow |
| `/listings/new` | Angebot/Gesuch erstellen |
| `/auth` | Registrierung / Login (rollen-basiert) |
| `/dashboard` | KPIs, Projekte, Booking-Pipeline |
| `/bookings/:id` | Inquiry → Offer → Accepted → Booked → Completed |
| `/messages` `/messages/:threadId` | Messaging Threads |
| `/projects/new` `/projects/:id` | Event-Container inkl. Ressourcen |
| `/profile` `/profiles/:id` | Eigenes / öffentliches Profil + Badges |

## Supabase anbinden

1. Projekt in Supabase anlegen  
2. SQL aus `supabase/migrations/20260912_init.sql` ausführen  
3. `.env` aus `.env.example` kopieren:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_USE_MOCK=false
```

4. `src/lib/supabase.ts` erkennt gültige Keys automatisch (`isSupabaseConfigured`)  
5. Nächster Schritt: Store-Methoden auf Supabase-Queries umstellen (Auth über `supabase.auth`, Tabellen wie in der Migration)

**Hinweis:** In v1 ist die UI vollständig mit dem lokalen Store lauffähig. Der Supabase-Client und das Schema sind vorbereitet; Live-CRUD ist v1.1.

## Design

- Hintergrund `#0a0a0a`, Accent `#00F0FF` / Teal `#14b8a6`
- Mobile Bottom-Nav + Desktop Sidebar
- Deutsche UI-Texte

## Out of Scope (v1)

Stripe / Payments, Native Apps, schweres ERP

## Lizenz

Privat / Projektrepo — Owner: networker-vt
