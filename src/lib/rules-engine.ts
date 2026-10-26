import cptBenchmarksData from '../../data/cpt_benchmarks.json';
import legalStatutesData from '../../data/legal_statutes.json';
import {
  RawLineItem,
  AuditedLineItem,
  AnomalyReport,
  AnomalySeverity,
  FacilityMetadata,
  PatientMetadata,
  FinancialSummary,
  DisputePackage,
  AuditReport,
} from '@/types/audit';

export interface CptBenchmark {
  code: string;
  name: string;
  category: string;
  medicareMedian: number;
  fairMarketRange: [number, number];
  markupThreshold: number;
  bundles?: string[];
  maxAllowedPerEncounter?: number;
  description: string;
}

export interface LegalStatute {
  id: string;
  title: string;
  statutoryCode: string;
  category: string;
  appliesTo: string[];
  formalNoticeClause: string;
  mandatoryDemand: string;
}

export const CPT_BENCHMARKS = cptBenchmarksData as CptBenchmark[];
export const LEGAL_STATUTES = legalStatutesData as LegalStatute[];

/**
 * Normalizes CPT/HCPCS code to alphanumeric string without spaces or symbols.
 * Strips annotations like "(Inferred)".
 */
export function normalizeCptCode(code: string): string {
  if (!code) return '';
  const cleaned = code.replace(/\s*\([^)]*\)/g, '').trim();
  const match = cleaned.match(/^[a-zA-Z0-9]+/);
  return match ? match[0].toUpperCase() : cleaned.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/**
 * Normalizes dates across ISO (YYYY-MM-DD) and US (MM/DD/YYYY) formats.
 */
export function normalizeDate(dateStr?: string): string {
  if (!dateStr) return 'nodate';
  const trimmed = dateStr.trim();
  const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, m, d, y] = usMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().split('T')[0];
  }
  return trimmed.toLowerCase();
}

/**
 * Finds benchmark for a given code or description.
 */
export function findBenchmark(code: string, description?: string): CptBenchmark | undefined {
  const cleanCode = normalizeCptCode(code);
  let match = CPT_BENCHMARKS.find((b) => normalizeCptCode(b.code) === cleanCode);
  if (match) return match;

  if (description) {
    const lowerDesc = description.toLowerCase();
    match = CPT_BENCHMARKS.find((b) =>
      b.name.toLowerCase().includes(lowerDesc) || lowerDesc.includes(b.name.toLowerCase())
    );
  }
  return match;
}

/**
 * 1. Deterministic Duplicate Charge Detection
 */
