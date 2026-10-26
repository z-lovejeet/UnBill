import { NextRequest } from 'next/server';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { ApiError, apiFailure, guard, json, readJson, redisClient } from '@/lib/api-utils';
import { normalizeReport, redactReport } from '@/lib/reports';
import { compileForensicAudit, recalculateReport } from '@/lib/rules-engine';
import type { AuditReport } from '@/types/audit';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const TTL = 30 * 24 * 60 * 60;
const ID = /^share_[A-Za-z0-9_-]{43}$/;
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
interface SharedRecord {
  report: AuditReport;
  revokeHash: string;
  expiresAt: string;
}
const hash = (token: string) => createHash('sha256').update(token).digest('hex');
export async function POST(req: NextRequest) {
  try {
    const input = await readJson(req, 500000);
    if (input.consent !== true)
      throw new ApiError(
        400,
        'Confirm that procedure details and amounts may be visible to anyone with the link.',
      );
    let report: AuditReport;
    try {
      report = normalizeReport(input.auditReport);
    } catch {
      throw new ApiError(400, 'Supply a valid complete audit report.');
    }
    const redis = redisClient();
    if (!redis)
      throw new ApiError(503, 'Sharing is unavailable because cloud storage is not configured.');
    await guard(req, 'share', 5);
    // Recompute all findings before publication; a caller cannot supply arbitrary legal text or savings.
    const rebuilt = compileForensicAudit(
      report.items,
      report.facility,
      report.patient,
      report.financials,
    );
    rebuilt.items = rebuilt.items.map((i) => ({
      ...i,
      isDisputed: report.items.find((old) => old.id === i.id)?.isDisputed ?? false,
    }));
    const shareId = `share_${randomBytes(32).toString('base64url')}`;
    const revokeToken = randomBytes(32).toString('base64url');
    const redacted = redactReport(recalculateReport(rebuilt));
    redacted.id = shareId;
    const expiresAt = new Date(Date.now() + TTL * 1000).toISOString();
    const configured = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
    let base = new URL(req.url).origin;
    if (configured) {
      try {
        base = new URL(configured).origin;
      } catch {
        throw new ApiError(503, 'The public application URL is misconfigured.');
      }
    }
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.ALLOW_LOCAL_RATE_LIMIT !== 'true' &&
      !base.startsWith('https://')
    )
      throw new ApiError(503, 'Set APP_URL to the deployed HTTPS origin.');
    await redis.set(
      `unbill:share:v2:${shareId}`,
      { report: redacted, revokeHash: hash(revokeToken), expiresAt },
      { ex: TTL },
    );
    return json({
      shareId,
      shareUrl: `${base}/results/${shareId}`,
      revokeToken,
      expiresAt,
      redacted: true,
    });
  } catch (error) {
    return apiFailure(error);
  }
}
export async function GET(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id || !ID.test(id)) throw new ApiError(400, 'Invalid share link.');
    const redis = redisClient();
    if (!redis) throw new ApiError(503, 'Sharing is not configured.');
    await guard(req, 'share-read', 60);
    const record = await redis.get<SharedRecord>(`unbill:share:v2:${id}`);
    if (!record) throw new ApiError(404, 'This shared report has expired or was revoked.');
    return json({ ...record.report, id });
  } catch (error) {
    return apiFailure(error);
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const input = await readJson(req, 2000);
    if (
      typeof input.shareId !== 'string' ||
      !ID.test(input.shareId) ||
      typeof input.revokeToken !== 'string' ||
      !TOKEN.test(input.revokeToken)
    )
      throw new ApiError(400, 'A valid share ID and private revocation token are required.');
    const redis = redisClient();
    if (!redis) throw new ApiError(503, 'Sharing is not configured.');
    await guard(req, 'share-revoke', 20);
    const record = await redis.get<SharedRecord>(`unbill:share:v2:${input.shareId}`);
    if (!record) return json({ revoked: true });
    if (
      !timingSafeEqual(
        Buffer.from(hash(input.revokeToken), 'hex'),
        Buffer.from(record.revokeHash, 'hex'),
      )
    )
      throw new ApiError(403, 'The revocation token is invalid.');
    await redis.del(`unbill:share:v2:${input.shareId}`);
    return json({ revoked: true });
  } catch (error) {
    return apiFailure(error);
  }
}
