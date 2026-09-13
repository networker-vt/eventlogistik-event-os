# LoadIn

**Das Event-OS für Crew, Gigs, Gear & Transport** — Marketplace + Matching + Ops Lite + Trust. Load-in-Energie, nicht Spedition.

Dual Marketplace (Angebot ↔ Gesuch) für Freelancer, Firmen, Material, Transporter, Kuriere, Hotels und Jobs. Mobil-first **PWA** mit dunklem Premium-UI (#0a0a0a + Cyan/Teal).

- **Live (GitHub Pages):** https://networker-vt.github.io/eventlogistik-event-os/
- **Repo:** https://github.com/networker-vt/eventlogistik-event-os
- **Releases / ZIP-Download:** https://github.com/networker-vt/eventlogistik-event-os/releases

> Vite `base` ist fest `/eventlogistik-event-os/` (GitHub Pages Projektseite). Nicht ändern, solange unter diesem Pfad gehostet wird.

## Quick Start

```bash
npm install
cp .env.example .env   # Keys optional — ohne Keys läuft die Demo
npm run dev
```

Build & Preview:

```bash
npm run build
npm run preview
```

Deploy Pages:

```bash
./scripts/deploy-pages.sh
```

Die App startet mit **Seed-Daten** und lokalem Store, wenn keine gültigen Supabase-Keys gesetzt sind. Mit `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` versucht sie, Supabase zu hydratisieren (graceful Fallback).

## Production Upload

1. `.env` aus `.env.example` befüllen (Supabase-Projekt + Anon-Key)
2. Migration: `supabase/migrations/20260912_init.sql`
3. `npm run build` — Artefakt in `dist/`
4. `./scripts/deploy-pages.sh` **oder** ZIP aus Release hochladen/entpacken
5. Rechtstexte unter `/impressum`, `/datenschutz`, `/agb` mit Firmendaten ersetzen
6. Checkliste: [`LAUNCH.md`](./LAUNCH.md) · Store später: [`STORE_READY.md`](./STORE_READY.md)

### Downloadbarer Build

GitHub Release-Asset **`eventlogistik-event-os-web.zip`** = Inhalt von `dist/` (statisches Hosting). Nach dem Entpacken auf beliebigen Static Host legen — Base-Path `/eventlogistik-event-os/` beachten, oder neu mit anderem `base` bauen.

## PWA installieren

- **Android:** Banner oder Chrome-Menü → App installieren  
- **iOS Safari:** Teilen → Zum Home-Bildschirm  
- Offline-Shell via Service Worker (Workbox)



## Öffentlicher Katalog · Datenschutz (GDPR)

LoadIn führt einen **öffentlichen Business-Katalog** (`src/data/catalog/`):

- **Quellen:** dry-hire.com Deutschland-Verzeichnis, Firmen-Impressumsseiten, allgemein veröffentlichte Venue-Adressen.
- **Felder:** nur öffentlich gelistete Firmendaten (Name, Straße, PLZ, Ort, Geschäfts-Telefon, Geschäfts-E-Mail, Website).
- **Nicht enthalten:** private Freelancer-Handynummern, private E-Mails oder Profile von Instaff/Facebook/WhatsApp o. Ä. Freelancer in der Seed-Demo sind fiktiv/anonymisiert.
- Jeder Eintrag hat `source` und `dataClass: 'public_business'`.
- UI-Hinweis: „Öffentliche Firmendaten · Angaben ohne Gewähr · Korrekturen: …“
- **Innovation / Wissen:** redaktionell kuratierte Outbound-Links (News, Branchenmedien, Fortbildungen) — keine Buchungen, keine gescrapten Nutzer-DBs.

Routes: `/katalog/firmen`, `/katalog/locations`, `/katalog/transporteure`, `/katalog/plattformen`, `/katalog/fahrzeuggroessen`, `/innovation`, `/wissen/medien`, `/wissen/fortbildung`.

## Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4
- React Router 7
- Lucide Icons
- Supabase JS (optional live)
- **vite-plugin-pwa** / Workbox

## Architektur

```
src/
  components/   # layout, ui, listings, bookings
  data/         # seed.ts, constants
  hooks/        # useStore
  lib/          # store (local + Supabase prefer), auth, supabase, supabaseSync
  pages/        # Feature-Screens + legal/
supabase/
  migrations/   # SQL Schema + RLS Starter
scripts/
  deploy-pages.sh
```

### Store

`src/lib/store.ts` — sync Repository für UI. Beim Start: `initStore()` lädt bei konfiguriertem Supabase einen Snapshot; sonst Seed + `localStorage`. Mutationen schreiben lokal und best-effort nach Supabase.

### Features (Auswahl)

- Jobs-Marketplace (Seek / Hire) mit DE-2026-Tagessatz-Orientierung (Fachkraft 400–500 € · Specialist 600–800 €, 10h-Tag) — Anfahrt, Übernachtung, Spesen Pflichtfelder
- Bewerber-Pipeline
- **Angebote vergleichen** (`/jobs/compare/:listingId`)
- Booking-Flow inkl. **Rating-Prompt** nach `completed`
- Messaging, Projekte, Verifizierungs-Badges
- Legal-Routen (Platzhalter DE)

## Routen

| Route | Beschreibung |
|-------|----------------|
| `/` | Unified Discovery |
| `/jobs` | Jobs finden / posten |
| `/jobs/compare/:listingId` | Bewerber side-by-side |
| `/listings/:id` · `/listings/new` | Detail / erstellen |
| `/bookings/:id` | Pipeline + Rating |
| `/messages` | Chat |
| `/dashboard` · `/projects/*` · `/profile` | Ops & Profil |
| `/impressum` · `/datenschutz` · `/agb` | Legal stubs |

## Design

- Hintergrund `#0a0a0a`, Accent `#00F0FF` / Teal `#14b8a6`
- Mobile Bottom-Nav + Desktop Sidebar
- Deutsche UI-Texte

## Docs

- [`LAUNCH.md`](./LAUNCH.md) — Go-Live-Checkliste
- [`STORE_READY.md`](./STORE_READY.md) — PWA jetzt, TWA/Capacitor später

## Out of Scope (aktuell)

Stripe / Payments, native Store-Binaries, schweres ERP

## Lizenz

Privat / Projektrepo — Owner: networker-vt
