# UnBill — Development Roadmap & Test Plan

**Document Version:** 1.0.0  
**Target Deadline:** October 26, 2026, 5:00 PM EDT (October 27, 2:30 AM IST)  
**Total Build Window:** ~72 Hours  
**Execution Strategy:** Wave-based parallelized implementation with strict test gates  

---

## 1. 72-Hour Milestone Execution Schedule

```
[Hour 0] ───────────────► [Hour 18] ───────────────► [Hour 36] ───────────────► [Hour 54] ───────────────► [Hour 72]
  Phase 1: Setup & Data      Phase 2: Core AI Engine    Phase 3: Dashboard & Letter  Phase 4: Copilot & Visuals   Phase 5: Ship & Video
```

### Phase 1: Environment Scaffolding & Datasets (Hours 0 – 12)
* **Goal:** A clean, compiling Next.js 15 TypeScript project with Tailwind, UI primitives, and the reference datasets.
* **Tasks:**
  1. Initialize Next.js 15 (App Router, Tailwind CSS, TypeScript, Lucide Icons).
  2. Install core dependencies (`@google/genai`, `groq-sdk`, `zustand`, `idb-keyval`, `clsx`, `tailwind-merge`).
  3. Create `data/cpt_benchmarks.json` with 50+ real CMS Medicare median benchmarks, unbundling arrays, and plain-English translations.
  4. Create `data/legal_statutes.json` with Fair Credit Billing Act, No Surprises Act, and Section 501(r) legal clauses.
  5. Create `public/samples/` with 2 pre-baked synthetic medical bill assets (JSON + sample PNGs) for zero-latency testing.
* **Exit Gate:** `npm run build` passes with zero errors; datasets load cleanly in memory.

---

### Phase 2: Multi-Agent AI Engine & Rules Logic (Hours 12 – 28)
* **Goal:** A working serverless API endpoint that takes an image/PDF or sample ID and returns an audited, error-flagged JSON report.
* **Tasks:**
  1. Build `lib/gemini.ts`: Configure Gemini 3.8 Flash multimodal vision client with structured JSON schema output and fallback to Gemini 3.5 Flash Lite.
  2. Build `lib/rules-engine.ts`:
     * Duplicate detection algorithm.
     * Correct Coding Initiative (CCI) unbundling detector matching `cpt_benchmarks.json`.
     * Medicare allowable markup calculator (>2.5× threshold).
  3. Build `lib/dispute-generator.ts`: Statutory citation matcher and dispute letter assembler.
  4. Build `/api/audit/route.ts`: Wire Agent 1 (Ingestion) $\rightarrow$ Agent 2 (Forensic Auditor) $\rightarrow$ Agent 3 (Dispute Advocate).
* **Exit Gate:** Sending a sample medical bill to `/api/audit` returns an `AuditReport` JSON with line items, flagged duplicates, and legal dispute letter in $<4.5$ seconds.

---

### Phase 3: Forensic Dashboard & Dispute Kit UI (Hours 28 – 46)
* **Goal:** The core user interface: Landing page, Scanner Hub, Audit Dashboard, and Printable Dispute Letter.
* **Tasks:**
  1. Build Global Navigation (`components/navbar.tsx`) with Lifetime Savings Counter.
  2. Build Landing Page (`app/page.tsx`): High-converting stats hero, problem narrative, and 1-Click Sample Bill test cards.
  3. Build Scanner Hub (`app/scan/page.tsx`): Multi-modal drag-drop zone, camera snap, and paste-text fallback.
  4. Build Audit Dashboard (`app/results/[id]/page.tsx`):
     * KPI Header Cards (Total Billed, Flagged Count, Potential Savings).
     * Overcharge Risk Gauge.
     * Interactive Itemized Table (`components/audit-table.tsx`) with expandable drawers and plain-English translations.
  5. Build Dispute Toolkit (`app/dispute/[id]/page.tsx`):
     * Formatted, printable Fair Credit Billing Act dispute letter (`components/dispute-letter.tsx`).
     * Phone Negotiation Playbook with interactive call checklist (`components/phone-script.tsx`).
     * 1-Click copy to clipboard.
