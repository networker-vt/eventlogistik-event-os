# Orbit Credits (v2.4.0)

Bitcoin-style **hard cap: 21.000.000** Orbit Credits across the entire app. The demo ledger is **client-side** (localStorage). Real 21M enforcement later needs a server or chain — **this client still never mints above the cap.**

Invariant: `circulating + remainingReserve + burned === 21_000_000`. Every grant (welcome, early tester, rewards, packs) **debits a pre-allocated pool** or fails.

## Allocation (sums to 21M)

| Pool | Amount | Rule |
|------|--------|------|
| Early Testers (signup **1–50**) | 75.000 | **1.500** Credits each |
| Welcome later (signup 51+) | 425.000 | **25** Credits each (17.000 seats) |
| Rewards (performance) | 4.500.000 | Prefs, profile, match, referral, reviews, jobs — transfer from this pool |
| Packs (system mint) | 14.000.000 | While reserve remains. After 0: **P2P only** |
| P2P float (genesis) | 100.000 | Already circulating with simulated peers |
| Treasury (unissued) | 1.900.000 | Ops, no airdrop |
| **Total** | **21.000.000** | |

Signup ordinal is stored in `localStorage` (`orbit_signup_ordinal_v1`) on this device.

When **remainingReserve = 0**: no system minting. Users can (1) **earn** from whatever is left in the pre-allocated rewards pool, or (2) **buy/P2P** from other users (order-book stub). Gift / sponsoring is a **peer transfer** (1 Credit burned as fee) — never a new mint.

## Always free

- Assist ask
- Browse Match + **20 swipes / day**
- **Look analysis (basic)** — photo/video, two demo variants
- Basic chat (Match / Booking / Support)
- Wallet view
- Social read

## Welcome / Early testers

| Cohort | Each | Pool |
|--------|------|------|
| Signup 1–50 | 1.500 | Early |
| Signup 51+ | 25 | Welcome |

No extra +100 seed. If a pool is empty, the grant fails.

## Rewards (from the rewards pool)

| Action | Credits | Cap |
|--------|---------|-----|
| Prefs complete | 20 | once |
| Profile mostly complete | 30 | once |
| First successful match | 15 | once |
| Referral demo-signup | 40 | per demo |
| Ideas box | 8 | max 3 |
| Review | 10 | max 5 |
| Search / Match day | 5 | max 7 days |
| Job completed | 25 | max 5 |

## Buy packs (demo checkout)

While the **packs pool** has remainder, packs debit that pool:

| Pack | Credits | Shown price |
|------|---------|-------------|
| Klein | 100 | 9,90 € |
| Mittel | 300 | 24,90 € |
| Groß | 800 | 59,90 € |

**No Stripe, no PayPal.** When the pack reserve is empty, Wallet switches to **„von Nutzern kaufen“** (P2P stub).

## Spend (boosts — no remint into reserve)

| Boost | Credits |
|-------|---------|
| Listing boost | 40 |
| Extra-Swipes | 25 |
| Travel deep-scan | 15 |
| Social featured | 20 |
| Priority interview | 30 |
| Look extra try-on variants (today) | 15 |
| Look nearby shop featured | 20 |
| Gift / sponsoring | peer transfer, **1 burned** |

## Scarcity UX

Wallet shows `X / 21M im Umlauf`, remaining reserve, burned, P2P-float, and a **Wert-Index** stub:

`100 × log₁₀(1 + aktive Nutzer) × (1 + Umlauf / 21M)` — labeled Demo-Formel, not a market price.

Indicative rate: 10 Credits ≈ 1 € — not a payout.
