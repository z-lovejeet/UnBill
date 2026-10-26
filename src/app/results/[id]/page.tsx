'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useReport } from '@/hooks/use-report';
import { useAuditStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { AuditTable } from '@/components/audit-table';
import { CopilotDrawer } from '@/components/copilot-drawer';
import { GuideSteps } from '@/components/page-content';
import { ArrowUpRight } from 'lucide-react';
export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const { report, loading, error } = useReport(id);
  const toggle = useAuditStore((s) => s.toggleItemDispute);
  const [shareConsent, setShareConsent] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  async function share() {
    if (!report || !shareConsent || shareBusy) return;
    setShareBusy(true);
    setShareMessage('');
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditReport: report, consent: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sharing failed.');
      useAuditStore.getState().addOwnedShare(data);
      setShareUrl(data.shareUrl);
      try {
        await navigator.clipboard.writeText(data.shareUrl);
        setShareMessage('Redacted link created and copied. Revoke it from your vault.');
      } catch {
        setShareMessage('Link created. Copy the URL below; revoke it from your vault.');
      }
    } catch (e) {
      setShareMessage(e instanceof Error ? e.message : 'The share link could not be created.');
    } finally {
      setShareBusy(false);
    }
  }
  if (loading)
    return (
      <div role="status" className="max-w-5xl mx-auto p-12">
        Opening Report…
      </div>
    );
  if (error || !report)
    return (
      <div className="max-w-xl mx-auto p-12 space-y-4">
        <h1 className="text-2xl font-bold">Report Not Found or Unavailable</h1>
        <p className="text-slate-600">{error || 'This report is not available in this browser.'}</p>
        <Link href="/scan" className="underline">
          Start a New Review
        </Link>
        <Link href="/history" className="underline ml-4">
          Open Vault
        </Link>
      </div>
    );
  const selected = report.items.filter((i) => i.isDisputed).length;
  return (
    <div className="page-shell space-y-8 sm:space-y-10">
      <header className="flex flex-wrap gap-5 justify-between items-start">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            {report.source === 'sample'
              ? 'Synthetic example'
              : report.source === 'shared'
                ? 'Redacted shared copy'
                : 'Statement review'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] mt-3">
            Your billing review
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            {report.facility.name} · Account {report.patient.accountNumber}
          </p>
          <p className="text-sm leading-7 text-slate-500 mt-3 max-w-xl">
            Start with the numbers, explore the line items and choose the questions you want to take
            to the billing team.
          </p>
        </div>
        <div className="flex gap-3 print:hidden">
          <button
            onClick={() => useAuditStore.getState().openCopilot()}
            className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-slate-50"
          >
            Ask Billing Coach
          </button>
          <Link
            href={`/dispute/${report.id}`}
            className="rounded-lg bg-slate-950 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800"
          >
            Generate Dispute Kit
          </Link>
        </div>
      </header>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          [
            'Gross Charges',
            formatCurrency(report.financials.totalBilledGross),
            'Before insurance or a billing review',
          ],
          [
            'Selected Review Amount',
            formatCurrency(report.financials.totalPotentialSavings),
            `${selected} selected line items; no guaranteed reduction`,
          ],
          [
            'Reported Patient Balance',
            report.financials.patientResponsibility === null
              ? 'Not Provided'
              : formatCurrency(report.financials.patientResponsibility),
            'As extracted; verify against your insurer EOB',
          ],
          [
            'Review Notes',
            String(report.anomalies.length),
            'Heuristic findings, not confirmed violations',
          ],
        ].map(([label, value, detail]) => (
          <div key={label} className="surface p-5 sm:p-6">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {label}
            </h2>
            <p
              className="font-mono text-2xl font-semibold mt-3"
              data-testid={label === 'Selected Review Amount' ? 'review-total' : undefined}
            >
              {value}
            </p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{detail}</p>
          </div>
        ))}
      </div>
      <section className="grid md:grid-cols-[0.7fr_1.5fr] gap-6 rounded-2xl bg-emerald-50/60 border border-emerald-100 p-6 sm:p-8">
        <div>
          <p className="eyebrow">Reading this report</p>
          <h2 className="text-xl font-semibold tracking-tight mt-3">
            The numbers tell
            <br />
            different parts of the story.
          </h2>
        </div>
        <div className="text-sm leading-7 text-slate-600 space-y-3">
          <p>
            Gross charges describe the statement before adjustments. The patient balance is the
            amount reported on the source, when available. The selected review amount reflects the
            findings you have included below; it is not an estimate of what you legally owe or will
            save.
          </p>
          <p>
            Expand a service to read its supporting detail. Use the filters to focus on findings,
            price comparisons or codes without a reference. Change a selection whenever you want the
            letter and phone guide to cover a different set of questions.
          </p>
        </div>
      </section>
      <details className="surface p-5 sm:p-6">
        <summary className="text-sm font-semibold cursor-pointer">
          Review context and methodology notes
        </summary>
        <div className="pt-4 space-y-3">
          {report.warnings.map((w) => (
            <p className="text-xs text-slate-600 leading-6" key={w}>
              {w}
            </p>
          ))}
          <p className="text-xs text-slate-600 leading-6">
            No collection or credit-reporting protection is activated by this audit.
          </p>
          <Link href="/about" className="text-link">
            Read the review methodology <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </details>
      <AuditTable items={report.items} onToggleDispute={toggle} />
      <section className="next-step">
        <div>
          <h2 className="text-xl font-semibold">Turn selected findings into clear questions.</h2>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-7">
            The letter and phone guide use the same selected amount. Verify them before sending or
            agreeing to payment.
          </p>
        </div>
        <Link href={`/dispute/${report.id}`} className="action-primary">
          Open Review Letter & Phone Guide
        </Link>
      </section>
      <section className="editorial-section print:hidden">
        <div>
          <p className="eyebrow">After the review</p>
          <h2 className="section-title mt-4">
            A practical plan
            <br />
            for the conversation.
          </h2>
        </div>
        <GuideSteps
          items={[
            {
              title: 'Confirm the source details',
              copy: 'Compare extracted codes, dates, quantities and amounts with the itemized statement. Keep the insurer explanation of benefits nearby if one is available.',
            },
            {
              title: 'Ask about the selected charges',
              copy: 'Use the letter and four phone prompts to request an explanation or corrected statement. The optional coach can help you phrase a follow-up question.',
            },
            {
              title: 'Keep a record of the response',
              copy: 'During the call, note the date, representative and any reference number outside the app. Reopen this report from the vault when you need the original context.',
            },
          ]}
        />
      </section>
      <section className="bg-white border rounded-2xl p-6 space-y-4 print:hidden">
        <h2 className="text-lg font-semibold">Share a Redacted Copy</h2>
        <p className="text-sm text-slate-600">
          Patient/account identifiers, facility contact details and service dates are removed.
          Procedure descriptions and amounts remain visible to anyone with the link for up to 30
          days. Keep this browser&apos;s vault to retain your revocation control.
        </p>
        <label className="flex gap-3 text-sm">
          <input
            type="checkbox"
            checked={shareConsent}
            onChange={(e) => setShareConsent(e.target.checked)}
          />
          <span>I authorize sharing the remaining procedure details and amounts.</span>
        </label>
        <button
          disabled={!shareConsent || shareBusy}
          onClick={share}
          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
        >
          {shareBusy ? 'Creating…' : 'Create Share Link'}
        </button>
        {shareMessage && (
          <p role="status" className="text-sm">
            {shareMessage}
          </p>
        )}
        {shareUrl && (
          <label className="block text-xs text-slate-500">
            Share URL
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="block w-full border rounded p-3 mt-1 text-sm text-slate-900"
            />
          </label>
        )}
      </section>
      <CopilotDrawer report={report} />
    </div>
  );
}