* **Exit Gate:** User can click a sample bill on the landing page, navigate to results, inspect flagged items, toggle dispute items, and view a formatted formal dispute letter.

---

### Phase 4: Copilot Chat, History Vault & Visual Polish (Hours 46 – 60)
* **Goal:** Instant streaming AI negotiation chat, local persistence, and anti-AI slop visual polish.
* **Tasks:**
  1. Build `/api/chat/route.ts`: Groq Llama-3.3-70b streaming chat endpoint with active audit report context injection and fallback to 8b.
  2. Build Slide-Over Copilot Drawer (`components/copilot-drawer.tsx`): Sub-350ms streaming response UI with suggested prompt pills.
  3. Build Multi-Agent Radar Screen (`app/pipeline/page.tsx`): Animated stepper with progressive status indicators (Agent 1 $\rightarrow$ Agent 2 $\rightarrow$ Agent 3).
  4. Build Local History Vault (`app/history/page.tsx`): Displays previously scanned bills, lifetime savings total, and 1-click re-open.
  5. Apply Design Polish: Editorial typography, warm slate background, restrained badge colors, smooth button states.
* **Exit Gate:** Copilot responds in real-time to billing questions; audits persist across page refreshes; mobile responsive on 375px.

---

### Phase 5: Verification, Demo Video & Devpost Submission (Hours 60 – 72)
* **Goal:** Flawless live deployment on Vercel, public GitHub repository, and recorded 2.5-minute demo video.
* **Tasks:**
  1. Deploy to Vercel and verify production environment variables.
  2. Verify all edge cases (blurry image, clean bill, 1-click sample bills).
  3. Write comprehensive GitHub `README.md` with architecture diagrams and setup instructions.
  4. Run Skill Pack `6-ship` to generate official submission copy.
  5. Record and edit a punchy 150-second screen-recorded demo video.
  6. Submit before the hard deadline on Devpost.

---

## 2. Quality Assurance & Test Matrix

| Test ID | Test Description | Expected Behavior | Pass Criteria |
|---|---|---|---|
| **TC-01** | Upload Sample ER Bill with duplicate lab test | Agent 1 extracts all rows; Agent 2 flags CPT 80053 as duplicate; Agent 3 cites FCBA 15 U.S.C. § 1666. | Flagged savings equal \$280.00; dispute letter contains duplicate grievance. |
| **TC-02** | Upload Sample Surgery Bill with unbundled tests | Agent 2 flags child test CPT 82040 as unbundled under CPT 80053. | Status badge displays `🔴 UNBUNDLED CHARGE`; remedy says reduce to \$0.00. |
| **TC-03** | Upload clean bill with standard Medicare pricing | Agent 2 finds zero anomalies; risk meter sits at 0/100 (`Clean`). | UI displays *"No anomalous billing patterns detected"*; confirms fair market pricing. |
| **TC-04** | Upload non-medical document (e.g. food menu) | Agent 1 detects non-medical content; returns `isMedicalBill: false`. | Graceful alert: *"Document does not appear to be an itemized medical bill."* Zero crash. |
| **TC-05** | Ask Copilot: *"What if the rep refuses to lower my bill?"* | Groq streams response in $<400$ms citing Section 501(r) Financial Assistance. | Streaming text renders without UI freeze; includes quotation script for user to read. |
| **TC-06** | Page refresh on `/results/[id]` | Zustand loads persisted audit from browser `localStorage`. | Full dashboard rehydrates instantly without re-calling Gemini API. |
| **TC-07** | Production Build Verification | `npm run build` executed locally. | Zero TypeScript errors; zero SSR `window` hydration mismatches. |
