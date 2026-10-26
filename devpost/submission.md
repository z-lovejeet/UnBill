# UnBill — submission draft for contributor review

**AI-assisted draft prepared at the user's explicit request.** This is not a claim of learner authorship or submission. The current Devpost Learn Skill Pack reserves final public answers and narration to the learner. Review the actual form and authorship requirements; supply final original answers and personal reflections before submission. Do not describe unverified deployment, feedback or participation as completed.

## Project name
UnBill

## Short description draft
Turn an itemized medical statement into clear billing-review questions, a consistent selected-charge letter, and a practical phone guide.

## Inspiration draft
Medical statements combine unfamiliar service codes, repeated-looking entries, insurance adjustments and large amounts. A useful first step is to make those details understandable and prepare specific questions for the billing team. UnBill focuses on that review and preparation step, with explicit limits on what automation can conclude.

## What it does draft
UnBill accepts supported images, PDFs or pasted itemized text. Gemini extracts structured facts; TypeScript validates the statement and identifies possible repeats, panel overlaps, documentation questions and differences from a limited illustrative reference catalog. Users choose which findings to include. One calculation keeps the dashboard, saved report, letter and phone guide consistent. An optional Groq coach streams practical questions, while device-encrypted history and revocable redacted links support follow-up.

The synthetic examples run the same rules engine without calling document AI. They make the core flow available to judges without personal medical records.

## How it was built — factual notes
- Next.js 15 App Router, React 19, TypeScript, Tailwind CSS and accessible semantic controls.
- Gemini REST structured extraction with runtime Zod validation, missing facts preserved, bounded attempts and fallback.
- Deterministic per-item reconciliation and letter/phone generation; no AI replacement of letter figures.
- Groq streaming with de-identified context, consent and cancellation.
- AES-256-GCM local persistence with a nonextractable IndexedDB device key.
- Upstash Redis request limits and 30-day redacted reports with independent cryptographic revocation credentials.
- Offline regressions, lint/types/build gate, CI and a synthetic live provider/route suite. Consult release evidence for current measured results.

## Challenges — factual notes
The readiness audit found a real mismatch between selected amounts and exported letter text, overlapping findings counted twice in printed schedules, a wrong-record fallback, incomplete runtime validation and unsupported privacy/legal claims. The hardening pass centralized reconciliation, loaded exact IDs, implemented device encryption and revocable redaction, bounded provider calls and replaced misleading claims with explicit review limits.

## Accomplishments — factual notes
The supported text/image/PDF paths, streaming coach and redacted share/revocation flow passed live synthetic checks during hardening. The original selection bug was reproduced and then verified through the real browser, including refresh. The app preserves unknown facts and distinguishes gross-charge review amounts from a patient's reported balance.

## Personal learning/reflection
The contributor must supply their own genuine reflection. Possible factual topics to reflect on: the selection-to-letter bug, the difference between schema validation and JSON parsing, or how privacy promises were checked against actual storage and provider flows. No personal experience is asserted here.

## Next steps draft
Future work includes appropriately licensed and dated payer/facility reference data, richer provider/modifier handling, EOB reconciliation and formal expert validation. Real sensitive-health-data operation requires appropriate provider agreements, settings and organizational practices. The public release is a synthetic/de-identified billing-review demonstration.

## Built with
Next.js, React, TypeScript, Tailwind CSS, Zod, Google Gemini API, Groq, Upstash Redis, Zustand, Web Crypto, IndexedDB, Lucide.

## Skill Pack usage — factual draft notes
The repository contains substantive scope, PRD, technical spec, build checklist and app-map artifacts following the Devpost Learn sequence. The final repair pass used the readiness findings to reconcile the implementation, documentation, verification and shipping checklist. The contributor should describe their actual participation and planning chronology truthfully; this draft does not attest to an original interview or learning activity.

## Links and final form
Repository: https://github.com/z-lovejeet/UnBill . Use the current released revision, not an unpublished local repair. Add the verified public YouTube/Vimeo video URL. A live deployment is optional and belongs here only after verification. See `shipping-status.md` for actual status.

Contributor-only completion: final original public answers/narration, Skill Pack usage explanation, age-of-majority checkbox, exit survey and submission confirmation. The agent does not attest to age or personal reflections.
