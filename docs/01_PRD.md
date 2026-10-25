# UnBill — Product Requirements Document (PRD)

**Document Version:** 1.0.0  
**Status:** Approved for Implementation  
**Last Updated:** October 2026  
**Target Event:** Build With AI Hackathon (Devpost)  
**Author:** UnBill Engineering Core  

---

## 1. Executive Summary & Vision

**UnBill** is an open, client-first forensic hospital bill auditor and statutory dispute engine. It transforms complex, opaque medical bills (CPT/HCPCS/ICD-10 codes) into transparent, plain-English audits, automatically identifies predatory hospital billing errors (duplicate charges, unbundling, excessive markups, and clinical upcoding), and generates legally grounded, ready-to-mail Fair Credit Billing Act (FCBA) and No Surprises Act dispute packages.

### The Core Value Proposition
> *"Upload a medical bill photo $\rightarrow$ Decode every line item into plain English $\rightarrow$ Expose overcharges and compliance violations $\rightarrow$ Generate an enforceable dispute package in under 60 seconds."*

---

## 2. Problem Statement & Market Context

1. **The 80% Error Rate:** Multiple consumer advocacy studies and hospital revenue cycle audits reveal that **up to 80% of US hospital bills contain at least one billing discrepancy** (duplicate lab entries, inflated room tiers, unbundled diagnostic panels).
2. **The $88B Medical Debt Crisis:** American consumers carry over \$88 billion in medical debt on credit reports, a massive percentage of which stems from unresolved administrative errors, not real clinical liability.
3. **The Complexity Moat:** 86% of patients never dispute their hospital bills because bills are deliberately written in cryptographic medical billing codes, without standard prices or explanations.
4. **The General AI Limitation:** General chatbots (ChatGPT, generic LLMs) cannot ingest unstructured bill images, cross-reference 20+ line items against CMS/Medicare allowable benchmarks, verify Correct Coding Initiative (CCI) bundling edits, and assemble a formally cited Fair Credit Billing Act dispute package.

---

## 3. Target Personas

### Persona A: Sarah — The Overwhelmed Insured Patient
* **Profile:** 34, employed with standard employer PPO insurance.
* **Scenario:** Visited the ER for a severe migraine with nausea. Received a \$3,800 bill. Her insurer paid \$1,200; the hospital demands \$2,600 out-of-pocket.
* **Pain Point:** She has no idea what "CPT 99285" or "REV 0250" means, why an IV saline bag costs \$450, or if she can dispute it.
* **Need:** An immediate, non-intimidating translation of the bill with clear "Red/Yellow/Green" risk flags and an exact dispute script.

### Persona B: David — The Caregiver for Aging Parents
* **Profile:** 48, managing healthcare expenses for his 74-year-old mother on Medicare Advantage.
* **Scenario:** Mom had outpatient joint surgery; bills are arriving from four different providers (hospital facility, anesthesiologist, surgeon, pathology lab).
* **Pain Point:** Duplicate charges between facility and physician claims, confusing EOBs, fear of debt collectors.
* **Need:** A batch review system that tracks past scans locally, identifies unbundling, and produces formal dispute letters.

### Persona C: The Hackathon Judge
* **Profile:** Devpost technical judge reviewing dozens of projects in a 2-hour window.
* **Need:** Zero login barriers, instant comprehension in the first 20 seconds, visible multi-agent technical depth, flawless 1-click sample testing, and an undeniable "I need this in my own life" reaction.

---

## 4. User Journeys & End-to-End Scenarios

