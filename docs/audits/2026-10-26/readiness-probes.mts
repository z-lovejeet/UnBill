/** Supplemental audit probes. Synthetic data only; no real provider calls.
 * Run: ./node_modules/.bin/tsx docs/audits/2026-10-26/readiness-probes.mts
 * These record product expectations; exit 1 identifies an unmet expectation.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { extractBillFromText } from '../../../src/lib/gemini';
import { compileForensicAudit } from '../../../src/lib/rules-engine';

const checks: Array<{ name: string; pass: boolean; expected: unknown; actual: unknown }> = [];
function check(name: string, expected: unknown, actual: unknown) {
  checks.push({ name, pass: JSON.stringify(expected) === JSON.stringify(actual), expected, actual });
}
const facility = { name: 'SYNTHETIC READINESS FACILITY' };
const patient = { accountNumber: 'SYNTHETIC-READINESS', patientName: 'SYNTHETIC READINESS PERSON', statementDate: '2026-10-26' };
const item = { id: 'synthetic-one', code: '80053', rawDescription: 'SYNTHETIC PANEL', dateOfService: '2026-10-01', quantity: 1, billedAmount: 200 };
const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;
let responseText = '';
process.env.GEMINI_API_KEY = 'synthetic-audit-key';
globalThis.fetch = async () => new Response(JSON.stringify({ candidates: [{
  content: { role: 'model', parts: [{ text: responseText }] }, finishReason: 'STOP',
}] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
try {
  responseText = JSON.stringify({ isMedicalBill: true, facility, patient, items: [{ billedAmount: 100 }] });
  const missing = await extractBillFromText('SYNTHETIC DOCUMENT');
  check('missing extracted CPT must not become an asserted 99283 code', false, missing.items[0].code === '99283');
  responseText = JSON.stringify({ isMedicalBill: 'false', facility, patient, items: [item] });
  const wrongBoolean = await extractBillFromText('SYNTHETIC DOCUMENT');
  check('string false must not be accepted as a true medical-bill flag', false, wrongBoolean.isMedicalBill);
  responseText = JSON.stringify({ isMedicalBill: true, facility, patient, items: [{ ...item, billedAmount: -100, quantity: -2 }] });
  let negativeAccepted = false;
  try { const negative = await extractBillFromText('SYNTHETIC DOCUMENT'); negativeAccepted = negative.isMedicalBill && negative.items[0].billedAmount < 0; } catch {}
  check('negative extracted charge and quantity must not be accepted without classification', false, negativeAccepted);
  responseText = 'SYNTHETIC_PRIVATE_PATIENT unexpected non-JSON model output';
  const logged: unknown[][] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => { logged.push(args); };
  try { await extractBillFromText('SYNTHETIC DOCUMENT'); } catch {} finally { console.error = originalError; }
  check('JSON parser error logging must not leak model output snippets', false,
    logged.some(args => args.some(arg => typeof arg === 'string' && arg.includes('SYNTHETIC_'))));
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
}

const storage = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
} });
Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: globalThis.localStorage } });
const { useAuditStore } = await import('../../../src/lib/store');
const report = compileForensicAudit([item, { ...item, id: 'synthetic-two' }], facility, patient);
useAuditStore.getState().setAudit(report);
const stored = storage.get('unbill_vault_v1')!;
check('vault advertised as encrypted must not be readable by Base64 decoding alone', false,
  Buffer.from(stored, 'base64').toString('utf8').includes(patient.patientName));
useAuditStore.getState().toggleItemDispute('synthetic-two');
const toggled = useAuditStore.getState().currentReport!;
check('store-only toggle must update the letter closing amount', true,
  toggled.disputePackage.formalLetterText.includes(`no payment on the disputed sum of $${toggled.financials.totalPotentialSavings.toFixed(2)}`));
check('store-only toggle must remove deselected duplicate grievance', false,
  toggled.disputePackage.formalLetterText.includes('Violation: Duplicate Line-Item Detected'));

for (const name of ['er_visit_broken_wrist', 'outpatient_surgery']) {
  const sample = JSON.parse(fs.readFileSync(`public/samples/${name}.json`, 'utf8'));
  check(`${name}: printed disputed amounts must reconcile with the letter total`,
    sample.financials.totalPotentialSavings,
    Math.round(sample.anomalies.reduce((sum: number, a: any) => sum + a.disputedAmount, 0) * 100) / 100);
}

const result = { auditedAt: '2026-10-26', revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  syntheticOnly: true, liveProvidersUsed: false, checks,
  summary: { total: checks.length, passed: checks.filter(c => c.pass).length, failed: checks.filter(c => !c.pass).length } };
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.summary.failed ? 1 : 0;
