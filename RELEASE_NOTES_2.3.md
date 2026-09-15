# Orbit 2.3.0 — release notes

Orbit as a calm **everything marketplace**: jobs, B2B, travel & lifestyle, in-app book/pay stubs, tickets in Wallet, conversation hub, light social. Home stays Assist-first.

Keeps 2.2: dual-sided B2B, AI concierge Home, Match, company hub. GitHub Pages `base` remains `/eventlogistik-event-os/`. Impressum: Mirco Küßner (private).

## Information architecture

**Start · Match · Chat · Wallet · Mehr**

| Tab | Role |
|-----|------|
| **Start** | Orbit Assist — greeting, free-text (+ voice), one secondary CTA. No catalogue spam. |
| **Match** | Tinder-style matching (seeker jobs/services · company candidates/partners). |
| **Chat** | Conversations hub — thread types: Match, Booking, Support, Social DM. |
| **Wallet** | Credits, payment methods (UI), **bookings**, **tickets** (QR stub), confirmations. |
| **Mehr** | Social, Travel, Firma, Marktplatz, Mein, archives, Legal. |

Create stays in the header **+**. Mein is via avatar / Mehr. Social is a secondary stage so Home stays assist-first.

## New routes

| Route | Purpose |
|-------|---------|
| `/reise` | Travel & lifestyle marketplace — Flüge, Hotels, Bahn, Mietwagen, Urlaub/Packages. Demo search, cheapest-first. |
| `/reise/:offerId` | Unified checkout — fiat stub or Orbit Credits. No real charges. |
| `/tickets/:id` | Booking confirmation + QR stub. |
| `/social` | Light feed: posts, follow/connect, comments/likes, discover, share offers (localStorage). |
| `/wallet` | Now also tickets + marketplace bookings. |
| `/messages` | Filter by thread kind. |

Existing: `/`, `/match`, `/firma`, `/marktplatz`, `/listings/new`, `/prefs`, `/mein`.

## Assist travel

Examples:

- `billigster Flug nach Berlin Freitag` → plan → ranked mock flights (cheapest first) → book stub → Wallet ticket.
- `Hotel + Mietwagen München 29.10.` → package + hotel + car ranked → same checkout path.

## Demo limits (honest)

- **No real GDS / airline / hotel / rail / car booking.** Mock providers and prices. Live booking needs partner APIs later.
- **No real money.** Fiat checkout and Orbit Credits are local stubs.
- **Social is a local demo** (localStorage). Not a Twitter clone; no follower servers.
- Assist without `VITE_LLM_API_KEY` remains **Demo-Recherche**.
- Pages base and Impressum unchanged.
