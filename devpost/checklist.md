---
doc: checklist
status: approved
revision: release-docs-2026-10-26
---

# Build checklist

Build mode: fast. The contributor requested the readiness repairs and final repository documentation. Recording and the Devpost submission are handled by the contributor.

## Slices

- [x] Supported intake, two synthetic examples and consistent fixture totals.
- [x] Schema-validated Gemini extraction with unknown facts preserved, fallback and time limits.
- [x] Deterministic findings and one selected-item reconciliation for dashboard, history, letter and phone prompts.
- [x] Exact-ID loading, honest missing/expired states, accessible item disclosures and copy/print UI.
- [x] Bounded streaming coach with provider consent, minimized context, cancellation and failure recovery.
- [x] AES-GCM device history with nonextractable key and legacy recovery handling.
- [x] Redacted cryptographic share links, 30-day TTL and private-token revocation.
- [x] Request/body/rate/budget guards, safe errors, headers and dependency advisory remediation.
- [x] Offline regression suite, type checks, configured lint, production build, CI and deployment configuration.

## Mechanical verification

- [x] `npm test`: 18 offline regressions passed during hardening.
- [x] `npm run lint` and `npm run typecheck` passed.
- [x] Production `npm run build` and local production start passed.
- [x] Synthetic live route suite: 9/9 passed for text/image/PDF, rejection, chat and share/revocation.
- [x] Browser regression: selected $1,587.50 matches letter/schedule/closing and survives refresh; unknown dispute IDs show not found.
- [x] Final release snapshot evidence and any post-change rerun recorded in `docs/audits/2026-10-26/RELEASE.md`.

## Hands-on Checkpoints

- [x] Agent exercised the real sample → selection → letter → refresh → missing-ID path.
- [x] Contributor PDF feedback received: “the letter pdf … looks clean simple and good” (26 October 2026).
- [x] Contributor confirmed the latest commit deployed on Vercel without an issue (26 October 2026).

## Final Review

- [x] Release audit findings resolved and reviewed against the current scope, acceptance criteria and recorded checks.
- [x] Recording path centers on intake → findings → selection → matching preparation kit, with optional coach/history/sharing.
- [x] Contributor's requested document refresh covers the current implemented release and its product limits.

## Code Tour and App Map

- [x] `devpost/app-map.html` refreshed with three source stops and a concrete regression practice.
- [x] Optional edit/transfer practice is supplied with exact commands and a real selection bug example.

The map is a take-home guide through the selection-to-letter fix. The optional personal practice remains available for later; the documentation records the delivered guide and verified engineering work.

## Documentation

- [x] Private learner profile refreshed with current working preferences and task ownership; remains ignored.
- [x] Scope records audience, unique kernel, core loop, success example, boundary and deferred work.
- [x] PRD records the complete journey, features, states, acceptance criteria and visual direction.
- [x] Spec records actual architecture, data model, components, services, failure handling and setup.
- [x] Recording guide, factual project overview, shipping status and document index are prepared.
- [x] Final document links, source anchors, formatting and diff checks verified.

## Revisions

The readiness audit exposed stale letters, wrong-record fallback, misleading privacy/legal/performance claims, incomplete validation and deployment gaps. The release hardening replaced these with tested boundaries and factual scope. Historical audits remain as evidence and are clearly distinguished from current release results.

## Shipping

- [x] Existing public repository URL verified in the audit.
- [x] Hardening commit `cdb81ed` and follow-up lockfile correction `1069dfb` published to main.
- [x] Repaired deployment confirmed by contributor: https://unbill-delta.vercel.app .
- [ ] Final video recorded/uploaded by contributor and public access verified.
- [ ] Actual submission fields and age confirmation completed by contributor.
- [ ] Exit survey completed by contributor.
- [ ] Devpost submission confirmation verified.
