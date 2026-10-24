# UnBill — Multi-Agent AI Pipeline Specification

**Document Version:** 1.0.0  
**Status:** Approved for Implementation  
**Last Updated:** October 2026  
**Author:** UnBill Engineering Core  

---

## 1. Orchestration Architecture

UnBill rejects brittle, non-deterministic "autonomous multi-agent loops" in favor of a **Deterministic Sequential Agent Pipeline** with specialized single-responsibility models:

```
[Uploaded Document / Base64 Image]
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 🤖 AGENT 1: Clinical Ingestion Agent (Gemini 3.8 Flash)      │
│    • Document classification (Hospital Statement vs Other)  │
│    • High-precision multimodal table extraction             │
│    • Extraction into standardized RawBillData JSON schema   │
└─────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ ⚖️ AGENT 2: Forensic CPT & Pricing Auditor (Hybrid Engine)   │
│    • Deterministic Rule Engine (Duplicates & CCI Unbundling)│
│    • Statistical Pricing Engine (CMS Medicare Allowable)    │
│    • Gemini Clinical Evaluator (Upcoding & Plain English)   │
└─────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 📜 AGENT 3: Legal & Dispute Advocate (Gemini 3.8 Flash)     │
│    • Statutory Rule Matcher (FCBA § 1666, No Surprises Act) │
│    • Certified Dispute Letter Assembly                      │
│    • Strategic Phone Negotiation Playbook Generation        │
└─────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 💬 AGENT 4: UnBill Copilot (Groq Ultra-Fast Llama-3.3)    │
│    • Real-time streaming conversational assistant           │
│    • Injected with Active Audit Report context              │
│    • Sub-350ms response latency for patient inquiries       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Agent 1: Clinical Ingestion Agent

### 2.1 Mission & Responsibilities
* **Engine:** Google Gemini 3.8 Flash (`gemini-3.8-flash`) via `@google/genai`.
* **Input:** Base64 encoded image (PNG, JPEG, WebP) or PDF page buffer.
* **Output:** Strict JSON conforming to `RawBillData`.
* **Objective:** Accurately parse header metadata (Provider Name, Statement Date, Account Number) and itemized clinical rows (CPT/HCPCS code, description, dates, quantities, charged amounts).

### 2.2 System Prompt Specification
```typescript
export const AGENT_1_INGESTION_PROMPT = `
You are the Clinical Ingestion Agent for UnBill, a forensic hospital billing system.
Your sole job is to extract structured clinical and financial data from the provided medical bill or Explanation of Benefits (EOB).

CRITICAL RULES:
1. Examine the image carefully. Determine if this is an itemized medical bill, hospital statement, or EOB.
   - If it is NOT a medical document (e.g. a grocery receipt, selfie, landscape), set "isMedicalBill": false and provide an explanation.
2. Extract the Facility/Hospital Name, Statement or Service Date, and Patient Account or Invoice Number.
3. Extract EVERY itemized line item into the "items" array:
   - "code": Standard 5-digit CPT code or alphanumeric HCPCS code. If the code is missing or obscured, infer the most likely CPT code from the description and append "(Inferred)".
   - "description": The exact raw description as printed on the bill.
   - "dateOfService": The specific date of the procedure or test (YYYY-MM-DD format if identifiable).
   - "quantity": Number of units billed (default to 1 if not stated).
   - "billedAmount": The gross total charged for this specific line item as a float (e.g. 450.00). Do not include currency symbols.
4. If there is a listed "Adjusted Amount" or "Insurance Paid" column, extract that into "insurancePaid" and "patientResponsibility".
5. Return ONLY a valid JSON object matching the requested schema. No markdown formatting, no conversational filler.
`;
```

### 2.3 Extraction Schema (Zod / JSON Schema)
```typescript
export interface RawBillData {
  isMedicalBill: boolean;
  rejectionReason?: string;
  facility: {
    name: string;
    address?: string;
    billingDepartmentPhone?: string;
  };
  patient: {
    accountNumber: string;
    statementDate: string;
  };
  financials: {
    totalBilledGross: number;
    insurancePaid?: number;
    patientBalanceDue: number;
  };
  items: Array<{
    id: string;
    code: string;
    rawDescription: string;
    dateOfService: string;
    quantity: number;
    billedAmount: number;
  }>;
}
```

---

## 3. Agent 2: Forensic CPT & Pricing Auditor

Agent 2 combines **deterministic TypeScript rules** (for zero-hallucination math and clinical unbundling) with **Gemini clinical reasoning** (for plain-English translation and E&M upcoding analysis).

### 3.1 Algorithm 1: Duplicate Charge Detection (Strict Rule)
```typescript
export function auditDuplicateCharges(items: RawBillData['items']): AnomalyReport[] {
  const anomalies: AnomalyReport[] = [];
  const itemMap = new Map<string, typeof items>();

  for (const item of items) {
    // Normalizing code: strip non-alphanumeric characters
    const cleanCode = item.code.replace(/[^a-zA-Z0-9]/g, '');
    const key = `${cleanCode}_${item.dateOfService}_${item.billedAmount}`;
    
    if (!itemMap.has(key)) {
      itemMap.set(key, [item]);
    } else {
      itemMap.get(key)!.push(item);
    }
  }

  for (const [key, group] of itemMap.entries()) {
    if (group.length > 1) {
      // Exclude row 0 (the legitimate first charge); flag rows 1..n as duplicates
      for (let i = 1; i < group.length; i++) {
        anomalies.push({
          itemId: group[i].id,
          code: group[i].code,
          anomalyType: 'DUPLICATE_CHARGE',
          severity: 'HIGH',
          disputedAmount: group[i].billedAmount,
          title: 'Duplicate Line-Item Detected',
          explanation: `CPT code ${group[i].code} was billed ${group.length} times on the same date (${group[i].dateOfService}) with identical amounts ($${group[i].billedAmount.toFixed(2)}).`,
          remedy: 'Demand complete removal of duplicate occurrences.'
        });
      }
    }
  }
  return anomalies;
}
```

### 3.2 Algorithm 2: Correct Coding Initiative (CCI) Unbundling Detection
```typescript
import cptBenchmarks from '@/data/cpt_benchmarks.json';

