---
doc: spec
status: approved
revision: release-hardening-2026-10-26
approval_basis: User delegated the existing-flow repairs described in the readiness audit.
---
# Technical specification — UnBill

## Stack
Next.js 15 App Router / React 19 / TypeScript; Tailwind CSS; Zod runtime validation; Zustand persistence; Web Crypto AES-256-GCM; IndexedDB via idb-keyval for a nonextractable device key; Google Gemini REST structured extraction; Groq SDK streaming; Upstash Redis for shared reports and distributed limits. Routes use Node.js, not Edge runtime.

## Flow and boundaries
`/scan` → bounded JSON `/api/audit` → runtime-validated extraction → deterministic rules → `AuditReport` → encrypted device history → exact-ID report and preparation pages. Samples compile their fixture items through the rules engine without AI. No `/pipeline` or `/share/[uuid]` page exists.

`src/lib/rules-engine.ts` owns checks, per-item maximum review amounts, `recalculateReport` and deterministic letter/phone generation. UI and store call this authority; neither patches letter strings. Unknown prices are zero/unavailable and shown as unassessed. Patient responsibility is nullable and kept distinct from gross-charge review amounts.

`src/lib/validation.ts` validates item IDs/types/dates, nonnegative finite money, positive integer quantities, 200-item coverage, and gross reconciliation. `src/lib/reports.ts` validates persisted/shared reports and removes identifiers before publication. Raw/model errors never return raw provider output.

`src/lib/gemini.ts` calls the REST structured-output endpoint using a server key header. Defaults: `gemini-3.5-flash-lite`, then `gemini-3.1-flash-lite`; 18 seconds per attempt, bounded route/client timing. Transient quota/server/model failures can fall back. No generative legal-letter replacement is performed.

`/api/chat` validates user/assistant history and consent, omits identifiers from context, uses `openai/gpt-oss-120b` with `openai/gpt-oss-20b` transient-error fallback, and streams plain text with cancellation and a bounded request. No latency guarantee.

`src/lib/api-utils.ts` enforces bounded body reads, origin checks, per-network limits and a global configurable daily AI budget. Redis counters have TTLs. Public production AI endpoints fail closed when distributed protection is unavailable. Local-only fallback must be explicitly enabled. Hosting/proxy configuration determines trusted network identity.

## Persistence and sharing
`src/lib/vault-storage.ts`: ciphertext in `unbill_vault_v2` localStorage; AES-256-GCM with random 96-bit IV; nonextractable device key in IndexedDB. Zustand stores history and share-owner controls, not chat. Legacy data is validated/migrated and an encrypted recovery archive preserves the previous local copy. Encryption is not a password/login boundary and does not protect against same-origin script compromise.

`POST /api/share`: validates/recomputes the report, requires sharing consent, redacts patient/account/facility identifiers and service dates, creates a 256-bit random bearer link and separate revocation token. `GET /api/share?id=…` returns the exact shared ID with no-store headers. `DELETE /api/share` verifies the hashed private token and revokes it. Redis TTL: 30 days. Procedures/amounts remain visible to link holders. No URL-only success fallback.

## Actual source map
- `src/app/page.tsx`, `src/components/sample-bill-cards.tsx`: home/example entry.
- `src/app/scan/page.tsx`: intake and waiting/error/recovery UI.
- `src/app/api/{audit,chat,share,health}/route.ts`: API boundaries.
- `src/lib/{validation,gemini,rules-engine,reports,store,vault-storage,api-utils,samples}.ts`: focused data/service modules.
- `src/hooks/use-report.ts`: exact local/sample/shared resolution after hydration.
- `src/components/{audit-table,copilot-drawer,vault-notice,navbar,footer}.tsx`: reusable UI.
- `src/app/results/[id]/page.tsx`, `src/app/dispute/[id]/page.tsx`, `src/app/history/page.tsx`: report/letter/history.
- `data/cpt_benchmarks.json`, `data/benchmark_metadata.json`, `data/legal_statutes.json`: illustrative catalog and linked conditional resources.
- `tests/release.test.ts`: offline regressions; `scripts/smoke-live.ts`: actual provider/route checks.

## Run, deployment and links
Node.js 22+; `npm ci`; copy `.env.example` to `.env.local`; `npm run dev`. Full release gate: `npm run check` and `npm audit --audit-level=moderate`. Live gate: documented test server + `npm run test:live`. See `docs/07_MANUAL_STEPS_AND_CONFIG.md` for public environment, payload limits, rollout and rollback.

Public repository: https://github.com/z-lovejeet/UnBill . Hosted URL, final video URL and Devpost confirmation are recorded in `devpost/shipping-status.md` only after actual verification. A local recording is permitted; deployment is optional for this hackathon.

## Known product limits
19 illustrative codes, no official fee-feed or insurer/EOB adjudication, no clinical coding determination, no automatic legal protection, no guaranteed reduction, no verified organizational approval for sensitive health-data operation. Public demo inputs must be synthetic or de-identified.
