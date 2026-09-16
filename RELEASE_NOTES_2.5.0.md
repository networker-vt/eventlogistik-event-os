# Orbit 2.5.0 — release notes

SUPER-APP sprint on live 2.4.0. GitHub Pages `base` stays `/eventlogistik-event-os/`. Impressum: Mirco Küßner (unchanged). PWA first — **no App Store / Play submission this sprint**.

## 90-day focus

DE Freelancer/KMU: **Jobs finden oder anbieten** (not everything-equal). Look, Gift/Sponsor, Channels stay **stubs**. Channel = connected flag only.

## Home IA

Assist-first. Top-3 chips: **Suchen / Anbieten / Weitermachen**. One filled primary CTA (Orbit fragen). Match remains a secondary text link (prefs-first). Opt-in reminders: max 1–2/week, 1-tap action.

## Credits P0 — append-only ledger

- Schema `credit_events` (SQL migration) + Edge Function stub `credit-intent`.
- Idempotent `txn_id`. **Balance = sum(delta)**. Cap never exceeded (client + RPC).
- `VITE_APP_MODE=demo|prod` — demo keeps localStorage; prod writes/reads intents when keys exist, otherwise graceful demo fallback.
- Early-50: 1.500 Credits (≥2–3× welcome) **plus −20% boosts forever**. Normal welcome 25.
- Soft paywall only at money moments. Public Wert-Index + Burn table in Wallet.
- See [CREDITS.md](./CREDITS.md).

## Auth

Magic link / email. Supabase `signInWithOtp` when configured; demo 1-tap link if keys are missing.

## Trust & catalogue

- Soft verify: email → phone to offer → ID/business before payout (stubs).
- Categories: 6–10 filled industries live; empty chips hidden.

## Demo honesty

No Stripe/PayPal. No real magic-email without keys. No OAuth on channels. Look is filters, not ML. Travel/News still labeled demo.
