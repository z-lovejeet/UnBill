# UnBill — Data Models & Schemas Specification

**Document Version:** 1.0.0  
**Status:** Approved for Implementation  
**Last Updated:** October 2026  
**Author:** UnBill Engineering Core  

---

## 1. Core TypeScript Domain Interfaces

These interfaces govern the data contract between Agent 1, Agent 2, Agent 3, and the React frontend state store.

```typescript
// types/audit.ts

export type AnomalySeverity = 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';

export type AnomalyType = 
  | 'DUPLICATE_CHARGE' 
  | 'UNBUNDLED_CHARGE' 
  | 'EXCESSIVE_MARKUP' 
  | 'UPCODING_SEVERITY' 
  | 'QUANTITY_OVERBILL' 
  | 'OUT_OF_NETWORK_SURPRISE';

export interface RawLineItem {
  id: string;
  code: string;
  rawDescription: string;
  dateOfService: string;
  quantity: number;
  billedAmount: number;
}

export interface AuditedLineItem extends RawLineItem {
  plainEnglishDescription: string;
  clinicalCategory: string;
  benchmarkMedian: number;
  fairMarketRange: [number, number];
  status: AnomalySeverity;
  isDisputed: boolean; // Toggleable by user in UI
  anomalies: AnomalyReport[];
}

export interface AnomalyReport {
  itemId: string;
  code: string;
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  disputedAmount: number;
  title: string;
  explanation: string;
  remedy: string;
  statutoryBasis?: string;
}

export interface FacilityMetadata {
  name: string;
  address?: string;
  billingPhone?: string;
}

export interface PatientMetadata {
  accountNumber: string;
  statementDate: string;
  patientName?: string;
}

export interface FinancialSummary {
  totalBilledGross: number;
  insuranceAdjustments: number;
  patientResponsibility: number;
  totalPotentialSavings: number;
  riskScore: number; // 0 (Clean) to 100 (Severe Overcharge)
}

export interface DisputePackage {
  formalLetterText: string;
  statutoryCitations: string[];
  phoneNegotiationPoints: string[];
  generatedAt: string;
}

export interface AuditReport {
  id: string; // UUID v4
  createdAt: string; // ISO 8601
  facility: FacilityMetadata;
  patient: PatientMetadata;
  financials: FinancialSummary;
  items: AuditedLineItem[];
  anomalies: AnomalyReport[];
  disputePackage: DisputePackage;
}
```

---

## 2. Reference Dataset 1: CPT & HCPCS Benchmarks (`data/cpt_benchmarks.json`)

This dataset provides the baseline Medicare allowable median fees and Correct Coding Initiative (CCI) unbundling relationships.

