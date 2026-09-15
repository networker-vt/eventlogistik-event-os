# Orbit

**Dein Orbit für Arbeit — Matching statt Spam.**

Global all-industry job matching OS (v2.0.0). Prefs first, then Tinder-style Match Finder with explainable Match %. Event/VT remains one sector module under **Mehr**, not the only focus.

- **Live (GitHub Pages):** https://networker-vt.github.io/eventlogistik-event-os/
- **Repo:** https://github.com/networker-vt/eventlogistik-event-os
- **License:** MIT — forks welcome if they improve Orbit (see [CONTRIBUTING.md](./CONTRIBUTING.md))

> Vite `base` **MUST** stay `/eventlogistik-event-os/` for GitHub Pages.

## Core routes

| Route | Purpose |
|-------|---------|
| `/` | Home — Prefs CTA + Match CTA + quiet discovery |
| `/prefs` | Preference-first onboarding (seeker + employer) |
| `/match` | Match Finder — swipe jobs / candidates, Match % |
| `/quellen` | Aggregator stubs (LinkedIn, StepStone, Indeed, Xing, AA, Reed, Seek) |
| `/jobs` | Classic job list |
| `/wallet` | Wallet + **Orbit Credits** (EUR ↔ Credits demo) |
| `/mehr` | Quellen, Sektor Event/VT, Ideen, Empfehlen, Wallet, Wissen, Legal |
| `/mein` | Favoriten + lokaler Kalender |
| `/impressum` | Mirco Küßner |

Bottom nav: **Home · Match · + · Inbox · Mehr**

## Honest limits

- **No unofficial scrapes** of LinkedIn / StepStone / Indeed / Xing / etc. Quellen shows status stubs + sample cards tagged with `source`. API/Partner import planned.
- Orbit Credits and Wallet fiat/crypto are **demo** until Stripe/PayPal/Banking + KYC are live.
- Matching and mutual chat/booking seeds run locally (localStorage) unless Supabase is configured.

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
