# Integration notes and launch checklist

## HeyGen v3 model routing

All provider calls must run in server-only code. Never send the HeyGen API key to the browser.

### Avatar 6 and Avatar 6 Turbo

For the user's direct photo + recorded audio workflow, use the Avatar 6 Model API:
- Submit to `POST https://api.heygen.com/v3/models/avatars`.
- Pass `model: "heygen-avatar-6"` or `"heygen-avatar-6-turbo"`.
- Pass one `reference_images` asset and an `audio` asset.
- Use `resolution: "1080p"` and a descriptive `motion_prompt`.
- Optional `motion_expressiveness`: `default` or `less`.
- Poll `GET /v3/models/videos/{video_id}` or configure a callback.

The model API does not require a separate avatar or voice to be created first. A photo reference is available to all workspaces with the person's permission. Realistic human video references have additional Enterprise/consent requirements.

### Avatar IV

For arbitrary photo + audio:
- Upload image and audio using `POST /v3/assets`.
- Submit to `POST /v3/videos` with `type: "image"`, `image: { type: "asset_id", asset_id }`, and `audio_asset_id`.
- Set `engine: { type: "avatar_iv" }`, `resolution: "1080p"`, and the selected `aspect_ratio`.
- `motion_prompt` and `expressiveness` (`low`, `medium`, `high`) are supported for photo/image animation.
- Poll `GET /v3/videos/{video_id}` or receive a webhook.

### Avatar III

Avatar III uses the dedicated Photo Avatar look pipeline:
- Upload the image asset.
- Create a Photo Avatar look with `POST /v3/avatars`, `type: "photo"`, and `file: { type: "asset_id", asset_id }`.
- Save the returned avatar look ID.
- Submit to `POST /v3/videos` with `type: "avatar"`, `avatar_id`, `engine: { type: "avatar_iii" }`, and `audio_asset_id`.
- Photo Avatar output is 1080p max. Avatar III does not accept `motion_prompt`; use Avatar IV or Avatar 6 when custom gesture prompting is required.
- Poll `GET /v3/videos/{video_id}`.

### Audio and timestamps

For recorded audio, pass exactly one of `audio_url` or `audio_asset_id`; do not send `script` at the same time. HeyGen renders to the audio duration. The user's manually timestamped script is for subtitle/caption composition in our own FFmpeg step, not a replacement for the supplied audio.

## Pricing and eligibility

- Provider pricing is per model, look type and generated duration. Store rates in admin-managed configuration and snapshot the applied rate on each generation.
- The currently published API pricing table lists Avatar III Photo Avatar at $0.99/min and Avatar IV Photo Avatar at $2.31/min. Confirm the rate visible in the actual HeyGen API workspace before enabling generation.
- Do not guess Avatar 6 or Turbo pricing; keep those options disabled until the account-specific rate is confirmed.
- Check a look's `supported_api_engines` before using it with the Application API. A look that does not support a selected engine can fail with HTTP 400.
- Do not promise that every free Studio avatar can be reused through every API endpoint; test the exact look ID and workspace compatibility.

## Recommended generation lifecycle

1. Authenticate the user on the server.
2. Validate MIME type, file size, duration, consent confirmation, model availability and resolution.
3. Upload photo/audio to private object storage and/or HeyGen's asset endpoint using server-side code.
4. Estimate the charge from server-side pricing configuration and show it before generation.
5. Atomically reserve credits and create a generation row using an idempotency key.
6. Submit the provider job from the server.
7. Store the provider job ID and process a verified webhook (or poll as a fallback).
8. On success, copy the output to private storage, calculate actual provider cost, settle the reservation and create a ledger entry.
9. On failure, release the reservation and record a safe error code.
10. Make retries idempotent so a webhook or browser retry cannot charge twice.

## Webhook safety

HeyGen v3 webhooks use an endpoint secret and an HMAC-SHA256 signature over the raw request body. Verify the raw bytes with a constant-time comparison before trusting an event. De-duplicate events by a stable key such as video ID plus event type. Respond promptly; HeyGen retries failed deliveries.

## Credit ledger rules

- The browser must never set a wallet balance or final charge.
- Do not use floating point for wallet balances; use integer credits.
- Reserve credits before provider submission.
- Use database transactions / Postgres RPCs for reserve, settle and refund operations.
- Record the exchange rate and pricing version used for each generation.
- Do not mark a job completed until the output asset is stored and verified.

## Current repository status

The first milestone contains the Next.js app foundation, dark generation dashboard, configurable estimate calculator, safe pricing endpoint, health endpoint, environment template, initial Supabase schema and a server-only HeyGen v3 adapter for asset upload and the three model paths.

The UI is still a preview. Real authentication, private uploads, route-level authorization, wallet RPCs, signed webhook endpoint, Razorpay checkout, admin pricing screens and deployment are not yet enabled. The Generate button intentionally does not make a paid API call until those protections are implemented.