### 4.1 Primary Path: Standard Medical Bill Forensic Audit
1. **Landing & Intake:** User lands on `unbill.app`, reviews real-world stats, and clicks *"Audit a Medical Bill"*. Alternatively, they can click *"Test with Real Sample ER Bill"* to instantly test without uploading sensitive data.
2. **Document Ingestion:** User drops an image (JPG, PNG, WebP) or PDF of an itemized hospital bill.
3. **Multi-Agent Execution Pipeline:** The user is taken to an animated **Pipeline Execution Radar** showing:
   * 🤖 *Agent 1 (Clinical Ingestion):* OCR parsing and structured clinical extraction.
   * ⚖️ *Agent 2 (Forensic Auditor):* Running duplicate scans, CCI unbundling edits, and CMS benchmark comparison.
   * 📜 *Agent 3 (Legal Advocate):* Assembling FCBA citations and dispute documentation.
4. **Interactive Forensic Dashboard:**
   * **KPI Header:** Total Billed, Discrepancies Found, Total Potential Overcharges, and an Overcharge Risk Meter.
   * **Audited Itemized Table:** Every line item displayed with:
     * CPT code & clinical name.
     * Plain-English explanation ("What this actually was").
     * Billed price vs. Fair Market Benchmark range.
     * Anomaly Tag: 🔴 **Duplicate**, 🔴 **Unbundled**, 🟡 **Excessive Markup**, 🟢 **Standard**.
5. **Resolution Toolkit:**
   * User clicks *"Generate Dispute Kit"*.
   * App presents a formal, legal dispute letter formatted for certified mail with hospital address, patient account number, itemized errors, and FCBA/No Surprises Act citations.
   * User can toggle to the *"Phone Negotiation Script"* tab with bulleted talking points for calling billing.
6. **Copilot Interaction:**
   * User opens the floating *Copilot Chat Drawer* (powered by Groq for sub-second responses) and asks: *"What do I say if the hospital rep says the room fee is non-negotiable?"*
   * Copilot gives an instant, actionable answer citing Section 501(r) financial hardship rules.

### 4.2 Secondary Path: The "Clean Bill" Scenario (Edge Case)
* If an uploaded bill contains zero detected errors, the app does not fabricate false discrepancies. It congratulates the patient, shows fair market cost validation for all items, and confirms: *"No anomalous billing patterns detected. Your charges align within normal regional benchmarks."*

---

## 5. Functional Requirements (FRs)

### Module 1: Intake & Preprocessing
* **FR-1.1:** Support direct file upload of JPG, PNG, WebP, and multi-page PDF documents up to 15MB.
* **FR-1.2:** Support direct text-paste of itemized hospital statements for low-bandwidth or privacy-paranoid users.
* **FR-1.3:** Provide at least two built-in **1-Click Synthetic Sample Bills** (Sample A: Emergency Room with Duplicate Labs; Sample B: Outpatient Surgery with Severe Upcoding & Unbundling) for instant demonstration.
* **FR-1.4:** Client-side image validation (dimensions, file type, file size) with graceful error prompts before API dispatch.

### Module 2: Multi-Agent AI Pipeline
* **FR-2.1:** **Agent 1 (Clinical Ingestion):** Uses Gemini 3.8 Flash Multimodal Vision to extract hospital name, statement date, patient identifier, and structured line items (Code, Description, Quantity, Charge).
* **FR-2.2:** **Agent 2 (Forensic Auditor):** Executes deterministic algorithms:
  * Duplicate detection across identical codes and dates.
  * Correct Coding Initiative (CCI) unbundling detection via `cpt_benchmarks.json`.
  * Benchmark price deviation check (flagging items exceeding 2.5× Medicare median).
  * Clinical severity upcoding evaluation using Gemini clinical reasoning.
* **FR-2.3:** **Agent 3 (Legal Advocate):** Maps flagged anomalies to statutory consumer protections (Fair Credit Billing Act 15 U.S.C. § 1666, No Surprises Act, ACA 501(r) charity care) and compiles customized dispute packages.
* **FR-2.4:** **Agent 4 (Copilot Chat):** Streams sub-second conversational guidance via Groq Llama-3.3, injected with the active bill's audit context.

