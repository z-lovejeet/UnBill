# Setup, deployment and operating guide

## Local setup

Use Node.js 22 LTS; `npm ci`; copy `.env.example` to `.env.local`; fill only server-side keys. Run `npm run dev` and open http://localhost:3000 . Synthetic examples work without providers. Never publish `.env.local`, credentials or the private learner profile.

Gemini defaults: `gemini-3.8-flash`, fallback `gemini-3.5-flash-lite`. Groq defaults: `openai/gpt-oss-120b`, fallback `openai/gpt-oss-20b`. Verify current model access/quota in provider accounts; no fixed free-tier limits or latency guarantees are assumed.

`npm run check` runs lint, type checks, offline regressions and production build. `npm audit --audit-level=moderate` checks current advisory metadata. `npm run samples` regenerates JSON/text/SVG fixtures from the same source. PDF generation uses ReportLab; PNGs are renders of those PDFs.

## Public deployment (Vercel configuration included)

1. Review the exact release diff and secret/privacy scan before public publication.
2. Use the existing public GitHub repository and deploy this Node.js Next.js app. The repository has `vercel.json`; no separate database migration is required.
3. Set `GEMINI_API_KEY`, optional model overrides, `GROQ_API_KEY`, its optional overrides, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `AI_DAILY_REQUEST_LIMIT` and the actual HTTPS `APP_URL` in the deployment's server environment. Keep `ALLOW_LOCAL_RATE_LIMIT=false` publicly.
4. Vercel forwarding is detected automatically. For another reverse proxy, enable `TRUST_PROXY` only if that proxy strips/sanitizes incoming forwarded headers. Otherwise all requests share the fallback network bucket.
5. Rebuild after environment/configuration changes. Check `/api/health`; this only establishes configuration presence, not live provider health.
6. Run `UNBILL_SMOKE_URL=https://your-verified-origin npm run test:live` from the release checkout. It sends synthetic data only and deletes its own share. Verify a link in a separate browser, reload the dispute, and revoke it.
7. Review provider quota/spend, Redis availability, error rates and current deployment logs without logging documents. Record the verified origin and release revision in `devpost/shipping-status.md`.

The chosen 2.5 MB raw file maximum fits under Vercel's 4.5 MB function body limit after Base64/JSON overhead. Increasing Server Actions limits would not change this Route Handler constraint. Source: https://vercel.com/docs/functions/limitations#request-body-size .

## Runtime controls

Per-network limits: document audits 6/minute, coach 20/minute, share creation 5/minute, share reads 60/minute, revocation 20/minute. Default global AI budget: 200 accepted requests/day, configurable. Provider retries can consume more than one provider call per accepted request. Counters expire; current policies protect spend but are not authentication or a complete abuse-prevention service.

Production AI endpoints require working distributed Redis protection. Local production testing may explicitly use `ALLOW_LOCAL_RATE_LIMIT=true`; do not apply that setting to public hosting. Samples and direct validated structured intake do not call AI providers.

## Data and privacy operation

The public release expects synthetic/de-identified input. Review Gemini paid/unpaid data terms, Groq retention/ZDR controls and hosting/Redis arrangements before accepting sensitive records. No blanket zero retention or HIPAA certification is claimed. Device encryption is not password protection. Explicitly shared redacted reports still contain procedures/amounts, expire after 30 days and are revoked separately from local report deletion.

## Rollback and incident handling

Retain the prior hosting deployment for rollback. If a provider or privacy issue appears, disable the relevant AI key/feature at the hosting environment and serve synthetic mode while investigating; rotate any exposed credential through its provider. Do not expose tokens in diagnostics or rewrite Git history without a deliberate recovery plan. Roll back to a verified source revision, rerun the offline/live gates and update the status record.

## Submission and recording

Use the [Skill Pack document index](../devpost/README.md), [recording guide](../devpost/recording.md), [project overview](../devpost/submission.md), [checklist](../devpost/checklist.md) and [shipping status](../devpost/shipping-status.md). The contributor confirmed successful deployment of `1069dfb` and is handling the video, actual form, personal confirmations, exit survey and Devpost submission. The required public demonstration video remains a separate deliverable.

## Reproducible clean installs

Deployment is pinned to Node 22.x. The exact `@emnapi/core` and `@emnapi/runtime` development pins intentionally retain the WebAssembly toolchain entries needed by cross-platform optional dependencies. Do not remove those lock records based only on a successful cached macOS install; use a fresh `npm ci` when changing dependencies.

## Gemini primary quota routing

The primary is Gemini 3.8 Flash, with Gemini 3.5 Flash-Lite fallback. Redis atomically reserves at most 18 primary provider attempts per America/Los_Angeles calendar day across all workers. Failed primary attempts count conservatively. The next request uses the fallback directly after the cap; a confirmed daily/zero-quota provider response also stops further primary attempts for that day. Normal transient busy/rate/timeout responses can fall back within the bounded request.

Keep GEMINI_QUOTA_SCOPE stable across deployments and key rotations for the same Google project; default: unbill. Public extraction skips the primary when its shared ledger cannot be used. Local development may use a process-local counter. This ledger covers UnBill attempts, not other tools sharing the Google project. The separate application-wide 200-request UTC-day AI budget still applies. Google quotas are per project, not per key, and reset at Pacific midnight: https://ai.google.dev/gemini-api/docs/rate-limits .

Provider logs contain only model, HTTP status, safe error category and elapsed time. Missing models, rate limits, daily quota, busy responses, timeout and network failure are distinguished without printing documents, keys or raw provider responses.
