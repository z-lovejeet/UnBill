---
doc: scope
status: approved
revision: release-hardening-2026-10-26
approval_basis: User requested repairs to all audited issues and delegated repository documentation work.
---
# Scope — UnBill

## Audience and problem
People reviewing an itemized medical statement need understandable line items and concrete questions for a billing team. This public prototype uses synthetic or de-identified data; it does not establish clinical or legal conclusions.

## Kernel
Read a statement, identify charges that merit review, and produce a consistent selected-item review request. The observable kernel is selection → recalculation → matching letter and phone guide, with no duplicate counting.

## Core journey
1. Open a synthetic example or consent to processing supported document/text input.
2. Validate the extracted facts; review itemized findings and their limits.
3. Choose findings; open a letter and four phone prompts with the same selected total.
4. Copy/print, ask the optional streaming coach, revisit encrypted local history, or explicitly share/revoke a redacted report.

## Done for this release
All existing flows operate on validated input, preserve unknown facts, resolve the exact requested report and show bounded/recoverable failures. Offline checks, production build and synthetic live provider checks supply evidence. The app's copy and documents describe its actual data flow and limited catalog.

## Boundary
The 19-code price catalog is illustrative, not official CMS/payer/facility pricing. No fraud finding, enforceable price cap, automatic collection stay, guaranteed savings, insurer EOB reconciliation, legal representation or HIPAA certification. Negative credits, illegible/incomplete statements and over-limit inputs require manual review.

## Later
Licensed, sourced and dated payer/facility pricing; EOB reconciliation; richer provider/modifier support; formal expert validation; appropriate agreements and governance for sensitive health records. These are separate from a functioning hackathon demonstration.

## Planning record
This document describes the current delegated hardening scope. It does not retroactively claim that an original learner interview occurred. The private learner profile is preserved and excluded from publication.
