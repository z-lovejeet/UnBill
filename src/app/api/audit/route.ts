import { NextRequest, NextResponse } from 'next/server';
import { extractBillFromImage, extractBillFromText, generateTailoredDisputeLetterWithAI } from '@/lib/gemini';
import { compileForensicAudit } from '@/lib/rules-engine';
import { AuditReport, RawLineItem } from '@/types/audit';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, rawText, sampleId, rawBillData, billData } = body;
    const incomingBill = rawBillData || billData;

    // Route 1: Instant 1-Click Sample Intake
    if (sampleId) {
      if (sampleId !== 'outpatient_surgery' && sampleId !== 'er_visit_broken_wrist') {
        return NextResponse.json({ error: 'Sample bill not found.' }, { status: 404 });
      }
      const sampleFileName =
        sampleId === 'outpatient_surgery'
          ? 'outpatient_surgery.json'
          : 'er_visit_broken_wrist.json';
      
      const filePath = path.join(process.cwd(), 'public', 'samples', sampleFileName);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const parsedReport: AuditReport = JSON.parse(fileContent);
        // Refresh timestamp
        parsedReport.createdAt = new Date().toISOString();
        return NextResponse.json(parsedReport, { status: 200 });
      }
      return NextResponse.json({ error: 'Sample file missing from disk.' }, { status: 404 });
    }

    // Route 2: Pre-parsed Raw Bill Data (direct JSON intake)
    if (incomingBill) {
      if (!Array.isArray(incomingBill.items) || incomingBill.items.length === 0) {
        return NextResponse.json(
          { error: 'Empty itemized statement. At least one line item is required.' },
          { status: 400 }
        );
      }

      const hasInvalidAmount = incomingBill.items.some(
        (i: any) => typeof i?.billedAmount !== 'number' || isNaN(i?.billedAmount)
      );
      if (hasInvalidAmount) {
        return NextResponse.json(
          { error: 'Invalid line item amount. Billed amount must be a valid number.' },
          { status: 400 }
        );
      }

      const auditedReport = compileForensicAudit(
        incomingBill.items,
        incomingBill.facility || { name: 'Hospital Facility' },
        incomingBill.patient || { accountNumber: 'ACC-000', statementDate: new Date().toISOString().split('T')[0] },
        incomingBill.financials
      );
      return NextResponse.json(auditedReport, { status: 200 });
    }

    // Route 3: Multimodal Image or OCR Text Ingestion via Gemini Agent 1
    let extractedBill;
    if (imageBase64) {
      extractedBill = await extractBillFromImage(imageBase64, mimeType || 'image/jpeg');
    } else if (rawText && typeof rawText === 'string' && rawText.trim().length > 0) {
      extractedBill = await extractBillFromText(rawText);
    } else {
      return NextResponse.json(
        { error: 'Missing bill payload. Please provide imageBase64, rawText, or sampleId.' },
        { status: 400 }
      );
    }

    if (!extractedBill.isMedicalBill) {
      return NextResponse.json(
        {
          error: 'Document rejected',
          message:
            extractedBill.rejectionReason ||
            'The uploaded document does not appear to be an itemized medical bill or hospital statement.',
        },
        { status: 422 }
      );
    }

    // Agent 2: Run deterministic rules engine (CCI unbundling, duplicates, markups)
    const auditedReport = compileForensicAudit(
      extractedBill.items,
      extractedBill.facility,
      extractedBill.patient,
      extractedBill.financials
    );

    // Agent 3: Attempt Gemini AI letter enhancement (with deterministic fallback)
    if (process.env.GEMINI_API_KEY) {
      try {
        const tailoredLetter = await generateTailoredDisputeLetterWithAI(
          auditedReport.facility,
          auditedReport.patient,
          auditedReport.items,
          auditedReport.anomalies,
          auditedReport.financials
        );
        if (tailoredLetter && tailoredLetter.trim().length > 100) {
          auditedReport.disputePackage.formalLetterText = tailoredLetter;
        }
      } catch (err) {
        console.warn('AI letter enhancement skipped, using deterministic statutory letter:', err);
      }
    }

    return NextResponse.json(auditedReport, { status: 200 });
  } catch (error: any) {
    console.error('Audit API error:', error);

    const msg = (error?.message || '').toLowerCase();
    const status = error?.status || error?.statusCode;

    let errorCode = 'GEMINI_PROCESSING_ERROR';
    let errorTitle = 'Gemini 3.8 Flash Extraction Failed';
    let errorDescription =
      error?.message || 'An unexpected error occurred during forensic document ingestion.';
    let statusCode = 500;

    if (
      status === 429 ||
      msg.includes('429') ||
      msg.includes('quota') ||
      msg.includes('resource_exhausted') ||
      msg.includes('too many requests') ||
      msg.includes('rate limit')
    ) {
      errorCode = 'GEMINI_QUOTA_EXCEEDED';
      errorTitle = 'Gemini API Rate Limit / Quota Exceeded (429)';
      errorDescription =
        'Google Gemini 3.8 Flash has reached its per-minute rate limit or free-tier quota. Please wait a few moments and click Retry, or test instantly with one of our synthetic sample bills.';
      statusCode = 429;
    } else if (
      status === 503 ||
      status === 504 ||
      msg.includes('503') ||
      msg.includes('504') ||
      msg.includes('unavailable') ||
      msg.includes('overloaded') ||
      msg.includes('busy') ||
      msg.includes('server error')
    ) {
      errorCode = 'GEMINI_SERVER_BUSY';
      errorTitle = 'Gemini Server Busy / Temporarily Overloaded (503)';
      errorDescription =
        'Google Gemini AI servers are currently experiencing high global traffic or transient overload. Please retry in a moment.';
      statusCode = 503;
    } else if (
      status === 401 ||
      status === 403 ||
      msg.includes('401') ||
      msg.includes('403') ||
      msg.includes('api_key') ||
      msg.includes('permission_denied') ||
      msg.includes('unauthorized')
    ) {
      errorCode = 'GEMINI_AUTH_ERROR';
      errorTitle = 'Gemini API Key / Permission Error (403)';
      errorDescription =
        'The configured GEMINI_API_KEY was rejected by Google Cloud or lacks permissions. Please check server configuration.';
      statusCode = 403;
    } else if (
      msg.includes('not valid json') ||
      msg.includes('json') ||
      msg.includes('parse')
    ) {
      errorCode = 'GEMINI_PARSE_ERROR';
      errorTitle = 'Gemini Document Parsing Incomplete';
      errorDescription =
        'The vision model returned an incomplete response. Retrying or ensuring the image is clear and well-lit will resolve this.';
      statusCode = 502;
    }

    return NextResponse.json(
      {
        error: errorTitle,
        errorCode,
        message: errorDescription,
        rawDetails: error?.message || undefined,
        agentFailed: 1, // Agent 1: Clinical Ingestion
      },
      { status: statusCode }
    );
  }
}
