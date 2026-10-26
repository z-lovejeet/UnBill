import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { AuditReport } from '@/types/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url.includes('YOUR_UPSTASH')) {
    return null;
  }
  return new Redis({ url, token });
}

export async function POST(req: NextRequest) {
  try {
    const { auditReport } = (await req.json()) as { auditReport: AuditReport };
    if (!auditReport) {
      return NextResponse.json({ error: 'Missing audit report payload' }, { status: 400 });
    }

    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json(
        { error: 'Cloud sharing storage is disabled or unavailable in this environment.' },
        { status: 503 }
      );
    }

    const shareId = `share_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    // Store report with 30-day expiration (2,592,000 seconds)
    await redis.set(`unbill:share:${shareId}`, JSON.stringify(auditReport), {
      ex: 60 * 60 * 24 * 30,
    });

      // Increment global anonymous audit counter
      try {
        await redis.incr('unbill:global:audits_count');
        await redis.incrbyfloat(
          'unbill:global:disputed_savings',
          auditReport.financials.totalPotentialSavings || 0
        );
      } catch (counterErr) {
        console.warn('Non-critical: Redis counter update skipped:', counterErr);
      }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/results/${shareId}`;

    return NextResponse.json({
      shareId,
      shareUrl,
      persistedInRedis: !!redis,
    });
  } catch (err: any) {
    console.error('Share API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate share link' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Share ID required' }, { status: 400 });
    }

    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json(
        { error: 'Cloud sharing storage is not active in this environment.' },
        { status: 503 }
      );
    }

    const data = await redis.get<string>(`unbill:share:${id}`);
    if (!data) {
      return NextResponse.json({ error: 'Audit report not found or expired.' }, { status: 404 });
    }

    const report: AuditReport = typeof data === 'string' ? JSON.parse(data) : data;
    return NextResponse.json(report);
  } catch (err: any) {
    console.error('Share retrieval error:', err);
    return NextResponse.json({ error: 'Failed to retrieve shared report' }, { status: 500 });
  }
}
