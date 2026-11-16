# PhotoAvatar AI

A SaaS foundation for creating audio-driven talking-avatar videos with HeyGen.

## Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS
- Supabase (authentication, database, wallet) — not connected yet
- HeyGen API (video generation)
- Razorpay (payments; planned)

## Current starter
- Dark creator dashboard with Avatar 3 Photo, Avatar 4 Photo, Avatar 6 and Avatar 6 Turbo model selection
- Photo and audio input selectors
- Script and motion direction fields
- Output resolution, aspect ratio and duration controls
- Server-only HeyGen v3 adapter for asset upload and generation request construction
- Supabase schema and integration notes for a future authenticated application

## Pricing display
The website intentionally has no public pricing plans, subscription tiers, provider rates or cost estimates. HeyGen provider rates remain server-side configuration for internal cost accounting only; they are not presented to website visitors.

## Setup
1. Install Node.js 20.9+.
2. Copy `.env.example` to `.env.local` and fill in your own credentials.
3. Install dependencies: `npm install`.
4. Start locally: `npm run dev`.

## Before enabling real generation
- Create and configure Supabase.
- Configure private media storage and upload validation.
- Configure and verify the HeyGen API key and webhook signing secret.
- Add server-side job creation and idempotent credit reservation/settlement.
- Never expose `HEYGEN_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Configure Razorpay webhooks and verify payment signatures before enabling wallet top-ups.

The dashboard is currently a frontend preview. It does not start paid generation or deduct credits.
