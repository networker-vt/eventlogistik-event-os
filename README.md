# Orbit

**Dein Orbit für Arbeit — Matching statt Spam.**

Global all-industry marketplace OS (v2.5.1): 90-day focus **DE Freelancer/KMU — Jobs finden oder anbieten**. Dual-sided plus Orbit Assist. Look / Gift / Channels stay stubs. Event/VT catalog is not in the primary IA.

- **Live (GitHub Pages):** https://networker-vt.github.io/eventlogistik-event-os/
- **Repo:** https://github.com/networker-vt/eventlogistik-event-os
- **License:** MIT — forks welcome if they improve Orbit (see [CONTRIBUTING.md](./CONTRIBUTING.md))
- **A11y notes:** [A11Y.md](./A11Y.md) · **2.5.1:** [RELEASE_NOTES_2.5.1.md](./RELEASE_NOTES_2.5.1.md) · **2.5.0:** [RELEASE_NOTES_2.5.0.md](./RELEASE_NOTES_2.5.0.md) · **Credits:** [CREDITS.md](./CREDITS.md) · **2.4.0:** [RELEASE_NOTES_2.4.0.md](./RELEASE_NOTES_2.4.0.md)

> Vite `base` **MUST** stay `/eventlogistik-event-os/` for GitHub Pages.

## IA (v2.5.1)

**Start · Match · Chat · Wallet · Mehr** — Create in the header (not on Home). Mein via avatar / Mehr. Home: robot + greeting + **Was brauchst du?** → quiet **Suchen / Anbieten / Weitermachen** → one filled **Orbit fragen** → **one Tageskarte** (plan merged in) → Match as text link.

## Core routes (v2.4)

| Route | Purpose |
|-------|---------|
| `/` | Start — robot + Was brauchst du?, quiet Suchen / Anbieten / Weitermachen, one Tageskarte, one filled Orbit fragen |
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
- Orbit Credits: **21M hard cap**, append-only `credit_events` (`txn_id`, balance = sum). Demo = localStorage. Prod (`VITE_APP_MODE=prod` + keys) writes Supabase intents. Pack checkout does not charge anyone. See [CREDITS.md](./CREDITS.md).
- **Orbit Look** is filters + labels + seed shops — not live virtual try-on ML.
- **Channel linking** (Amazon, Netflix, YouTube, Spotify, Instagram) is a **connected flag only** on Mein. No OAuth, no scraping.
- **Gift / Sponsoring** (Wallet → Verschenken / Sponsorn) moves demo Credits on this device; 1 Credit fee burned; nobody is paid in fiat. Recipients are listings / companies / profiles in the demo.
- **Social is localStorage-only** — not a full social network.
- Photo “vision” and in-app video calls are **stubs**. Real calling needs a provider (Daily / Twilio / LiveKit) later.
- Matching and mutual chat/booking seeds run locally (localStorage) unless Supabase is configured.
- **Orbit Assist** plans locally (heuristics), including travel (“billigster Flug nach Berlin Freitag”). Optional `VITE_LLM_API_KEY` may add tips; otherwise honest Demo-Recherche.

## Quick start

```bash
npm install
cp .env.example .env   # optional — VITE_APP_MODE=demo|prod
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
