---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Project Scaffolding, Datasets & Instant 1-Click Sample Intake**
  Becomes usable: A running Next.js 15 app on `localhost:3000` with the landing hero, reference datasets (`cpt_benchmarks.json` and `legal_statutes.json`), and clickable synthetic sample bills that render a live audit structure.
  Why now: Proves the whole path end-to-end on the first slice — Next.js 15, Tailwind, data models, state, and routing — establishing the foundation for all later slices.
  PRD ref: `prd.md > Screens and Layout`, `prd.md > The Core Journey` (steps 1-2)
  Spec ref: `spec.md > Stack`, `spec.md > File Structure`, `spec.md > Components`
  Build: Initialize Next.js 15 App Router, configure Tailwind & icons, inject `data/cpt_benchmarks.json` and `data/legal_statutes.json`, create landing hero with 1-click sample cards, configure Zustand store.
  Verify (mechanical): `npm run build` passes with zero errors; clicking a sample card updates state and navigates cleanly.
  Learner check: Open http://localhost:3000, review the editorial landing page, click "Test Sample ER Bill", and verify the audit loads.
  Commit: `Scaffold Next.js 15 app with datasets and sample intake`

- [x] **2. Multi-Agent Audit Engine: Gemini Ingestion & Deterministic Rules**
  Becomes usable: Dropping a real bill image or statement text into `/api/audit` runs Agent 1 (Gemini Vision extraction), Agent 2 (deterministic duplicate & CCI unbundling checks + CMS benchmark comparison), and Agent 3 (statutory dispute matching).
  Why now: The forensic audit engine is the unique kernel of the app; proving it early eliminates all AI model and rule-engine risks.
  PRD ref: `prd.md > Features and Behavior` (Features 1 & 2)
  Spec ref: `spec.md > Components`, `spec.md > External Services and Dependencies`
  Build: Implement `lib/gemini.ts` with structured JSON schema output, `lib/rules-engine.ts` with duplicate/unbundling/markup algorithms, and `/api/audit/route.ts`.
  Verify (mechanical): POST a sample bill payload to `/api/audit` and verify response contains extracted items, flagged duplicate, and calculated savings in <4.5s.
  Learner check: Upload a sample hospital bill and confirm that duplicate charges and price markups are accurately detected.
  Commit: `Add Gemini vision extraction and deterministic forensic audit engine`

- [x] **3. Forensic Audit Dashboard & Legal Dispute Kit Generator**
  Becomes usable: A full visual dashboard on `/results/[id]` with KPI summary cards, overcharge risk meter, interactive plain-English table, and a printable Fair Credit Billing Act formal dispute letter.
  Why now: Delivers the core visual deliverable that judges evaluate for Design and Potential Impact.
  PRD ref: `prd.md > Features and Behavior` (Feature 3), `prd.md > Look and Feel`
  Spec ref: `spec.md > Components > AuditTable`, `spec.md > Components > DisputeLetter`
  Build: Build `components/audit-table.tsx` with expandable plain-English drawers, `app/results/[id]/page.tsx`, and `app/dispute/[id]/page.tsx` with printable FCBA certified letter and phone negotiation script.
  Verify (mechanical): Verify table renders all line items with color-coded risk badges; verify dispute letter compiles with account number and itemized grievances.
  Learner check: Inspect the audited line items, toggle items to dispute, and click "Print / Save PDF" to see the formal dispute letter.
  Commit: `Add forensic audit dashboard and printable dispute kit`

- [x] **4. Groq Ultra-Fast Copilot Chat, History Vault & Edge Resilience**
  Becomes usable: Real-time sub-350ms streaming chat via Groq (`openai/gpt-oss-120b`) in a slide-over drawer, persistent local history vault (`/history`), and anonymous Upstash report sharing.
  Why now: Completes the full platform with instant conversational negotiation tactics and local-first privacy persistence.
  PRD ref: `prd.md > Features and Behavior` (Feature 4), `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components > CopilotDrawer`, `spec.md > Data Model`
  Build: Implement `/api/chat/route.ts` with Groq SSE streaming, `components/copilot-drawer.tsx`, `/history/page.tsx` with IndexedDB persistence, and Upstash `/api/share`.
  Verify (mechanical): Send question to `/api/chat` and confirm streaming tokens arrive in <350ms; confirm page refresh restores history from local storage.
  Learner check: Open the Copilot drawer, ask a question about hospital negotiation, and review past scans in the history vault.
  Commit: `Add Groq copilot streaming chat and local-first history vault`

## Hands-on Checkpoints

- [x] Early usable behavior explored — Slices 1 and 2 completed with working audit engine.
- [x] Final kick-the-tires exploration and feedback completed — Full end-to-end journey verified.

## Final Review

- [x] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [x] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [x] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Verified all 4 vertical slices; tested multi-agent Gemini ingestion and deterministic duplicate/CCI unbundling rules; tested Groq sub-350ms streaming chat; validated production Next.js 15 build with 6 optimized routes.
Route and stops: 1) Gemini Ingestion (src/lib/gemini.ts) -> 2) Deterministic Rules (src/lib/rules-engine.ts) -> 3) Audit Dashboard (src/app/results/[id]/page.tsx) -> 4) Legal Dispute Kit (src/app/dispute/[id]/page.tsx) -> 5) Groq Copilot (src/app/api/chat/route.ts).
Edit outcome: Clean production build with complete test harness and local-first privacy vault.
Reflection: Hybrid AI architectures that delegate math, duplicate detection, and statutory rules to deterministic TypeScript prevent hallucinations in sensitive consumer finance domains.
Activity mode: Autonomous execution adhering to Devpost Learn AI Basics skill pack.

## Revisions
