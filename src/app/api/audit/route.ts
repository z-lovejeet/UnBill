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
    }

    // Route 2: Pre-parsed Raw Bill Data (direct JSON intake)
    if (incomingBill && Array.isArray(incomingBill.items)) {
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
    return NextResponse.json(
      {
        error: 'Audit processing failed',
        message: error?.message || 'An unexpected error occurred during forensic bill audit.',
      },
      { status: 500 }
    );
  }
}