export function auditUnbundling(items: RawBillData['items']): AnomalyReport[] {
  const anomalies: AnomalyReport[] = [];
  const presentCodes = new Set(items.map(i => i.code.replace(/[^a-zA-Z0-9]/g, '')));

  for (const item of items) {
    const cleanCode = item.code.replace(/[^a-zA-Z0-9]/g, '');
    const benchmark = cptBenchmarks.find(b => b.code === cleanCode);

    if (benchmark && benchmark.bundles && benchmark.bundles.length > 0) {
      // Benchmark defines child codes that should be included inside this comprehensive code
      for (const bundledChildCode of benchmark.bundles) {
        if (presentCodes.has(bundledChildCode)) {
          const childItem = items.find(i => i.code.replace(/[^a-zA-Z0-9]/g, '') === bundledChildCode);
          if (childItem && childItem.dateOfService === item.dateOfService) {
            anomalies.push({
              itemId: childItem.id,
              code: childItem.code,
              anomalyType: 'UNBUNDLED_CHARGE',
              severity: 'HIGH',
              disputedAmount: childItem.billedAmount,
              title: 'Improper Unbundling (CCI Violation)',
              explanation: `CPT ${childItem.code} was billed separately for $${childItem.billedAmount.toFixed(2)}, but it is legally bundled under the comprehensive panel CPT ${item.code} (${benchmark.name}) performed on the same day.`,
              remedy: 'The separate fee for this sub-component should be reduced to $0.00.'
            });
          }
        }
      }
    }
  }
  return anomalies;
}
```

### 3.3 Algorithm 3: Medicare/CMS Benchmark Markup Analysis
* For every item matching `cpt_benchmarks.json`:
  $$\text{Markup Ratio} = \frac{\text{Billed Amount}}{\text{Medicare Median Allowable}}$$
* **Thresholds:**
  * $\text{Ratio} > 2.5$: Flagged as **🟡 Excessive Hospital Markup**.
  * $\text{Disputed Overcharge} = \text{Billed Amount} - (\text{Medicare Median} \times 1.5)$.

### 3.4 Gemini Clinical Translation & Upcoding Evaluation
* In parallel, Gemini 3.8 Flash is provided with the line items and instructed to:
  1. Generate a **1-sentence plain-English explanation** ("What this actually was" without clinical jargon).
  2. Evaluate Evaluation & Management (E&M) codes (CPT 99281–99285). If a minor outpatient encounter was billed as Level 5 (CPT 99285 - Emergency room, high severity / immediate life threat), flag as **🔴 Severe Upcoding**.

---

## 4. Agent 3: Legal & Dispute Advocate

### 4.1 Statutory Citation Rules
Agent 3 inspects the anomalies compiled by Agent 2 and matches them against federal consumer protection statutes:

| Anomaly Type | Applicable Statute | Statutory Demand |
|---|---|---|
| **Duplicate Charge** | Fair Credit Billing Act (15 U.S.C. § 1666) | Formal notice of mathematical billing error; mandatory pause on credit reporting during investigation. |
| **Unbundled Test** | CMS National Correct Coding Initiative (NCCI) | Demand write-off of component charges subsumed under comprehensive parent code. |
| **Excessive Markup** | Affordable Care Act IRC § 501(r) / Fair Market Standard | Demand recalculation based on hospital's Amount Generally Billed (AGB) percentage. |
| **Emergency Out-of-Network** | Federal No Surprises Act (Public Law 116-260) | Balance billing prohibited; patient cost-sharing capped at in-network median rate. |

### 4.2 System Prompt for Formal Dispute Letter Compilation
```typescript
export const AGENT_3_DISPUTE_PROMPT = `
You are the Legal & Dispute Advocate Agent for UnBill.
Your job is to generate a formal, legally grounded dispute letter that an American patient can send directly to a hospital billing department.

REQUIRED STRUCTURE:
1. SENDER HEADER: Patient name (placeholder if omitted), Account Number, Date.
2. RECIPIENT HEADER: Hospital Billing and Patient Financial Services Department.
3. FORMAL NOTICE OF DISPUTE: Open with explicit invocation of rights under the Fair Credit Billing Act (15 U.S.C. § 1666) and the federal No Surprises Act.
4. ITEMIZED GRIEVANCES TABLE: Detail each flagged line item:
   - CPT Code and Description
   - Billed Amount vs Fair Market Benchmark
   - Concrete reason for dispute (e.g. Duplicate charge on 10/12, Unbundled component of CPT 80053, Excessive markup exceeding 300% of CMS standard).
5. MANDATORY LEGAL DEMANDS:
   - Immediate suspension of collection activities or credit bureau reporting during the 30-day statutory investigation window.
   - Issuance of an itemized statement containing standard Revenue Codes and National Drug Codes (NDCs).
   - Provision of the hospital's Financial Assistance Policy (FAP) application under IRC Section 501(r).
6. CLOSING & SIGNATURE: Professional, firm, and legally unambiguous.
`;
```

---

## 5. Agent 4: UnBill Copilot (Groq Sub-Second Chat)

### 5.1 System Persona & Injected Context
Agent 4 is exposed via the slide-over chat drawer. When triggered, its system prompt is dynamically assembled with the **active bill audit report**:

```typescript
export function buildCopilotPrompt(auditReport: AuditReport): string {
  return `
You are UnBill Copilot, an expert healthcare billing advocate and patient negotiation advisor.
You are assisting a patient who is reviewing their hospital bill from ${auditReport.facility.name}.

ACTIVE BILL CONTEXT:
- Total Billed: $${auditReport.financials.totalBilledGross.toFixed(2)}
- Discrepancies Identified: ${auditReport.anomalies.length} items
- Estimated Potential Overcharge: $${auditReport.financials.totalPotentialSavings.toFixed(2)}
- Flagged Line Items:
${auditReport.anomalies.map(a => `  * CPT ${a.code}: ${a.title} ($${a.disputedAmount.toFixed(2)}) - ${a.explanation}`).join('\n')}

GUIDELINES:
1. Provide concise, empowering, step-by-step advice. Keep answers under 3 short paragraphs.
2. If the user asks what to say on the phone, give them exact quote scripts: "Tell the representative: '...'".
3. Reference specific healthcare rights (Itemized bill rights, No Surprises Act, Financial Hardship 501(r)).
4. Always remind them never to put hospital bills on personal credit cards while charges remain in dispute.
`;
}
```

### 5.2 Streaming Edge Route (`/api/chat/route.ts`)
* Uses `groq-sdk` with `llama-3.3-70b-versatile`.
* Implements direct HTTP streaming via `new Response(stream)` with Server-Sent Events.
* Latency to first token: $<300$ms.
