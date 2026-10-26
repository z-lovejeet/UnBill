import fs from 'node:fs';
import { sampleReport } from '../src/lib/samples';
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!,
  );
for (const id of ['er_visit_broken_wrist', 'outpatient_surgery']) {
  const report = sampleReport(id);
  report.createdAt = '2026-10-26T00:00:00.000Z';
  fs.writeFileSync(`public/samples/${id}.json`, JSON.stringify(report, null, 2) + '\n');
  const lines = [
    'SYNTHETIC EXAMPLE - NOT A REAL PATIENT',
    report.facility.name,
    `Account: ${report.patient.accountNumber}`,
    `Statement date: ${report.patient.statementDate}`,
    'ITEMIZED CHARGES',
    ...report.items.map(
      (i) =>
        `${i.dateOfService} | ${i.code} | ${i.rawDescription} | Qty ${i.quantity} | $${i.billedAmount.toFixed(2)}`,
    ),
    `Gross total: $${report.financials.totalBilledGross.toFixed(2)}`,
    `Insurance adjustments: $${report.financials.insuranceAdjustments.toFixed(2)}`,
    `Patient balance: ${report.financials.patientResponsibility === null ? 'Not provided' : `$${report.financials.patientResponsibility.toFixed(2)}`}`,
  ];
  fs.writeFileSync(`public/samples/${id}.txt`, lines.join('\n') + '\n');
  const rows = report.items
    .map(
      (i, n) =>
        `<text x="40" y="${260 + n * 70}" font-family="monospace" font-size="15" fill="#0f172a">${escape(`${i.dateOfService}  ${i.code}  Qty ${i.quantity}  $${i.billedAmount.toFixed(2)}`)}</text><text x="40" y="${285 + n * 70}" font-family="sans-serif" font-size="14" fill="#475569">${escape(i.rawDescription)}</text>`,
    )
    .join('');
  fs.writeFileSync(
    `public/samples/${id}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1000" viewBox="0 0 900 1000"><rect width="900" height="1000" fill="white"/><rect width="900" height="110" fill="#0f172a"/><text x="40" y="45" font-family="sans-serif" font-size="16" fill="#6ee7b7">SYNTHETIC EXAMPLE - NOT A REAL PATIENT</text><text x="40" y="80" font-family="sans-serif" font-size="24" fill="white">${escape(report.facility.name)}</text><text x="40" y="155" font-family="sans-serif" font-size="17">Account: ${escape(report.patient.accountNumber)}</text><text x="40" y="185" font-family="sans-serif" font-size="17">Statement: ${escape(report.patient.statementDate)}</text><text x="40" y="225" font-family="sans-serif" font-size="14">Date | Code | Quantity | Line total | Description</text>${rows}<text x="40" y="895" font-family="sans-serif" font-size="23" font-weight="bold">Gross total: $${report.financials.totalBilledGross.toFixed(2)}</text><text x="40" y="930" font-family="sans-serif" font-size="16">Synthetic fixture for testing document extraction. No real medical record.</text></svg>`,
  );
  console.log(
    `${id}: ${report.items.length} rows, gross ${report.financials.totalBilledGross}, review ${report.financials.totalPotentialSavings}`,
  );
}
