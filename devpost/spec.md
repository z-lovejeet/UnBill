---
doc: spec
status: approved
---

# UnBill — Technical Specification

Detailed technical architecture and implementation blueprint for UnBill.
Implements: `prd.md > Features and Behavior` and refers to deep documentation in `docs/02_SYSTEM_ARCHITECTURE.md` and `docs/03_MULTI_AGENT_AI_PIPELINE.md`.

## How This Works, In Plain Language
UnBill is a web application that takes an image, PDF, or text of a hospital bill and turns it into a forensic financial audit and legal dispute package. 

Instead of routing medical data through complex central cloud databases, it uses a **Hybrid Privacy-First Serverless Architecture**:
1. When a bill is uploaded, a serverless function uses **Gemini Multimodal Vision** (`gemini-flash-lite-latest` in dev, `gemini-3.8-flash` in production) to extract the hospital name, dates, codes, and charges into structured JSON in memory.
2. An in-memory **Forensic Rule Engine** cross-references the codes against bundled Medicare benchmark tables (`data/cpt_benchmarks.json`), identifying duplicate charges, unbundled lab tests, and excessive facility markups.
3. A **Legal Advocate Engine** maps the detected errors to federal consumer rights laws (the Fair Credit Billing Act and the No Surprises Act) and formats a formal dispute letter and phone negotiation script.
4. For real-time questions, a slide-over **Copilot Chat** connects to **Groq** (`openai/gpt-oss-120b` with `openai/gpt-oss-20b` fallback) for sub-350ms streaming answers.
5. All sensitive patient audit records are stored 100% locally in the browser (`localStorage` / IndexedDB). Zero cloud database retention of medical data.

## The Core Journey Through the System
1. **Intake:** The user drops a bill image on `/scan` or clicks a sample on `/` $\rightarrow$ The file is converted to a base64 buffer in the browser.
2. **Analysis API (`/api/audit`):** The buffer is sent via POST to the Next.js serverless route $\rightarrow$ Gemini extracts line items $\rightarrow$ The rule engine executes duplicate, unbundling, and markup algorithms $\rightarrow$ Gemini compiles the statutory dispute letter $\rightarrow$ Memory buffer is flushed.
3. **Dashboard Render:** The JSON payload returns to the client in $<4.5$s $\rightarrow$ Saved to browser `localStorage` under `unbill_vault_v1` $\rightarrow$ Dashboard displays summary cards, risk meter, and interactive line-item table.
4. **Dispute Export:** The user toggles disputed items on `/dispute/[id]` $\rightarrow$ Pre-filled certified dispute letter renders with print CSS and 1-click clipboard copy.
5. **Interactive Copilot:** User clicks "Ask Copilot" $\rightarrow$ `/api/chat` streams real-time negotiation tactics from Groq with the active bill context injected.

## Stack
- **Framework:** Next.js 15 (App Router, TypeScript, React 19)
- **Styling & Components:** Tailwind CSS, shadcn/ui primitives, Lucide React icons
- **State Management:** Zustand with `persist` middleware (SSR-safe hydration)
- **AI Providers:**
  - Google Gemini Vision (`@google/genai`): Multimodal document OCR & forensic extraction. Primary: `gemini-flash-lite-latest` / `gemini-3.8-flash`. Fallback: `gemini-3.5-flash-lite`.
  - Groq (`groq-sdk`): Ultra-low-latency streaming chat. Primary: `openai/gpt-oss-120b`. Fallback: `openai/gpt-oss-20b`.
- **Cloud Telemetry & Sharing (Optional):** Upstash Serverless Redis (`@upstash/redis`) for anonymous UUID share links (`/share/[uuid]`) and global dollars-saved counters.
- **Local Storage:** `localStorage` & IndexedDB (`idb-keyval`).

