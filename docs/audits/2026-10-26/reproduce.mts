/** Synthetic, offline audit probes. Run from the project root:
 * ./node_modules/.bin/tsx docs/audits/2026-10-26/reproduce.mts
 * Optional: UNBILL_AUDIT_URL=http://127.0.0.1:3107 to probe a local server
 * started with Gemini, Groq, and Redis credentials explicitly empty.
 * Exit 1 means at least one product invariant is violated, not a harness error.
 */
import fs from 'node:fs';
import {
  compileForensicAudit, auditUnbundling, auditExcessiveMarkups,
  auditDuplicateCharges, auditUpcodingSeverity, findBenchmark,
} from '../../../src/lib/rules-engine';
import { extractBillFromText } from '../../../src/lib/gemini';
import type { RawLineItem } from '../../../src/types/audit';

const checks: Array<{ name: string; pass: boolean; expected: unknown; actual: unknown }> = [];
function check(name: string, expected: unknown, actual: unknown) {
  checks.push({ name, pass: JSON.stringify(expected) === JSON.stringify(actual), expected, actual });
}
const item = (overrides: Partial<RawLineItem> = {}): RawLineItem => ({
  id: 'synthetic-1', code: '80053', rawDescription: 'SYNTHETIC TEST SERVICE',
  dateOfService: '2026-10-01', quantity: 1, billedAmount: 52, ...overrides,
});
const facility = { name: 'Synthetic Audit Hospital' };
const patient = { accountNumber: 'SYNTHETIC-ACCOUNT', statementDate: '2026-10-02', patientName: 'SYNTHETIC PATIENT' };

check('control: exact duplicate detected', 1, auditDuplicateCharges([
  item(), item({ id: 'synthetic-2' }),
]).filter(a => a.anomalyType === 'DUPLICATE_CHARGE').length);
check('control: same-day configured bundle detected', 1, auditUnbundling([
  item(), item({ id: 'synthetic-child', code: '82040', billedAmount: 18 }),
]).length);
check('unbundling must not join different service dates', 0, auditUnbundling([
  item(), item({ id: 'synthetic-child', code: '82040', dateOfService: '2026-10-02', billedAmount: 18 }),
]).length);
check('unbundling must examine every matching component row', ['synthetic-child-1', 'synthetic-child-2'], auditUnbundling([
  item(), item({ id: 'synthetic-child-1', code: '82040', billedAmount: 18 }),
  item({ id: 'synthetic-child-2', code: '82040', billedAmount: 19 }),
]).map(a => a.itemId));
check('markup comparison must account for quantity', 0, auditExcessiveMarkups([
  item({ code: 'J7030', quantity: 3, billedAmount: 42 }),
]).length);
check('equivalent service dates must match for duplicates', 1, auditDuplicateCharges([
  item(), item({ id: 'synthetic-2', dateOfService: '10/01/2026' }),
]).filter(a => a.anomalyType === 'DUPLICATE_CHARGE').length);
check('inferred CPT suffix must preserve benchmark lookup', '80053', findBenchmark('80053 (Inferred)', 'COMP METAB PANEL')?.code ?? null);
const unknown = compileForensicAudit([item({ code: 'ZZ999', billedAmount: 1000 })], facility, patient);
check('unknown codes must not acquire an invented benchmark', false, unknown.items[0].benchmarkMedian > 0);
check('unknown-code report must not assert regional price conformity', false,
  unknown.disputePackage.formalLetterText.includes('All billed items conform to median regional pricing'));
const extractedFinancials = { totalBilledGross: 1000, insurancePaid: 900, patientBalanceDue: 100 };
const mapped = compileForensicAudit([item({ billedAmount: 1000 })], facility, patient, extractedFinancials);
check('extracted patient balance must reach financial report', 100, mapped.financials.patientResponsibility);
check('extracted insurance amount must reach financial report', 900, mapped.financials.insuranceAdjustments);
check('high-decision-making ED care alone is not proof of upcoding', 0, auditUpcodingSeverity([
  item({ code: '99285', billedAmount: 1300 }),
]).length);
const pair = compileForensicAudit([item({ billedAmount: 200 }), item({ id: 'synthetic-2', billedAmount: 200 })], facility, patient);
check('control: compiled savings cannot exceed gross charges', true,
  pair.financials.totalPotentialSavings <= pair.financials.totalBilledGross);
check('negotiation parent and child CPT codes must differ', true,
  !compileForensicAudit([item(), item({ id: 'synthetic-child', code: '82040', billedAmount: 18 })], facility, patient)
    .disputePackage.phoneNegotiationPoints[2].includes('comprehensive panel 82040'));

// Mock the HTTP transport, including across the SDK's ESM/CJS entry points.
// No network request or genuine credential is used by the extraction probes.
const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;
let mockData: unknown = { isMedicalBill: true, facility, patient,
  financials: { totalBilledGross: 1000, insurancePaid: 1000, patientBalanceDue: 0 }, items: [item()] };
