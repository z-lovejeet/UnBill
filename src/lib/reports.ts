import type { AuditReport } from '@/types/audit';
import { rawBillSchema, reportSchema } from './validation';
import { compileForensicAudit, recalculateReport } from './rules-engine';
/** Treat stored/shared JSON as untrusted. Derived findings and letters are rebuilt. */
export function normalizeReport(value: unknown): AuditReport {
  if (!value || typeof value !== 'object') throw new Error('Invalid report');
  const input = value as Record<string, unknown>;
  if (input.schemaVersion === 2 && input.source === 'shared')
    return recalculateReport(reportSchema.parse(input));
  if (input.schemaVersion === 2) reportSchema.parse(input);
  if (typeof input.id !== 'string' || !/^[A-Za-z0-9_-]{1,120}$/.test(input.id))
    throw new Error('Invalid report ID');
  const raw = rawBillSchema.parse(input);
  const report = compileForensicAudit(raw.items, raw.facility, raw.patient, raw.financials);
  const selected = new Map(
    (input.items as Array<{ id: string; isDisputed?: boolean }>).map((i) => [i.id, i.isDisputed]),
  );
  report.items = report.items.map((i) => ({
    ...i,
    isDisputed: typeof selected.get(i.id) === 'boolean' ? selected.get(i.id)! : i.isDisputed,
  }));
  report.id = input.id;
  report.createdAt =
    typeof input.createdAt === 'string' && !isNaN(Date.parse(input.createdAt))
      ? new Date(input.createdAt).toISOString()
      : report.createdAt;
  report.source = ['sample', 'document', 'structured', 'shared'].includes(String(input.source))
    ? (input.source as AuditReport['source'])
    : 'structured';
  return recalculateReport(report);
}
export function redactReport(report: AuditReport): AuditReport {
  return recalculateReport({
    ...report,
    source: 'shared',
    facility: { name: 'Healthcare facility (redacted)' },
    patient: { patientName: 'Patient (redacted)', accountNumber: 'Redacted', statementDate: '' },
    items: report.items.map((i) => ({
      ...i,
      dateOfService: '',
      providerId: undefined,
      rawDescription: i.plainEnglishDescription,
    })),
    warnings: [
      ...report.warnings,
      'Shared copy: direct patient and facility identifiers and service dates were removed. Procedure details and amounts remain visible to anyone with this link.',
    ],
  });
}
