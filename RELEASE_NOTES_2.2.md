# Orbit 2.2.0 — release notes

Dual-sided marketplace + Orbit Assist (personal concierge). Companies use the app as fully as seekers.

## Highlights

- **Dual roles:** Suchende / Firma / Beides (`localStorage`). Company onboarding: firm name, industry, locations, offer vs need, languages/countries.
- **Firmen-Hub** `/firma` — profile, services CRUD, hiring, partnership interests, portfolio stubs, B2B radius.
- **Marktplatz** `/marktplatz` — Jobs, Minijobs, Dienstleistungen, B2B, Partnerschaften, Assets. Preference-first; not on Home as a catalogue.
- **Create sheet** — Job / Service / Partnership / Need, title, optional price, optional Orbit Credits boost, one-tap publish.
- **Match Finder** — seekers swipe jobs & services; companies swipe candidates **and** complementary offers/partners. Explainable Match % (skills, industry, land, sprache, offer↔need). Mutual match seeds chat.
- **Orbit Assist** — Home greets and asks how it can help. Free-text (optional voice). Intent → short plan/checklist → a few matches + “Orbit berät” tips. Complex event asks get location stub, services, staffing, ideas, reminders. Everyday (“Milch und ein Regal”) and B2B (“3 Techniker + LED Wall”) share the same flow.
- **Reminders** — plan steps write into the local calendar; list in Mein Bereich. ICS/Google unchanged.
- Nav stays **Start · Match · Mein · Chat · Mehr**. Mehr Entdecken links Firma/Marktplatz. Event/DE/Wissen/Jobs Liste stay archived.
- Home stays calm: greeting, ask field, **one** secondary CTA (Match or Prefs). Deine Welt ≤4 only when no active plan.

## Routes / screens

| Route | Purpose |
|-------|---------|
| `/` | Orbit Assist + quiet world |
| `/match` | Dual Match decks |
| `/firma` | Company hub |
| `/marktplatz` | Unified marketplace |
| `/listings/new` | Simple create sheet (`?full=1` classic form) |
| `/prefs` | Seeker / Firma / Beides wizard |
| `/mein` | Personal hub + reminders + role switch |

GitHub Pages `base` remains `/eventlogistik-event-os/`. Impressum: Mirco Küßner (private).

## Demo limits (honest)

- No real payments; Orbit Credits are a local ledger.
- Assist is on-device heuristics. Optional `VITE_LLM_API_KEY` enriches tips; otherwise **Demo-Recherche**.
- Location search for events is a stub (archive Locations).
- Voice input needs the Web Speech API.
- Matching, chat seeds, company profile: `localStorage` unless Supabase is configured.
- No unofficial scrapes of LinkedIn / StepStone / Indeed.
