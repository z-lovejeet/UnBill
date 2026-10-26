---
doc: prd
status: approved
revision: release-hardening-2026-10-26
approval_basis: User authorized the readiness-audit repairs and document refresh.
---
# Product requirements — UnBill

## Outcome
A person can turn a supported itemized statement into understandable review questions and an internally consistent letter without mistaking the tool's suggestions for confirmed violations or savings.

## Screens and behavior
- `/`: explain the workflow and limits; two keyboard-accessible synthetic examples with figures sourced from fixtures.
- `/scan`: file upload/drop or text entry; 2.5 MB/50,000-character limits; explicit provider consent; actual waiting state, cancellation, actionable rejection/retry.
- `/results/[id]`: exact report, gross charges, selected review amount, reported patient balance (unknown when absent), review notes, item filters/details and selected checkboxes.
- `/dispute/[id]`: same exact report; regenerated letter, four phone prompts and conditional consumer-resource links; copy and clean print output.
- `/history`: up to 30 encrypted local reports, open/delete/clear, legacy recovery archive where applicable and private share-revocation controls.
- `/about` and `/privacy`: actual methodology, reference catalog scope, device encryption limitations, provider transmission and sharing policy.
- Billing coach: native modal dialog, focus handling, accessible controls, explicit Groq consent, streaming and cancellation. Closed content is absent from the accessibility tree.

## Acceptance criteria
1. Deselecting an item updates the selected total, schedule, closing, phone guide and saved report consistently, including after refresh.
2. Overlapping findings on one line contribute at most one amount capped at that line's charge.
3. A missing/expired/revoked ID shows an error; it never becomes another patient's/sample report.
4. Missing codes/dates are not invented. Invalid amounts, duplicate IDs, unsupported credits and unreconciled statement totals are rejected before producing a report.
5. Price comparisons are clearly illustrative. The app never activates or promises a collection/credit-reporting stay.
6. A real share is distinct from a local URL, removes direct identifiers, uses a strong token, expires and can be revoked by its creator.
7. Provider failures are bounded, recoverable, and do not disclose raw documents or credentials.

## Visual and accessibility direction
Keep the existing slate/emerald billing-tool character, clear typography and tabular amounts. Use visible labels, semantic buttons, keyboard disclosures, focus indicators, reduced-motion support and horizontally contained item tables. Printed letters omit app navigation and controls.

## Now/later
Now: supported intake, transparent heuristic review, preparation kit, coach, encrypted history and revocable redacted shares. Later: official pricing, comprehensive coding adjudication, EOB/claim integration and regulated health-data operation.

## User participation
The user delegated this repair pass. Engineering verification can be completed by the agent; a claimed learner review, personal reflection, original narration, eligibility attestation or actual submission requires genuine contributor evidence.
