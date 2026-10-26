# Gemini routing and quota guard

26 October 2026. The contributor requested Gemini 3.8 Flash as primary, Gemini 3.5 Flash-Lite as fallback, and a cutoff before a nineteenth primary attempt in a quota day. They reported zero prior 3.8 requests for the Google project at the start of this change.

## Observed failure

The baseline production deployment was ready and newer than the key update. A synthetic PDF request and a minimal text statement both returned GEMINI_TIMEOUT after approximately 37 seconds. The previous implementation used 3.5 Flash-Lite and 3.1 Flash-Lite and grouped missing models, busy responses and quota errors under one message. Key presence alone did not establish provider availability.

## Change

- Default primary: gemini-3.8-flash, using supported low thinking without a custom temperature.
- Default fallback: gemini-3.5-flash-lite.
- Redis atomically reserves a maximum of 18 primary attempts per Pacific calendar day across workers. Failed attempts count conservatively. Subsequent reviews use the fallback directly.
- Confirmed daily/zero-quota responses stop further primary attempts for that day. Public extraction skips the primary if its shared quota ledger cannot be used.
- The stable quota scope survives deployment and key rotation. It tracks UnBill attempts; other applications using the Google project are independent consumers.
- Model availability, rate limits, daily quota, busy responses, timeout and network failure have distinct safe errors. Logs include model, HTTP status/error category and elapsed time, without provider response bodies, document text or credentials.

## Verification

- New routing test reproduced the old incorrect defaults before the fix.
- Twenty-four concurrent offline reviews produce exactly 18 primary calls and six fallback calls.
- A confirmed provider daily-quota response sends the next review directly to the fallback.
- Pacific reset, missing-model classification/privacy and public missing-ledger behavior are covered.
- Isolated real Redis test: 40 concurrent reservations, 18 admitted, 22 blocked, zero provider calls; its test key was deleted.
- Live provider PDF check: 3.8 Flash returned HTTP 503 in 3.26 seconds; 3.5 Flash-Lite succeeded in 15.05 seconds, producing eight items and a $3,820 gross total. That primary attempt was included in the shared ledger.
- Full lint, TypeScript, 23-test suite and production build passed before publication.

Google's quota day and project scope are documented at https://ai.google.dev/gemini-api/docs/rate-limits . Project-specific model quotas must be read from the operator's AI Studio; the configured 18-attempt policy does not assert a universal free-tier allowance or guarantee provider uptime.

## Hosted follow-up

The production overall AI_DAILY_REQUEST_LIMIT had been changed to 18 and its shared counter was at 21. That application-wide setting blocked both extraction models and the coach. It was restored to the previously configured 200 while the dedicated 3.8 primary cap remains 18. The existing counter was preserved.

The subsequent PDF request still exhausted both 18-second provider windows. The fallback window is extended to 32 seconds while the primary stays at 18; total provider wait is bounded to 50 seconds under the 60-second route/client limit. This allows a slower valid provider response without changing the quota policy.

## Image timeout follow-up

The contributor supplied a readable 1,463,325-byte, 1086×1448 synthetic PNG with five charges totaling $2,305. The failed production request logged a primary HTTP 503 after 1,972 ms, followed by the fallback's fixed 32,001 ms timeout. Replaying that exact image against the same production deployment succeeded with HTTP 200 and five items in 21.10 seconds. The evidence points to variable provider response time rather than file validation or arithmetic rejection.

The fixed fallback cutoff discarded time even when the primary failed almost immediately. Both attempts now share one 90-second extraction deadline, with the primary still limited to 18 seconds and the fallback receiving the remainder. The route is bounded to 120 seconds and the browser to 125 seconds. There are still at most two provider attempts per review; daily quota accounting, cancellation, document validation and error handling are preserved. Provider delays beyond this bound can still return a timeout.

An offline image-extraction regression reproduces the old timeout for an otherwise valid fallback response at 40 seconds, then passes after the change. A second regression verifies that two stalled model attempts stop at the shared 90-second deadline. These simulate provider timing, not OCR accuracy or provider uptime.

References: [Google thinking levels](https://ai.google.dev/gemini-api/docs/thinking) and [Vercel function duration](https://vercel.com/docs/functions/configuring-functions/duration). No model switch or temperature change was needed for this issue.

Verification before publication: lint, TypeScript, all 25 offline tests and production build passed. The exact contributor PNG was successfully processed by the live deployment before this patch; the new deadline behavior is covered by deterministic timing regressions.
