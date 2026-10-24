# UnBill — UI/UX Design & Component Specification

**Document Version:** 1.0.0  
**Status:** Approved for Implementation  
**Last Updated:** October 2026  
**Design Philosophy:** Editorial Clinical-Fintech ("Anti-AI Slop", Calm, Trustworthy, Restrained)  
**Author:** UnBill Engineering Core  

---

## 1. Design Philosophy & Anti-AI Slop Principles

Most AI hackathon projects look identical: dark purple neon gradients, floating glassmorphism blobs, robotic chat bubbles, and aggressive glowing buttons.

**UnBill deliberately rejects the generic AI aesthetic.** 
Because this application deals with medical vulnerability and predatory financial debt, the design must feel **calm, authoritative, tactile, and deeply reassuring**—like a hybrid of the *New York Times Graphics Department* and *Stripe/Mercury Banking*.

### The 5 Visual Rules:
1. **Warm, Restrained Canvas:** No pitch-black dark mode or blinding pure-white (#FFFFFF). We use a calming warm bone/slate background (`#F8FAFC` to `#F1F5F9`) with crisp white card containers (`#FFFFFF`) framed by micro-borders (`border border-slate-200/80`).
2. **Editorial Typography Pairings:**
   * **Headings:** Modern, high-trust serif/sans (e.g. `Instrument Serif` / `Newsreader` accents paired with `Geist Sans` or `Inter`).
   * **Data & Medical Codes:** High-legibility tabular monospace (`Geist Mono` or `JetBrains Mono`) for CPT codes, monetary values, and dates.
3. **Intentional, Non-Alarmist Color Accents:**
   * Primary: Deep Medical Navy (`#0F172A`).
   * Forensic Accent: Deep Pine Forest (`#064E3B` / `#059669`).
   * Critical Error (Duplicates / Unbundling): Muted Crimson (`#DC2626`).
   * Warning (Price Markup): Warm Ochre Amber (`#D97706`).
   * Verified / Standard: Calming Sage Emerald (`#10B981`).
4. **Data Density over Fluff:** Show the real line items, benchmark graphs, and statutory citations clearly. Never hide critical information behind 10 unnecessary dropdowns.
5. **Tactile Micro-Interactions:** Subtle button presses (`active:scale-[0.98]`), smooth progress bars, and crisp badge pills.

---

## 2. Design Tokens & Color Palette

```css
:root {
  /* Canvas & Surfaces */
  --background: #F8FAFC;          /* slate-50: Calming, warm clinical backdrop */
  --surface: #FFFFFF;             /* Crisp white card surfaces */
  --surface-muted: #F1F5F9;       /* slate-100: Table headers & subtle strips */
  --surface-elevated: #FFFFFF;
  
  /* Borders & Dividers */
  --border-subtle: #E2E8F0;       /* slate-200: Tactile 1px dividers */
  --border-active: #94A3B8;       /* slate-400: Focus rings */

  /* Typography */
  --text-primary: #0F172A;        /* slate-900: High-contrast readability */
  --text-secondary: #475569;      /* slate-600: Explanatory copy */
  --text-muted: #64748B;          /* slate-500: Table captions & metadata */

  /* Brand Accents */
  --brand-navy: #0F172A;          /* Deep Anchor Navy */
  --brand-emerald: #059669;       /* Positive Financial Savings Accent */
  
  /* Anomaly Risk Colors */
  --risk-danger-bg: #FEF2F2;      /* red-50 */
  --risk-danger-border: #FCA5A5;  /* red-300 */
  --risk-danger-text: #B91C1C;    /* red-700 */

  --risk-warning-bg: #FFFBEB;     /* amber-50 */
  --risk-warning-border: #FCD34D; /* amber-300 */
  --risk-warning-text: #B45309;   /* amber-700 */

  --risk-safe-bg: #ECFDF5;        /* emerald-50 */
  --risk-safe-border: #6EE7B7;    /* emerald-300 */
  --risk-safe-text: #047857;      /* emerald-700 */
}
```

---

## 3. Site Architecture & Route Map

```
/
├── /                     # Landing Page (Value Proposition, Real Stats, 1-Click Samples)
├── /scan                 # Intake Hub (Upload Zone, Camera Snap, Paste Fallback)
├── /pipeline             # Multi-Agent Live Execution Stepper (Real-time progress radar)
├── /results/[id]         # Forensic Audit Dashboard (KPIs, Itemized Table, Plain English)
├── /dispute/[id]         # Dispute Toolkit (Printable FCBA Letter, Phone Script, PDF)
├── /history              # Local History Vault (Past Scans, Total Lifetime Dollars Saved)
├── /about                # Mission, Methodology & Verification Sources
└── /privacy              # Zero-Retention Guarantee & HIPAA Privacy Statement
```

---

## 4. Page-by-Page Wireframe Specifications

### 4.1 Landing Page (`/`)
* **Top Navigation Bar:**
  * Left: `UnBill` logo with a subtle shield icon.
  * Center: *How It Works*, *Methodology*, *Sample Audits*.
  * Right: *Lifetime Savings Counter* badge ("\$482,900 Audited") + *"Audit a Bill"* CTA button.
* **Hero Section:**
  * Eyebrow pill: `Independent Patient Financial Defense`
  * Main Headline: *"80% of US hospital bills contain errors. Don't pay until you audit."*
  * Subtitle: *"Upload your medical bill. Our multi-agent forensic engine decodes clinical jargon, flags duplicate and unbundled charges against Medicare benchmarks, and drafts enforceable legal dispute letters."*
  * Primary Action: High-contrast dark button: *"Audit Your Bill Now — 100% Free & Private"*
* **1-Click Test Station (Crucial for Judges!):**
  * Section Title: *"Experience an instant forensic audit without uploading personal data:"*
  * **Card 1: Emergency Room Encounter:** *"Patient charged $4,820 for broken wrist with duplicate blood panel and Level 5 upcoding."* $\rightarrow$ Button: *Load Sample Bill A*
  * **Card 2: Outpatient Surgical Procedure:** *"Patient charged $8,400 with unbundled anesthesia and 400% facility markup."* $\rightarrow$ Button: *Load Sample Bill B*
* **Statutory Grounding Strip:**
  * Logos/Badges: *Enforcing Rights Under: Fair Credit Billing Act (15 U.S.C. § 1666) • Federal No Surprises Act • CMS National Correct Coding Initiative*.

---

### 4.2 Scanner & Intake Hub (`/scan`)
* **Container:** Centralized clean card (`max-w-2xl mx-auto`).
* **Intake Tabs:**
  1. **Upload Photo / PDF (Default):** Drag-and-drop box with subtle dashed border. Icons for PDF, PNG, JPG. "Drag statement here or browse files (Max 15MB)".
  2. **Take Photo:** Mobile camera integration using `<input type="file" accept="image/*" capture="environment">`.
  3. **Paste Text:** Textarea for patients copying and pasting raw bill summaries from patient portals (Epic MyChart, Cerner).
* **Privacy Assurance Badge:**
  * Lock icon: *"Zero-Storage Pipeline: Document processed in temporary server memory and purged immediately. Your health records never touch a cloud database."*

---

### 4.3 Multi-Agent Processing Screen (`/pipeline`)
* **Container:** Minimal focused screen (`max-w-xl mx-auto py-16 text-center`).
* **Visual Radar:**
  * An animated progressive stepper showing 3 active agents:
    * `Agent 1: Clinical Ingestion (Gemini 3.8 Flash)` — *[Scanning OCR & extracting 12 line items...]*
    * `Agent 2: Forensic CPT Auditor (Hybrid Rules)` — *[Auditing CPT 80053 against CMS CCI edits... Flagged duplicate!]*
    * `Agent 3: Legal & Dispute Advocate` — *[Assembling Fair Credit Billing Act dispute packet...]*
  * Progress Bar with subtle pulsing pine emerald glow. Total transition time: ~3.5 seconds.

---

### 4.4 Forensic Audit Dashboard (`/results/[id]`)
* **Header Summary Bar:**
  * Hospital Name & Date: `St. Jude Regional Medical Center • Statement Date: Oct 12, 2026`
  * Action Buttons: *"Download PDF"*, *"Generate Dispute Kit"*, *"Ask Copilot"*.
* **KPI Metrics Grid (3 Cards):**
  * **Card 1 (Gross Billed):** `$4,820.00`
  * **Card 2 (Discrepancies Found):** `3 Line Items Flagged` (Red pill: `High Severity`)
  * **Card 3 (Potential Savings):** `$1,650.00` (In bold pine emerald)
* **Overcharge Risk Meter:**
  * Visual horizontal gauge (0 to 100): Positioned at 78/100 (`High Discrepancy Level`).
* **Itemized Forensic Table:**
  * Columns:
    1. **Code & Description:** `CPT 80053` • `Comp Metabolic Panel`
    2. **Plain-English Translation:** *"Standard 14-test blood panel checking liver & kidneys."*
    3. **Billed Price:** `$280.00`
    4. **Fair Market Benchmark:** `$52.00 (Medicare Median: $40 - $75)`
    5. **Status Badge:** `🔴 DUPLICATE CHARGE`
    6. **Include in Dispute:** Checkbox (Default: Checked).
  * Expandable Drawer on row click:
    * Shows the forensic rationale: *"This exact test was billed twice at 09:14 and 09:15 on the same encounter date."*
    * Shows suggested dispute remedy: *"Demand deletion of line item #4."*

---

### 4.5 Dispute Kit & Resolution (`/dispute/[id]`)
* **Tab 1: Certified Dispute Letter:**
  * Styled as an authentic formal letter on clean white cardstock with serif typography.
  * Pre-populated with:
    * Patient Account Number.
    * Hospital Billing Office Address.
    * Formal invocation of 15 U.S.C. § 1666.
    * Formatted table of the user-selected disputed line items.
    * Mandatory demand for 30-day investigation and suspension of collections.
  * Actions: *"Copy Letter to Clipboard"*, *"Print / Save as PDF"*.
* **Tab 2: Phone Negotiation Playbook:**
  * Step-by-step call script:
    * Step 1: *"Ask for the Patient Financial Services supervisor."*
    * Step 2: *"State: 'I am reviewing statement #X and have identified duplicate CPT code 80053.' "*
    * Step 3: *"If denied: 'Please mail me an itemized statement with CMS Revenue Codes and your Section 501(r) financial assistance form.' "*

---

### 4.6 UnBill Copilot (Slide-Over Chat Drawer)
* **Trigger:** Floating button in bottom right: `Ask UnBill Copilot` with a subtle chat bubble icon.
* **Component:** Right-hand sliding sheet drawer (`w-[420px]`).
* **Capabilities:**
  * Instant sub-350ms streaming answers via Groq.
  * Injected with the active bill's flagged codes.
  * Quick Prompts:
    * *"What does CPT 99284 mean?"*
    * *"Can they send me to collections while this is disputed?"*
    * *"How do I apply for hospital charity care?"*

---

## 5. Component Hierarchy & State Store Architecture

```
src/
├── app/
│   ├── layout.tsx                # Root Layout (Nav, Footer, Copilot Drawer Provider)
│   ├── page.tsx                  # Landing Page
│   ├── scan/page.tsx             # Intake Scanner Hub
│   ├── pipeline/page.tsx         # Multi-Agent Processing Radar
│   ├── results/[id]/page.tsx     # Forensic Dashboard
│   ├── dispute/[id]/page.tsx     # Dispute Letter & Call Playbook
│   ├── history/page.tsx          # Local Scan Vault
│   └── (legal)/about/page.tsx    # Methodology & Disclaimers
├── components/
│   ├── ui/                       # shadcn/ui primitives (Button, Card, Dialog, Badge, Tabs)
│   ├── navbar.tsx                # Global Nav with Lifetime Savings Counter
│   ├── upload-zone.tsx           # Multi-modal dropzone & camera intake
│   ├── sample-bill-cards.tsx     # 1-Click test bill triggers
│   ├── agent-radar.tsx           # Animated multi-agent progress radar
│   ├── audit-table.tsx           # Interactive line-item table with drawer
│   ├── dispute-letter.tsx        # Printable formal letter template
│   ├── phone-script.tsx          # Step-by-step calling checklist
│   └── copilot-drawer.tsx        # Floating slide-over chat with Groq
├── store/
│   └── useAuditStore.ts          # Zustand store with localStorage persistence
└── lib/
    ├── gemini.ts                 # Gemini 3.8 Flash SDK client & prompts
    ├── groq.ts                   # Groq SDK client & streaming helper
    ├── rules-engine.ts           # Deterministic duplicate & unbundling algorithms
    └── rate-limiter.ts           # In-memory sliding window edge limiter
```
