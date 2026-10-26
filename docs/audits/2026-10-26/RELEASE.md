# UnBill repaired-release verification

26 October 2026. This is the current release record. `READINESS.md`, `skillpack-review.md`, original `evidence.json` and `current-*` files preserve the earlier pre-repair audit; their failures are not current release results.

## Verified locally

- Lint, strict TypeScript, 18 offline regression tests and the production Next.js build pass.
- Dependency advisory audit reports zero vulnerabilities after explicit PostCSS/parser override remediation.
- Nine live synthetic route checks pass: health/headers, both example paths, actual Gemini text/image/PDF extraction, unrelated-document rejection, Groq streaming and Redis redaction/revocation.
- Actual browser selection changes $2,717.50 to $1,587.50; letter header, schedule and closing agree, and the selection survives refresh.
- An unknown dispute ID shows not found; it does not load a sample.
- Coach consent, streaming completion, modal isolation, Escape dismissal and return focus were exercised in the browser. Runtime-origin rejection discovered in this check was corrected and regression-tested.
- The browser share flow creates a canonical link, displays a redacted copy with the same selected total and exposes private revocation controls in the creator's vault. API revocation/invalid-token checks pass.
- Synthetic PDFs and their image renders were visually inspected. The contributor separately confirmed that the letter PDF looks clean, simple and good. Actual contributor feedback is recorded in the checklist.

Evidence: `release-live-local.json`, `release-live-verification.json`, `release-letter.txt`, `release-letter.png`, `release-coach.txt`; reproducible regressions in `tests/release.test.ts`. The live record includes measured times; these are observations, not guaranteed latency.

## Audit finding disposition

| Finding                                       | Resolution                                                                                                                  |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Selection and stale/overlapping letters       | Single `recalculateReport` authority; deterministic package regenerated from selected items; per-item maximum amounts       |
| Wrong-record fallback                         | Exact-ID hydration/loading; unknown/shared expiry errors                                                                    |
| Unconditional legal claims                    | Conditional linked resources and billing review requests; no automatic stay or price-cap promise                            |
| False encryption/retention claims             | AES-GCM device persistence, explicit server/provider flow, honest same-origin/device-key limits                             |
| Full-record weak-token sharing                | Identifier/date redaction, 256-bit random links, separate private revocation tokens, no-store and TTL                       |
| Runtime validation/input errors               | Zod schemas, amount/date/quantity/ID limits, reconciliation, safe client errors                                             |
| Gemini live failures                          | Verified Flash Lite defaults/fallback, structured outputs and bounded requests; text/image/PDF pass                         |
| Stale example figures                         | Fixtures regenerated through the current engine; UI reads fixture figures                                                   |
| Unsourced official pricing/clinical certainty | Catalog explicitly illustrative/19 codes; uncertain coding/quantity findings are review notes                               |
| Sensitive parser logging                      | Raw provider/parser snippets never logged or returned                                                                       |
| Abuse/deployment controls                     | Redis limits/daily budget, body/MIME/signature caps, configured runtime APP_URL, browser headers                            |
| Dependency/lint/verification gaps             | Zero advisory findings, configured ESLint, 18 offline checks, CI and bounded live suite                                     |
| Accessibility/export                          | Semantic controls, labelled fields, native modal, reduced motion, contained tables and print styles                         |
| Technical/Skill Pack drift                    | Scope/PRD/spec/checklist/app map, engineering docs, README/setup, license/notices, recording and project overview refreshed |

## Publication and hosting

The user confirmed the project is already deployed and GitHub-connected. Vercel access was restored. Existing project `unbill` in `z-lovejeets-projects` is linked to `z-lovejeet/UnBill`; verified production domain: https://unbill-delta.vercel.app . The runtime APP_URL, public distributed-limit setting and daily budget are configured for the existing production environment. The release hardening was published in commit `cdb81ed`. The first cloud install exposed missing platform-runtime lock entries; the follow-up explicitly records both WebAssembly runtime packages and pins deployment Node to 22.x. The contributor requested that the agent fix, commit and push, with Vercel verification handled by the contributor.

## Honest completion boundary

The technical release is a synthetic/de-identified billing-review demonstration, not a certification for regulated patient records or comprehensive clinical/legal adjudication. The 19-code prices remain illustrative and explicitly labelled. Real sensitive-health-data use requires appropriate provider arrangements, account settings and organizational/expert review.

Repository Skill Pack documentation and recording materials are prepared; see the [document index](../../../devpost/README.md). The contributor is handling the final video, actual form answers, eligibility confirmation, exit survey and Devpost submission. External completion is tracked in [shipping status](../../../devpost/shipping-status.md).

## Clean-install correction

The supplied Vercel logs identify missing `@emnapi/core@1.11.3` and `@emnapi/runtime@1.11.3` entries during `npm ci`. Both are now explicit exact development dependencies with resolved integrity entries, so platform-specific optional dependency resolution cannot omit them from the release lock. The unrelated Vercel `cache-dir` warning is not the install failure. Fresh local `npm ci`, lint, types, 18 regressions, production build and advisory audit passed before push; results are recorded in `clean-install-fix.json`.

## Deployment confirmation and documentation handoff

The contributor subsequently confirmed that code commit `1069dfb` deployed on Vercel without an issue. On 26 October 2026 they clarified that the remaining request covers the Skill Pack repository documents; recording and the Devpost submission are their responsibility. The scope, PRD and spec were aligned to the pack's section names, the complete documentation set was indexed, and the checklist/shipping status were updated to reflect that confirmation and ownership.

Documentation verification checked 13 public documents, 60 local links and four source/test anchors with no errors. Required planning frontmatter is present; the learner profile remains ignored and untracked. The update changes documentation only and preserves the application release evidence above.
