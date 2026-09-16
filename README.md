# Orbit

**Dein Orbit für Arbeit — Matching statt Spam.**

Global all-industry marketplace OS (v2.4.0): jobs, B2B, travel & lifestyle, **Look/Style**, in-app book/pay stubs, tickets in Wallet, conversation hub, light social — still **calm**. Dual-sided (seekers **and** companies) plus Orbit Assist. Event/VT catalog is not in the primary IA.

- **Live (GitHub Pages):** https://networker-vt.github.io/eventlogistik-event-os/
- **Repo:** https://github.com/networker-vt/eventlogistik-event-os
- **License:** MIT — forks welcome if they improve Orbit (see [CONTRIBUTING.md](./CONTRIBUTING.md))
- **A11y notes:** [A11Y.md](./A11Y.md) · **2.4.0:** [RELEASE_NOTES_2.4.0.md](./RELEASE_NOTES_2.4.0.md) · **Credits:** [CREDITS.md](./CREDITS.md) · **2.3.1:** [RELEASE_NOTES_2.3.1.md](./RELEASE_NOTES_2.3.1.md)

> Vite `base` **MUST** stay `/eventlogistik-event-os/` for GitHub Pages.

## IA (v2.4.0)

**Start · Match · Chat · Wallet · Mehr** — Create in the header (not on Home). Mein via avatar / Mehr. Home: greeting → warm chips → Assist → Match CTA → **Für dich** (one rail).

## Core routes (v2.4)

| Route | Purpose |
|-------|---------|
| `/` | Start — one glance: Assist + next-best CTA + Für dich |
| `/match` | Match Finder — jobs/services **or** candidates + B2B/partners |
| `/look` | Orbit Look / Style — photo/video, demo try-on, shops, nearby |
| `/messages` | Chat hub — Match / Booking / Support / Social DM |
| `/wallet` | Credits (21M cap), gift/sponsoring, methods, bookings, tickets |
| `/reise` | Travel marketplace (demo, cheapest-first) |
| `/channels` | Community channel link-stubs |
| `/mein` | Prefs, **Kanäle verbinden** (Amazon/Netflix… stubs), hub |
| `/firma` | Company hub |
| `/marktplatz` | Unified marketplace |
| `/mehr` | Look, Social, Reise, Firma, Channels, Wallet, Legal |
| `/impressum` | Mirco Küßner |

Bottom nav: **Start · Match · Chat · Wallet · Mehr**

## Honest limits

- **No unofficial scrapes** of LinkedIn / StepStone / Indeed / Xing / etc. Quellen shows status stubs + sample cards tagged with `source`. API/Partner import planned.
- **No real GDS / airline / hotel / rail / car booking.** Travel is mock search + checkout stub. Partner APIs later.
- Orbit Credits: **21M hard cap**, demo client ledger until Stripe/PayPal/Banking + KYC. Pack checkout does not charge anyone. See [CREDITS.md](./CREDITS.md).
- **Orbit Look** is filters + labels + seed shops — not live virtual try-on ML.
- **Channel linking** (Amazon, Netflix, YouTube, Spotify, Instagram) is a localStorage toggle on Mein. No OAuth, no scraping. It only nudges demo ranking. Copy never claims Orbit read those accounts.
- **Gift / Sponsoring** (Wallet → Verschenken / Sponsorn) moves demo Credits on this device; 1 Credit fee burned; nobody is paid in fiat. Recipients are listings / companies / profiles in the demo.
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
