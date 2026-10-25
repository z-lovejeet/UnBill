import { GoogleGenerativeAI } from '@google/generative-ai';
import { RawLineItem, FacilityMetadata, PatientMetadata, FinancialSummary, AnomalyReport } from '@/types/audit';

export interface RawBillData {
  isMedicalBill: boolean;
  rejectionReason?: string;
  facility: FacilityMetadata;
  patient: PatientMetadata;
  financials: {
    totalBilledGross: number;
    insurancePaid?: number;
    patientBalanceDue: number;
  };
  items: RawLineItem[];
}

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenerativeAI(apiKey);
}

const EXTRACTION_SYSTEM_INSTRUCTION = `
You are the Clinical Ingestion Agent for UnBill, a forensic hospital billing audit system.
Your mission is to extract structured clinical and financial data from the provided medical bill, itemized hospital statement, or Explanation of Benefits (EOB).

CRITICAL EXTRACTION RULES:
1. Examine the image or text. Determine if this is an itemized medical bill, hospital statement, pharmacy ledger, or EOB.
   - If it is clearly NOT a medical document (e.g. restaurant receipt, selfie, landscape, unrelated invoice), set "isMedicalBill": false and describe "rejectionReason".
2. Extract the Facility / Hospital Name, Billing Department Address/Phone (if present), Statement or Service Date, and Patient Account or Invoice Number.
3. Extract EVERY line item into the "items" array:
   - "id": A unique string like "item-1", "item-2".
   - "code": Standard 5-digit CPT code or alphanumeric HCPCS code (e.g., 99285, 80053, 73130, 36415, J7030). If the code is missing or hidden on the bill, infer the most accurate 5-digit CPT code from the description and append "(Inferred)".
   - "rawDescription": Exact description as printed on the statement.
   - "dateOfService": Specific date in YYYY-MM-DD or MM/DD/YYYY format.
   - "quantity": Number of units billed (default to 1 if not stated).
   - "billedAmount": The gross charge for this specific line item as a clean float (e.g., 450.00). Do NOT include dollar signs or commas.
4. Extract the gross total billed, insurance adjustments/payments if noted, and patient responsibility amount.
5. You MUST return ONLY a valid, parseable JSON object matching the schema below. Do not wrap in conversational filler.

SCHEMA:
{
  "isMedicalBill": true,
  "rejectionReason": null,
  "facility": {
    "name": "Hospital Name",
    "address": "123 Health Ave, City, State",
    "billingPhone": "800-555-0199"
  },
  "patient": {
    "accountNumber": "ACC-992819",
    "statementDate": "2026-09-14",
    "patientName": "Patient Name or Optional"
  },
  "financials": {
    "totalBilledGross": 5420.00,
    "insurancePaid": 0,
    "patientBalanceDue": 5420.00
  },
  "items": [
    {
      "id": "item-1",
      "code": "99285",
      "rawDescription": "EMERGENCY DEPT VISIT LEVEL 5",
      "dateOfService": "2026-09-14",
      "quantity": 1,
      "billedAmount": 2850.00
    }
  ]
}
`;

/**
 * Extracts raw structured bill data from an image file (base64) using Gemini multimodal vision.
 */
export async function extractBillFromImage(
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<RawBillData> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: DEFAULT_GEMINI_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
    systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION,
  });

  // Strip prefix if included (e.g. "data:image/png;base64,")
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

  const result = await model.generateContent([
    {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType || 'image/jpeg',
      },
    },
    {
      text: 'Extract all hospital facility details, patient account numbers, and itemized billing line items into the required JSON schema.',
    },
  ]);

  const responseText = result.response.text();
  try {
    const parsed = JSON.parse(responseText);
    return sanitizeRawBillData(parsed);
  } catch (err) {
    console.error('Failed to parse Gemini JSON response:', responseText, err);
    throw new Error('Gemini extraction output was not valid JSON.');
  }
}

/**
 * Extracts raw structured bill data from pasted text or OCR text using Gemini.
 */
