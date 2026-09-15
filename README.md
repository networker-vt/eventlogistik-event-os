# Orbit

**Dein Orbit für Arbeit — Matching statt Spam.**

Global all-industry marketplace OS (v2.3.1): jobs, B2B, travel & lifestyle, in-app book/pay stubs, tickets in Wallet, conversation hub, light social — still **calm**. Dual-sided (seekers **and** companies) plus Orbit Assist. Event/VT remains one sector module under **Mehr**, not the home screen.

- **Live (GitHub Pages):** https://networker-vt.github.io/eventlogistik-event-os/
- **Repo:** https://github.com/networker-vt/eventlogistik-event-os
- **License:** MIT — forks welcome if they improve Orbit (see [CONTRIBUTING.md](./CONTRIBUTING.md))
- **A11y notes:** [A11Y.md](./A11Y.md) · **2.3.1:** [RELEASE_NOTES_2.3.1.md](./RELEASE_NOTES_2.3.1.md) · **Credits:** [CREDITS.md](./CREDITS.md) · **2.3:** [RELEASE_NOTES_2.3.md](./RELEASE_NOTES_2.3.md) · **2.2:** [RELEASE_NOTES_2.2.md](./RELEASE_NOTES_2.2.md)

> Vite `base` **MUST** stay `/eventlogistik-event-os/` for GitHub Pages.

## IA (v2.3.1)

**Start · Match · Chat · Wallet · Mehr** — Create in the header (not on Home). Mein via avatar / Mehr. Home: greeting → warm chips → Assist → Match CTA → Top Deals → Match-Vorschläge → News.

## Core routes (v2.3)

| Route | Purpose |
|-------|---------|
| `/` | Start — greeting, warm chips, Assist, one Match CTA, Top Deals, Match-Vorschläge, News |
| `/match` | Match Finder — jobs/services **or** candidates + B2B/partners |
| `/messages` | Chat hub — Match / Booking / Support / Social DM |
| `/wallet` | Credits, methods, bookings, tickets & confirmations |
| `/reise` | Travel marketplace (demo, cheapest-first) |
| `/reise/:offerId` | In-app checkout stub |
| `/tickets/:id` | Ticket + QR stub |
| `/social` | Light networking feed (local demo) |
| `/firma` | Company hub — profile, offers CRUD, hiring, partnerships |
| `/marktplatz` | Unified marketplace (prefs-first) |
| `/mein` | Personal hub — role, radius, prefs, skills, docs, reminders |
| `/mehr` | Travel, Social, Firma/Marktplatz, archives, Legal |
| `/prefs` | Preference wizard (Seeker / Firma / Beides) |
| `/listings/new` | Simple create sheet |
| `/jobs` | Classic job list (archived under Mehr) |
| `/impressum` | Mirco Küßner |

Bottom nav: **Start · Match · Chat · Wallet · Mehr**

## Honest limits

- **No unofficial scrapes** of LinkedIn / StepStone / Indeed / Xing / etc. Quellen shows status stubs + sample cards tagged with `source`. API/Partner import planned.
- **No real GDS / airline / hotel / rail / car booking.** Travel is mock search + checkout stub. Partner APIs later.
- Orbit Credits and Wallet fiat/crypto are **demo** until Stripe/PayPal/Banking + KYC are live. Credit pack checkout does not charge anyone. See [CREDITS.md](./CREDITS.md).
- **Social is localStorage-only** — not a full social network.
- Photo “vision” and in-app video calls are **stubs**. Real calling needs a provider (Daily / Twilio / LiveKit) later.
- Matching and mutual chat/booking seeds run locally (localStorage) unless Supabase is configured.
- **Orbit Assist** plans locally (heuristics), including travel (“billigster Flug nach Berlin Freitag”). Optional `VITE_LLM_API_KEY` may add tips; otherwise honest Demo-Recherche.

## Quick start

```bash
npm install
cp .env.example .env   # optional
npm run dev
```

```bash
npm run build
./scripts/deploy-pages.sh
```

## Open Source

MIT. Fork welcome if it improves Orbit. Keep operator impressum (Mirco Küßner) unless ownership changes.

## Stack

React 19 · TypeScript · Vite 8 · Tailwind 4 · PWA · optional Supabase