### Module 3: Forensic Dashboard & Visualization
* **FR-3.1:** Display high-level financial summary cards: Total Billed, Discrepancy Count, Potential Savings.
* **FR-3.2:** Render an interactive itemized table with expandable rows revealing plain-English translations and dispute rationale.
* **FR-3.3:** Filter and sort table by Anomaly Severity (All, High Risk, Standard).
* **FR-3.4:** Interactive checkbox selector allowing users to include or exclude specific line items from the final dispute letter.

### Module 4: Dispute Kit & Resolution Tools
* **FR-4.1:** Render a formal, printable HTML/PDF dispute letter complete with sender info, hospital billing department, itemized grievances, statutory citations, and formal demand for billing suspension.
* **FR-4.2:** 1-Click "Copy to Clipboard" with formatted markdown/plain-text.
* **FR-4.3:** "Phone Negotiation Script" generator with interactive step-by-step checklist.

### Module 5: Local-First History & Privacy Vault
* **FR-5.1:** Persist all completed audits in browser `localStorage` / IndexedDB.
* **FR-5.2:** Provide a `/history` route where users can review past scans, track total lifetime dollars saved, and re-download dispute letters.
* **FR-5.3:** 1-Click "Clear All History" button that completely purges all local health records.

### Module 6: Anonymous Report Sharing (Optional Cloud Feature)
* **FR-6.1:** Allow users to generate a de-identified, encrypted share link (`/share/[uuid]`) using Upstash Redis or URL-hash compression (`lz-string`), containing zero personal identifiers.

---

## 6. Non-Functional Requirements (NFRs)

* **NFR-1 (Performance & Latency):** Full multi-agent bill audit execution must complete in $<6$ seconds on standard broadband. Copilot chat responses must begin streaming in $<400$ms.
* **NFR-2 (Privacy & HIPAA Alignment):** Ephemeral server-side processing: bill image buffers must be processed in RAM and discarded immediately after inference. Zero persistent storage of Protected Health Information (PHI) on any central server.
* **NFR-3 (Reliability & Failover):** Automated fallback from Gemini 3.8 Flash to lightweight extraction if rate limits or 503 errors occur. Automated fallback from Groq 70b to Groq 8b.
* **NFR-4 (Device Responsiveness):** Flawless presentation across desktop (1440px), laptop (1024px), tablet (768px), and mobile (375px) viewports.
* **NFR-5 (Accessibility):** WCAG 2.1 AA compliant contrast ratios, full keyboard navigability across the dashboard, and ARIA labels on all modal and table expansions.

---

## 7. Edge Cases & Error Handling

| Scenario | System Behavior |
|---|---|
| Non-medical document uploaded (e.g. grocery receipt, selfie) | Agent 1 validation fails gracefully: *"This document does not appear to be an itemized medical bill. Please upload a hospital statement or EOB."* |
| Blurry / unreadable image | Prompt user: *"Image text is too low resolution to extract codes safely. Please upload a clearer photo or paste the statement text."* |
| Massive multi-page bill (100+ items) | Paginated processing; Agent 1 extracts in chunks; dashboard renders virtualized table without DOM slowdown. |
| Missing CPT code on line item | Gemini infers the standard CPT code from the raw clinical text description, marking confidence level as *"Inferred"*. |
| API Rate Limit Hit (429) | Seamless silent retry with exponential backoff and automatic failover to the secondary model. |

---

## 8. Success Metrics & Judging Criteria Alignment

* **Design (25%):** Non-AI slop aesthetic: editorial typography, warm calming palette, clean data density, micro-interactions, zero generic purple gradients.
* **Potential Impact (25%):** Directly tackles the \$88B medical debt epidemic with measurable dollars-and-cents savings displayed on screen.
* **Innovation/Idea (25%):** Multi-agent forensic pipeline combining multimodal vision, deterministic Medicare/CCI rule checks, and statutory consumer legal automation.
* **Presentation (25%):** 1-Click test samples, dramatic before/after reveal in the first 30 seconds, and ready-to-mail legal dispute outputs.
