import test from 'node:test';
import assert from 'node:assert/strict';
import { extractBillFromImage, extractBillFromText } from '../src/lib/gemini';
import { reserveGeminiPrimaryAttempt } from '../src/lib/gemini-budget';

const bill = {
  isMedicalBill: true,
  facility: { name: 'Synthetic hospital' },
  patient: { accountNumber: 'SYNTHETIC', statementDate: '2026-10-26' },
  financials: { totalBilledGross: 200, patientBalanceDue: 200 },
  items: [
    {
      id: 'one',
      code: '80053',
      rawDescription: 'Synthetic panel',
      dateOfService: '2026-10-26',
      quantity: 1,
      billedAmount: 200,
    },
  ],
};
const success = () =>
  new Response(
    JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(bill) }] } }] }),
  );

test('an image review can finish a slow fallback after the primary immediately reports busy', async (t) => {
  const previous = { ...process.env };
  const realFetch = globalThis.fetch;
  const realWarn = console.warn;
  Object.assign(process.env, {
    GEMINI_API_KEY: 'synthetic-test-key',
    GEMINI_QUOTA_SCOPE: 'slow-image-fallback-regression',
    ALLOW_LOCAL_RATE_LIMIT: 'true',
  });
  for (const key of [
    'GEMINI_MODEL',
    'GEMINI_FALLBACK_MODEL',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ])
    delete process.env[key];
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: new Date('2026-10-26T12:00:00Z') });
  t.mock.method(AbortSignal, 'timeout', (delay: number) => {
    const controller = new AbortController();
    setTimeout(
      () => controller.abort(new DOMException('Deadline exceeded', 'TimeoutError')),
      delay,
    );
    return controller.signal;
  });
  let started!: () => void;
  const fallbackStarted = new Promise<void>((resolve) => {
    started = resolve;
  });
  const models: string[] = [];
  globalThis.fetch = async (url, init) => {
    const model = new URL(String(url)).pathname.split('/').pop()!.split(':')[0];
    models.push(model);
    if (model === 'gemini-3.8-flash') return new Response('{}', { status: 503 });
    return new Promise<Response>((resolve, reject) => {
      const timer = setTimeout(() => resolve(success()), 40000);
      init?.signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(init.signal!.reason);
        },
        { once: true },
      );
      started();
    });
  };
  console.warn = () => {};
  try {
    const pending = extractBillFromImage('iVBORw0KGgo=', 'image/png');
    await fallbackStarted;
    t.mock.timers.tick(40000);
    const result = await pending;
    assert.equal(result.financials.totalBilledGross, 200);
    assert.deepEqual(models, ['gemini-3.8-flash', 'gemini-3.5-flash-lite']);
  } finally {
    globalThis.fetch = realFetch;
    console.warn = realWarn;
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});

test('stalled primary and fallback requests share one 90-second deadline', async (t) => {
  const previous = { ...process.env };
  const realFetch = globalThis.fetch;
  const realWarn = console.warn;
  Object.assign(process.env, {
    GEMINI_API_KEY: 'synthetic-test-key',
    GEMINI_QUOTA_SCOPE: 'overall-deadline-regression',
    ALLOW_LOCAL_RATE_LIMIT: 'true',
  });
  for (const key of [
    'GEMINI_MODEL',
    'GEMINI_FALLBACK_MODEL',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ])
    delete process.env[key];
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: new Date('2026-10-26T12:00:00Z') });
  t.mock.method(AbortSignal, 'timeout', (delay: number) => {
    const controller = new AbortController();
    setTimeout(
      () => controller.abort(new DOMException('Deadline exceeded', 'TimeoutError')),
      delay,
    );
    return controller.signal;
  });
  let primaryReady!: () => void;
  let fallbackReady!: () => void;
  const primaryStarted = new Promise<void>((resolve) => {
    primaryReady = resolve;
  });
  const fallbackStarted = new Promise<void>((resolve) => {
    fallbackReady = resolve;
  });
  const models: string[] = [];
  globalThis.fetch = async (url, init) => {
    const model = new URL(String(url)).pathname.split('/').pop()!.split(':')[0];
    models.push(model);
    return new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal!.reason), { once: true });
      if (model === 'gemini-3.8-flash') primaryReady();
      else fallbackReady();
    });
  };
  console.warn = () => {};
  try {
    let settled = false;
    const pending = extractBillFromImage('iVBORw0KGgo=', 'image/png');
    const rejected = assert.rejects(pending, { code: 'GEMINI_TIMEOUT', status: 504 });
    pending.catch(() => {
      settled = true;
    });
    await primaryStarted;
    t.mock.timers.tick(18000);
    await fallbackStarted;
    t.mock.timers.tick(71999);
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(settled, false);
    t.mock.timers.tick(1);
    await rejected;
    assert.deepEqual(models, ['gemini-3.8-flash', 'gemini-3.5-flash-lite']);
  } finally {
    globalThis.fetch = realFetch;
    console.warn = realWarn;
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});

