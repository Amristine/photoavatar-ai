# Integration notes and launch checklist

## HeyGen-only provider strategy

The product supports these UI model identifiers:
- `avatar-iii`
- `avatar-iv`
- `avatar-6`
- `avatar-6-turbo`

The UI identifiers are internal product names. Map each one to the exact current HeyGen endpoint/model identifier in a server-only provider adapter. Do not send browser-provided endpoint names directly to HeyGen.

## Before implementing the generation route

Verify each model against the user's HeyGen API workspace:
1. Exact endpoint URL and HTTP method.
2. Exact model identifier and required request fields.
3. Whether it accepts a photo asset, an audio URL, a motion prompt, timestamps, and 1080p output.
4. Whether photo assets created in HeyGen Studio can be reused by that endpoint.
5. Whether the endpoint accepts 30–180 second audio inputs in one request or requires segmentation.
6. Actual per-second/per-minute billing, including Turbo pricing.
7. Webhook signature/authentication method and job-status response schema.
8. Output retention period and permitted commercial use.

Do not infer Avatar 6 API pricing from Avatar III/IV pricing or from consumer subscription credits.

## Recommended generation lifecycle

1. Authenticate the user on the server.
2. Validate MIME type, file size, duration, consent confirmation, model availability and resolution.
3. Upload photo/audio into private object storage using short-lived signed URLs.
4. Estimate the charge from server-side pricing configuration.
5. Atomically reserve credits and create a generation row using an idempotency key.
6. Submit the provider job from the server; never expose the HeyGen API key to the browser.
7. Store the provider job ID and process a verified webhook (or poll as a fallback).
8. On success, store the output in private storage, calculate actual provider cost, settle the reservation and create a ledger entry.
9. On failure, release the reservation and record a safe error code.
10. Make retries idempotent so a webhook or browser retry cannot charge twice.

## Credit ledger rules

- The browser must never set a wallet balance or final charge.
- Do not use floating point for wallet balances; use integer credits.
- Reserve credits before provider submission.
- Use database transactions / a Postgres RPC for reserve, settle and refund operations.
- Record the exchange rate and pricing version used for each generation.
- Do not mark a job completed until the output asset is stored and verified.

## Current repository status

The first commit series contains the Next.js app foundation, dark generation dashboard, configurable estimate calculator, safe pricing endpoint, health endpoint, environment template and initial Supabase schema.

The UI is a preview. Real authentication, private uploads, HeyGen generation, signed webhook handling, wallet RPCs, Razorpay checkout, admin pricing screens and deployment are not yet enabled. The Generate button intentionally does not make a paid API call.