export function auditDuplicateCharges(items: RawLineItem[]): AnomalyReport[] {
  const anomalies: AnomalyReport[] = [];
  const itemMap = new Map<string, RawLineItem[]>();

  for (const item of items) {
    const cleanCode = normalizeCptCode(item.code);
    const cleanDate = normalizeDate(item.dateOfService);
    // Group by Code + Date + Amount (or just Code + Date if exact same amount)
    const key = `${cleanCode}_${cleanDate}_${item.billedAmount}`;
    
    if (!itemMap.has(key)) {
      itemMap.set(key, [item]);
    } else {
      itemMap.get(key)!.push(item);
    }
  }

  for (const [, group] of itemMap.entries()) {
    if (group.length > 1) {
      // The first charge is the original; subsequent occurrences are duplicates
      for (let i = 1; i < group.length; i++) {
        const dupItem = group[i];
        anomalies.push({
          itemId: dupItem.id,
          code: dupItem.code,
          anomalyType: 'DUPLICATE_CHARGE',
          severity: 'HIGH',
          disputedAmount: dupItem.billedAmount,
          title: 'Duplicate Line-Item Detected',
          explanation: `CPT ${dupItem.code} was billed ${group.length} times on the same date (${dupItem.dateOfService || 'date of service'}) with identical amounts ($${dupItem.billedAmount.toFixed(2)}).`,
          remedy: 'Demand complete removal of duplicate charge under Fair Credit Billing Act Section 1666 computational error rules.',
          statutoryBasis: 'Fair Credit Billing Act (15 U.S.C. 1666)',
        });
      }
    }
  }

  // Also check per-encounter max allowances (e.g. routine venipuncture billed 3x in one visit)
  for (const item of items) {
    const benchmark = findBenchmark(item.code, item.rawDescription);
    if (benchmark && benchmark.maxAllowedPerEncounter) {
      if (item.quantity > benchmark.maxAllowedPerEncounter) {
        const excessQty = item.quantity - benchmark.maxAllowedPerEncounter;
        const perUnitCost = item.billedAmount / item.quantity;
        const overcharge = excessQty * perUnitCost;
        
        anomalies.push({
          itemId: item.id,
          code: item.code,
          anomalyType: 'QUANTITY_OVERBILL',
          severity: 'HIGH',
          disputedAmount: Math.round(overcharge * 100) / 100,
          title: `Excessive Billing Quantity (${item.quantity} units)`,
          explanation: `CPT ${item.code} (${benchmark.name}) is clinically limited to ${benchmark.maxAllowedPerEncounter} unit per encounter, but ${item.quantity} units were billed.`,
          remedy: `Reduce billable quantity to ${benchmark.maxAllowedPerEncounter} unit, removing $${overcharge.toFixed(2)} in excess charges.`,
          statutoryBasis: 'Fair Credit Billing Act (15 U.S.C. 1666)',
        });
      }
    }
  }

  return anomalies;
}

/**
 * 2. Deterministic Correct Coding Initiative (CCI) Unbundling Detection
 */
export function auditUnbundling(items: RawLineItem[]): AnomalyReport[] {
  const anomalies: AnomalyReport[] = [];

  for (const parentItem of items) {
    const parentBenchmark = findBenchmark(parentItem.code, parentItem.rawDescription);
    if (parentBenchmark && parentBenchmark.bundles && parentBenchmark.bundles.length > 0) {
      const parentDate = normalizeDate(parentItem.dateOfService);

      for (const bundledCode of parentBenchmark.bundles) {
        const cleanBundled = normalizeCptCode(bundledCode);
        const matchingChildren = items.filter((i) => {
          if (i.id === parentItem.id) return false;
          if (normalizeCptCode(i.code) !== cleanBundled) return false;
          const childDate = normalizeDate(i.dateOfService);
          if (parentDate !== 'nodate' && childDate !== 'nodate' && parentDate !== childDate) {
            return false;
          }
          return true;
        });

        for (const childItem of matchingChildren) {
          anomalies.push({
            itemId: childItem.id,
            code: childItem.code,
            parentCode: parentItem.code,
            anomalyType: 'UNBUNDLED_CHARGE',
            severity: 'HIGH',
            disputedAmount: childItem.billedAmount,
            title: 'Improper Unbundling (CCI Violation)',
            explanation: `CPT ${childItem.code} was billed separately for $${childItem.billedAmount.toFixed(2)}, but it is legally bundled under comprehensive panel CPT ${parentItem.code} (${parentBenchmark.name}) performed on the same date.`,
            remedy: 'Component test must be written off to $0.00 in compliance with CMS National Correct Coding Initiative.',
            statutoryBasis: 'CMS National Correct Coding Initiative (NCCI Policy Manual, Ch. 1)',
          } as AnomalyReport);
        }
      }
    }
  }

  return anomalies;
}

/**
 * 3. Deterministic Medicare Benchmark & Hospital Markup Analysis
 */