test('concurrent reviews send at most 18 daily attempts to Flash 3.8 and route the rest to Flash-Lite 3.5', async () => {
  const previous = { ...process.env };
  const realFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = 'synthetic-test-key';
  process.env.ALLOW_LOCAL_RATE_LIMIT = 'true';
  delete process.env.GEMINI_MODEL;
  delete process.env.GEMINI_FALLBACK_MODEL;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  const models: string[] = [];
  globalThis.fetch = async (url, init) => {
    const model = new URL(String(url)).pathname.split('/').pop()!.split(':')[0];
    models.push(model);
    const config = JSON.parse(String(init?.body)).generationConfig;
    if (model === 'gemini-3.8-flash') {
      assert.equal(config.temperature, undefined);
      assert.deepEqual(config.thinkingConfig, { thinkingLevel: 'low' });
    }
    return success();
  };
  try {
    const results = await Promise.all(
      Array.from({ length: 24 }, () => extractBillFromText('Synthetic statement')),
    );
    assert.equal(results.length, 24);
    assert.equal(models.filter((m) => m === 'gemini-3.8-flash').length, 18);
    assert.equal(models.filter((m) => m === 'gemini-3.5-flash-lite').length, 6);
  } finally {
    globalThis.fetch = realFetch;
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});

test('a confirmed provider daily quota error sends subsequent reviews directly to the fallback', async () => {
  const previous = { ...process.env };
  const realFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = 'synthetic-test-key';
  process.env.GEMINI_QUOTA_SCOPE = 'daily-quota-regression';
  process.env.ALLOW_LOCAL_RATE_LIMIT = 'true';
  for (const key of [
    'GEMINI_MODEL',
    'GEMINI_FALLBACK_MODEL',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ])
    delete process.env[key];
  const models: string[] = [];
  globalThis.fetch = async (url) => {
    const model = new URL(String(url)).pathname.split('/').pop()!.split(':')[0];
    models.push(model);
    return model === 'gemini-3.8-flash'
      ? new Response(
          JSON.stringify({
            error: {
              status: 'RESOURCE_EXHAUSTED',
              details: [
                {
                  violations: [
                    {
                      quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier',
                      quotaValue: '20',
                    },
                  ],
                },
              ],
            },
          }),
          { status: 429 },
        )
      : success();
  };
  try {
    await extractBillFromText('Synthetic statement');
    await extractBillFromText('Synthetic statement');
    assert.deepEqual(models, [
      'gemini-3.8-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash-lite',
    ]);
  } finally {
    globalThis.fetch = realFetch;
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});

test('the primary quota follows Pacific midnight rather than UTC midnight', async (t) => {
  const previous = { ...process.env };
  process.env.GEMINI_QUOTA_SCOPE = 'pacific-reset-regression';
  process.env.ALLOW_LOCAL_RATE_LIMIT = 'true';
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-26T23:59:59Z') });
  try {
    for (let index = 0; index < 18; index++)
      assert.equal(await reserveGeminiPrimaryAttempt('gemini-3.8-flash'), true);
    t.mock.timers.setTime(new Date('2026-10-27T00:00:01Z').getTime());
    assert.equal(await reserveGeminiPrimaryAttempt('gemini-3.8-flash'), false);
    t.mock.timers.setTime(new Date('2026-10-27T07:00:01Z').getTime());
    assert.equal(await reserveGeminiPrimaryAttempt('gemini-3.8-flash'), true);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});

test('an unavailable model is not reported as quota exhaustion and provider details stay private', async () => {
  const previous = { ...process.env };
  const realFetch = globalThis.fetch;
  const realWarn = console.warn;
  const logs: unknown[][] = [];
  process.env.GEMINI_API_KEY = 'synthetic-test-key';
  process.env.GEMINI_QUOTA_SCOPE = 'unavailable-model-regression';
  process.env.ALLOW_LOCAL_RATE_LIMIT = 'true';
  for (const key of [
    'GEMINI_MODEL',
    'GEMINI_FALLBACK_MODEL',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ])
    delete process.env[key];
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        error: { message: 'PRIVATE_SYNTHETIC_NAME synthetic-test-key', status: 'NOT_FOUND' },
      }),
      { status: 404 },
    );
  console.warn = (...args) => {
    logs.push(args);
  };
  try {
    await assert.rejects(extractBillFromText('Synthetic statement'), (error: unknown) => {
      assert.equal((error as { code: string }).code, 'GEMINI_MODEL_UNAVAILABLE');
      assert.doesNotMatch(
        (error as Error).message,
        /quota|PRIVATE_SYNTHETIC_NAME|synthetic-test-key/,
      );
      return true;
    });
    assert.equal(logs.length, 2);
    assert.doesNotMatch(JSON.stringify(logs), /PRIVATE_SYNTHETIC_NAME|synthetic-test-key/);
  } finally {
    globalThis.fetch = realFetch;
    console.warn = realWarn;
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});

test('public extraction skips the primary if a shared quota ledger is not configured', async () => {
  const previous = { ...process.env };
  const realFetch = globalThis.fetch;
  Object.assign(process.env, {
    NODE_ENV: 'production',
    GEMINI_API_KEY: 'synthetic-test-key',
    GEMINI_QUOTA_SCOPE: 'missing-ledger-regression',
  });
  for (const key of [
    'ALLOW_LOCAL_RATE_LIMIT',
    'GEMINI_MODEL',
    'GEMINI_FALLBACK_MODEL',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ])
    delete process.env[key];
  const models: string[] = [];
  globalThis.fetch = async (url) => {
    models.push(new URL(String(url)).pathname.split('/').pop()!.split(':')[0]);
    return success();
  };
  try {
    await extractBillFromText('Synthetic statement');
    assert.deepEqual(models, ['gemini-3.5-flash-lite']);
  } finally {
    globalThis.fetch = realFetch;
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});