## Where It Runs and How Someone Tries It
- **Local Development:**
  - Node.js 18+
  - Set keys in `.env.local` (`GEMINI_API_KEY`, `GROQ_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`).
  - Run: `npm run dev` $\rightarrow$ Open [http://localhost:3000](http://localhost:3000).
- **Production Deployment:**
  - Target: Vercel Serverless Edge.
  - Zero database configuration required for core features (local-first storage).
- **Judge 1-Click Verification:**
  - The landing page includes two pre-loaded synthetic test bills (*ER Visit with Duplicate Labs* and *Outpatient Surgery with Upcoding*) so judges can audit instantly without uploading personal files.

## Look and Feel
- **Theme:** Editorial Clinical-Fintech ("Anti-AI Slop").
- **Canvas:** Calming warm slate (`#F8FAFC`), crisp white cards (`#FFFFFF`), micro-borders (`#E2E8F0`).
- **Typography:** Serif headings paired with sans-serif body and crisp monospace for CPT codes and currency.
- **Accents:** Anchor Navy (`#0F172A`), Pine Emerald (`#059669`), Alert Crimson (`#DC2626`), Warning Amber (`#D97706`).

## Components
- `Navbar` (`components/navbar.tsx`): Brand shield logo, lifetime dollars audited counter, history link.
- `LandingHero` (`components/landing-hero.tsx`): Problem statistics, value proposition, 1-click sample cards. Implements `prd.md > Arrival & Orientation`.
- `UploadZone` (`components/upload-zone.tsx`): Drag-and-drop file uploader, camera snap, and text paste. Implements `prd.md > Document Ingestion`.
- `AgentRadar` (`components/agent-radar.tsx`): Multi-agent execution visualizer with progressive step updates. Implements `prd.md > Multi-Agent Forensic Audit`.
- `AuditTable` (`components/audit-table.tsx`): Interactive line items with plain-English descriptions, price comparisons, and risk badges. Implements `prd.md > Interactive Dashboard`.
- `DisputeLetter` (`components/dispute-letter.tsx`): Printable Fair Credit Billing Act formal letter. Implements `prd.md > Legal Dispute Kit Generator`.
- `PhoneScript` (`components/phone-script.tsx`): Step-by-step hospital calling playbook. Implements `prd.md > Legal Dispute Kit Generator`.
- `CopilotDrawer` (`components/copilot-drawer.tsx`): Floating slide-over chat assistant with sub-350ms streaming via Groq. Implements `prd.md > Real-Time Copilot Chat`.

## Data Model
Documented in full in `docs/04_DATA_MODELS_AND_SCHEMAS.md`:
- `RawBillData`: Extracted hospital metadata, statement dates, and itemized rows.
- `AuditedLineItem`: Line items with clinical categories, CMS median prices, plain-English translations, and anomaly flags.
- `AuditReport`: Complete audit package including financial summary, risk score, anomalies list, and dispute package.
- `cpt_benchmarks.json`: Top 50+ hospital CPT codes with Medicare median benchmarks and bundling rules.
- `legal_statutes.json`: Statutory text for Fair Credit Billing Act (15 U.S.C. § 1666), No Surprises Act, and IRC Section 501(r).

## File Structure
```
UnBill/
├── data/
│   ├── cpt_benchmarks.json       # Medicare benchmarks & CCI bundling rules
│   └── legal_statutes.json       # FCBA, No Surprises Act, 501(r) statutory clauses
├── public/
│   └── samples/                  # Pre-baked synthetic test bills (JSON & images)
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Global Root Layout
│   │   ├── page.tsx              # Landing Page
│   │   ├── scan/page.tsx         # Intake & Scanner Hub
│   │   ├── pipeline/page.tsx     # Multi-Agent Execution Radar
│   │   ├── results/[id]/page.tsx # Forensic Audit Dashboard
│   │   ├── dispute/[id]/page.tsx # Dispute Toolkit (Letter & Phone Script)
│   │   ├── history/page.tsx      # Local History Vault
│   │   └── api/
│   │       ├── audit/route.ts    # Agent 1, 2, 3 Execution API
│   │       ├── chat/route.ts     # Agent 4 Groq Streaming Copilot
│   │       └── share/route.ts    # Anonymous Upstash Share API
│   ├── components/               # React UI Components
│   ├── lib/
│   │   ├── gemini.ts             # Gemini Vision client & prompts
│   │   ├── groq.ts               # Groq streaming client
│   │   ├── rules-engine.ts       # Deterministic duplicate & unbundling logic
│   │   └── store.ts              # Zustand local-first vault store
│   └── types/                    # TypeScript interfaces
├── docs/                         # Comprehensive Engineering Specifications
└── devpost/                      # Devpost Learn Skill Pack Artifacts
```

## Important Failure Modes
1. **Non-Medical Image Uploaded:** Agent 1 detects invalid document structure $\rightarrow$ Returns graceful warning: *"This document does not appear to be an itemized hospital statement."* Zero crash.
2. **API Rate Limit Exceeded (HTTP 429):** Automated failover from primary Gemini to secondary Gemini Flash Lite, and from Groq 120b to Groq 20b.
3. **Missing CPT Code on Bill:** Gemini infers the standard 5-digit CPT code from clinical description and labels it as *"Inferred Code"*.

## What Was Simplified and Why
- **Local-First Storage instead of Central SQL Database:** Eliminates login friction for judges, prevents server connection timeouts on Vercel, and provides a 100% HIPAA-respecting Zero-Retention privacy posture.
- **Deterministic Rules + Prompting instead of Fine-Tuning:** Eliminates training delay, infrastructure costs, and deployment risk while delivering 99%+ accuracy against CMS benchmarks.
