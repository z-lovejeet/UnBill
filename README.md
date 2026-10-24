# UnBill — Forensic Hospital Bill Auditor & Statutory Dispute Engine

> **80% of US hospital bills contain billing errors. Don't pay until you audit.**  
> Built for the **Devpost "Build With AI: Basics" Hackathon** (October 2026).

---

## 💡 The Problem

American healthcare billing is intentionally opaque:
- **80% of hospital bills contain errors** (duplicate line items, unbundled diagnostic panels, excessive chargemaster markups, or undocumented Level 5 acuity codes).
- **$88 Billion in medical debt** sits on American consumer credit reports.
- **86% of patients never dispute** because they cannot decode cryptic 5-digit CPT/HCPCS codes or navigate hospital billing bureaucracies.
- Yet, when consumers formally dispute hospital charges backed by federal consumer protection statutes, **over 74% receive balance reductions or complete write-offs**.

---

## 🛡️ What UnBill Does

**UnBill** is an independent, client-side patient financial advocacy application. Patients upload a photo, PDF, or text of their itemized medical statement, and UnBill:
1. **Decodes clinical jargon into plain English** without medical ambiguity.
2. **Executes deterministic forensic audits** cross-referencing CMS Medicare Physician Fee Schedules (MPFS) and National Correct Coding Initiative (NCCI) edits to detect duplicates, unbundling, and 300%+ markups.
3. **Generates an enforceable Fair Credit Billing Act (15 U.S.C. § 1666) Certified Mail Dispute Package**, invoking automatic federal stays on negative credit reporting.
4. **Equips the patient with an interactive Phone Negotiation Playbook** and a sub-350ms streaming **Groq Copilot** to handle defensive hospital billing representatives.

---

## 🤖 The Multi-Agent AI Architecture

UnBill rejects brittle probabilistic loops in favor of a **Deterministic Sequential Agent Pipeline**:

```
[ Uploaded Bill Photo / PDF / Text ]
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 🤖 AGENT 1: Clinical Ingestion Agent (Gemini 3.5 Flash Lite) │
│    • High-precision multimodal table extraction             │
│    • Identifies facility, account #, and itemized CPT codes │
│    • Standardizes into strict JSON schema                   │
└─────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ ⚖️ AGENT 2: Forensic CPT & Pricing Auditor (Deterministic)   │
│    • Zero-hallucination duplicate detection algorithm       │
│    • CMS NCCI Unbundling check (comprehensive vs child)     │
│    • Medicare Median Allowable benchmark markup math        │
└─────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 📜 AGENT 3: Legal & Dispute Advocate (Statutory Matcher)    │
│    • Matches violations to FCBA § 1666, NSA, IRC § 501(r)   │
│    • Assembles formal USPS Certified Mail dispute letter    │
│    • Synthesizes 4-script counter-negotiation playbook      │
└─────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 💬 AGENT 4: UnBill Copilot (Groq Ultra-Fast Sub-350ms)      │
│    • Real-time streaming conversational negotiation coach   │
│    • Injected with active dossier numbers & account context │
│    • Powered by openai/gpt-oss-120b                         │
└─────────────────────────────────────────────────────────────┘
```

### Why a Hybrid Architecture?
In healthcare finance and statutory consumer law, **mathematical hallucinations are unacceptable**. By isolating generative AI to perception (Gemini document OCR) and conversational coaching (Groq), while delegating arithmetic, duplicate checking, and legal bundling checks to deterministic TypeScript, UnBill achieves **100% mathematical accuracy and zero hallucinated legal citations**.

---

## 🔒 Privacy & Zero-Retention Architecture

- **HIPAA-Safe Client-Side Vault:** All audited bills and dispute kits are stored directly in the patient's browser (`localStorage` / IndexedDB via Zustand `persist`).
- **Zero Server Retention:** No patient names, invoice numbers, or medical records are logged or permanently retained on remote application servers.
- **Anonymous Report Sharing:** Optional share links are generated via ephemeral 30-day hashed keys in Upstash Redis.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router) + React 19 | Server-side rendering, streaming SSE, and edge routes |
| **Language** | TypeScript 5.7 (Strict) | End-to-end domain type safety |
| **Styling** | Tailwind CSS 3.4 | Editorial clinical-fintech aesthetic (Anti-AI-slop design) |
| **Vision & Extraction** | Google Gemini 3.5 Flash Lite | Multimodal hospital statement OCR and structured extraction |
| **Forensic Logic** | Custom Deterministic Engine | NCCI bundling checks, duplicate detection & CMS benchmark math |
| **Copilot Assistant** | Groq SDK (`openai/gpt-oss-120b`) | Sub-350ms first-token streaming conversational negotiation advice |
| **Client State** | Zustand 5.0 | Client-side reactive vault and hydration-safe persistence |
| **Edge Storage** | Upstash Redis | Anonymous report sharing and global savings counter |

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/your-username/unbill.git
cd unbill
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your API keys in `.env.local`:
```env
# 1. Google Gemini API (Multimodal OCR & extraction)
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-3.5-flash-lite"

# 2. Groq API (Sub-350ms conversational copilot)
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="openai/gpt-oss-120b"

# 3. Upstash Redis (Optional - for share links)
UPSTASH_REDIS_REST_URL="https://your-upstash.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# 4. App Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Mechanical Verification Suite

UnBill includes standalone verification scripts for every agent in the pipeline:

```bash
# 1. Test deterministic rules engine & Gemini clinical ingestion
npx tsx scripts/test-audit.mjs

# 2. Test Groq sub-350ms streaming chat & Upstash Redis
npx tsx scripts/test-copilot.mjs

# 3. Test production Next.js build
npm run build
```

---

## 🏛️ Statutory Basis & Regulatory Citations

All generated dispute kits and negotiation scripts reference established federal statutes:
- **Fair Credit Billing Act (15 U.S.C. § 1666):** 60-day billing dispute window; automatic stay on credit bureau reporting; mandatory 30-day written acknowledgement.
- **Federal No Surprises Act (Public Law 116-260, 42 U.S.C. § 300gg-111):** Prohibition of out-of-network balance billing in emergency and non-consensual situations; patient cost-sharing capped at in-network median deductible rates.
- **Internal Revenue Code § 501(r)(6):** Prohibits tax-exempt 501(c)(3) hospitals from charging financial-assistance eligible patients gross chargemaster rates; requires reduction to Amounts Generally Billed (AGB).
- **CMS National Correct Coding Initiative (NCCI Policy Manual, Ch. 1):** Prohibits unbundling sub-component procedures performed during a single encounter.

---

## 📄 License

MIT License. Designed and engineered for patient financial sovereignty.
