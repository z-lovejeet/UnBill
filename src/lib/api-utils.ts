import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { createHash } from 'node:crypto';
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = 'REQUEST_FAILED',
  ) {
    super(message);
  }
}
export function redisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token && !url.includes('YOUR_UPSTASH') ? new Redis({ url, token }) : null;
}
const windows = new Map<string, { count: number; expires: number }>();
const incrementScript =
  "local n=redis.call('INCR',KEYS[1]);if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end;return n";
async function count(key: string, seconds: number) {
  const redis = redisClient();
  if (redis) {
    try {
      return Number(await redis.eval(incrementScript, [key], [seconds]));
    } catch {
      throw new ApiError(
        503,
        'Request protection is temporarily unavailable. Please try again.',
        'GUARD_UNAVAILABLE',
      );
    }
  }
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_LOCAL_RATE_LIMIT !== 'true')
    throw new ApiError(
      503,
      'Configure Redis request protection before enabling public AI endpoints.',
      'GUARD_NOT_CONFIGURED',
    );
  const now = Date.now();
  if (windows.size > 1000) for (const [k, v] of windows) if (v.expires <= now) windows.delete(k);
  const old = windows.get(key);
  const entry = old && old.expires > now ? old : { count: 0, expires: now + seconds * 1000 };
  entry.count++;
  windows.set(key, entry);
  return entry.count;
}
export async function guard(req: NextRequest, feature: string, limit: number, { ai = false } = {}) {
  const origin = req.headers.get('origin');
  const allowed = [new URL(req.url).origin];
  const host = req.headers.get('host');
  if (
    process.env.ALLOW_LOCAL_RATE_LIMIT === 'true' &&
    host &&
    /^(localhost|127\.0\.0\.1):\d+$/.test(host)
  )
    allowed.push(`http://${host}`);
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      allowed.push(new URL(appUrl).origin);
    } catch {
      /* Verified by deployment health check. */
    }
  }
  if (origin && !allowed.includes(origin)) throw new ApiError(403, 'This origin is not allowed.');
  const trusted = process.env.VERCEL === '1' || process.env.TRUST_PROXY === 'true';
  const ip = trusted
    ? req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    : 'local';
  const digest = createHash('sha256').update(ip).digest('hex').slice(0, 32);
  if (
    (await count(`unbill:limits:${feature}:${digest}:${Math.floor(Date.now() / 60000)}`, 60)) >
    limit
  )
    throw new ApiError(429, 'Too many requests. Wait a minute before trying again.', 'RATE_LIMIT');
  if (ai) {
    const configured = Number(process.env.AI_DAILY_REQUEST_LIMIT || 200);
    const cap = Number.isInteger(configured) && configured > 0 ? configured : 200;
    if ((await count(`unbill:limits:ai-day:${new Date().toISOString().slice(0, 10)}`, 86400)) > cap)
      throw new ApiError(
        429,
        'The daily AI request budget has been reached. Synthetic examples remain available.',
        'DAILY_LIMIT',
      );
  }
}
export async function readJson(
  req: NextRequest,
  maxBytes = 3_600_000,
): Promise<Record<string, unknown>> {
  const length = Number(req.headers.get('content-length') || 0);
  if (length > maxBytes)
    throw new ApiError(413, 'Request is too large. Upload a file no larger than 2.5 MB.');
  if (!req.headers.get('content-type')?.includes('application/json'))
    throw new ApiError(415, 'Send application/json.');
  const reader = req.body?.getReader();
  if (!reader) throw new ApiError(400, 'Request body is required.');
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maxBytes) {
      await reader.cancel();
      throw new ApiError(413, 'Request exceeds the supported size.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    const value = JSON.parse(new TextDecoder().decode(bytes));
    if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error();
    return value;
  } catch {
    throw new ApiError(400, 'Request body must be a valid JSON object.', 'INVALID_JSON');
  }
}
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      ...(status === 429 ? { 'Retry-After': '60' } : {}),
    },
  });
}
export function apiFailure(error: unknown) {
  if (error instanceof ApiError)
    return json({ error: error.message, errorCode: error.code }, error.status);
  return json(
    {
      error: 'The request could not be completed. Please retry or use a synthetic example.',
      errorCode: 'INTERNAL_ERROR',
    },
    500,
  );
}
