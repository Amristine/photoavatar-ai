# PhotoAvatar AI

A SaaS foundation for creating audio-driven talking-avatar videos with HeyGen.

## Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS
- Supabase (authentication, database, wallet)
- Cloudflare R2 (media storage)
- HeyGen API (video generation)
- Razorpay (INR credit purchases; planned)

## Current starter
- Dark dashboard UI with model selection (Avatar III, Avatar IV, Avatar 6, Avatar 6 Turbo)
- Duration and estimated-cost calculator
- Credit wallet and generation history UI
- Server-side pricing configuration
- Safe environment-variable template

The dashboard is currently a frontend preview. A server-only HeyGen v3 adapter now covers asset upload and request construction for Avatar III, Avatar IV, Avatar 6 and Avatar 6 Turbo. It is not exposed as a paid generation route yet, and it does **not** deduct real credits.

## Setup
1. Install Node.js 20.9+.
2. Copy `.env.example` to `.env.local`.
3. Install dependencies: `npm install`.
4. Start locally: `npm run dev`.

## Before enabling real generation
- Create a Supabase project and apply the database migrations (not added yet).
- Configure private media storage and upload validation.
- Configure and verify the HeyGen API key and webhook signing secret.
- Confirm account-specific model rates and enable only supported model/asset combinations.
- Add server-side job creation and idempotent credit reservation/settlement.
- Never expose `HEYGEN_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Configure Razorpay webhooks and verify payment signatures before crediting wallets.

## Pricing
Rates in `.env.local` are planning defaults, not guaranteed quotes. Avatar 6 rates are intentionally blank until confirmed in the HeyGen account. The UI labels estimates as estimates and does not start a paid generation.
