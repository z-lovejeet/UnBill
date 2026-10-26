import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { NextRequest } from 'next/server';
import {
  compileForensicAudit,
  recalculateReport,
  itemReviewAmount,
  auditDuplicateCharges,
  auditUnbundling,
  findBenchmark,
} from '../src/lib/rules-engine';
import { rawBillSchema } from '../src/lib/validation';
import { extractBillFromText } from '../src/lib/gemini';
import { redactReport, normalizeReport } from '../src/lib/reports';
import { encryptVault, decryptVault } from '../src/lib/vault-storage';
import { POST } from '../src/app/api/audit/route';
const item = {
  id: 'one',
  code: '80053',
  rawDescription: 'SYNTHETIC PANEL',
  dateOfService: '2026-10-01',
  quantity: 1,
  billedAmount: 200,
};
const facility = { name: 'SYNTHETIC FACILITY', address: 'Private address' };
const patient = {
  patientName: 'PRIVATE_SYNTHETIC_NAME',
  accountNumber: 'PRIVATE-ACCOUNT',
  statementDate: '2026-10-02',
};
const make = () =>
  compileForensicAudit([item, { ...item, id: 'two' }], facility, patient, {
    patientBalanceDue: 0,
    insurancePaid: 400,
  });
const request = (body: unknown) =>
  new NextRequest('http://localhost:3000/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
test('reconciles each selected item once across package, closing and phone guide', () => {
  let r = make();
  assert.equal(r.financials.totalPotentialSavings, 322);
  r.items[1].isDisputed = false;
  r = recalculateReport(r);
  assert.equal(r.financials.totalPotentialSavings, 122);
  assert.match(r.disputePackage.formalLetterText, /Total Disputed Amount: \$122.00/);
  assert.doesNotMatch(r.disputePackage.formalLetterText, /Possible duplicate charge/);
  assert.match(r.disputePackage.formalLetterText, /request review of \$122.00/);
  assert.match(r.disputePackage.phoneNegotiationPoints[1], /\$122.00/);
  const amounts = [
    ...r.disputePackage.formalLetterText.matchAll(/Amount requested for review: \$([\d.]+)/g),
  ].map((m) => Number(m[1]));
  assert.equal(
    amounts.reduce((s, n) => s + n, 0),
    r.financials.totalPotentialSavings,
  );
});
test('empty selection produces an honest zero-amount letter', () => {
  const r = make();
  r.items.forEach((i) => (i.isDisputed = false));
  const updated = recalculateReport(r);
  assert.equal(updated.financials.totalPotentialSavings, 0);
  assert.match(updated.disputePackage.formalLetterText, /No charges are selected/);
  assert.doesNotMatch(updated.disputePackage.formalLetterText, /automatic.*stay[^.]*in effect/);
});
test('keeps zero patient balance; missing balance is unknown', () => {
  assert.equal(make().financials.patientResponsibility, 0);
  assert.equal(
    compileForensicAudit([item], facility, patient).financials.patientResponsibility,
    null,
  );
});
test('reference differences do not become legal caps or official prices', () => {
  const r = make();
  assert.ok(r.warnings.some((w) => w.includes('illustrative')));
  assert.ok(itemReviewAmount(r.items[1]) <= item.billedAmount);
  assert.doesNotMatch(
    r.disputePackage.formalLetterText,
    /strictly prohibited|legally required|must cease immediately/,
  );
});
test('unknown/inferred codes get no invented reference', () => {
  assert.equal(findBenchmark('UNKNOWN'), undefined);
  assert.equal(findBenchmark('80053 (Inferred)'), undefined);
});
test('date and repeat modifiers constrain duplicate/panel checks', () => {
  assert.equal(auditDuplicateCharges([item, { ...item, id: 'two', modifiers: ['91'] }]).length, 0);
  assert.equal(
    auditDuplicateCharges([item, { ...item, id: 'two', dateOfService: '10/01/2026' }]).length,
    1,
  );
  assert.equal(
    auditUnbundling([item, { ...item, id: 'child', code: '82040', dateOfService: '2026-10-02' }])
      .length,
    0,
  );
  assert.equal(auditUnbundling([item, { ...item, id: 'child', code: '82040' }]).length, 1);
  assert.equal(
    auditDuplicateCharges([
      { ...item, dateOfService: '' },
      { ...item, id: 'two', dateOfService: '' },
    ]).length,
    0,
  );
});
test('raw schema rejects negative/invalid amounts, dates, quantities and duplicate IDs', () => {
  for (const bad of [
    { ...item, billedAmount: -100 },
    { ...item, billedAmount: NaN },
    { ...item, quantity: -2 },
    { ...item, quantity: 1.5 },
    { ...item, dateOfService: '2026-02-31' },
    { ...item, code: 123 },
  ])
    assert.equal(rawBillSchema.safeParse({ items: [bad] }).success, false);
  assert.equal(rawBillSchema.safeParse({ items: [item, item] }).success, false);
  assert.equal(
    rawBillSchema.safeParse({ items: [item], financials: { totalBilledGross: 500 } }).success,
    false,
  );
});
test('encrypted vault cannot be read with Base64 and detects tampering', async () => {
  const text = JSON.stringify(make());
  const a = await encryptVault(text),
    b = await encryptVault(text);
  assert.notEqual(a, b);
  assert.ok(!a.includes(patient.patientName));
  assert.equal(await decryptVault(a), text);
  const envelope = JSON.parse(a);
  envelope.ciphertext = 'AAAA' + envelope.ciphertext.slice(4);
  await assert.rejects(decryptVault(JSON.stringify(envelope)));
});
test('redaction removes direct identifiers from every serialized field', () => {
  const shared = redactReport(make());
  const text = JSON.stringify(shared);
  for (const sensitive of [
    patient.patientName,
    patient.accountNumber,
    facility.name,
    facility.address,
    '2026-10-01',
  ])
    assert.ok(!text.includes(sensitive), sensitive);
  assert.equal(
    normalizeReport(shared).financials.totalPotentialSavings,
    shared.financials.totalPotentialSavings,
  );
});
test('malformed and invalid structured API requests return client errors', async () => {
  for (const body of [
    '{',
    { rawBillData: { items: [] } },
    { rawBillData: { items: [{ ...item, billedAmount: -100 }] } },
    { rawBillData: { items: [{ ...item, code: 123 }] } },
  ]) {
    const response = await POST(request(body));
    assert.equal(response.status, 400);
    assert.ok(!(await response.text()).includes(patient.patientName));
  }
});
test('sample API rejects unknown identifiers and runs supported samples', async () => {
  assert.equal((await POST(request({ sampleId: 'invalid' }))).status, 404);
  const response = await POST(request({ sampleId: 'er_visit_broken_wrist' }));
  assert.equal(response.status, 200);
  const report = await response.json();
  assert.equal(report.source, 'sample');
  assert.equal(
    report.items.reduce((s: number, i: { billedAmount: number }) => s + i.billedAmount, 0),
    report.financials.totalBilledGross,
  );
});
test('document processing requires explicit consent', async () => {
  assert.equal((await POST(request({ rawText: 'synthetic' }))).status, 400);
});
test('model validation preserves unknown code and rejects a string false flag', async () => {
  const original = globalThis.fetch;
  const key = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'synthetic-test';
  let data: unknown = {
    isMedicalBill: true,
    facility,
    patient,
    financials: { totalBilledGross: 200, patientBalanceDue: 0 },
    items: [{ ...item, code: '' }],
  };
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(data) }] } }] }),
    );
  try {
    assert.equal((await extractBillFromText('synthetic')).items[0].code, '');
    data = { ...(data as object), isMedicalBill: 'false' };
    await assert.rejects(extractBillFromText('synthetic'));
  } finally {
    globalThis.fetch = original;
    if (key === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = key;
  }
});
test('parser failure never logs raw provider snippets', async () => {
  const original = globalThis.fetch;
  const logger = console.error;
  const captured: unknown[][] = [];
  const key = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'synthetic-test';
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        candidates: [{ content: { parts: [{ text: 'PRIVATE_SYNTHETIC_NAME not JSON' }] } }],
      }),
    );
  console.error = (...args) => captured.push(args);
  try {
    await assert.rejects(extractBillFromText('synthetic'));
    assert.equal(captured.length, 0);
  } finally {
    globalThis.fetch = original;
    console.error = logger;
    if (key === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = key;
  }
});
test('fallback handles transient provider limits without changing bill facts', async () => {
  const original = globalThis.fetch;
  const key = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'synthetic-test';
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return calls === 1
      ? new Response('{}', { status: 429 })
      : new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        isMedicalBill: true,
                        facility,
                        patient,
                        financials: { totalBilledGross: 200, patientBalanceDue: 0 },
                        items: [item],
                      }),
                    },
                  ],
                },
              },
            ],
          }),
        );
  };
  try {
    const bill = await extractBillFromText('synthetic');
    assert.equal(calls, 2);
    assert.equal(bill.financials.patientBalanceDue, 0);
  } finally {
    globalThis.fetch = original;
    if (key === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = key;
  }
});

