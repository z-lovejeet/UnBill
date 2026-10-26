import catalog from '../../data/cpt_benchmarks.json';
import resources from '../../data/legal_statutes.json';
import { phoneQuestion } from './review-language';
import type {
  RawLineItem,
  AuditedLineItem,
  AnomalyReport,
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
  referenceAmount: number;
  referenceRange: number[];
  reviewThreshold: number;
  bundles?: string[];
  maxAllowedPerEncounter?: number;
  description: string;
}
export const CPT_BENCHMARKS: CptBenchmark[] = catalog;
export const LEGAL_STATUTES = resources;
const cents = (n: number) => Math.round(n * 100);
const money = (n: number) => Math.round(n * 100) / 100;
export function normalizeCptCode(code: string): string {
  return typeof code === 'string'
    ? code
        .trim()
        .split(/[\s(-]/)[0]
        .toUpperCase()
    : '';
}
export function normalizeDate(value?: string): string {
  if (!value) return '';
  const us = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const date = us ? `${us[3]}-${us[1].padStart(2, '0')}-${us[2].padStart(2, '0')}` : value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !isNaN(Date.parse(date)) &&
    new Date(date + 'T00:00:00Z').toISOString().slice(0, 10) === date
    ? date
    : '';
}
export function findBenchmark(code: string, _description?: string): CptBenchmark | undefined {
  if (!code || /inferred|unknown/i.test(code)) return undefined;
  return CPT_BENCHMARKS.find((b) => b.code === normalizeCptCode(code));
}
function repeatModifier(item: RawLineItem) {
  return [...(item.modifiers || []), ...item.code.split('-').slice(1)].some((m) =>
    ['59', '76', '77', '91', 'XE', 'XP', 'XS', 'XU'].includes(m.toUpperCase()),
  );
}
function finding(
  item: RawLineItem,
  type: AnomalyReport['anomalyType'],
  amount: number,
  title: string,
  explanation: string,
  remedy: string,
): AnomalyReport {
  return {
    itemId: item.id,
    code: item.code,
    anomalyType: type,
    severity: type === 'DUPLICATE_CHARGE' ? 'HIGH' : 'MEDIUM',
    disputedAmount: money(Math.max(0, amount)),
    title,
    explanation,
    remedy,
  };
}
export function auditDuplicateCharges(items: RawLineItem[]): AnomalyReport[] {
  const groups = new Map<string, RawLineItem[]>();
  const output: AnomalyReport[] = [];
  for (const item of items) {
    const date = normalizeDate(item.dateOfService);
    if (!date || !item.code || /inferred|unknown/i.test(item.code) || repeatModifier(item))
      continue;
    const key = [
      normalizeCptCode(item.code),
      date,
      item.providerId || '',
      cents(item.billedAmount),
    ].join('|');
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  }
  for (const group of groups.values())
    for (const item of group.slice(1))
      output.push(
        finding(
          item,
          'DUPLICATE_CHARGE',
          item.billedAmount,
          'Possible duplicate charge',
          `The same code, service date and amount appear ${group.length} times. Repeat services, separate providers or missing modifiers may explain this.`,
          'Ask the billing team to identify each distinct service and remove a duplicate only if confirmed.',
        ),
      );
  for (const item of items) {
    const reference = findBenchmark(item.code);
    if (reference?.maxAllowedPerEncounter && item.quantity > reference.maxAllowedPerEncounter)
      output.push(
        finding(
          item,
          'QUANTITY_OVERBILL',
          0,
          'Quantity documentation review',
          'The quantity exceeds this demonstration catalog’s usual per-encounter value. Multiple legitimate collections or encounters may explain it.',
          'Ask the provider to explain each unit. No reduction is estimated from quantity alone.',
        ),
      );
  }
  return output;
}
export function auditUnbundling(items: RawLineItem[]): AnomalyReport[] {
  const output: AnomalyReport[] = [];
  const seen = new Set<string>();
  for (const parent of items) {
    const reference = findBenchmark(parent.code);
    const date = normalizeDate(parent.dateOfService);
    if (!reference?.bundles || !date || repeatModifier(parent)) continue;
    for (const child of items) {
      if (
        child.id === parent.id ||
        seen.has(child.id) ||
        repeatModifier(child) ||
        normalizeDate(child.dateOfService) !== date ||
        !reference.bundles.includes(normalizeCptCode(child.code))
      )
        continue;
      if (parent.providerId && child.providerId && parent.providerId !== child.providerId) continue;
      const result = finding(
        child,
        'UNBUNDLED_CHARGE',
        child.billedAmount,
        'Possible overlapping panel charge',
        `Code ${child.code} appears with panel ${parent.code} on the same date in the limited demonstration catalog. Provider, modifier and repeat-test details need review.`,
        'Ask whether this component was a separate, medically necessary service or is included in the panel.',
      );
      result.parentCode = parent.code;
      output.push(result);
      seen.add(child.id);
    }
  }
  return output;
}
export function auditExcessiveMarkups(items: RawLineItem[]): AnomalyReport[] {
  return items.flatMap((item) => {
    const ref = findBenchmark(item.code);
    if (!ref) return [];
    const baseline = ref.referenceAmount * item.quantity;
    if (
      item.billedAmount < ref.reviewThreshold * item.quantity &&
      item.billedAmount < baseline * 2.5
    )
      return [];
    const comparison = money(baseline * 1.5);
    return [
      finding(
        item,
        'EXCESSIVE_MARKUP',
        item.billedAmount - comparison,
        'Price comparison to discuss',
        `Billed ${item.billedAmount.toFixed(2)} for ${item.quantity} unit(s); illustrative reference ${baseline.toFixed(2)}. The comparison uses 1.5× that demonstration value. This is not an official rate, legal cap, or verified overcharge.`,
        'Request the applicable insurer allowance, cash/self-pay price and financial assistance policy. Any reduction depends on your bill and eligibility.',
      ),
    ];
  });
}
export function auditUpcodingSeverity(items: RawLineItem[]): AnomalyReport[] {
  // A line-item statement cannot establish clinical acuity or medical decision making.
  return items
    .filter((i) => normalizeCptCode(i.code) === '99285')
    .map((i) =>
      finding(
        i,
        'UPCODING_SEVERITY',
        0,
        'Documentation review: emergency visit level',
        'Emergency visit level depends on documented medical decision making. A bill alone cannot establish upcoding; absence of resuscitation is not evidence of an error.',
        'If the level is unclear, request the documentation supporting the code. No reduction is estimated for this note.',
      ),
    );
}
export function itemReviewAmount(item: AuditedLineItem): number {
  return money(
    Math.max(
      0,
      Math.min(item.billedAmount, ...[Math.max(0, ...item.anomalies.map((a) => a.disputedAmount))]),
    ),
  );
}
export function generateStatutoryDisputePackage(
  facility: FacilityMetadata,
  patient: PatientMetadata,
  items: AuditedLineItem[],
  _anomalies: AnomalyReport[],
  financials: FinancialSummary,
): DisputePackage {
  const selected = items.filter((i) => i.isDisputed && i.anomalies.length);
  const date = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeZone: 'Asia/Kolkata',
  }).format(new Date());
  const rows = selected
    .map(
      (i, index) =>
        `${index + 1}. ${i.code || 'Code not provided'} — ${i.rawDescription}\n   Service date: ${i.dateOfService || 'Not provided'} | Quantity: ${i.quantity}\n   Billed amount: $${i.billedAmount.toFixed(2)}\n   Amount requested for review: $${itemReviewAmount(i).toFixed(2)}\n   Reasons: ${i.anomalies.map((a) => a.title).join('; ')}\n   Request: ${i.anomalies.map((a) => a.remedy).join(' ')}`,
    )
    .join('\n\n');
  const amount = financials.totalPotentialSavings.toFixed(2);
  return {
    generatedAt: new Date().toISOString(),
    formalLetterText: `REQUEST FOR ITEMIZED BILLING REVIEW\nDate: ${date}\n\nTo: ${facility.name}\n${facility.address || 'Patient Billing Department'}\n\nPatient: ${patient.patientName || 'Not provided'}\nAccount: ${patient.accountNumber}\nStatement date: ${patient.statementDate || 'Not provided'}\nTotal Disputed Amount: $${amount}\n\nDear Billing Team,\n\nPlease review the selected charges below and provide supporting documentation or a corrected itemized statement. My statement lists gross charges of $${financials.totalBilledGross.toFixed(2)}. The selected, non-overlapping amount requested for review is $${amount}. This is a request for clarification, not a determination that the charges are invalid or that a reduction is owed.\n\nSELECTED CHARGES\n\n${rows || 'No charges are selected. Please provide a complete itemized statement and explain the balance.'}\n\nPlease explain any repeated services, relevant billing modifiers, applicable insurer adjustments, and the basis of the patient balance. If available, please send your financial assistance policy and self-pay pricing options.\n\nI request written confirmation of receipt and your expected review timeline. Please let me know whether you will voluntarily pause collection activity during this review. This letter does not establish an automatic collection or credit-reporting stay. Specific consumer protections depend on the type of account, coverage, facility and eligibility.\n\nPlease confirm any correction or settlement in writing before I agree to a revised payment. I request review of $${amount}; I am not treating an illustrative reference price as a legal payment limit.\n\nSincerely,\n${patient.patientName || 'Patient / account holder'}\nContact details: ____________________\n\nPrepared with UnBill. Verify all figures and facts before sending. Educational billing assistance; not legal or medical advice.`,
    statutoryCitations: resources.map((r) => `${r.title}: ${r.formalNoticeClause} ${r.sourceUrl}`),
    phoneNegotiationPoints: [
      `Open the conversation
“Hello, I am calling about account ${patient.accountNumber}. I would like help understanding my itemized statement. Am I speaking with the right department for a billing review? May I have your name and a reference number for this call?”`,
      selected.length
        ? `Explain your request
“I have ${selected.length} selected line item${selected.length === 1 ? '' : 's'} to discuss. The amount I am asking you to review is $${amount} within the original charges. I understand this is not a confirmed refund or reduction. Could we go through each selected charge together?”`
        : `Explain your request
“I have not selected any charges to dispute. Please help me understand the statement and provide a complete itemized breakdown before I decide whether anything needs review.”`,
      `Confirm what the balance means
“My statement lists total charges of $${financials.totalBilledGross.toFixed(2)}${financials.patientResponsibility === null ? ', but it does not show a patient balance' : ` and a patient balance of $${financials.patientResponsibility.toFixed(2)}`}. Could you explain which insurance adjustments, payments and credits have been applied? Are any claims or adjustments still pending? If I am insured, can you help me compare this with my insurer’s explanation of benefits?”`,
      ...selected.map(
        (item) =>
          `Discuss ${item.code || 'the uncoded service'} — ${item.rawDescription}
“The statement lists ${item.rawDescription}, ${item.code ? `code ${item.code}, ` : ''}${item.dateOfService ? `on ${item.dateOfService}, ` : 'with no service date shown, '}quantity ${item.quantity}, billed at $${item.billedAmount.toFixed(2)}. ${item.anomalies.map(phoneQuestion).join(' ')} Please explain the supporting record. If you confirm an error, could you send a corrected statement and explain how the correction affects my patient balance?”`,
      ),
      `Ask about affordable options
“Could you send me your financial assistance policy and explain how to apply? Are there self-pay prices, discounts or payment plans that could apply to my situation? Please explain eligibility, interest, fees and the full terms in writing before I choose an option.”`,
      `If the concern is not resolved
“Could you refer this to a billing supervisor or coding reviewer? How do I submit the supporting statement and a written review request? What reference number should I use, and when should I expect a response? Can you voluntarily pause collection activity while you review it? Please confirm whether that request is accepted; I am not assuming a pause is automatic.”`,
      `Close and confirm the next steps
“Let me read back what we agreed: the charges you will review, the documents you will send, and the expected response date. Is that correct? Please send the explanation and any corrected balance in writing. Who should I contact if I have not heard back by that date? Thank you for your help.”`,
    ],
  };
}
export function recalculateReport(report: AuditReport): AuditReport {
  const total = money(
    report.items.filter((i) => i.isDisputed).reduce((s, i) => s + itemReviewAmount(i), 0),
  );
  const financials = {
    ...report.financials,
    totalPotentialSavings: Math.min(report.financials.totalBilledGross, total),
  };
  return {
    ...report,
    financials,
    disputePackage: generateStatutoryDisputePackage(
      report.facility,
      report.patient,
      report.items,
      report.anomalies,
      financials,
    ),
  };
}
export function compileForensicAudit(
  rawItems: RawLineItem[],
  facility: FacilityMetadata,
  patient: PatientMetadata,
  override?: Partial<FinancialSummary> & {
    insurancePaid?: number;
    patientBalanceDue?: number | null;
  },
): AuditReport {
  const anomalies = [
    ...auditDuplicateCharges(rawItems),
    ...auditUnbundling(rawItems),
    ...auditExcessiveMarkups(rawItems),
    ...auditUpcodingSeverity(rawItems),
  ];
  const items: AuditedLineItem[] = rawItems.map((i) => {
    const ref = findBenchmark(i.code);
    const found = anomalies.filter((a) => a.itemId === i.id);
    return {
      ...i,
      plainEnglishDescription:
        ref?.description ||
        'No catalog translation available. Ask the provider to explain this service.',
      clinicalCategory: ref?.category || 'Not in reference catalog',
      referenceAmount: ref?.referenceAmount || 0,
      referenceRange: (ref?.referenceRange || [0, 0]) as [number, number],
      status: found.some((a) => a.severity === 'HIGH')
        ? 'HIGH'
        : found.length
          ? 'MEDIUM'
          : 'NORMAL',
      isDisputed: found.length > 0,
      anomalies: found,
    };
  });
  const gross = money(rawItems.reduce((s, i) => s + i.billedAmount, 0));
  const warnings = [
    'The 19-code price catalog is illustrative, not official CMS, insurer or hospital pricing. Findings require billing-team verification.',
    'Estimated review amounts concern gross charges, not guaranteed savings or the patient amount due.',
    'Provider identity, modifiers and medical necessity can explain apparently repeated or overlapping services.',
  ];
  if (items.some((i) => !i.referenceAmount))
    warnings.push(
      'Some codes have no reference price; absence of a finding does not validate those charges.',
    );
  if (items.some((i) => !i.dateOfService || !i.code))
    warnings.push(
      'Some service dates or codes are missing. Corresponding duplicate/panel checks may be incomplete.',
    );
  return recalculateReport({
    schemaVersion: 2,
    id: `audit_${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    facility,
    patient,
    source: 'structured',
    warnings,
    items,
    anomalies,
    financials: {
      totalBilledGross: gross,
      insuranceAdjustments: override?.insuranceAdjustments ?? override?.insurancePaid ?? 0,
      patientResponsibility: override?.patientResponsibility ?? override?.patientBalanceDue ?? null,
      totalPotentialSavings: 0,
      riskScore: Math.min(100, anomalies.length * 10),
    },
    disputePackage: {
      formalLetterText: '',
      statutoryCitations: [],
      phoneNegotiationPoints: [],
      generatedAt: '',
    },
  });
}
