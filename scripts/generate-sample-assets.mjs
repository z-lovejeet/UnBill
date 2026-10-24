import fs from 'fs';
import path from 'path';

// Generate realistic synthetic medical statement SVG
function generateBillSvg(facilityName, accountNo, date, items, total) {
  const itemRows = items.map((it, idx) => `
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 10px 14px; font-family: monospace; font-size: 13px; color: #1E293B;">${it.date}</td>
      <td style="padding: 10px 14px; font-family: monospace; font-size: 13px; font-weight: bold; color: #0F172A;">${it.code}</td>
      <td style="padding: 10px 14px; font-size: 13px; color: #334155;">${it.desc}</td>
      <td style="padding: 10px 14px; text-align: center; font-size: 13px; color: #475569;">${it.qty}</td>
      <td style="padding: 10px 14px; text-align: right; font-family: monospace; font-size: 13px; font-weight: bold; color: #0F172A;">$${it.amount.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
<svg width="800" height="950" viewBox="0 0 800 950" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 22px; font-weight: bold; fill: #0F172A; }
      .meta-label { font-family: sans-serif; font-size: 11px; text-transform: uppercase; fill: #64748B; font-weight: bold; }
      .meta-val { font-family: sans-serif; font-size: 13px; fill: #1E293B; font-weight: 600; }
    </style>
  </defs>
  <!-- Background -->
  <rect width="800" height="950" fill="#FFFFFF" rx="8" stroke="#CBD5E1" stroke-width="2"/>

  <!-- Header Banner -->
  <rect x="0" y="0" width="800" height="110" fill="#0F172A"/>
  <text x="40" y="55" class="title" fill="#FFFFFF">${facilityName}</text>
  <text x="40" y="80" font-family="sans-serif" font-size="12" fill="#94A3B8">PATIENT FINANCIAL SERVICES • ITEMIZED BILLING LEDGER</text>

  <!-- Statement Metadata Box -->
  <rect x="40" y="140" width="720" height="90" fill="#F8FAFC" rx="6" stroke="#E2E8F0"/>
  <text x="60" y="168" class="meta-label">Patient Name</text>
  <text x="60" y="190" class="meta-val">Sarah Jenkins</text>

  <text x="260" y="168" class="meta-label">Account Number</text>
  <text x="260" y="190" class="meta-val" font-family="monospace">${accountNo}</text>

  <text x="460" y="168" class="meta-label">Statement Date</text>
  <text x="460" y="190" class="meta-val">${date}</text>

  <text x="620" y="168" class="meta-label">Account Status</text>
  <text x="620" y="190" class="meta-val" fill="#DC2626">BALANCE DUE</text>

  <!-- Table Container -->
  <foreignObject x="40" y="260" width="720" height="520">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <thead>
          <tr style="background: #F1F5F9; border-bottom: 2px solid #CBD5E1; text-align: left;">
            <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; color: #475569;">Date</th>
            <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; color: #475569;">CPT Code</th>
            <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; color: #475569;">Description</th>
            <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; color: #475569; text-align: center;">Qty</th>
            <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; color: #475569; text-align: right;">Gross Charge</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    </div>
  </foreignObject>

  <!-- Total Summary Bar -->
  <rect x="40" y="800" width="720" height="80" fill="#0F172A" rx="6"/>
  <text x="60" y="845" font-family="sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF">TOTAL AMOUNT OWED:</text>
  <text x="730" y="848" font-family="monospace" font-size="22" font-weight="bold" fill="#34D399" text-anchor="end">$${total.toFixed(2)}</text>

  <text x="400" y="915" font-family="sans-serif" font-size="11" fill="#94A3B8" text-anchor="middle">NOTICE: If payment is not received within 30 days, this account may be forwarded to collections.</text>
</svg>`;
}

const erItems = [
  { date: '10/12/2026', code: '99284', desc: 'EMERGENCY DEPT VISIT LEVEL 4', qty: 1, amount: 1850.00 },
  { date: '10/12/2026', code: '80053', desc: 'COMPREHENSIVE METABOLIC PANEL', qty: 1, amount: 340.00 },
  { date: '10/12/2026', code: '80048', desc: 'BASIC METABOLIC PANEL (COMPONENT)', qty: 1, amount: 220.00 },
  { date: '10/12/2026', code: '73130', desc: 'RADIOLOGIC EXAM WRIST 3+ VIEWS', qty: 1, amount: 680.00 },
  { date: '10/12/2026', code: '73130', desc: 'RADIOLOGIC EXAM WRIST (DUPLICATE)', qty: 1, amount: 680.00 },
  { date: '10/12/2026', code: '36415', desc: 'ROUTINE VENIPUNCTURE BLOOD DRAW', qty: 1, amount: 95.00 },
  { date: '10/12/2026', code: '99070', desc: 'STERILE IMMOBILIZATION SPLINT SUPPLIES', qty: 1, amount: 955.00 }
];

const surgeryItems = [
  { date: '10/10/2026', code: '29881', desc: 'ARTHROSCOPY KNEE SURGICAL W/ MENISCECTOMY', qty: 1, amount: 4850.00 },
  { date: '10/10/2026', code: '01400', desc: 'ANESTHESIA FOR ARTHROSCOPIC KNEE SURGERY', qty: 1, amount: 1650.00 },
  { date: '10/10/2026', code: '80053', desc: 'COMPREHENSIVE METABOLIC PANEL', qty: 1, amount: 380.00 },
  { date: '10/10/2026', code: '82040', desc: 'ALBUMIN SERUM (UNBUNDLED COMPONENT)', qty: 1, amount: 140.00 },
  { date: '10/10/2026', code: '84075', desc: 'ALKALINE PHOSPHATASE (UNBUNDLED)', qty: 1, amount: 160.00 },
  { date: '10/10/2026', code: '71046', desc: 'CHEST RADIOLOGY 2 VIEWS (FACILITY CHARGE)', qty: 1, amount: 1240.00 }
];

const erSvg = generateBillSvg('MERCY GENERAL HOSPITAL & TRAUMA CENTER', 'ACC-99284-883', 'October 14, 2026', erItems, 4820.00);
const surgerySvg = generateBillSvg('ST. LUKE\'S SURGICAL PAVILION', 'ACC-44192-001', 'October 15, 2026', surgeryItems, 8420.00);

fs.writeFileSync(path.join('public', 'samples', 'er_visit_broken_wrist.svg'), erSvg);
fs.writeFileSync(path.join('public', 'samples', 'outpatient_surgery.svg'), surgerySvg);

console.log('✅ Generated sample bill visual assets: er_visit_broken_wrist.svg and outpatient_surgery.svg');