export async function extractBillFromText(rawText: string): Promise<RawBillData> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: DEFAULT_GEMINI_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
    systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION,
  });

  const result = await model.generateContent([
    {
      text: `Analyze the following medical bill statement text and extract all line items:\n\n${rawText}`,
    },
  ]);

  const responseText = result.response.text();
  try {
    const parsed = JSON.parse(responseText);
    return sanitizeRawBillData(parsed);
  } catch (err) {
    console.error('Failed to parse Gemini text response:', responseText, err);
    throw new Error('Gemini extraction output was not valid JSON.');
  }
}

/**
 * Uses Gemini to generate an advanced, legally tailored Fair Credit Billing Act letter.
 */
export async function generateTailoredDisputeLetterWithAI(
  facility: FacilityMetadata,
  patient: PatientMetadata,
  items: RawLineItem[],
  anomalies: AnomalyReport[],
  financials: FinancialSummary
): Promise<string> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: DEFAULT_GEMINI_MODEL,
      generationConfig: {
        temperature: 0.2,
      },
    });

    const prompt = `
You are the Senior Legal Advocate for UnBill.
Generate a formal, certified dispute letter under the Fair Credit Billing Act (15 U.S.C. 1666) and IRS Section 501(r) Amounts Generally Billed rules.

PATIENT INFO:
- Name: ${patient.patientName || 'Patient'}
- Account Number: ${patient.accountNumber}
- Statement Date: ${patient.statementDate}

HOSPITAL INFO:
- Facility: ${facility.name}
- Billing Address: ${facility.address || 'Hospital Billing Compliance Office'}
- Phone: ${facility.billingPhone || 'Financial Services'}

FINANCIAL DISPUTE:
- Gross Billed: $${financials.totalBilledGross.toFixed(2)}
- Disputed Overcharges: $${financials.totalPotentialSavings.toFixed(2)}
- Revised Undisputed Amount: $${(financials.totalBilledGross - financials.totalPotentialSavings).toFixed(2)}

FLAGGED ANOMALIES:
${JSON.stringify(anomalies, null, 2)}

INSTRUCTIONS:
1. Format as an unambiguous formal legal document sent via Certified Mail.
2. Emphasize immediate stay on credit reporting (15 U.S.C. 1666) during the 30-day investigation window.
3. Include an itemized table or list detailing each CPT violation (duplicate, unbundled, excessive markup).
4. Demand an itemized statement with CMS Revenue Codes and National Drug Codes (NDCs).
5. Conclude with a conditional settlement offer for the undisputed amount upon full reconciliation.
6. Do NOT use markdown bold asterisks (**) anywhere in the letter. Use standard uppercase for section headers and clean plain text suitable for formal typed certified mail.
Return ONLY the formatted letter text.
`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    return rawText.replace(/\*\*(.*?)\*\*/g, '$1');
  } catch (error) {
    console.warn('Gemini dispute letter generation fallback to deterministic:', error);
    return ''; // Caller will use deterministic fallback
  }
}

/**
 * Ensures extracted data conforms to valid types and sane defaults.
 */
function sanitizeRawBillData(data: any): RawBillData {
  return {
    isMedicalBill: data.isMedicalBill !== false,
    rejectionReason: data.rejectionReason || undefined,
    facility: {
      name: data.facility?.name || 'Metropolitan Memorial Hospital',
      address: data.facility?.address || '100 Medical Center Parkway, Suite 400',
      billingPhone: data.facility?.billingPhone || '(800) 555-0199',
    },
    patient: {
      accountNumber: data.patient?.accountNumber || `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
      statementDate: data.patient?.statementDate || new Date().toISOString().split('T')[0],
      patientName: data.patient?.patientName || 'Patient',
    },
    financials: {
      totalBilledGross: Number(data.financials?.totalBilledGross) || 0,
      insurancePaid: Number(data.financials?.insurancePaid) || 0,
      patientBalanceDue: Number(data.financials?.patientBalanceDue) || Number(data.financials?.totalBilledGross) || 0,
    },
    items: Array.isArray(data.items)
      ? data.items.map((item: any, idx: number) => ({
          id: item.id || `item-${idx + 1}`,
          code: String(item.code || '99283').trim(),
          rawDescription: String(item.rawDescription || 'Clinical Medical Service').trim(),
          dateOfService: item.dateOfService || new Date().toISOString().split('T')[0],
          quantity: Number(item.quantity) || 1,
          billedAmount: Number(item.billedAmount) || 0,
        }))
      : [],
  };
}
