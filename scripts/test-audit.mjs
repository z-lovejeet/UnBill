import fs from 'fs';
import path from 'path';

// Read .env.local without external dotenv package
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      val = val.replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  }
}

import { compileForensicAudit } from '../src/lib/rules-engine.ts';
import { extractBillFromText } from '../src/lib/gemini.ts';

async function runVerification() {
  console.log('🧪 Starting Slice 2 Verification: Multi-Agent Audit Engine\n');

  // Test 1: Deterministic Rules Engine
  const testRawItems = [
    {
      id: 'item_1',
      code: '99284',
      rawDescription: 'EMERGENCY DEPT VISIT LEVEL 4',
      dateOfService: '2026-10-12',
      quantity: 1,
      billedAmount: 1850.00
    },
    {
      id: 'item_2',
      code: '80053',
      rawDescription: 'COMPREHENSIVE METABOLIC PANEL',
      dateOfService: '2026-10-12',
      quantity: 1,
      billedAmount: 340.00
    },
    {
      id: 'item_3',
      code: '80048', // Bundled under 80053!
      rawDescription: 'BASIC METABOLIC PANEL',
      dateOfService: '2026-10-12',
      quantity: 1,
      billedAmount: 220.00
    },
    {
      id: 'item_4',
      code: '73130',
      rawDescription: 'RADIOLOGIC EXAM WRIST 3+ VIEWS',
      dateOfService: '2026-10-12',
      quantity: 1,
      billedAmount: 680.00
    },
    {
      id: 'item_5',
      code: '73130', // Exact duplicate on same date!
      rawDescription: 'RADIOLOGIC EXAM WRIST 3+ VIEWS',
      dateOfService: '2026-10-12',
      quantity: 1,
      billedAmount: 680.00
    }
  ];

  const startRules = Date.now();
  const auditResult = compileForensicAudit(
    testRawItems,
    { name: 'St. Jude Community Hospital', address: '450 Health Ave' },
    { accountNumber: 'ACC-123456', statementDate: '2026-10-14', patientName: 'John Doe' },
    { totalBilledGross: 3770.00 }
  );
  const rulesDuration = Date.now() - startRules;

  console.log(`⚡ Rules Engine Duration: ${rulesDuration}ms`);
  console.log(`📊 Total Gross Billed: $${auditResult.financials.totalBilledGross}`);
  console.log(`💰 Total Potential Savings: $${auditResult.financials.totalPotentialSavings}`);
  console.log(`⚠️ Risk Score: ${auditResult.financials.riskScore}/100`);
  console.log(`🔍 Total Anomalies Detected: ${auditResult.anomalies.length}`);

  // Assertions
  const duplicateAnomaly = auditResult.anomalies.find(a => a.anomalyType === 'DUPLICATE_CHARGE');
  if (!duplicateAnomaly) throw new Error('FAIL: Duplicate charge was not detected!');
  console.log('✅ PASS: Duplicate charge detected on CPT 73130 ($' + duplicateAnomaly.disputedAmount + ')');

  const unbundledAnomaly = auditResult.anomalies.find(a => a.anomalyType === 'UNBUNDLED_CHARGE');
  if (!unbundledAnomaly) throw new Error('FAIL: CCI Unbundled charge (80048) not detected!');
  console.log('✅ PASS: CCI Unbundled charge detected on CPT 80048 ($' + unbundledAnomaly.disputedAmount + ')');

  const markupAnomaly = auditResult.anomalies.find(a => a.anomalyType === 'EXCESSIVE_MARKUP');
  if (!markupAnomaly) throw new Error('FAIL: Excessive hospital markup not detected!');
  console.log('✅ PASS: Excessive markup detected (' + markupAnomaly.title + ')');

  if (!auditResult.disputePackage.formalLetterText.includes('Fair Credit Billing Act (15 U.S.C. § 1666)')) {
    throw new Error('FAIL: Dispute letter missing FCBA citation!');
  }
  console.log('✅ PASS: Statutory dispute package generated with FCBA § 1666 citations.');

  // Test 2: Gemini OCR / Clinical Extraction
  console.log('\n🤖 Testing Agent 1 (Gemini Clinical Ingestion)...');
  const sampleBillText = `
    VALLEY METRO GENERAL HOSPITAL
    100 Health Sciences Way, Sacramento, CA
    Patient: James Miller | Account #: ACC-772183
    Statement Date: October 15, 2026

    ITEMIZED CHARGES:
    Date        Code    Description                      Qty   Total ($)
    10/12/2026  99285   EMERGENCY DEPT VISIT LEVEL 5       1    2,850.00
    10/12/2026  80053   COMPREHENSIVE METABOLIC PANEL      1      340.00
    10/12/2026  36415   ROUTINE VENIPUNCTURE               1       95.00
    TOTAL CHARGES: $3,285.00
  `;

  const startGemini = Date.now();
  const extracted = await extractBillFromText(sampleBillText);
  const geminiDuration = Date.now() - startGemini;

  console.log(`⚡ Gemini Ingestion Duration: ${geminiDuration}ms`);
  console.log(`🏥 Extracted Facility: ${extracted.facility.name}`);
  console.log(`👤 Extracted Account: ${extracted.patient.accountNumber}`);
  console.log(`📋 Extracted Line Items: ${extracted.items.length}`);

  if (extracted.items.length < 3) {
    throw new Error(`FAIL: Expected at least 3 items, got ${extracted.items.length}`);
  }
  console.log('✅ PASS: Gemini successfully parsed structured clinical rows from bill statement.');

  console.log('\n========================================');
  console.log('🎉 SLICE 2 MECHANICAL VERIFICATION PASSED');
  console.log(`⏱ Total Execution Time: ${rulesDuration + geminiDuration}ms (< 4500ms target)`);
  console.log('========================================\n');
}

runVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