### 2.1 JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CPTBenchmark",
  "type": "object",
  "required": ["code", "name", "category", "medicareMedian", "fairMarketRange", "markupThreshold"],
  "properties": {
    "code": { "type": "string" },
    "name": { "type": "string" },
    "category": { "type": "string" },
    "medicareMedian": { "type": "number" },
    "fairMarketRange": {
      "type": "array",
      "items": { "type": "number" },
      "minItems": 2,
      "maxItems": 2
    },
    "markupThreshold": { "type": "number" },
    "bundles": {
      "type": "array",
      "items": { "type": "string" }
    },
    "severityLevel": { "type": "number" },
    "description": { "type": "string" }
  }
}
```

### 2.2 Core Benchmark Entries (Sample)
```json
[
  {
    "code": "80053",
    "name": "Comprehensive Metabolic Panel (CMP)",
    "category": "Laboratory",
    "medicareMedian": 52.00,
    "fairMarketRange": [40.00, 75.00],
    "markupThreshold": 180.00,
    "bundles": ["80048", "82040", "82247", "84075", "84155"],
    "description": "Comprehensive screening of 14 blood tests evaluating kidneys, liver, electrolytes, and glucose."
  },
  {
    "code": "80048",
    "name": "Basic Metabolic Panel (BMP)",
    "category": "Laboratory",
    "medicareMedian": 38.00,
    "fairMarketRange": [30.00, 55.00],
    "markupThreshold": 130.00,
    "bundles": ["82374", "82435", "82565", "82947", "84132", "84295", "84520"],
    "description": "Standard 8-test blood panel checking blood sugar, kidney function, and fluid balance."
  },
  {
    "code": "85025",
    "name": "Complete Blood Count (CBC) with Automated Differential",
    "category": "Laboratory",
    "medicareMedian": 28.00,
    "fairMarketRange": [20.00, 45.00],
    "markupThreshold": 110.00,
    "bundles": ["85027", "85004"],
    "description": "Measures red cells, white cells, platelets, and infection indicators."
  },
  {
    "code": "36415",
    "name": "Routine Venipuncture (Blood Draw)",
    "category": "Phlebotomy",
    "medicareMedian": 12.00,
    "fairMarketRange": [8.00, 25.00],
    "markupThreshold": 60.00,
    "maxAllowedPerEncounter": 1,
    "description": "Needle stick procedure to collect blood tubes. Billed only once per collection encounter."
  },
  {
    "code": "99281",
    "name": "Emergency Department Visit - Level 1",
    "category": "Evaluation and Management",
    "medicareMedian": 75.00,
    "fairMarketRange": [60.00, 140.00],
    "markupThreshold": 350.00,
    "severityLevel": 1,
    "description": "Minor emergency room visit for straightforward, low-risk conditions (e.g. suture removal)."
  },
  {
    "code": "99283",
    "name": "Emergency Department Visit - Level 3",
    "category": "Evaluation and Management",
    "medicareMedian": 260.00,
    "fairMarketRange": [200.00, 450.00],
    "markupThreshold": 950.00,
    "severityLevel": 3,
    "description": "Moderate severity ER encounter requiring moderate medical decision-making."
  },
  {
    "code": "99284",
    "name": "Emergency Department Visit - Level 4",
    "category": "Evaluation and Management",
    "medicareMedian": 480.00,
    "fairMarketRange": [380.00, 750.00],
    "markupThreshold": 1600.00,
    "severityLevel": 4,
    "description": "High severity ER evaluation for acute conditions without an immediate life threat."
  },
  {
    "code": "99285",
    "name": "Emergency Department Visit - Level 5",
    "category": "Evaluation and Management",
    "medicareMedian": 720.00,
    "fairMarketRange": [550.00, 1100.00],
    "markupThreshold": 2400.00,
    "severityLevel": 5,
    "description": "Maximum severity ER evaluation for immediately life-threatening or unstable conditions."
  },
  {
    "code": "71046",
    "name": "Chest X-Ray - 2 Views (Front & Lateral)",
    "category": "Radiology",
    "medicareMedian": 68.00,
    "fairMarketRange": [50.00, 120.00],
    "markupThreshold": 380.00,
    "description": "Two radiographic images of the lungs, heart, and chest cavity."
  },
  {
    "code": "70450",
    "name": "CT Scan - Head/Brain without Contrast",
    "category": "Radiology",
    "medicareMedian": 290.00,
    "fairMarketRange": [220.00, 520.00],
    "markupThreshold": 1800.00,
    "description": "Computerized axial tomography of the brain used to detect stroke, hemorrhage, or trauma."
  },
  {
    "code": "93000",
    "name": "Electrocardiogram (ECG/EKG) with Routine Interpretation",
    "category": "Cardiology",
    "medicareMedian": 42.00,
    "fairMarketRange": [30.00, 85.00],
    "markupThreshold": 260.00,
    "description": "Standard 12-lead electrical tracing of the heart rhythm."
  },
  {
    "code": "96372",
    "name": "Therapeutic/Prophylactic Intramuscular/Subcutaneous Injection",
    "category": "Nursing & Medicine",
    "medicareMedian": 32.00,
    "fairMarketRange": [25.00, 60.00],
    "markupThreshold": 190.00,
    "description": "Administration of a medication injection into muscle or subcutaneous tissue."
  }
]
```

---

## 3. Reference Dataset 2: Legal Statutes (`data/legal_statutes.json`)

```json
[
  {
    "id": "FCBA",
    "title": "Fair Credit Billing Act (15 U.S.C. § 1666)",
    "statutoryCode": "15 U.S.C. § 1666",
    "category": "Billing Discrepancy & Computational Error",
    "appliesTo": ["DUPLICATE_CHARGE", "UNBUNDLED_CHARGE", "QUANTITY_OVERBILL"],
    "formalNoticeClause": "Pursuant to the Fair Credit Billing Act (15 U.S.C. § 1666) and Regulation Z (12 C.F.R. § 1026.13), this document serves as timely written notice of significant billing discrepancies on Account #{ACCOUNT_NUMBER}.",
    "mandatoryDemand": "You are formally required to acknowledge this notice within 30 days and resolve the disputed errors within two billing cycles. Under federal law, you may not report this disputed balance to any consumer credit reporting agency or initiate collection activities while the investigation remains pending."
  },
  {
    "id": "NSA",
    "title": "Federal No Surprises Act (Public Law 116-260)",
    "statutoryCode": "42 U.S.C. § 300gg-111",
    "category": "Surprise Balance Billing & Out-of-Network Emergency",
    "appliesTo": ["OUT_OF_NETWORK_SURPRISE", "UPCODING_SEVERITY"],
    "formalNoticeClause": "Under the federal No Surprises Act (P.L. 116-260, 42 U.S.C. § 300gg-111), balance billing for emergency medical conditions and non-emergency ancillary services at in-network facilities is strictly prohibited by federal statute.",
    "mandatoryDemand": "All out-of-network facility and practitioner charges must be recalculated to the Qualifying Payment Amount (QPA), and patient responsibility cannot exceed in-network median cost-sharing limits."
  },
  {
    "id": "ACA_501R",
    "title": "IRS Section 501(r) - Nonprofit Hospital Financial Assistance",
    "statutoryCode": "26 U.S.C. § 501(r)",
    "category": "Excessive Markups & Financial Assistance",
    "appliesTo": ["EXCESSIVE_MARKUP"],
    "formalNoticeClause": "Under Internal Revenue Code Section 501(r)(4) and (r)(6), tax-exempt 501(c)(3) hospitals are legally required to provide a Plain Language Summary of their Financial Assistance Policy (FAP) and cannot charge FAP-eligible individuals more than the Amounts Generally Billed (AGB) for emergency or other medically necessary care.",
    "mandatoryDemand": "I hereby request an immediate copy of your Financial Assistance Policy, an itemized statement listing all standard CMS Revenue Codes and National Drug Codes (NDCs), and an adjustment of charges to the hospital's AGB percentage."
  }
]
```

---

## 4. Client Storage Schema (`localStorage` / IndexedDB)

To ensure privacy, all patient audits are stored under the key `unbill_vault_v1`.

```typescript
export interface LocalVaultStorage {
  version: number; // 1
  activeAuditId: string | null;
  audits: Record<string, AuditReport>; // Keyed by UUID
  userPreferences: {
    theme: 'light' | 'dark' | 'system';
    autoSaveHistory: boolean;
    defaultStateCode?: string;
  };
  metrics: {
    totalScansPerformed: number;
    cumulativeSavingsDiscovered: number;
  };
}
```

---

## 5. Upstash Redis Schema (Cloud Ephemeral Sharing & Telemetry)

When an audit is optionally shared or anonymized:

```typescript
// Key: share:{uuid}
export interface UpstashShareRecord {
  id: string; // e.g. "share_8f4b12c9"
  createdAt: string; // ISO 8601
  expiresAt: string; // ISO 8601 (+7 days)
  reportData: Omit<AuditReport, 'patient'>; // Patient PII stripped out!
}

// Global Counter Keys:
// stats:global_dollars_audited (Integer, incremented via INCRBY)
// stats:total_bills_scanned (Integer, incremented via INCR)
```
