import { NextRequest } from 'next/server';
import { extractBillFromImage, extractBillFromText } from '@/lib/gemini';
import { compileForensicAudit } from '@/lib/rules-engine';
import { rawBillSchema, validationMessage } from '@/lib/validation';
import { ApiError, apiFailure, guard, json, readJson } from '@/lib/api-utils';
import { sampleReport } from '@/lib/samples';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  try {
    const body = await readJson(req);
    if (body.sampleId !== undefined) {
      if (typeof body.sampleId !== 'string') throw new ApiError(400, 'Invalid sample identifier.');
      return json(sampleReport(body.sampleId));
    }
    const direct = body.rawBillData ?? body.billData;
    if (direct !== undefined) {
      const valid = rawBillSchema.safeParse(direct);
      if (!valid.success) throw new ApiError(400, validationMessage(valid.error), 'INVALID_BILL');
      return json(
        compileForensicAudit(
          valid.data.items,
          valid.data.facility,
          valid.data.patient,
          valid.data.financials,
        ),
      );
    }
    if (body.consent !== true)
      throw new ApiError(
        400,
        'Confirm that the document/text may be sent to the AI provider. Use synthetic or de-identified data.',
        'CONSENT_REQUIRED',
      );
    if (
      (typeof body.imageBase64 !== 'string' || !body.imageBase64) &&
      (typeof body.rawText !== 'string' || !body.rawText.trim())
    )
      throw new ApiError(400, 'Upload a statement or paste its itemized text.');
    if (body.imageBase64 && body.rawText)
      throw new ApiError(400, 'Send one document or text payload at a time.');
    await guard(req, 'audit', 6, { ai: true });
    const bill =
      typeof body.imageBase64 === 'string'
        ? await extractBillFromImage(
            body.imageBase64,
            typeof body.mimeType === 'string' ? body.mimeType : 'image/jpeg',
            req.signal,
          )
        : await extractBillFromText(body.rawText as string, req.signal);
    if (!bill.isMedicalBill)
      throw new ApiError(
        422,
        bill.rejectionReason || 'No usable itemized medical statement was found.',
        'DOCUMENT_REJECTED',
      );
    const report = compileForensicAudit(bill.items, bill.facility, bill.patient, bill.financials);
    report.source = 'document';
    return json(report);
  } catch (error) {
    return apiFailure(error);
  }
}
