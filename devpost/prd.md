---
doc: prd
status: approved
---

# UnBill — Product Requirements

UnBill is a forensic hospital bill auditor and statutory dispute generator that decodes complex medical codes into plain English, detects overcharges against Medicare benchmarks, and produces legally enforceable dispute packages for patients.
Source: `scope.md > The Unique Kernel` and `scope.md > Who It's For`.

## The Core Journey
1. **Arrival & Orientation:** The patient arrives on the homepage, sees immediate real-world validation (the 80% error rate and $88B debt context), and has an instant option to test a pre-loaded realistic sample bill or upload their own bill.
2. **Document Ingestion:** The patient drops a photo, scan, or PDF of their itemized medical bill (or pastes statement text).
3. **Multi-Agent Forensic Audit:** In under 5 seconds, the ingestion engine extracts clinical line items, audits them against CMS/Medicare benchmarks, and runs deterministic duplicate and unbundling checks.
4. **Interactive Dashboard:** The patient explores their decoded bill with plain-English descriptions, overcharge calculations, and clear risk flags (🔴 Duplicate, 🔴 Unbundled, 🟡 Price Markup, 🟢 Standard).
5. **Dispute Resolution Kit:** The patient clicks "Generate Dispute Kit" to receive a customized, printable Fair Credit Billing Act (15 U.S.C. § 1666) letter and an interactive phone negotiation checklist.
6. **Copilot Interaction:** The patient asks real-time tactical questions in the slide-over chat drawer powered by Groq.

## Screens and Layout
- **Landing Page (`/`):** Problem statistics, feature highlights, and 1-Click sample test cards.
- **Scanner Hub (`/scan`):** Multi-modal upload zone (drag-drop, camera snap, and text paste).
- **Processing View (`/pipeline`):** Animated multi-agent radar showing live extraction, audit, and legal assembly steps.
- **Forensic Dashboard (`/results/[id]`):** KPI summary cards, risk gauge, interactive audited table with plain-English drawers.
- **Dispute Toolkit (`/dispute/[id]`):** Printable certified dispute letter, copy button, and phone script checklist.
- **History Vault (`/history`):** Client-side scan archive showing lifetime dollars audited and saved.

## Look and Feel
- **Aesthetic:** Editorial clinical-fintech ("Anti-AI Slop"). Calm, authoritative, and reassuring.
- **Palette:** Warm slate canvas (`#F8FAFC`), crisp white card surfaces (`#FFFFFF`), micro-borders (`#E2E8F0`), deep anchor navy (`#0F172A`), and calming pine emerald (`#059669`).
- **Typography:** Modern serif headings paired with clean sans-serif body and high-legibility tabular monospace for CPT codes and prices.

## Features and Behavior

### 1. Document Extraction & Translation
- As an insured patient, I want my cryptic hospital bill decoded so that I know what each charge actually represents.
  - [x] Extracts CPT/HCPCS codes, raw descriptions, service dates, and billed amounts via Gemini Vision.
  - [x] Translates clinical jargon into conversational plain English for every line item.

### 2. Forensic Auditing Engine
- As a patient, I want billing errors automatically identified so that I don't pay for hospital mistakes.
  - [x] Flags duplicate charges on identical dates.
  - [x] Flags unbundled diagnostic tests under Correct Coding Initiative (CCI) rules.
  - [x] Compares charges against CMS/Medicare allowable benchmarks and flags markups exceeding 2.5x.

### 3. Legal Dispute Kit Generator
- As an overbilled patient, I want a formal legal dispute letter so that I can exercise my consumer rights without hiring a lawyer.
  - [x] Assembles a formal dispute letter citing the Fair Credit Billing Act (15 U.S.C. § 1666).
  - [x] Generates an interactive phone script for negotiating with hospital billing supervisors.

### 4. Real-Time Copilot Chat
- As a nervous patient, I want instant answers to negotiation questions so that I feel confident calling the billing office.
  - [x] Streams sub-350ms responses via Groq (`openai/gpt-oss-120b`).
  - [x] Injected with the active bill's audit findings and Section 501(r) financial hardship rules.

## States and Boundaries
- **First Use:** Clean onboarding with 1-click sample bills so judges can test instantly without uploading personal documents.
- **Error State (Non-Medical Upload):** Gracefully informs the user if an uploaded image is not a medical statement.
- **Success State (Clean Bill):** Confirms when a bill has no detected errors and validates charges against fair market rates.
- **Privacy Boundary:** Ephemeral processing on serverless functions; all saved bills reside 100% in browser local storage.

## Product Decisions
- **No User Login:** Chosen to eliminate friction for hackathon judges and uphold zero-retention patient privacy.
- **Dual-LLM (Gemini + Groq):** Gemini handles high-fidelity multimodal vision and forensic extraction; Groq handles sub-second streaming chat.
- **Bundled Datasets:** `cpt_benchmarks.json` and `legal_statutes.json` bundled locally to eliminate slow external database dependencies.

## What We're Building
A working proof of concept demonstrating the full end-to-end journey: intake $\rightarrow$ forensic audit $\rightarrow$ interactive dashboard $\rightarrow$ dispute package $\rightarrow$ copilot chat.

## Deferred From the POC
- Direct integration with insurance portals (Epic MyChart FHIR APIs).
- Automated physical certified mail dispatch.

## Non-Goals
- We will not provide formal legal representation or clinical medical diagnoses.
- We will not store patient medical records on a central cloud database.
