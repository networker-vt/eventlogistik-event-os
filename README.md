# Orbit

**Dein Orbit für Arbeit — Matching statt Spam.**

Global all-industry job matching OS (v2.2.0). Dual-sided marketplace (seekers **and** companies) plus Orbit Assist: a calm concierge that turns a free-text need into a short plan and a few matches. Event/VT remains one sector module under **Mehr**, not the home screen.

- **Live (GitHub Pages):** https://networker-vt.github.io/eventlogistik-event-os/
- **Repo:** https://github.com/networker-vt/eventlogistik-event-os
- **License:** MIT — forks welcome if they improve Orbit (see [CONTRIBUTING.md](./CONTRIBUTING.md))
- **A11y notes:** [A11Y.md](./A11Y.md) · **2.2 draft:** [RELEASE_NOTES_2.2.md](./RELEASE_NOTES_2.2.md)

> Vite `base` **MUST** stay `/eventlogistik-event-os/` for GitHub Pages.

## Core routes (v2.2)

| Route | Purpose |
|-------|---------|
| `/` | Start — greeting, Orbit Assist ask field, one secondary CTA, Deine Welt ≤4 if no plan |
| `/match` | Match Finder — jobs/services **or** candidates + B2B/partners |
| `/firma` | Company hub — profile, offers CRUD, hiring, partnerships |
| `/marktplatz` | Unified marketplace (prefs-first) |
| `/mein` | Personal hub — role, radius, prefs, skills, docs, reminders |
| `/messages` | Inbox |
| `/mehr` | Quellen, Foto-Jobs, Interview, Erfahrungen, Firma/Marktplatz links, Event/VT archive, Legal |
| `/prefs` | Preference wizard (Seeker / Firma / Beides) |
| `/listings/new` | Simple create sheet |
| `/jobs` | Classic job list (archived under Mehr) |
| `/wallet` | Wallet + **Orbit Credits** (demo ledger) |
| `/impressum` | Mirco Küßner |

Bottom nav: **Start · Match · Mein · Chat · Mehr**

## Honest limits

- **No unofficial scrapes** of LinkedIn / StepStone / Indeed / Xing / etc. Quellen shows status stubs + sample cards tagged with `source`. API/Partner import planned.
- Orbit Credits and Wallet fiat/crypto are **demo** until Stripe/PayPal/Banking + KYC are live. Rewards (welcome, referral, reviews, search, completed jobs) are a local ledger with caps so they stay fair, not spammy.
- Photo “vision” and in-app video calls are **stubs**. Real calling needs a provider (Daily / Twilio / LiveKit) later.
- Matching and mutual chat/booking seeds run locally (localStorage) unless Supabase is configured.
- **Orbit Assist** plans locally (heuristics). Optional `VITE_LLM_API_KEY` may add tips; otherwise honest Demo-Recherche. No live payments.

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
