---
doc: scope
status: approved
revision: release-docs-2026-10-26
approval_basis: User requested repairs to all audited issues and delegated repository documentation work.
---

# Scope — UnBill

## Who It's For

People reviewing an itemized medical statement need understandable line items and concrete questions for a billing team. This public prototype uses synthetic or de-identified data; it does not establish clinical or legal conclusions.

The immediate audience is someone preparing to call a hospital billing office with an itemized statement in hand. Today they must interpret codes, compare repeated entries and assemble a request manually.

## The Unique Kernel

Read a statement, identify charges that merit review, and produce a consistent selected-item review request. The observable kernel is selection → recalculation → matching letter and phone guide, with no duplicate counting.

## The Core Loop

1. Open a synthetic example or consent to processing supported document/text input.
2. Validate the extracted facts; review itemized findings and their limits.
3. Choose findings; open a letter and four phone prompts with the same selected total.
4. Copy/print, ask the optional streaming coach, revisit encrypted local history, or explicitly share/revoke a redacted report.

The person can revise a selection, regenerate the preparation kit and return to the same report when following up with the billing team.

## Inspiration & Identity

Keep the existing slate and emerald interface, clear headings, tabular amounts and restrained motion. The experience should feel like a practical billing-review workspace: understandable questions first, supporting detail available when needed. The established product direction is documented in [the PRD](prd.md#look-and-feel).

## Project Goal

The contributor requested a working project, complete repository documentation, a reliable demo-recording path and deployment readiness. Recording and the Devpost submission are handled by the contributor.

## What "Working" Looks Like

All existing flows operate on validated input, preserve unknown facts, resolve the exact requested report and show bounded/recoverable failures. Offline checks, production build and synthetic live provider checks supply evidence. The app's copy and documents describe its actual data flow and limited catalog.

The clearest demonstration is the synthetic report changing from $2,717.50 to $1,587.50 after one $1,130 finding is deselected, followed by a letter and phone guide showing that same selected amount after refresh.

## The POC Boundary

Supported statement intake, transparent review findings, selected-charge reconciliation, copy/print preparation kit, optional streaming coach, encrypted device history and revocable redacted sharing. Two synthetic examples make the core journey available without provider credentials or patient records.

## Explicitly Cut

The 19-code price catalog is illustrative, not official CMS/payer/facility pricing. No fraud finding, enforceable price cap, automatic collection stay, guaranteed savings, insurer EOB reconciliation, legal representation or HIPAA certification. Negative credits, illegible/incomplete statements and over-limit inputs require manual review.

These exclusions keep the demonstration grounded in statement review. Official price adjudication needs appropriately sourced data; clinical and legal conclusions require facts and expert assessment the app does not possess.

## Later

Licensed, sourced and dated payer/facility pricing; EOB reconciliation; richer provider/modifier support; formal expert validation; appropriate agreements and governance for sensitive health records. These are separate from a functioning hackathon demonstration.

## Related Documents

[Product requirements](prd.md), [technical specification](spec.md), [build checklist](checklist.md), [app map](app-map.html) and [release evidence](../docs/audits/2026-10-26/RELEASE.md) describe the current release. Personal learning context remains in the ignored learner profile.
