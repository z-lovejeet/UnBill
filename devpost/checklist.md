---
doc: checklist
status: approved
revision: release-hardening-2026-10-26
---
# Build checklist

Build mode: fast. The user delegated the readiness repairs. Boxes below record engineering work and actual evidence, not invented learner participation.

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
- [ ] Contributor's own final exploration/feedback confirmed. Delegation is recorded; no personal review is invented.

- [x] Contributor PDF feedback received: “the letter pdf … looks clean simple and good” (26 October 2026). This confirms the export layout, not an invented full-project review.

## Final Review
- [ ] Contributor confirms final product/demo scope and reviews original submission/narration requirements.

## Code Tour and App Map
- [x] `devpost/app-map.html` refreshed with three source stops and a concrete regression practice.
- [x] Optional edit/transfer practice is supplied with exact commands and a real selection bug example.
- [ ] Contributor's completed learning/reflection activity confirmed, if required by their guided curriculum path.

## Revisions
The readiness audit exposed stale letters, wrong-record fallback, misleading privacy/legal/performance claims, incomplete validation and deployment gaps. The release hardening replaced these with tested boundaries and factual scope. Historical audits remain as evidence and are clearly distinguished from current release results.

## Shipping
- [x] Existing public repository URL verified in the audit.
- [x] Hardening commit cdb81ed published to main; follow-up lockfile correction is verified locally before push.
- [ ] Repaired deployment verified by contributor, who explicitly elected to handle Vercel. Existing origin: https://unbill-delta.vercel.app .
- [ ] Final contributor-owned narration recorded and public video access verified.
- [ ] Final original submission answers, Skill Pack usage field and age confirmation completed by contributor.
- [ ] Exit survey completed by contributor.
- [ ] Devpost submission confirmation verified.
