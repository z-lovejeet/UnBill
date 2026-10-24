import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { AuditReport } from '@/types/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PRIMARY_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

export async function POST(req: NextRequest) {
  try {
    const { messages, auditContext } = (await req.json()) as {
      messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
      auditContext?: AuditReport | null;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required.' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    // Format context from active audit report if available
    let contextPrompt = '';
    if (auditContext) {
      const { facility, patient, financials, anomalies } = auditContext;
      const flaggedSummary = anomalies
        .map(
          (a) =>
            `- CPT ${a.code}: ${a.title} ($${a.disputedAmount.toFixed(2)} disputed) — Basis: ${
              a.statutoryBasis || 'Fair Credit Billing Act'
            }`
        )
        .join('\n');

      contextPrompt = `
ACTIVE AUDIT DOSSIER CONTEXT:
- Healthcare Facility: ${facility.name}
- Patient Account #: ${patient.accountNumber}
- Statement Date: ${patient.statementDate}
- Total Gross Billed: $${financials.totalBilledGross.toFixed(2)}
- Total Disputed Overcharges: $${financials.totalPotentialSavings.toFixed(2)}
- Undisputed Fair Market Rate: $${(financials.totalBilledGross - financials.totalPotentialSavings).toFixed(2)}
- Audit Risk Score: ${financials.riskScore}/100

FLAGGED FORENSIC DISCREPANCIES:
${flaggedSummary || 'None flagged'}
`;
    }

    const systemMessage = {
      role: 'system' as const,
      content: `You are UnBill Copilot, an expert patient financial advocate and forensic hospital bill negotiator powered by Groq's ultra-low-latency engine.
Your purpose is to coach American patients through fighting inflated, duplicate, and predatory medical bills.

CORE BEHAVIOR RULES:
1. Tone: Calm, highly knowledgeable, assertive, protective, and non-alarmist.
2. If an ACTIVE AUDIT DOSSIER is provided below, incorporate its specific numbers, facility name, account number, and CPT violations into your advice.
3. Anchor your tactical negotiation advice in federal consumer statutes:
   - Fair Credit Billing Act (15 U.S.C. 1666): 60-day dispute window, mandatory credit reporting stay, 30-day acknowledgement.
   - Internal Revenue Code Section 501(r): Nonprofit hospitals cannot charge more than Amounts Generally Billed (AGB).
   - Federal No Surprises Act (Public Law 116-260): Ban on out-of-network emergency surprise balance billing.
4. Keep answers concise (2-4 punchy paragraphs or bulleted scripts), practical, and immediately actionable on a phone call.
5. Provide exact quotation marks when suggesting what the patient should say out loud to a billing representative.

${contextPrompt}`,
    };

    const formattedMessages = [systemMessage, ...messages];

    // Attempt streaming with primary model, fallback if needed
    let stream;
    try {
      stream = await groq.chat.completions.create({
        model: PRIMARY_MODEL,
        messages: formattedMessages,
        stream: true,
        temperature: 0.3,
        max_tokens: 800,
      });
    } catch (modelErr: any) {
      console.warn(`Primary model ${PRIMARY_MODEL} failed, falling back to ${FALLBACK_MODEL}:`, modelErr?.message);
      stream = await groq.chat.completions.create({
        model: FALLBACK_MODEL,
        messages: formattedMessages,
        stream: true,
        temperature: 0.3,
        max_tokens: 800,
      });
    }

    // Convert Groq async iterable stream to standard Web Response Stream
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (streamError) {
          controller.error(streamError);
        }
      },
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate chat response' },
      { status: 500 }
    );
  }
}