export function auditExcessiveMarkups(items: RawLineItem[]): AnomalyReport[] {
  const anomalies: AnomalyReport[] = [];

  for (const item of items) {
    const benchmark = findBenchmark(item.code, item.rawDescription);
    if (!benchmark) continue;

    const billed = item.billedAmount;
    const qty = Math.max(1, item.quantity || 1);
    const totalMedian = benchmark.medicareMedian * qty;
    const totalThreshold = benchmark.markupThreshold * qty;
    const ratio = billed / (totalMedian > 0 ? totalMedian : 1);

    // If billed exceeds threshold OR exceeds 2.5x Medicare median (accounting for quantity)
    if (billed >= totalThreshold || ratio >= 2.5) {
      // Disputed overcharge is everything beyond a reasonable fair market rate (1.5x Medicare)
      const fairBenchmark = Math.round(totalMedian * 1.5 * 100) / 100;
      const disputedOvercharge = Math.max(0, Math.round((billed - fairBenchmark) * 100) / 100);

      const severity: AnomalySeverity = ratio >= 4.0 ? 'HIGH' : 'MEDIUM';

      anomalies.push({
        itemId: item.id,
        code: item.code,
        anomalyType: 'EXCESSIVE_MARKUP',
        severity,
        disputedAmount: disputedOvercharge,
        title: `Excessive Markup (${ratio.toFixed(1)}x Medicare Benchmark)`,
        explanation: `Hospital billed $${billed.toFixed(2)} for ${qty > 1 ? `${qty} units of ` : ''}CPT ${item.code} (${benchmark.name}). The CMS Medicare median allowable fee is $${totalMedian.toFixed(2)} (Fair market range: $${(benchmark.fairMarketRange[0] * qty).toFixed(2)}–$${(benchmark.fairMarketRange[1] * qty).toFixed(2)}). The hospital marked up this service by ${((ratio - 1) * 100).toFixed(0)}%.`,
        remedy: `Demand recalculation to the regional fair market standard of $${fairBenchmark.toFixed(2)}, saving $${disputedOvercharge.toFixed(2)}.`,
        statutoryBasis: 'IRC Section 501(r) Amounts Generally Billed (AGB) Limitation',
      });
    }
  }

  return anomalies;
}

/**
 * 4. Deterministic Upcoding Severity Checks (e.g. CPT 99285 Emergency High Severity)
 */
export function auditUpcodingSeverity(items: RawLineItem[]): AnomalyReport[] {
  const anomalies: AnomalyReport[] = [];
  const level5ER = items.find((i) => normalizeCptCode(i.code) === '99285');

  if (level5ER) {
    // If billed Level 5 (immediate life or limb threat) but encounter contains explicitly low-acuity indicators (e.g. closed simple fracture, routine minor suture)
    const hasMajorResuscitation = items.some((i) => {
      const code = normalizeCptCode(i.code);
      return ['99291', '31500', '92950'].includes(code); // Critical care, intubation, CPR
    });

    const hasMinorClinicalIndicators = items.some((i) => {
      const code = normalizeCptCode(i.code);
      return ['73130', '73110', '25600', '12001', '12002', '29125', '29105', '99281', '99282'].includes(code);
    });

    // High decision-making ED care alone without minor contradictors is not upcoding
    if (!hasMajorResuscitation && hasMinorClinicalIndicators && level5ER.billedAmount > 1200) {
      const level3Median = 260.0;
      const potentialDispute = Math.max(0, level5ER.billedAmount - (level3Median * 1.8));

      anomalies.push({
        itemId: level5ER.id,
        code: level5ER.code,
        anomalyType: 'UPCODING_SEVERITY',
        severity: 'MEDIUM',
        disputedAmount: Math.round(potentialDispute * 100) / 100,
        title: 'Suspected E&M Code Severity Upcoding (Level 5)',
        explanation: `CPT 99285 represents Emergency Department Visit Level 5 (high severity with immediate threat to life or physiologic function). If the clinical encounter did not require critical stabilization, this level is clinically unsupported.`,
        remedy: 'Request physician medical chart notes and clinical acuity scoring records justifying Level 5 instead of Level 3 or 4.',
        statutoryBasis: 'CMS Evaluation & Management Documentation Guidelines / False Claims Act',
      });
    }
  }

  return anomalies;
}

