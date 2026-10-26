import { json } from '@/lib/api-utils';
export const dynamic = 'force-dynamic';
export function GET() {
  const configured = {
    extraction: !!process.env.GEMINI_API_KEY,
    coach: !!process.env.GROQ_API_KEY,
    sharing: !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN,
    publicHttps: !!(process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL)?.startsWith('https://'),
  };
  return json({
    status: 'ok',
    configured,
    dataMode: 'synthetic-or-deidentified',
    checks: 'Configuration presence only; live service verification requires the smoke suite.',
  });
}
