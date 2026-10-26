---
doc: spec
status: approved
revision: release-docs-2026-10-26
approval_basis: User delegated the existing-flow repairs described in the readiness audit.
---

# Technical specification — UnBill

## How This Works, In Plain Language

The browser accepts a statement or a built-in synthetic example. A server service turns supported documents/text into structured facts; validation checks those facts before the billing-review rules run. The report, saved selection, letter and phone guide all use the same calculation. The browser encrypts device history, while an explicitly created redacted share is stored separately with an expiration and revocation credential.

## The Core Journey Through the System

Source: [PRD — The Core Journey](prd.md#the-core-journey).

1. The home example cards or `/scan` submit input to `/api/audit`.
2. Samples use their fixtures directly; document/text input goes through consent, bounded extraction and runtime validation.
3. `compileForensicAudit` produces an `AuditReport`. `store.ts` saves it through encrypted browser persistence.
4. A selection change calls `recalculateReport`, regenerating the financial summary and preparation package together.
5. `use-report.ts` loads the exact report for the results and dispute pages. Copy/print uses that report's current package.
6. Optional coach and share requests use their own validated API boundaries; share revocation invalidates the server record.

## Stack

Next.js 15 App Router / React 19 / TypeScript; Tailwind CSS; Zod runtime validation; Zustand persistence; Web Crypto AES-256-GCM; IndexedDB via idb-keyval for a nonextractable device key; Google Gemini REST structured extraction; Groq SDK streaming; Upstash Redis for shared reports and distributed limits. Routes use Node.js, not Edge runtime.

The existing React/Next.js app is retained to keep one interface and server API deployment. Zod validates external/persisted data at runtime; TypeScript alone cannot validate those inputs. Deterministic reconciliation keeps financial output independent of a language model's prose. Browser persistence avoids introducing an account system for the demonstration. Exact installed dependency versions are recorded in `package-lock.json`; deployment uses Node.js 22.x.

## Flow and boundaries

`/scan` → bounded JSON `/api/audit` → runtime-validated extraction → deterministic rules → `AuditReport` → encrypted device history → exact-ID report and preparation pages. Samples compile their fixture items through the rules engine without AI. No `/pipeline` or `/share/[uuid]` page exists.

`src/lib/rules-engine.ts` owns checks, per-item maximum review amounts, `recalculateReport` and deterministic letter/phone generation. UI and store call this authority; neither patches letter strings. Unknown prices are zero/unavailable and shown as unassessed. Patient responsibility is nullable and kept distinct from gross-charge review amounts.

`src/lib/validation.ts` validates item IDs/types/dates, nonnegative finite money, positive integer quantities, 200-item coverage, and gross reconciliation. `src/lib/reports.ts` validates persisted/shared reports and removes identifiers before publication. Raw/model errors never return raw provider output.

`src/lib/gemini.ts` calls the REST structured-output endpoint using a server key header. Defaults: `gemini-3.8-flash`, then `gemini-3.5-flash-lite`; 18 seconds per attempt, bounded route/client timing. Transient quota/server/model failures can fall back. The Redis-backed gemini-budget.ts module reserves no more than 18 primary attempts per Pacific-time day across workers, then routes directly to the fallback; confirmed daily-quota responses disable the primary for the remaining day. Failed attempts count, and key rotation does not reset the stable-scope ledger. Other applications can independently consume the Google project quota. No generative legal-letter replacement is performed.

`/api/chat` validates user/assistant history and consent, omits identifiers from context, uses `openai/gpt-oss-120b` with `openai/gpt-oss-20b` transient-error fallback, and streams plain text with cancellation and a bounded request. No latency guarantee.

`src/lib/api-utils.ts` enforces bounded body reads, origin checks, per-network limits and a global configurable daily AI budget. Redis counters have TTLs. Public production AI endpoints fail closed when distributed protection is unavailable. Local-only fallback must be explicitly enabled. Hosting/proxy configuration determines trusted network identity.

## Persistence and sharing

`src/lib/vault-storage.ts`: ciphertext in `unbill_vault_v2` localStorage; AES-256-GCM with random 96-bit IV; nonextractable device key in IndexedDB. Zustand stores history and share-owner controls, not chat. Legacy data is validated/migrated and an encrypted recovery archive preserves the previous local copy. Encryption is not a password/login boundary and does not protect against same-origin script compromise.

`POST /api/share`: validates/recomputes the report, requires sharing consent, redacts patient/account/facility identifiers and service dates, creates a 256-bit random bearer link and separate revocation token. `GET /api/share?id=…` returns the exact shared ID with no-store headers. `DELETE /api/share` verifies the hashed private token and revokes it. Redis TTL: 30 days. Procedures/amounts remain visible to link holders. No URL-only success fallback.

## Data Model

The canonical interfaces live in `src/types/audit.ts`; runtime schemas live in `src/lib/validation.ts`.

| Record                   | Contents and lifecycle                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Raw statement            | Facility/patient metadata, line items and financial fields; validated before rules run. Missing optional facts stay absent.                       |
| Audited item and finding | Source item ID, code, charge, reference assessment and review explanation. Findings remain tied to the exact item.                                |
| AuditReport              | Exact report ID, item selections, findings, financial summary, warnings and generated package. Recalculated on selection changes.                 |
| Device vault             | Up to 30 reports and owned-share controls in encrypted persistence; IndexedDB holds the nonextractable encryption key. Chat is not persisted.     |
| Shared record            | Redacted, validated report, expiration and hashed revocation credential in Redis. Link possession grants read access until expiration/revocation. |

## Components and Actual Source Map

Shared page content lives in src/components/page-content.tsx: introductions, step guides and next actions. The processing-status.tsx component presents actual input/request/save phases without simulated progress.

- `src/app/page.tsx`, `src/components/sample-bill-cards.tsx`: home/example entry.
- `src/app/scan/page.tsx`: intake and waiting/error/recovery UI.
- `src/app/api/{audit,chat,share,health}/route.ts`: API boundaries.
- `src/lib/{validation,gemini,rules-engine,reports,store,vault-storage,api-utils,samples}.ts`: focused data/service modules.
- `src/hooks/use-report.ts`: exact local/sample/shared resolution after hydration.
- `src/components/{audit-table,copilot-drawer,vault-notice,navbar,footer}.tsx`: reusable UI.
- `src/app/results/[id]/page.tsx`, `src/app/dispute/[id]/page.tsx`, `src/app/history/page.tsx`: report/letter/history.
- `data/cpt_benchmarks.json`, `data/benchmark_metadata.json`, `data/legal_statutes.json`: illustrative catalog and linked conditional resources.
- `tests/release.test.ts`: offline regressions; `scripts/smoke-live.ts`: actual provider/route checks.

These components implement [PRD — Features and Behavior](prd.md#features-and-behavior) and [States and Boundaries](prd.md#states-and-boundaries).

## Where It Runs and How Someone Tries It

Node.js 22 LTS; `npm ci`; copy `.env.example` to `.env.local`; `npm run dev`. Full release gate: `npm run check` and `npm audit --audit-level=moderate`. Live gate: documented test server + `npm run test:live`. See `docs/07_MANUAL_STEPS_AND_CONFIG.md` for public environment, payload limits, rollout and rollback.

Open http://localhost:3000 locally. The existing Vercel app is https://unbill-delta.vercel.app ; the contributor confirmed successful deployment of code commit `1069dfb` on 26 October 2026. Public repository: https://github.com/z-lovejeet/UnBill . Final video/publication status is tracked in [shipping status](shipping-status.md).

## Look and Feel

Carry forward [PRD — Look and Feel](prd.md#look-and-feel): slate/emerald colors, clear text hierarchy, tabular amounts, semantic controls and reduced-motion support. Use existing components and Tailwind styles. Native modal behavior manages coach focus/Escape; print styles produce a letter without app navigation.

## External Services and Dependencies

| Service       | Application contract and operating boundary                                                                                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gemini        | Server-side `GEMINI_API_KEY`; text or supported Base64/MIME document input to REST structured extraction; validated bill response. Default/fallback and attempt bounds are documented above.                                 |
| Groq          | Server-side `GROQ_API_KEY`; validated message history and minimized report context to streaming chat completions. Default `openai/gpt-oss-120b`, transient fallback `openai/gpt-oss-20b`; cancellation and bounded requests. |
| Upstash Redis | Server-side REST URL/token; expiring distributed counters and redacted share records. Public AI requests fail closed when distributed protection is unavailable.                                                             |
| Vercel        | Node.js Next.js hosting, server environment configuration and existing GitHub-triggered deployment. Raw upload limit keeps Base64/JSON requests within the hosting body limit.                                               |

Per-network limits are audits 6/minute, coach 20/minute, share creation 5/minute, reads 60/minute and revocation 20/minute. Default global budget: 200 accepted AI requests/day. Provider attempts can exceed accepted requests because of retries; account quota and charges depend on provider settings. No free-tier allowance or fixed latency is assumed.

## Important Failure Modes

- **Extraction failure or invalid facts:** bounded attempts followed by a safe error, retry or synthetic example. No model output is substituted for validated facts.
- **Missing local key/storage failure:** surface the vault error and preserve recoverable data; do not claim persistence succeeded.
- **Unavailable/expired sharing or distributed protection:** show a failed share/missing report or service error. Do not invent a working public URL or silently remove public request protection.

## What Was Simplified and Why

- A small, clearly illustrative catalog keeps comparisons inspectable; official price adjudication would require licensed, dated payer/facility data and domain review.
- Device-local history avoids authentication and cross-device synchronization while retaining the core follow-up workflow.
- Deterministic letters and phone prompts keep selected financial figures consistent; optional generative coaching is a separate educational aid.

## Decisions and Open Issues

The repair pass retained the existing stack and journey. A real uncertainty was whether changing a selection updated every output: browser reproduction and the regression in `tests/release.test.ts` established the mismatch, and central reconciliation resolved it. A subsequent cloud install exposed missing WebAssembly runtime lock entries; explicit dependency pins and a clean install resolved the deployment build issue. See [release evidence](../docs/audits/2026-10-26/RELEASE.md).

No unresolved implementation decision blocks the documented demonstration. Future pricing, EOB support and sensitive-data operations remain outside the current boundary.

## Known product limits

19 illustrative codes, no official fee-feed or insurer/EOB adjudication, no clinical coding determination, no automatic legal protection, no guaranteed reduction, no verified organizational approval for sensitive health-data operation. Public demo inputs must be synthetic or de-identified.