/**
 * Assembles the full audit report by combining deterministic rules and reference data.
 */
export function compileForensicAudit(
  rawItems: RawLineItem[],
  facility: FacilityMetadata,
  patient: PatientMetadata,
  financialsOverride?: Partial<FinancialSummary>
): AuditReport {
  // Run all deterministic audit checks
  const dupAnomalies = auditDuplicateCharges(rawItems);
  const unbundleAnomalies = auditUnbundling(rawItems);
  const markupAnomalies = auditExcessiveMarkups(rawItems);
  const upcodeAnomalies = auditUpcodingSeverity(rawItems);

  const allAnomalies = [
    ...dupAnomalies,
    ...unbundleAnomalies,
    ...markupAnomalies,
    ...upcodeAnomalies,
  ];

  // Map each item to AuditedLineItem
  const auditedItems: AuditedLineItem[] = rawItems.map((item) => {
    const benchmark = findBenchmark(item.code, item.rawDescription);
    const itemAnomalies = allAnomalies.filter((a) => a.itemId === item.id);

    // Determine highest severity
    let status: AnomalySeverity = 'NORMAL';
    if (itemAnomalies.some((a) => a.severity === 'HIGH')) {
      status = 'HIGH';
    } else if (itemAnomalies.some((a) => a.severity === 'MEDIUM')) {
      status = 'MEDIUM';
    } else if (itemAnomalies.some((a) => a.severity === 'LOW')) {
      status = 'LOW';
    }

    const median = benchmark ? benchmark.medicareMedian : 0;
    const fairRange: [number, number] = benchmark
      ? benchmark.fairMarketRange
      : [0, 0];

    return {
      ...item,
      plainEnglishDescription:
        benchmark?.description ||
        `Clinical diagnostic or therapeutic procedure (${item.rawDescription}).`,
      clinicalCategory: benchmark?.category || 'General Medical Services',
      benchmarkMedian: median,
      fairMarketRange: fairRange,
      status,
      isDisputed: itemAnomalies.length > 0,
      anomalies: itemAnomalies,
    };
  });

  // Calculate financial metrics
  const totalBilled = rawItems.reduce((acc, curr) => acc + curr.billedAmount, 0);

  // Calculate unique potential savings (avoid double counting duplicate + markup on same item)
  let totalPotentialSavings = 0;
  for (const item of auditedItems) {
    if (item.anomalies.length > 0) {
      // If there is a duplicate or unbundling, full charge is disputed
      const fullDispute = item.anomalies.find(
        (a) => a.anomalyType === 'DUPLICATE_CHARGE' || a.anomalyType === 'UNBUNDLED_CHARGE'
      );
      if (fullDispute) {
        totalPotentialSavings += fullDispute.disputedAmount;
      } else {
        // Otherwise take the maximum single disputed amount for this item
        const maxDispute = Math.max(...item.anomalies.map((a) => a.disputedAmount));
        totalPotentialSavings += maxDispute;
      }
    }
  }

  // Risk score calculation (0 - 100)
  const highSeverityCount = allAnomalies.filter((a) => a.severity === 'HIGH').length;
  const mediumSeverityCount = allAnomalies.filter((a) => a.severity === 'MEDIUM').length;
  const savingsRatio = totalBilled > 0 ? (totalPotentialSavings / totalBilled) : 0;
  
  let riskScore = Math.min(
    98,
    Math.round(savingsRatio * 60 + highSeverityCount * 15 + mediumSeverityCount * 8 + (allAnomalies.length > 0 ? 10 : 0))
  );
  if (allAnomalies.length === 0) riskScore = 8;

  const gross = financialsOverride?.totalBilledGross ?? totalBilled;
  const insurance = (financialsOverride as any)?.insuranceAdjustments ?? (financialsOverride as any)?.insurancePaid ?? 0;
  const patientResp = (financialsOverride as any)?.patientResponsibility ?? (financialsOverride as any)?.patientBalanceDue ?? gross;

  const financials: FinancialSummary = {
    totalBilledGross: gross,
    insuranceAdjustments: insurance,
    patientResponsibility: patientResp,
    totalPotentialSavings: Math.min(gross, Math.round(totalPotentialSavings * 100) / 100),
    riskScore,
  };

  // Build Statutory Dispute Package
  const disputePackage = generateStatutoryDisputePackage(
    facility,
    patient,
    auditedItems,
    allAnomalies,
    financials
  );

  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    facility,
    patient,
    financials,
    items: auditedItems,
    anomalies: allAnomalies,
    disputePackage,
  };
}