let mockOutput: string | undefined;
process.env.GEMINI_API_KEY = 'synthetic-offline-key';
globalThis.fetch = async () => new Response(JSON.stringify({ candidates: [{
  content: { role: 'model', parts: [{ text: mockOutput ?? JSON.stringify(mockData) }] }, finishReason: 'STOP',
}] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
try {
  const paid = await extractBillFromText('SYNTHETIC OFFLINE DOCUMENT');
  check('zero patient balance must remain zero after extraction', 0, paid.financials.patientBalanceDue);
  mockData = { isMedicalBill: true, items: [item()] };
  const incomplete = await extractBillFromText('SYNTHETIC OFFLINE DOCUMENT');
  check('missing facility and account must not become fabricated identifiers', false,
    incomplete.facility.name === 'Metropolitan Memorial Hospital' && incomplete.patient.accountNumber.startsWith('ACC-'));
  mockData = {};
  const empty = await extractBillFromText('SYNTHETIC OFFLINE DOCUMENT');
  check('empty model object must not be accepted as a medical bill', false, empty.isMedicalBill);
  mockOutput = '{"patientName":"SYNTHETIC_LOG_TEST"';
  const originalConsoleError = console.error;
  const capturedErrors: unknown[][] = [];
  console.error = (...args: unknown[]) => { capturedErrors.push(args); };
  try {
    await extractBillFromText('SYNTHETIC OFFLINE DOCUMENT');
  } catch {
    // The malformed response should fail; its raw content must not enter logs.
  } finally {
    console.error = originalConsoleError;
  }
  check('parse failures must not log raw patient-containing model output', false,
    capturedErrors.some(args => args.some(arg => typeof arg === 'string' && arg.includes('SYNTHETIC_LOG_TEST'))));
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
}

// Exercise the actual browser-store implementation against isolated memory storage.
const storage = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
} });
Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: globalThis.localStorage } });
const { useAuditStore } = await import('../../../src/lib/store');
useAuditStore.getState().setAudit(pair);
useAuditStore.getState().toggleItemDispute('synthetic-1');
const updated = useAuditStore.getState().currentReport!;
check('store savings must not double-count overlapping anomalies', 200, updated.financials.totalPotentialSavings);
check('store selection must update saved history', false,
  useAuditStore.getState().history[0].items[0].isDisputed);
useAuditStore.getState().setAudit(pair);
useAuditStore.getState().toggleItemDispute('synthetic-2');
const letterSelection = useAuditStore.getState().currentReport!;
check('selected totals and exported letter total must agree', true,
  letterSelection.disputePackage.formalLetterText.includes(`Total Disputed Amount: $${letterSelection.financials.totalPotentialSavings.toFixed(2)}`));
check('vault advertised as encrypted must not expose patient name as plaintext JSON', false,
  (storage.get('unbill_vault_v1') ?? '').includes('SYNTHETIC PATIENT'));

for (const sample of ['er_visit_broken_wrist', 'outpatient_surgery']) {
  const report = JSON.parse(fs.readFileSync(`public/samples/${sample}.json`, 'utf8'));
  check(`${sample}: item charges must reconcile to reported gross`, report.financials.totalBilledGross,
    report.items.reduce((sum: number, i: RawLineItem) => sum + i.billedAmount, 0));
  check(`${sample}: selected per-item savings must reconcile to total`, report.financials.totalPotentialSavings,
    report.items.filter((i: any) => i.isDisputed).reduce((sum: number, i: any) => sum + Math.max(0, ...i.anomalies.map((a: any) => a.disputedAmount)), 0));
  const recomputed = compileForensicAudit(report.items, report.facility, report.patient, report.financials);
  check(`${sample}: displayed sample savings must match current engine`, report.financials.totalPotentialSavings,
    recomputed.financials.totalPotentialSavings);
}

const baseUrl = process.env.UNBILL_AUDIT_URL;
if (baseUrl) {
  if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(baseUrl)) throw new Error('Only explicit local audit servers are allowed.');
  const post = async (endpoint: string, body: unknown) => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    return { status: response.status, data: await response.json() as any };
  };
  const normal = await post('/api/audit', { rawBillData: { items: [item()], facility, patient } });
  check('control: valid structured intake accepted', 200, normal.status);
  const invalid = await post('/api/audit', { rawBillData: { items: [item({ billedAmount: 'bad' as any })], facility, patient } });
  check('invalid line amount must be rejected as client input', 400, invalid.status);
  const noRows = await post('/api/audit', { rawBillData: { items: [], facility, patient } });
  check('empty itemized statement must not produce a successful audit', 400, noRows.status);
  const invalidSample = await post('/api/audit', { sampleId: 'nonexistent-synthetic-sample' });
  check('unknown sample ID must not return an ER sample', 404, invalidSample.status);
  const share = await post('/api/share', { auditReport: pair });
  check('disabled cloud sharing must return failure instead of a link', 503, share.status);
  if (share.data.shareId) {
    const getShared = await fetch(`${baseUrl}/api/share?id=${encodeURIComponent(share.data.shareId)}`);
    check('successful share creation must produce a retrievable link', share.status === 200 ? 200 : share.status, getShared.status);
  }
}

const evidence = {
  auditedAt: '2026-10-26', baseline: '8165bb6', syntheticOnly: true,
  liveProvidersUsed: false, checks, summary: {
    total: checks.length, passed: checks.filter(c => c.pass).length,
    failed: checks.filter(c => !c.pass).length,
  },
};
console.log(JSON.stringify(evidence, null, 2));
process.exitCode = evidence.summary.failed ? 1 : 0;
