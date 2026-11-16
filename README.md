# PhotoAvatar AI

A SaaS foundation for creating audio-driven talking-avatar videos with HeyGen.

## Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS
- Supabase (authentication, database, wallet) — not connected yet
- Optional Cloudflare R2 (long-term media storage)
- HeyGen API (video generation)
- Razorpay (INR credit purchases; planned)

## Current starter
- Dark dashboard UI with three customer-facing tiers:
  - Budget: Avatar 3 Photo — $0.99/min
  - Standard: Avatar 4 Photo — $2.31/min
  - Premium: Avatar 6 — $6.00/min at 1080p and $8.70/min at 2K
  - Avatar 6 Turbo is also available at $3.00/min (1080p) and $5.25/min (2K)
- Resolution-aware cost estimates using the HeyGen rates shown in the owner's API pricing dashboard
- Duration and estimated-cost calculator
- Credit wallet and generation history UI (preview only)
- Server-only HeyGen v3 adapter for asset upload and generation request construction

## Model rates
Rates are in USD per output minute:
| Model | 720p | 1080p | 2K |
|---|---:|---:|---:|
| Avatar 3 Photo | $0.99 | $0.99 | Not supported |
| Avatar 4 Photo | $2.31 | $2.31 | Not supported |
| Avatar 6 | Not supported | $6.00 | $8.70 |
| Avatar 6 Turbo | Not supported | $3.00 | $5.25 |

The values above are account-specific rates copied from the HeyGen API pricing screen shared for this project. Estimates use USD_TO_INR (default 85) and CREDITS_PER_INR (default 1). Taxes, foreign-exchange spread and any future HeyGen rate changes are not included.

## Setup
1. Install Node.js 20.9+.
2. Copy `.env.example` to `.env.local` and fill in your own credentials.
3. Install dependencies: `npm install`.
4. Start locally: `npm run dev`.

## Before enabling real generation
- Create and configure Supabase only when ready; no Supabase project is connected by this starter.
- Configure private media storage and upload validation.
- Configure and verify the HeyGen API key and webhook signing secret.
- Add server-side job creation and idempotent credit reservation/settlement.
- Never expose `HEYGEN_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Configure Razorpay webhooks and verify payment signatures before crediting wallets.

The dashboard is currently a frontend preview. It does not start paid generation or deduct credits.
