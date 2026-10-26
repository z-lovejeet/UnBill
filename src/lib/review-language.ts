import type { AnomalyReport, AuditedLineItem, AnomalyType } from '@/types/audit';
import { formatCurrency } from './utils';

export const findingLabels: Record<AnomalyType, string> = {
  DUPLICATE_CHARGE: 'Possible duplicate charge',
  UNBUNDLED_CHARGE: 'Test may already be included',
  EXCESSIVE_MARKUP: 'Above example price',
  QUANTITY_OVERBILL: 'Check the number of units',
  UPCODING_SEVERITY: 'Check the visit level',
};
export function findingSummary(item: AuditedLineItem, finding: AnomalyReport): string {
  switch (finding.anomalyType) {
    case 'DUPLICATE_CHARGE':
      return 'Another line has the same code, date and charge. Ask whether the service was actually performed more than once.';
    case 'UNBUNDLED_CHARGE':
      return `This test appears alongside panel ${finding.parentCode || 'on this bill'} on the same date. Ask whether the panel already covers it.`;
    case 'EXCESSIVE_MARKUP':
      return `${formatCurrency(item.billedAmount)} billed, compared with ${formatCurrency(item.referenceAmount * item.quantity)} in our example price catalog for this quantity. This is a comparison, not a verified overcharge.`;
    case 'QUANTITY_OVERBILL':
      return `${item.quantity} units are listed. Ask the billing office to explain each unit; repeat services can be valid.`;
    case 'UPCODING_SEVERITY':
      return 'Ask for the records supporting the emergency visit level. The bill alone cannot show whether that level is correct.';
  }
}
export function phoneQuestion(finding: AnomalyReport): string {
  switch (finding.anomalyType) {
    case 'DUPLICATE_CHARGE':
      return 'The same code, date and charge appear more than once. Were these separate services? Please identify the time, provider and any repeat-service modifier for each one. If a line was duplicated, could you remove it?';
    case 'UNBUNDLED_CHARGE':
      return `Was this test already included in panel ${finding.parentCode || 'listed on the same date'}? If it was billed separately, could you explain the separate service and the reason for that charge?`;
    case 'EXCESSIVE_MARKUP':
      return 'Could you explain how this price was set and which insurer-negotiated or self-pay price applies? I saw an example comparison, but I understand it is not an official rate or a required discount.';
    case 'QUANTITY_OVERBILL':
      return 'Could you explain what each billed unit represents and provide the record supporting the number of units?';
    case 'UPCODING_SEVERITY':
      return 'Could you arrange a coding review and provide the documentation supporting this emergency visit level? I am asking for an explanation, not assuming the code is incorrect.';
  }
}
