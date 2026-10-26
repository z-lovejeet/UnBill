> Historical pre-repair audit. For the repaired version, see [current release verification](RELEASE.md). Findings below record the earlier audited revision.

# UnBill submission, deployment, and demo readiness audit

Audited on 26 October 2026 (IST). Application revision: `3f166888704a758c10fdb6113beb58e06d4a89a4`. Current upstream Skill Pack: `a0f065781873e8a7ed9a9a705a8dafa6a0810439`.

## Decision

**UnBill is a functioning prototype with unresolved release blockers. It is not ready to certify as submission-complete, production-ready, or ready for a final end-to-end demo recording.** A successful Next.js build establishes deployability of the code bundle, not clinical/legal correctness, privacy, runtime provider reliability, or completed shipping requirements.

| Target | Decision | Why |
|---|---|---|
| Local synthetic demonstration | Usable for rehearsal | Sample dashboards render, but cards use stale numbers and exports contain correctness defects. |
| Final demo recording | Hold | Selection/letter mismatch, wrong-record dispute fallback, unsupported claims, and unverified Gemini extraction can appear in the core journey. |
| Hackathon submission | Not yet certified complete | Public repository and planning artifacts exist. Public demo video, exact form answers, learner authorship, exit survey, and submission confirmation remain unverified. |
| Deploy a controlled prototype | Build-capable, needs checks | Production compilation/start work; deployment URL, hosted environment, payload limits, provider behavior, and share-link behavior need verification. |
| Public production with real patient documents | No-go | Legal scope, benchmark provenance, sensitive-data handling, input validation, and abuse controls are inadequate for current claims. |

