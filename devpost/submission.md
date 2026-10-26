# UnBill — project overview

Project facts and links for recording and submission preparation. Publication status is tracked in [shipping status](shipping-status.md).

## Project name

UnBill

## Short description

Turn an itemized medical statement into clear billing-review questions, a consistent selected-charge letter, and a practical phone guide.

## Inspiration

Medical statements combine unfamiliar service codes, repeated-looking entries, insurance adjustments and large amounts. A useful first step is to make those details understandable and prepare specific questions for the billing team. UnBill focuses on that review and preparation step, with explicit limits on what automation can conclude.

## What it does

UnBill accepts supported images, PDFs or pasted itemized text. Gemini extracts structured facts; TypeScript validates the statement and identifies possible repeats, panel overlaps, documentation questions and differences from a limited illustrative reference catalog. Users choose which findings to include. One calculation keeps the dashboard, saved report, letter and phone guide consistent. An optional Groq coach streams practical questions, while device-encrypted history and revocable redacted links support follow-up.

The synthetic examples run the same rules engine without calling document AI. They make the core flow available to judges without personal medical records.

## How it was built

- Next.js 15 App Router, React 19, TypeScript, Tailwind CSS and accessible semantic controls.
- Gemini REST structured extraction with runtime Zod validation, missing facts preserved, bounded attempts and fallback.
- Deterministic per-item reconciliation and letter/phone generation; no AI replacement of letter figures.
- Groq streaming with de-identified context, consent and cancellation.
- AES-256-GCM local persistence with a nonextractable IndexedDB device key.
- Upstash Redis request limits and 30-day redacted reports with independent cryptographic revocation credentials.
- Offline regressions, lint/types/build gate, CI and a synthetic live provider/route suite. Consult release evidence for current measured results.

## Challenges

The readiness audit found a real mismatch between selected amounts and exported letter text, overlapping findings counted twice in printed schedules, a wrong-record fallback, incomplete runtime validation and unsupported privacy/legal claims. The hardening pass centralized reconciliation, loaded exact IDs, implemented device encryption and revocable redaction, bounded provider calls and replaced misleading claims with explicit review limits.

## Accomplishments

The supported text/image/PDF paths, streaming coach and redacted share/revocation flow passed live synthetic checks during hardening. The original selection bug was reproduced and then verified through the real browser, including refresh. The app preserves unknown facts and distinguishes gross-charge review amounts from a patient's reported balance.

## Engineering takeaways

The selection-to-letter defect demonstrated why a financial value shown in several places needs one authoritative calculation and a test of the complete user action. Runtime validation also matters beyond valid JSON: item identities, quantities, missing facts and statement totals must agree before a report can be trusted. Privacy descriptions must match the implemented browser storage, provider requests and sharing behavior.

## Next steps

Future work includes appropriately licensed and dated payer/facility reference data, richer provider/modifier handling, EOB reconciliation and formal expert validation. Real sensitive-health-data operation requires appropriate provider agreements, settings and organizational practices. The public release is a synthetic/de-identified billing-review demonstration.

## Built with

Next.js, React, TypeScript, Tailwind CSS, Zod, Google Gemini API, Groq, Upstash Redis, Zustand, Web Crypto, IndexedDB, Lucide.

## Skill Pack usage

The Devpost Learn Skill Pack provided the structure for UnBill's scope, product requirements, technical specification, build checklist, app map and release preparation. The scope centers on one observable kernel: selected statement findings produce a matching review letter and phone guide. The release audit was used to reconcile those requirements with the implementation, fix the selection and validation defects, and record the verification evidence. The recording guide follows that same end-to-end journey.

## Project links

- Public repository: https://github.com/z-lovejeet/UnBill
- Live demonstration: https://unbill-delta.vercel.app — deployment confirmed by the contributor for code revision `1069dfb`.
- Demo video: recording/upload handled by the contributor; add the public YouTube/Vimeo URL when available.
- Setup and verification: [technical specification](spec.md) and [release evidence](../docs/audits/2026-10-26/RELEASE.md).