test('store toggle persists a regenerated package without stale amounts', async () => {
  const memory = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => memory.set(k, v),
      removeItem: (k: string) => memory.delete(k),
    },
  });
  const { useAuditStore } = await import('../src/lib/store');
  useAuditStore.getState().setAudit(make());
  useAuditStore.getState().toggleItemDispute('two');
  const changed = useAuditStore.getState().currentReport!;
  assert.equal(changed.financials.totalPotentialSavings, 122);
  assert.match(changed.disputePackage.formalLetterText, /Total Disputed Amount: \$122.00/);
  assert.equal(useAuditStore.getState().history[0].items[1].isDisputed, false);
  const { encryptedStateStorage } = await import('../src/lib/vault-storage');
  const saved = await encryptedStateStorage.getItem('unbill_vault_v2');
  assert.ok(saved?.includes('PRIVATE_SYNTHETIC_NAME'));
  assert.ok(!memory.get('unbill_vault_v2')?.includes('PRIVATE_SYNTHETIC_NAME'));
});
test('share IDs survive normalization without rebuilding anonymized dates', () => {
  const shared = redactReport(make());
  shared.id = 'share_' + 'A'.repeat(43);
  const read = normalizeReport(shared);
  assert.equal(read.id, shared.id);
  assert.equal(read.source, 'shared');
  assert.equal(read.financials.totalPotentialSavings, shared.financials.totalPotentialSavings);
});
test('guard accepts the configured runtime origin and rejects cross-origin requests', async () => {
  const { guard } = await import('../src/lib/api-utils');
  const oldApp = process.env.APP_URL,
    oldLocal = process.env.ALLOW_LOCAL_RATE_LIMIT,
    oldUrl = process.env.UPSTASH_REDIS_REST_URL,
    oldToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  Object.assign(process.env, {
    APP_URL: 'http://127.0.0.1:3107',
    ALLOW_LOCAL_RATE_LIMIT: 'true',
    UPSTASH_REDIS_REST_URL: '',
    UPSTASH_REDIS_REST_TOKEN: '',
  });
  try {
    await guard(
      new NextRequest('http://localhost:3107/api/chat', {
        headers: { Origin: 'http://127.0.0.1:3107' },
      }),
      'origin-regression',
      10,
    );
    await assert.rejects(
      guard(
        new NextRequest('http://localhost:3107/api/chat', {
          headers: { Origin: 'https://unrelated.invalid' },
        }),
        'origin-regression',
        10,
      ),
    );
    for (let n = 0; n < 3; n++)
      await guard(new NextRequest('http://localhost:3107/api/chat'), 'limit-regression', 3);
    await assert.rejects(
      guard(new NextRequest('http://localhost:3107/api/chat'), 'limit-regression', 3),
    );
  } finally {
    for (const [key, value] of Object.entries({
      APP_URL: oldApp,
      ALLOW_LOCAL_RATE_LIMIT: oldLocal,
      UPSTASH_REDIS_REST_URL: oldUrl,
      UPSTASH_REDIS_REST_TOKEN: oldToken,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
