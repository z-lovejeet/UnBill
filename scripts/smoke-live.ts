import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const base = (process.env.UNBILL_SMOKE_URL || 'http://127.0.0.1:3107').replace(/\/$/, '');
if (!/^https:\/\//.test(base) && !/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base))
  throw new Error('Use an explicit localhost test server or HTTPS deployment.');
const checks: Array<{ name: string; pass: boolean; details?: unknown }> = [];
async function check(name: string, fn: () => Promise<unknown>) {
  try {
    const details = await fn();
    checks.push({ name, pass: true, details });
    console.log(`PASS ${name}`);
  } catch (e) {
    checks.push({ name, pass: false, details: e instanceof Error ? e.message : 'Failed' });
    console.log(`FAIL ${name}: ${e instanceof Error ? e.message : 'Failed'}`);
  }
}
const assert = (ok: unknown, message: string) => {
  if (!ok) throw new Error(message);
};
async function post(path: string, body: unknown) {
  const t = Date.now();
  const response = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(50000),
  });
  const data = await response.json();
  return { response, data, ms: Date.now() - t };
}
const sample = JSON.parse(fs.readFileSync('public/samples/er_visit_broken_wrist.json', 'utf8'));
async function main() {
  await check('production health and security headers', async () => {
    const r = await fetch(`${base}/api/health`);
    const d = await r.json();
    assert(r.status === 200, 'Health endpoint failed.');
    for (const header of [
      'content-security-policy',
      'x-content-type-options',
      'referrer-policy',
      'x-frame-options',
    ])
      assert(r.headers.has(header), `Missing ${header}`);
    return d;
  });
  for (const id of ['er_visit_broken_wrist', 'outpatient_surgery'])
    await check(`sample rules path: ${id}`, async () => {
      const { response, data } = await post('/api/audit', { sampleId: id });
      assert(response.status === 200, data.error);
      assert(
        data.items.reduce((s: number, i: { billedAmount: number }) => s + i.billedAmount, 0) ===
          data.financials.totalBilledGross,
        'Sample totals differ.',
      );
      assert(data.source === 'sample', 'Sample mode label missing.');
      return {
        items: data.items.length,
        gross: data.financials.totalBilledGross,
        review: data.financials.totalPotentialSavings,
      };
    });
  for (const kind of ['text', 'image', 'pdf'])
    await check(`live Gemini ${kind} extraction`, async () => {
      const file = `public/samples/er_visit_broken_wrist.${kind === 'image' ? 'png' : kind === 'pdf' ? 'pdf' : 'txt'}`;
      const payload =
        kind === 'text'
          ? { rawText: fs.readFileSync(file, 'utf8'), consent: true }
          : {
              imageBase64: fs.readFileSync(file).toString('base64'),
              mimeType: kind === 'pdf' ? 'application/pdf' : 'image/png',
              consent: true,
            };
      const { response, data, ms } = await post('/api/audit', payload);
      assert(response.status === 200, data.error || 'Extraction failed.');
      assert(
        data.items.length === sample.items.length,
        `Expected ${sample.items.length} rows; got ${data.items.length}.`,
      );
      assert(
        data.financials.totalBilledGross === sample.financials.totalBilledGross,
        'Extracted gross does not match the synthetic source.',
      );
      assert(
        data.financials.patientResponsibility === sample.financials.patientResponsibility,
        'Extracted patient balance differs from source.',
      );
      assert(
        data.financials.insuranceAdjustments === sample.financials.insuranceAdjustments,
        'Extracted insurance adjustments differ from source.',
      );
      return { ms, items: data.items.length, gross: data.financials.totalBilledGross };
    });
  await check('unrelated text rejected with recoverable error', async () => {
    const { response } = await post('/api/audit', {
      rawText:
        'SYNTHETIC RESTAURANT RECEIPT: One coffee $4, one sandwich $6, total $10. No medical care.',
      consent: true,
    });
    assert(response.status === 422, 'Expected document rejection.');
    return { status: response.status };
  });
  await check('live Groq streaming through application route', async () => {
    const t = Date.now();
    const response = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consent: true,
        messages: [
          {
            role: 'user',
            content:
              'In one short sentence, what should I ask when a statement has a repeated charge?',
          },
        ],
        auditContext: sample,
      }),
      signal: AbortSignal.timeout(35000),
    });
    assert(response.ok, 'Coach request failed.');
    const reader = response.body!.getReader();
    let bytes = 0,
      ttft = 0;
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      if (next.value.length && !ttft) ttft = Date.now() - t;
      bytes += next.value.length;
    }
    assert(bytes > 0, 'No streamed output.');
    return { firstContentMs: ttft, totalMs: Date.now() - t, bytes };
  });
  await check('redacted share round trip, revocation authorization and expiry state', async () => {
    let share: { shareId: string; revokeToken: string; shareUrl: string } | undefined;
    try {
      const created = await post('/api/share', { auditReport: sample, consent: true });
      assert(created.response.status === 200, created.data.error);
      share = created.data;
      const fetched = await fetch(`${base}/api/share?id=${share!.shareId}`);
      const data = await fetched.json();
      assert(fetched.status === 200, 'Shared report not retrievable.');
      assert(data.id === share!.shareId, 'Shared route and report IDs differ.');
      for (const value of [
        sample.patient.patientName,
        sample.patient.accountNumber,
        sample.facility.name,
        sample.facility.address,
      ])
        if (value) assert(!JSON.stringify(data).includes(value), 'Direct identifier leaked.');
      assert(
        data.financials.totalPotentialSavings === sample.financials.totalPotentialSavings,
        'Share changed selected totals.',
      );
      const wrong = await fetch(`${base}/api/share`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId: share!.shareId, revokeToken: 'A'.repeat(43) }),
      });
      assert(wrong.status === 403, 'Wrong token was accepted.');
      const revoked = await fetch(`${base}/api/share`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(share),
      });
      assert(revoked.status === 200, 'Revocation failed.');
      assert(
        (await fetch(`${base}/api/share?id=${share!.shareId}`)).status === 404,
        'Revoked report is still retrievable.',
      );
      return {
        shareOrigin: new URL(share!.shareUrl).origin,
        identifierMatches: true,
        revoked: true,
      };
    } finally {
      if (share)
        await fetch(`${base}/api/share`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(share),
        });
    }
  });
  const result = {
    checkedAt: new Date().toISOString(),
    base,
    revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    workingDiffSha256: createHash('sha256')
      .update(
        execFileSync('git', [
          'diff',
          'HEAD',
          '--',
          'src',
          'package.json',
          'package-lock.json',
          'next.config.ts',
          'data',
          'public/samples',
        ]),
      )
      .digest('hex'),
    syntheticOnly: true,
    checks,
    summary: {
      total: checks.length,
      passed: checks.filter((c) => c.pass).length,
      failed: checks.filter((c) => !c.pass).length,
    },
  };
  fs.mkdirSync('docs/audits/2026-10-26', { recursive: true });
  fs.writeFileSync(
    `docs/audits/2026-10-26/release-live-${base.startsWith('https://') ? 'production' : 'local'}.json`,
    JSON.stringify(result, null, 2) + '\n',
  );
  fs.writeFileSync(
    'docs/audits/2026-10-26/release-live-verification.json',
    JSON.stringify(result, null, 2) + '\n',
  );
  console.log(JSON.stringify(result.summary));
  process.exitCode = result.summary.failed ? 1 : 0;
}
main().catch(() => {
  console.error('Live verification could not start. Check the server and test configuration.');
  process.exitCode = 1;
});