Deployment is optional for this hackathon. A local recording is acceptable under the shipping skill. The official submission deadline is **27 October 2026 at 2:30 am IST** (26 October, 5:00 pm EDT). [Official rules](https://learn-ai-basics.devpost.com/rules), [shipping skill](https://github.com/challengepost/learn-ai-basics/blob/a0f065781873e8a7ed9a9a705a8dafa6a0810439/skills/6-ship/SKILL.md).

## Fresh verification

| Check | Observed result | Limits |
|---|---|---|
| `npm run build` | Exit 0; Next.js 15.5.28 production bundle generated | Does not prove a hosted deployment or completed ESLint run. |
| `tsc --noEmit` | Exit 0 | TypeScript cannot validate arbitrary incoming JSON or model responses. |
| `npm run lint` | Exit 1; asks to configure ESLint interactively | No checked-in ESLint configuration; not a working unattended lint gate. |
| Existing audit probes, including local HTTP routes with credentials blank | **33/33 pass**, exit 0 | Historical harness does not cover the real UI toggle path, Base64 decoding, or alternate parser failures. Its hardcoded baseline is stale; the new evidence records actual revision. |
| Supplemental readiness probes | **9/9 expose unmet expectations**, exit 1 | Focused reproductions of findings below; not a random sample or an overall quality score. |
| Existing live Gemini test | Deterministic assertions pass; extraction ends with `TypeError: fetch failed` | Root host reachability and model access subsequently succeed; cannot attribute this solely to invalid credentials or a nonexistent model. |
| Bounded Gemini smoke request | Model lookup HTTP 200; tiny generation times out after 20 seconds | End-to-end real text/image/PDF extraction and AI letter generation are not certified. No repeated extraction attempts were made. |
| Live Groq SDK script | Completes; first chunk 464 ms, total 778 ms | Script incorrectly labels this sub-350 ms success because its condition accepts up to 700 ms. |
| Actual `/api/chat` | HTTP 200; first nonempty chunk 725 ms, complete 795 ms | One synthetic request; not a latency percentile measurement. |
| Actual `/api/share` with configured Redis | POST/GET HTTP 200; full synthetic patient name survives retrieval | Returned URL uses current localhost:3000 config. Own synthetic test key deleted and counter increments reversed. |
| Dependency audit | 5 total package findings: 1 high, 4 moderate. Production-only: 2, including 1 high | These are affected-package findings, not proof of an exploitable application request path. |
| Public repository | Public, remote main matches audited revision | Public API shows 0 deployments and 0 Actions runs; this does not exclude a deployment outside GitHub. No hosted app URL supplied. |
| Targeted secret check | Current configured secret values not found in tracked Git patch history; local environment/profile ignored | Not a comprehensive scan of all possible old credentials, every branch object, or third-party dashboards. |

Evidence files: [existing probes](current-existing-probes.json), [supplemental probes](current-readiness-probes.json), [input-validation responses](current-input-validation.json), [live chat/share](current-live-routes.json), [Gemini smoke result](current-gemini-generation.json), [all dependencies](current-dependencies.json), [production dependencies](current-dependencies-production.json). Reproduce the supplemental checks with `./node_modules/.bin/tsx docs/audits/2026-10-26/readiness-probes.mts`.

The earlier `evidence.json` describes revision `8165bb6` and 29 failures. It is historical evidence, not today's result. Several of those defects are fixed. Conversely, the submission's statement that an exhaustive 34-probe audit passed is not established by that historical file or today's narrower passing harness.

## Findings: fix before the final recording

### R1 — High: selected charges and the exported letter disagree

Locations: `src/app/results/[id]/page.tsx:97–124`, `src/lib/store.ts:73–122`, `src/lib/rules-engine.ts:432–440,490`.

Reproduction through the real interface: load the ER sample, deselect its first $1,130 markup, then open Generate Dispute Kit. The page header shows **$1,587.50**, while the letter still demands **$2,717.50** and includes the deselected grievance.

Cause: the store toggle patches two letter strings, then ResultsPage independently builds another report from its stale local object and writes it back with the old dispute package. Even using the store alone leaves the closing amount, grievance schedule, and negotiation scripts stale. The letter compiler does not filter `isDisputed`.

Separately, each sample letter lists overlapping anomaly amounts twice. ER grievance amounts sum to **$2,971.50** versus its **$2,717.50** total; surgery sums to **$2,136.00** versus **$1,943.00**. Dashboard deduplication does not fix printed accounting.

Required outcome: one authoritative selection calculation, one non-overlapping per-item claim amount, and a regenerated package whose header, schedule, closing, phone scripts, history, and Copilot context agree. Test this through the page, not only the store. [Screenshot](current-letter-mismatch.png), [supplemental failures](current-readiness-probes.json).

### R2 — High: a nonexistent dispute URL fabricates a valid sample dossier

Location: `src/app/dispute/[id]/page.tsx:33–63`.

Opening `/dispute/audit_nonexistent_readiness_check` displays Sarah Jenkins's ER sample letter under that arbitrary identifier. The loader fetches an ER or surgery sample for every unmatched ID, rewrites its ID, and saves it. It does not first resolve local history or shared storage. Reloading a real non-sample dispute can therefore substitute a synthetic report. The separate Results missing-report page works in the fresh-page check.

Required outcome: resolve the exact report from the appropriate source; only load samples for explicit known sample identifiers; otherwise show an honest not-found/expired state. [Browser text evidence](current-missing-dispute.txt).

### R3 — High: legal protections and pricing rules are asserted without establishing applicability

Locations: `data/legal_statutes.json:1`, `src/lib/rules-engine.ts:119–120,213–230,421–426,475–490`, `src/lib/gemini.ts:208–237`, `src/app/api/chat/route.ts:59–74`, `src/app/results/[id]/page.tsx`, home/about/privacy/submission copy.

The app claims a mandatory collection/credit-reporting stay is already active just after an audit, and applies FCBA duties to hospital invoices generally. The cited Regulation Z provision is in **Open-End Credit** and sets conditions for a qualifying billing-error notice. Its 30 days concern acknowledgement; resolution can take two complete billing cycles, capped at 90 days. Merely running an audit does not establish any legal stay. [CFPB regulation](https://www.consumerfinance.gov/rules-policy/regulations/1026/13/).

The engine labels 1.5× a hardcoded Medicare value as a regional fair-market standard and grounds it in 501(r). The IRS describes AGB limits for FAP-eligible patients at applicable hospital facilities and specified hospital-specific calculation methods. **501(r)(5)** governs charge limits; (r)(6) concerns billing/collections. A universal 1.5× multiplier is not the rule described by the IRS. [IRS charge-limit requirements](https://www.irs.gov/charities-non-profits/limitation-on-charges-section-501r5).

Required outcome: accurately scope the advocacy prototype, replace automatic-enforcement assertions with conditional, supported descriptions, and do not show protection as active without evidence. Apply this consistently to UI, generated letters, model prompts, README, and recording materials. A small footer disclaimer does not reconcile contradictory promises in the main workflow.

### R4 — High: encrypted, client-only, zero-retention promises contradict the implementation

Locations: `src/lib/store.ts:179–205`, `src/app/api/audit/route.ts:74–110`, `src/app/api/chat/route.ts:30–74`, `src/app/api/share/route.ts:32–37,67–90`, `src/app/privacy/page.tsx:48–79,116–120`, `src/app/history/page.tsx:58`.

The vault is JSON encoded with Base64. A single Base64 decode recovers the synthetic patient name and full report; there is no encryption key or cryptographic confidentiality. It uses `localStorage`, not the described IndexedDB vault. Documents are transmitted through application servers to Gemini, and bill context is sent to Groq. Share POST stores the **entire** report, including patient details and letter, for 30 days; GET serves it to anyone holding the link. The identifier uses a timestamp plus five `Math.random()` base36 characters, despite the privacy page calling it cryptographic. There is no report redaction, authentication, or user-facing revocation endpoint.

Provider retention guarantees also require verifying actual account settings/terms. Google describes different handling for paid and unpaid services; unpaid inputs/outputs can be used for improvement and reviewed by humans, with a warning against submitting sensitive data. Groq documents reliability/abuse retention exceptions and an explicit ZDR setting. Account tier and ZDR settings were not inspected in this audit. [Gemini terms](https://ai.google.dev/gemini-api/terms), [Groq data controls](https://console.groq.com/docs/your-data).

Required outcome before any real-patient release: truthful data-flow and retention disclosures, verified provider arrangements/settings, appropriate storage protection, an explicit sharing disclosure, strong capability tokens, and a deliberate redaction/revocation policy. For the hackathon, an accurately labelled synthetic-only demonstration is a much smaller scope than a health-data production launch.

### R5 — High: extraction and public API inputs lack a complete runtime schema

Locations: `src/lib/gemini.ts:252–284`, `src/app/api/audit/route.ts:12–66`.

The JSON MIME setting is not a strict output schema. Supplemental mocked-provider probes show that missing codes become an asserted **99283**, string `"false"` becomes true, and negative charges/quantities survive sanitization. Missing service dates also become today's date. The API's direct structured input checks only nonempty items and numeric amounts. A negative $100 charge produces HTTP 200 with gross, responsibility, and savings all **−$100**; missing code/id/description also passes. Numeric codes and malformed financial types return 500; malformed request JSON returns a misleading Gemini 502 response, although no model was called.

Required outcome: validate model and direct input with one explicit schema, finite money values, explicit credit/adjustment handling, positive quantities, unique IDs, code/date/metadata validity, reconciliation checks, and bounded sizes/counts. Keep unknown fields unknown rather than inventing billing facts. Return accurate client-error statuses.

### R6 — High: the actual extraction journey has not passed a live verification

Locations: `src/lib/gemini.ts:79–115,127–146,164–176,200–240`, `src/app/scan/page.tsx:78–84`.

The current Gemini model exists and the configured key can read its model metadata. Nevertheless, the existing live extraction test fails with a transport error, and a separately bounded tiny generation times out. This is a runtime reliability blocker, not proof the model identifier is invalid. No image/PDF extraction or AI letter correctness is established by the successful synthetic sample path.

The sample routes return precomputed report JSON; homepage cards fetch those files directly. They do **not** exercise Gemini or rerun the rules engine. Pipeline stages advance on 1.6/3.2-second timers rather than backend progress. The extraction calls have no app-controlled timeout/cancellation; the optional second Gemini letter call uses only the primary model. The fallback classifier does not retry 429 despite the spec promising that behavior.

Required outcome: verify a real synthetic upload/text through the actual route with an explicit latency/timeout budget and recovery path. Describe sample mode and visual progress honestly. Remove fixed sub-3.5s/sub-4.5s claims unless measured under the represented workload.

### R7 — Medium: sample cards, dashboard, and recording material use different numbers

Locations: `src/components/sample-bill-cards.tsx:62–71,100–109`, `src/app/scan/page.tsx:237–244,583–593`, `public/samples/*.json`, `devpost/submission.md`.

| Case | Homepage claim | Current report |
|---|---|---|
| ER | $4,820 billed / $1,650 disputed | $3,820 billed / $2,717.50 disputed |
| Surgery | $8,420 billed / $2,350 disputed | $2,360 billed / $1,943.00 disputed |

Intake additionally labels the surgery sample $9,600. The JSON reports now reconcile to their own item sums and engine output, but the surrounding copy was not updated. Required outcome: derive visible example figures from one source and make the learner's final narration match the actual screen.

## Additional production blockers and release risks

### P1 — High: benchmark/coding scope cannot support the advertised clinical certainty

Locations: `data/cpt_benchmarks.json`, `src/lib/rules-engine.ts:89–194,241–272`, `devpost/spec.md:70`.

There are **19** benchmark entries, not the promised 50+. Entries have no source URL, CMS release/effective date, locality, place-of-service, facility/professional distinction, or ingestion/update process. The app does not load full MPFS/NCCI datasets. Its raw item model lacks provider/modifier detail necessary to establish many coding rules. Duplicate checks collapse same code/date/amount and strip annotations; unbundling does not evaluate modifiers or medical necessity. CMS explicitly discusses same-provider/date scope and repeat tests with modifier 91. [CMS NCCI FAQ](https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits/medicare-ncci-faq-library).

The remaining upcoding heuristic can infer inappropriate level 5 billing from minor procedure codes and lack of resuscitation. ED level selection involves medical decision making; a bill's absence of CPR/intubation does not establish lack of high MDM. [AMA E/M descriptors](https://www.ama-assn.org/system/files/2023-e-m-descriptors-guidelines.pdf), [CMS E/M guidance](https://www.cms.gov/training-education/medicare-learning-networkr-mln/compliance/medicare-provider-compliance-tips/evaluation-management-services).

The engine also estimates reductions from gross charges rather than reconciling insurance responsibility, so possible gross reductions must not be sold as guaranteed patient savings. An insured patient's balance can be much smaller than the calculated potential reduction. Unknown-code rows receive NORMAL status despite lacking a benchmark. Required outcome: source/version the supported data, communicate coverage/uncertainty, and label heuristics as review candidates until sufficient evidence exists.

### P2 — High: parsing errors can still leak patient text into logs

Locations: `src/lib/gemini.ts:149–154,180–185`, `src/app/api/audit/route.ts:122–123`.

The earlier fix removed explicit raw-response logging, but logs the JavaScript JSON parser's message. For a non-JSON response beginning with `SYNTHETIC_PRIVATE_PATIENT`, that message includes an output snippet. The supplemental mock proves the private marker reaches captured error logs. Required outcome: log a safe error category/request identifier without raw parser/provider text. Review other generic error-object logging and public `rawDetails` before making a no-PHI-logs promise.

### P3 — High for a public service: no application-level abuse/cost controls

Locations: all three `src/app/api/*/route.ts` files; `next.config.ts`.

Expensive extraction/chat and Redis writes are unauthenticated and have no visible rate limits, request token/byte limits, or per-user/IP budget. Chat accepts caller-supplied system roles and unvalidated context; share accepts an arbitrary object and can retain attacker-controlled content. Lack of authentication is not by itself a hackathon failure, but an internet-facing service needs controls that preserve its intended open access without exposing unlimited spend/storage.

No security headers are set in local production responses or `next.config.ts`. A hosting/CDN layer may supply some, so verify the deployed policy rather than treating local absence as a proven hosted vulnerability. Apply deliberate CSP, framing, referrer, content-type, HTTPS, and sensitive-response cache policies suitable for the final data flow.

### P4 — Medium: the 15 MB upload claim conflicts with the intended Vercel path

Locations: `src/app/scan/page.tsx:44–59,182–194,321`, `next.config.ts:5–8`.

Uploads are Base64 in JSON sent to a Route Handler. There is no actual file-size/MIME validation in the drop handler or API. The configured 15 MB `serverActions.bodySizeLimit` applies to Server Actions, not this API path. Vercel documents a 4.5 MB function request/response limit, and Base64 expands raw file size by about one third. Therefore a 15 MB statement cannot traverse the advertised Vercel function path. [Vercel limits](https://vercel.com/docs/functions/limitations#request-body-size).

Required outcome: choose and enforce a supported upload size/transport, give an actionable too-large/unsupported-type error, and test it on the actual deployment. No Vercel deployment was performed in this audit.

### P5 — Medium: shared-report client routing has an identifier mismatch

Locations: `src/app/api/share/route.ts:32–37,50–51`, `src/app/results/[id]/page.tsx:37–69,95`, `src/app/dispute/[id]/page.tsx:40–53`.

Live readback confirms shared storage retains the original `report.id` while its route uses a different `shareId`. Source inspection shows the results loader calls `setCurrentReport(sharedData)` without reconciling these identifiers; its effect depends on that object and only short-circuits if `currentReport.id === route id`. This creates a repeated-refetch risk. This specific loop was not browser-network-instrumented, so it is an inspection finding rather than a measured request count. The confirmed wrong-record dispute fallback makes shared-dispute reloads unsafe independently.

The Share button also reports success by copying the current local result URL if sharing fails (`results/page.tsx:127–150`). Such a URL is not sufficient to retrieve a private local report in another browser. Required outcome: distinguish a real retrievable share link from a local-only URL and show truthful failure states. Configure `NEXT_PUBLIC_APP_URL` to the final HTTPS origin; current local configuration returns localhost links.

### P6 — Medium: dependency and verification gates need work

Locations: `package.json:5–33`, `scripts/test-audit.mjs:135–139`, `scripts/test-copilot.mjs:67–72`, lockfile.

Production dependency findings include Next's nested PostCSS advisory chain. Review fixed compatible versions and actual use before choosing upgrades; an audit result is not a reason to blindly force major-version changes. No exploit was attempted.

There is no configured unattended lint, `npm test` command, or checked-in CI workflow. Existing scripts mix cloud calls with checks, accept 464 ms as sub-350 ms, and print an extraction-latency target without asserting it. The original privacy test only checks plaintext containment and therefore passes Base64 encoding. Keep genuinely offline checks separate from bounded live-provider smoke tests and UI regression checks. The public claims of exhaustive verification and 100% mathematical/clinical correctness exceed this evidence.

### P7 — Medium: accessibility and export QA are incomplete

Reviewed against [Vercel Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). Specific source findings:

- `src/components/sample-bill-cards.tsx:52,90` — clickable divs have no button/link semantics or keyboard activation.
- `src/components/audit-table.tsx:220` — expandable rows are mouse-driven; no equivalent labelled keyboard disclosure.
- `src/components/copilot-drawer.tsx:244` — translated closed drawer remains in the accessibility tree and has no inert/hidden state; open drawer lacks modal/focus-trap/Escape/return-focus handling.
- `src/components/copilot-drawer.tsx:275,361,371` — close/send icon buttons and chat input lack explicit accessible labels.
- `src/components/copilot-drawer.tsx:74,226,245` and `src/app/globals.css` — motion lacks a reduced-motion path.
- `src/app/scan/page.tsx:299` — upload click target uses a div; hidden file input is not a keyboard-accessible browse control.
- `src/app/layout.tsx:49–51`, `src/components/navbar.tsx:21`, `src/components/footer.tsx:7` — global navigation/footer have no print hiding, while dispute page print rules hide only its own controls. A clean letter-only multipage export needs visual verification; actual PDF pagination was not certified.

No mobile-device, screen-reader, browser-matrix, load/concurrency, or exported-PDF visual validation was completed. Desktop sample and dispute interactions were exercised in the in-app browser. These limits should remain explicit.

## Skill Pack, documentation, and shipping

See the separately verified [Skill Pack review](skillpack-review.md) for the six-step matrix and primary-source links. In practical terms:

- Present: ignored learner profile; approved substantive scope, PRD, spec, checklist; app map; seven engineering documents; environment template; README; public repository; implementation history.
- Inaccurate or incomplete: setup clone URL is still a placeholder; runtime/SDK/model/fallback descriptions drift; nonexistent planned file/route paths remain in the spec; storage and privacy claims differ from code; sample numbers differ; benchmark count differs; app map lacks source snapshot details and omits AI letter replacement. Engineering documents and public narration contain stale performance/legal claims.
- Public repository requirement is met. README says MIT, but no project license file is tracked. Official rules recommend a detectable open-source license; this is not phrased as a mandatory license gate.
- Checklist review/learning boxes are checked, but their generic autonomous-execution evidence does not authenticate the learner's actual feedback and wrap-up. Prior conversations may supply that evidence. Do not fabricate or repeat genuine work just to repair documentation.
- Current Skill Pack reserves submission fields and narration to the learner. A polished Markdown story does not establish human authorship. If agent-generated, the existing copy cannot simply be used verbatim under that curriculum instruction. This audit identifies gaps and does not rewrite the submission.
- A public YouTube/Vimeo video URL, completed exit survey, and actual submission confirmation were not found/verified. Their status outside the repo is unknown.
- The current Devpost form also requires a Skill Pack usage explanation and age-of-majority checkbox; the public repository goes in Try it out. [Organizer update](https://learn-ai-basics.devpost.com/updates/46821-two-new-questions-on-the-submission-form).
- Deployment, Discord posting, and peer feedback are optional. Source artifacts alone cannot establish historical planning conduct or eligibility. The organizer permits combined slice commits; there is no reason to recreate history.

## Recommended closing order

1. Repair the selected-charge/package calculation and exact-ID loading. Recheck toggle → letter → copy/print → refresh/history using synthetic data.
2. Correct unsupported legal, privacy, benchmark, and performance assertions throughout the actual app and documentation. Establish an honest scope suitable for the hackathon.
3. Make Gemini extraction work on the actual synthetic document/text path and verify graceful failure with bounded timing. Keep precomputed sample mode clearly labelled.
4. Align example numbers, setup instructions, app map, and technical spec with the finished code. Fix key runtime validation and sensitive logging before enabling general uploads.
5. If deploying for judges, set production secrets and app URL, enforce supported upload sizes, add abuse controls, review dependency advisories, and smoke-test the actual public origin and a share link in another browser.
6. The learner records a concise demonstration using their own narration; uploads it publicly; verifies access while signed out; completes original submission answers, new required questions, and the exit survey; and verifies submission confirmation before the deadline.

Production use with real health information requires resolving the broader privacy, legal/coding, data-source, and operational findings. A controlled hackathon prototype does not require adding accounts or rebuilding the entire architecture to meet the curriculum.

## Audit change boundary

Only audit notes, a synthetic reproduction script, JSON evidence, browser text, and a screenshot were added. Application code, submission prose, historical checklist boxes, secrets, and Git history were not changed. Nothing was pushed, deployed, submitted, or sent to other people. Live tests used synthetic text/report data only; the dedicated cloud test record was cleaned up.
