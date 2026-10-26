import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReviewSummary } from '../src/components/review-summary';
import { CoachMessage } from '../src/components/coach-message';
import { compileForensicAudit, recalculateReport } from '../src/lib/rules-engine';
import { normalizeReport } from '../src/lib/reports';

test('coach answers render headings, bold text and numbered steps instead of Markdown markers', () => {
  const html = renderToStaticMarkup(
    React.createElement(CoachMessage, {
      content:
        '### What to ask\n\n1. **Check the repeated charge.** Ask for the service record.\n2. Request a written explanation.',
    }),
  );
  assert.match(html, /<h3[^>]*>What to ask<\/h3>/);
  assert.match(html, /<strong[^>]*>Check the repeated charge\.<\/strong>/);
  assert.match(html, /<ol[^>]*>/);
  assert.doesNotMatch(html, /###|\*\*/);
});

test('coach answers do not execute embedded HTML or unsafe links', () => {
  const html = renderToStaticMarkup(
    React.createElement(CoachMessage, {
      content: '<script>alert(1)</script>\n\n[unsafe](javascript:alert%281%29)\n\n**Safe text**',
    }),
  );
  assert.doesNotMatch(html, /<script|href="javascript:/);
  assert.match(html, /<strong[^>]*>Safe text<\/strong>/);
});

test('phone script covers each selected charge and survives reopening a larger report', () => {
  const report = compileForensicAudit(
    Array.from({ length: 12 }, (_, i) => ({
      id: `line-${i}`,
      code: '80053',
      rawDescription: `Synthetic panel ${i + 1}`,
      dateOfService: '2026-10-26',
      quantity: 1,
      billedAmount: 200,
    })),
    { name: 'Synthetic clinic' },
    { accountNumber: 'DEMO', statementDate: '2026-10-26' },
    { patientBalanceDue: 0 },
  );
  report.items[0].isDisputed = false;
  const updated = recalculateReport(report);
  const script = updated.disputePackage.phoneNegotiationPoints.join('\n');
  assert.match(script, /Discuss 80053 — Synthetic panel 2/);
  assert.doesNotMatch(script, /Discuss 80053 — Synthetic panel 1\n/);
  assert.match(script, /patient balance of \$0.00/);
  assert.match(script, /read back|repeat back/i);
  assert.doesNotThrow(() => normalizeReport(updated));
  assert.equal(normalizeReport(updated).disputePackage.phoneNegotiationPoints.length, 17);
});

test('result summary counts affected charges once even when one charge has several findings', () => {
  const item = {
    id: 'one',
    code: '80053',
    rawDescription: 'Synthetic panel',
    dateOfService: '2026-10-26',
    quantity: 1,
    billedAmount: 200,
  };
  const report = compileForensicAudit(
    [item, { ...item, id: 'two' }],
    { name: 'Synthetic clinic' },
    { accountNumber: 'DEMO', statementDate: '2026-10-26' },
    { patientBalanceDue: 0 },
  );
  assert.equal(report.anomalies.length, 3);
  const html = renderToStaticMarkup(React.createElement(ReviewSummary, { report }));
  assert.match(html, /2 of 2 charges need a closer look/);
  assert.match(html, /Possible duplicate charge/);
  assert.match(html, /Above example price/);
  assert.doesNotMatch(html, /Review Notes|3 charges need/);
  assert.match(html, /Do not subtract it from the balance/);
});
