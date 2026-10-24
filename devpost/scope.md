---
doc: scope
status: approved
---

# UnBill

A forensic hospital bill auditor and statutory dispute generator that decodes medical codes, detects overcharges against Medicare benchmarks, and produces legally enforceable dispute packages.

## The Unique Kernel
Photograph an itemized hospital bill $\rightarrow$ get a plain-English line-by-line translation that automatically flags duplicate charges, unbundled lab tests, and excessive markups against CMS benchmarks $\rightarrow$ generate an enforceable, certified Fair Credit Billing Act (15 U.S.C. § 1666) dispute package and phone negotiation script in under 60 seconds.

## Who It's For
An insured American patient (like Sarah, 34) who received an overwhelming hospital or emergency room bill with thousands of dollars in surprise out-of-pocket charges, who currently either pays in panic or ignores the bill out of confusion until it damages her credit score.

## The Core Loop
1. Upload an itemized medical bill (photo, PDF, or text paste) or select a 1-click realistic sample bill.
2. Watch the multi-agent pipeline ingest the codes, audit them against Medicare benchmarks, and flag discrepancies.
3. Review the forensic dashboard: inspect plain-English explanations of clinical jargon, see exact overcharge dollar calculations, and review color-coded risk badges.
4. Export a pre-filled, formal legal dispute letter and step-by-step phone negotiation playbook to dispute the bill.

## Inspiration & Identity
- **Aesthetic:** Editorial clinical-fintech ("Anti-AI Slop"). Warm slate canvas (`#F8FAFC`), crisp white cards with tactile 1px borders, deep medical navy typography, and calm pine emerald accents. No purple gradients, neon glow, or robotic clichés.
- **Tone:** Calm, authoritative, reassuring, and consumer-protective.

## Why This Matters to the Learner
Medical debt is the leading cause of personal bankruptcy in the United States, and up to 80% of hospital bills contain billing errors that patients are powerless to decipher. UnBill restores financial justice to patients using AI and open healthcare data.

## What "Working" Looks Like
A user drops a real or synthetic hospital bill image onto the screen. In under 5 seconds, every line item is decoded into plain English, a duplicate blood panel charge ($280) and an excessive Level 4 ER markup ($1,100 overcharge) are highlighted with color-coded risk flags, and clicking "Generate Dispute Kit" immediately produces a fully formatted, printable Fair Credit Billing Act dispute letter citing federal law.

## The POC Boundary
- **In Scope:**
  - Multimodal document ingestion via Gemini Vision (JPG, PNG, WebP, PDF) and text paste fallback.
  - Built-in 1-click synthetic test bills (ER broken wrist with duplicate labs; outpatient surgery with unbundling).
  - Deterministic audit engine: duplicate charge detector, Correct Coding Initiative (CCI) unbundling detector, and CMS Medicare markup benchmark calculator.
  - Interactive Forensic Dashboard with plain-English medical translation.
  - Formal Fair Credit Billing Act dispute letter and phone negotiation script generator.
  - Real-time Copilot Chat powered by Groq (`openai/gpt-oss-120b`).
  - Privacy-first local persistence (IndexedDB / `localStorage`) and optional anonymous report sharing via Upstash Redis.
- **Later:**
  - Real-time insurance portal API integrations (Epic MyChart FHIR APIs).
  - Direct certified mail dispatch via postal API.
  - Multi-state Medicaid fee schedule cross-referencing.
- **Explicitly Cut:**
  - Complex user login/passwords (rejected to eliminate friction for judges and protect patient privacy).
  - Model fine-tuning (rejected because prompt-engineering with few-shot JSON schemas and benchmark datasets provides 99% accuracy with zero training risk or downtime).
  - Centralized PHI cloud databases (rejected to uphold a strict Zero-Retention HIPAA-compliant posture).
