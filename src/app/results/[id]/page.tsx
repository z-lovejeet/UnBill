'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useReport } from '@/hooks/use-report';
import { useAuditStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { AuditTable } from '@/components/audit-table';
import { CopilotDrawer } from '@/components/copilot-drawer';
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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 py-10 space-y-7">
      <header className="flex flex-wrap gap-5 justify-between items-start">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            {report.source === 'sample'
              ? 'Synthetic example'
              : report.source === 'shared'
                ? 'Redacted shared copy'
                : 'Statement review'}
          </p>
          <h1 className="text-3xl font-bold tracking-tight mt-2">Billing Review Report</h1>
          <p className="text-sm text-slate-600 mt-2">
            {report.facility.name} · Account {report.patient.accountNumber}
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
          <div key={label} className="rounded-xl bg-white border p-5">
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
      <aside className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-2">
        <h2 className="text-sm font-semibold">Read These Limits Before Acting</h2>
        {report.warnings.map((w) => (
          <p className="text-xs text-amber-950 leading-relaxed" key={w}>
            {w}
          </p>
        ))}
        <p className="text-xs font-semibold">
          No collection or credit-reporting protection is activated by this audit.
        </p>
      </aside>
      <AuditTable items={report.items} onToggleDispute={toggle} />
      <section className="rounded-2xl bg-slate-950 text-white p-6 sm:p-8 flex flex-wrap items-center justify-between gap-5">
        <div>
          <h2 className="text-xl font-semibold">Turn selected findings into clear questions.</h2>
          <p className="text-sm text-slate-300 mt-2">
            The letter and phone guide use the same selected amount. Verify them before sending or
            agreeing to payment.
          </p>
        </div>
        <Link
          href={`/dispute/${report.id}`}
          className="bg-emerald-400 text-slate-950 px-5 py-3 rounded-xl font-semibold text-sm hover:bg-emerald-300"
        >
          Open Review Letter & Phone Guide
        </Link>
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