/**
 * Compiles a formal statutory dispute package with FCBA § 1666 citation,
 * grievance tables, and phone negotiation script.
 */
export function generateStatutoryDisputePackage(
  facility: FacilityMetadata,
  patient: PatientMetadata,
  items: AuditedLineItem[],
  anomalies: AnomalyReport[],
  financials: FinancialSummary
): DisputePackage {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const patientName = patient.patientName || 'Patient';
  const accountNo = patient.accountNumber || 'PENDING-RECONCILIATION';
  const hospitalName = facility.name || 'Hospital Billing & Financial Services Department';

  // Matched statutory citations
  const citations = [
    'Fair Credit Billing Act (15 U.S.C. 1666) — Timely notice of computational billing error and automatic credit report stay.',
    'CMS National Correct Coding Initiative (NCCI) — Prohibition against improper component unbundling.',
    'Internal Revenue Code Section 501(r)(6) — Tax-exempt hospital Limitation on Charges to Amounts Generally Billed (AGB).',
    'Federal No Surprises Act (Public Law 116-260) — Protection against non-consensual out-of-network balance billing.',
  ];

  // Build itemized grievances markdown table
  let tableRows = '';
  let counter = 1;
  for (const item of items) {
    if (item.anomalies.length > 0) {
      for (const a of item.anomalies) {
        tableRows += `${counter}. CPT ${item.code} — ${item.rawDescription}\n`;
        tableRows += `   • Date of Service: ${item.dateOfService || 'As billed'}\n`;
        tableRows += `   • Billed Amount: $${item.billedAmount.toFixed(2)} | Benchmark Median: $${item.benchmarkMedian.toFixed(2)}\n`;
        tableRows += `   • Violation: ${a.title}\n`;
        tableRows += `   • Disputed Overcharge: $${a.disputedAmount.toFixed(2)}\n`;
        tableRows += `   • Forensic Remedy: ${a.remedy}\n\n`;
        counter++;
      }
    }
  }

  if (!tableRows) {
    tableRows = 'No severe statutory discrepancies flagged on itemized entries. Formal itemized reconciliation requested.\n';
  }

  const formalLetterText = `SENT VIA CERTIFIED MAIL / WRITTEN DISPUTE SUBMISSION
DATE: ${currentDate}

TO:
${hospitalName}
Attn: Patient Financial Services & Billing Dispute Department
${facility.address || 'Hospital Billing Compliance Office'}
Phone: ${facility.billingPhone || 'Hospital Financial Services'}

RE: FORMAL NOTICE OF BILLING ERROR, DISPUTE OF OVERCHARGES, AND DEMAND FOR ACCOUNT RECONCILIATION
Patient Name: ${patientName}
Account / Invoice Number: ${accountNo}
Statement Date: ${patient.statementDate || currentDate}
Total Disputed Amount: $${financials.totalPotentialSavings.toFixed(2)}

Dear Billing Compliance Officer,

Please accept this letter as formal written notice of billing errors, improper coding discrepancies, and excessive charges regarding the above-referenced account. I am exercising my rights under the Fair Credit Billing Act (15 U.S.C. § 1666), Regulation Z (12 C.F.R. § 1026.13), and federal hospital billing standards.

A comprehensive forensic audit of the itemized statement reveals that the gross billed total of $${financials.totalBilledGross.toFixed(2)} contains $${financials.totalPotentialSavings.toFixed(2)} in computational inaccuracies, unbundled procedures, duplicate entries, and markups that substantially exceed regional Medicare benchmarks.

============================================================
ITEMIZED SCHEDULE OF DISPUTED CHARGES
============================================================
${tableRows}
============================================================
STATUTORY DEMANDS & PRESERVATION OF RIGHTS
============================================================
1. IMMEDIATE STAY ON CREDIT REPORTING & COLLECTIONS:
Pursuant to 15 U.S.C. § 1666(a) and 12 C.F.R. § 1026.13, you are strictly prohibited from reporting this disputed account as delinquent to any consumer credit reporting agency or assessing late finance charges while this formal dispute is pending. Any collection activity must cease immediately.

2. TIMELY WRITTEN ACKNOWLEDGEMENT:
Federal law requires written acknowledgement of this notice within thirty (30) days of receipt, and a complete resolution or written explanation within two billing cycles (not to exceed 90 days).

3. COMPREHENSIVE ITEMIZED LEDGER DEMAND:
I formally demand an updated, itemized statement containing standard CMS Revenue Codes, 11-digit National Drug Codes (NDCs) for all administered pharmaceuticals, and verified physician charge summaries.

4. CHARITY CARE & AMOUNTS GENERALLY BILLED (AGB) DISCLOSURE:
In accordance with Internal Revenue Code Section 501(r)(4) and (r)(6), provide a complete copy of your Financial Assistance Policy (FAP) application and recalculate all remaining legitimate charges to your hospital's Amounts Generally Billed percentage.

Until these disputed charges are investigated and adjusted in accordance with federal and state billing regulations, no payment on the disputed sum of $${financials.totalPotentialSavings.toFixed(2)} will be remitted.

Sincerely,

____________________________________
${patientName}
Account Holder / Patient Representative
Certified Mail Tracking: _______________________
`;

  const unbundleAnomaly = items
    .flatMap((i) => i.anomalies)
    .find((a) => a.anomalyType === 'UNBUNDLED_CHARGE');
  const childCode = unbundleAnomaly?.code || '80048';
  const parentCode = unbundleAnomaly?.parentCode || '80053';

  const phoneNegotiationPoints = [
    `Script 1 (Account Verification): "Hello, I am calling regarding Account #${accountNo}. I have submitted a formal Fair Credit Billing Act dispute regarding $${financials.totalPotentialSavings.toFixed(2)} in duplicate and unbundled line items. Please confirm this account is tagged as 'In Active Dispute' so no automated collections trigger."`,
    `Script 2 (When representative says 'Rates are non-negotiable'): "I understand hospital chargemaster rates are standard, but federal IRC Section 501(r) prohibits non-profit hospitals from billing patients more than the Amount Generally Billed (AGB). Several line items on this bill exceed Medicare median allowables by over 400%. What is your facility's current AGB percentage for this year?"`,
    `Script 3 (Handling Unbundled CPT Codes): "Line item CPT ${childCode} is a component of comprehensive panel ${parentCode} billed on the same date. Under CMS NCCI guidelines, component testing cannot be billed separately. Please write off this unbundled charge."`,
    `Script 4 (Lump-Sum Settlement Offer): "If you recalculate the statement to fair market Medicare median rates of $${(financials.totalBilledGross - financials.totalPotentialSavings).toFixed(2)}, I am prepared to settle the entire undisputed balance today with a single one-time payment in exchange for a written zero-balance release."`,
  ];

  return {
    formalLetterText,
    statutoryCitations: citations,
    phoneNegotiationPoints,
    generatedAt: new Date().toISOString(),
  };
}
