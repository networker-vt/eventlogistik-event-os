# Orbit

**Dein Orbit für Arbeit — Matching statt Spam.**

Global all-industry job matching OS (v2.1.0). Prefs first, then Tinder-style Match Finder with explainable Match %. Event/VT remains one sector module under **Mehr**, not the home screen.

- **Live (GitHub Pages):** https://networker-vt.github.io/eventlogistik-event-os/
- **Repo:** https://github.com/networker-vt/eventlogistik-event-os
- **License:** MIT — forks welcome if they improve Orbit (see [CONTRIBUTING.md](./CONTRIBUTING.md))
- **A11y notes:** [A11Y.md](./A11Y.md) · **2.1 draft:** [RELEASE_NOTES_2.1.md](./RELEASE_NOTES_2.1.md)

> Vite `base` **MUST** stay `/eventlogistik-event-os/` for GitHub Pages.

## Core routes (v2.1)

| Route | Purpose |
|-------|---------|
| `/` | Home — **Deine Welt** feed (prefs + local behaviour) |
| `/match` | Match Finder — swipe; 1-tap Interesse shares profile pack |
| `/mein` | Personal hub — radius, prefs, skill stars, docs, language, favorites |
| `/messages` | Inbox |
| `/mehr` | Quellen, Foto-Jobs, Interview, Erfahrungen, Event/VT archive, Legal |
| `/prefs` | Preference wizard (also editable in Mein) |
| `/foto` | Photograph a storefront — mock vision + nearby jobs |
| `/interview` | Chat interview, schedule slot, video stub |
| `/erfahrungen` | Reviews: app, companies, jobs, agency↔client |
| `/quellen` | Aggregator stubs (no unofficial scrapes) |
| `/jobs` | Classic job list |
| `/wallet` | Wallet + **Orbit Credits** (demo ledger) |
| `/impressum` | Mirco Küßner |

Bottom nav: **Home · Match · Mein · Inbox · Mehr**

## Honest limits

- **No unofficial scrapes** of LinkedIn / StepStone / Indeed / Xing / etc. Quellen shows status stubs + sample cards tagged with `source`. API/Partner import planned.
- Orbit Credits and Wallet fiat/crypto are **demo** until Stripe/PayPal/Banking + KYC are live. Rewards (welcome, referral, reviews, search, completed jobs) are a local ledger with caps so they stay fair, not spammy.
- Photo “vision” and in-app video calls are **stubs**. Real calling needs a provider (Daily / Twilio / LiveKit) later.
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
