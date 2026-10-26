---
doc: prd
status: approved
revision: release-docs-2026-10-26
approval_basis: User authorized the readiness-audit repairs and document refresh.
---

# Product requirements — UnBill

## Outcome

A person can turn a supported itemized statement into understandable review questions and an internally consistent letter without mistaking the tool's suggestions for confirmed violations or savings.

Source: [scope — The Unique Kernel](scope.md#the-unique-kernel) and [The POC Boundary](scope.md#the-poc-boundary).

## The Core Journey

1. Arrive at the home page and open a synthetic example, or go to intake and consent to supported text/document processing.
2. Review the extracted line items, gross charges, any reported patient balance and the suggested review findings.
3. Expand findings, read their explanations and choose which charges belong in the request.
4. Open the preparation kit. The letter and four phone prompts use the same selected amount as the report.
5. Copy or print the letter; optionally ask the coach for help, create a redacted share or revisit encrypted device history.

Success means the report, preparation kit and saved selection agree. The user can reproduce this with the synthetic example and refresh without losing the selected figures.

## Screens and Layout

- `/`: explain the workflow and limits; two keyboard-accessible synthetic examples with figures sourced from fixtures.
- `/scan`: file upload/drop or text entry; 2.5 MB/50,000-character limits; explicit provider consent; actual waiting state, cancellation, actionable rejection/retry.
- `/results/[id]`: exact report, gross charges, selected review amount, reported patient balance (unknown when absent), review notes, item filters/details and selected checkboxes.
- `/dispute/[id]`: same exact report; regenerated letter, four phone prompts and conditional consumer-resource links; copy and clean print output.
- `/history`: up to 30 encrypted local reports, open/delete/clear, legacy recovery archive where applicable and private share-revocation controls.
- `/about` and `/privacy`: actual methodology, reference catalog scope, device encryption limitations, provider transmission and sharing policy.
- Billing coach: native modal dialog, focus handling, accessible controls, explicit Groq consent, streaming and cancellation. Closed content is absent from the accessibility tree.

## Features and Behavior

- **Intake:** supported PNG, JPEG, WebP and PDF input up to 2,500,000 bytes, or up to 50,000 text characters; explicit provider consent; at most 200 line items. Synthetic examples bypass document extraction.
- **Review:** possible duplicates, panel overlap, illustrative reference comparisons and documentation questions. Findings communicate uncertainty and preserve absent codes, dates and balances.
- **Selection:** each item contributes at most one selected review amount, bounded by its billed charge. Changing a checkbox updates the saved report and generated preparation kit.
- **Preparation:** deterministic letter and four phone prompts, conditional resource links, copy and print. The selected gross-charge review amount is distinct from confirmed savings or patient liability.
- **Coach:** optional streamed educational help with separate consent, minimized context, stop/retry and clear failure recovery.
- **History and sharing:** encrypted local reports; opt-in redacted links with expiration and creator revocation. Shared reports still expose procedures and amounts to link holders.

## Acceptance Criteria

1. Deselecting an item updates the selected total, schedule, closing, phone guide and saved report consistently, including after refresh.
2. Overlapping findings on one line contribute at most one amount capped at that line's charge.
3. A missing/expired/revoked ID shows an error; it never becomes another patient's/sample report.
4. Missing codes/dates are not invented. Invalid amounts, duplicate IDs, unsupported credits and unreconciled statement totals are rejected before producing a report.
5. Price comparisons are clearly illustrative. The app never activates or promises a collection/credit-reporting stay.
6. A real share is distinct from a local URL, removes direct identifiers, uses a strong token, expires and can be revoked by its creator.
7. Provider failures are bounded, recoverable, and do not disclose raw documents or credentials.

## States and Boundaries

- **First use:** empty history explains how to open an example or create a report.
- **Processing:** progress text, cancellation and bounded waiting; a provider failure offers a clear retry or synthetic path.
- **Rejected input:** unrelated documents, unsupported formats, invalid money/quantities and irreconcilable totals produce an actionable error rather than a fabricated report.
- **Missing report:** unknown, expired or revoked IDs display not found; another report is never substituted.
- **Persistence:** history is tied to this browser/device. A device-storage problem is surfaced; it does not become a false successful save.
- **Sharing:** creating a share requires consent and a successful server response. A local report URL is not presented as a public share.

## Look and Feel

Keep the existing slate/emerald billing-tool character, clear typography and tabular amounts. Use visible labels, semantic buttons, keyboard disclosures, focus indicators, reduced-motion support and horizontally contained item tables. Printed letters omit app navigation and controls.

## Product Decisions

- Preserve the existing workflow and visual identity while correcting release defects.
- Keep statement facts, calculations and letter figures in one authoritative model so different screens cannot disagree.
- Provide provider-independent examples for a repeatable demonstration.
- Use explicit processing/sharing choices and describe the implemented privacy boundaries directly.

## Deferred From the POC

Official payer/facility pricing, comprehensive coding adjudication, EOB/claim integration and regulated health-data operation require additional data, domain validation and operational arrangements. They are outside this release's acceptance criteria.

## Non-Goals

No diagnosis, fraud determination, legal representation, automatic collection protection or guaranteed financial reduction. No account-based cross-device synchronization. See [scope — Explicitly Cut](scope.md#explicitly-cut).

## Open Questions

No unresolved question blocks the documented synthetic demonstration. Pricing-data licensing, expert validation and arrangements for real sensitive records remain future product decisions. Video publication and Devpost form completion are tracked separately in [shipping status](shipping-status.md).
