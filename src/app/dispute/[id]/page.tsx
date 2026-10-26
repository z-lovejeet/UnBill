'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useReport } from '@/hooks/use-report';
import { formatCurrency } from '@/lib/utils';
import resources from '../../../../data/legal_statutes.json';
import { GuideSteps } from '@/components/page-content';
export default function DisputePage() {
  const { id } = useParams<{ id: string }>();
  const { report, loading, error } = useReport(id);
  const [tab, setTab] = useState<'LETTER' | 'PHONE' | 'RESOURCES'>('LETTER');
  const [message, setMessage] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        tab === 'PHONE'
          ? report!.disputePackage.phoneNegotiationPoints.join('\n\n')
          : report!.disputePackage.formalLetterText,
      );
      setMessage(tab === 'PHONE' ? 'Phone script copied.' : 'Letter copied.');
    } catch {
      setMessage('Clipboard access was unavailable. Select the text below and copy it.');
    }
  }
  if (loading)
    return (
      <div role="status" className="max-w-5xl mx-auto p-12">
        Opening Review Package…
      </div>
    );
  if (error || !report)
    return (
      <div className="max-w-xl mx-auto p-12 space-y-4">
        <h1 className="text-2xl font-bold">Review Package Not Found</h1>
        <p className="text-slate-600">{error || 'This exact report could not be found.'}</p>
        <Link href="/history" className="underline">
          Open Vault
        </Link>
        <Link href="/scan" className="underline ml-4">
          Start a New Review
        </Link>
      </div>
    );
  return (
    <div className="page-shell max-w-5xl space-y-7 sm:space-y-10 print:p-0">
      <header className="print:hidden space-y-3">
        <Link className="text-xs underline text-slate-500" href={`/results/${id}`}>
          Back to This Report
        </Link>
        <p className="eyebrow pt-3">Prepare the next conversation</p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em]">
          Your review letter & phone guide
        </h1>
        <p className="text-sm text-slate-600">
          Account {report.patient.accountNumber} ·{' '}
          {formatCurrency(report.financials.totalPotentialSavings)} selected for review. This is a
          draft request for clarification, not a legal notice establishing a collection stay.
        </p>
        <p className="text-sm text-slate-600 leading-7 max-w-2xl">
          Use the letter to organize your request, the phone guide to keep the conversation focused
          and the resource links to understand where further help may be available. Changes to the
          report selection update this package automatically.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={copy}
            className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-slate-50"
          >
            {tab === 'PHONE' ? 'Copy Phone Script' : 'Copy Letter'}
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-slate-950 text-white px-4 py-2 text-sm hover:bg-slate-800"
          >
            Print / Save as PDF
          </button>
        </div>
        {message && (
          <p role="status" className="text-sm">
            {message}
          </p>
        )}
      </header>
      <div role="tablist" aria-label="Review package" className="flex flex-wrap gap-2 print:hidden">
        {(
          [
            ['LETTER', 'Review Letter'],
            ['PHONE', 'Phone Guide'],
            ['RESOURCES', 'Consumer Resources'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-lg border px-4 py-2 text-sm ${tab === key ? 'bg-slate-950 text-white' : 'bg-white hover:bg-slate-50'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <aside className="quiet-panel grid sm:grid-cols-[0.6fr_1.4fr] gap-5 print:hidden">
        <h2 className="text-lg font-semibold tracking-tight">
          Before you use
          <br className="hidden sm:block" /> the package
        </h2>
        <p className="text-sm leading-7 text-slate-600">
          Check the account and selected services against the original statement. Add any missing
          recipient details and your preferred contact information after copying or printing. UnBill
          prepares the text; it does not send a letter or contact the billing office for you.
        </p>
      </aside>
      {tab === 'LETTER' ? (
        <article
          aria-label="Billing review letter"
          className="bg-white rounded-xl border border-slate-200 p-6 sm:p-12 print:border-0 print:p-0"
        >
          <div
            data-testid="review-letter"
            className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm leading-relaxed print:text-[10pt]"
          >
            {report.disputePackage.formalLetterText}
          </div>
        </article>
      ) : tab === 'PHONE' ? (
        <section className="space-y-5" aria-label="Read-aloud phone script">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
            <p className="eyebrow">Keep this open during your call</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              A word-for-word script for your billing call
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Read the quoted text aloud and pause for the representative’s answer. The script
              includes only your selected charges and updates when you change the selection.
            </p>
            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="font-semibold text-emerald-950">Have ready</p>
                <p className="mt-1 leading-6 text-slate-600">
                  Your itemized statement, account number, insurer’s explanation of benefits if
                  available, and somewhere to take notes.
                </p>
              </div>
              <div>
                <p className="font-semibold text-emerald-950">Call the verified billing number</p>
                <p className="mt-1 leading-6 text-slate-600">
                  {report.facility.billingPhone
                    ? `${report.facility.billingPhone} is printed on the source. Verify it against your statement before calling.`
                    : 'Use the number on your original statement or the provider’s official website. No billing number was extracted.'}
                </p>
              </div>
            </div>
          </div>
          <ol className="space-y-4">
            {report.disputePackage.phoneNegotiationPoints.map((point, index) => {
              const [title, ...script] = point.split('\n');
              return (
                <li
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 print:break-inside-avoid"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 font-mono text-xs font-semibold text-emerald-900">
                      {index + 1}
                    </span>
                    <h3 className="pt-1 text-base font-semibold leading-6 text-slate-950">
                      {title}
                    </h3>
                  </div>
                  <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                    Say this
                  </p>
                  <blockquote className="border-l-2 border-emerald-300 pl-4 text-sm leading-8 text-slate-700">
                    {script.join('\n') || point}
                  </blockquote>
                </li>
              );
            })}
          </ol>
          <aside className="rounded-2xl border border-sky-200 bg-sky-50 p-6">
            <h3 className="font-semibold text-sky-950">Write down the outcome</h3>
            <p className="mt-2 text-sm leading-7 text-sky-900">
              Call date · Representative · Reference number · Charges being reviewed · Documents
              promised · Follow-up date. Keep these notes with your statement outside the app.
            </p>
          </aside>
        </section>
      ) : (
        <section className="grid gap-4">
          {resources.map((resource) => (
            <article key={resource.id} className="bg-white border p-6 rounded-xl space-y-2">
              <h2 className="font-semibold">{resource.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {resource.formalNoticeClause}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">{resource.mandatoryDemand}</p>
              <a
                className="text-sm text-emerald-800 underline"
                href={resource.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Read the Source
              </a>
            </article>
          ))}
        </section>
      )}
      <section className="editorial-section print:hidden">
        <div>
          <p className="eyebrow">Make the follow-up easier</p>
          <h2 className="section-title mt-4">
            A clear request.
            <br />A useful record.
          </h2>
        </div>
        <GuideSteps
          items={[
            {
              title: 'Verify before sending',
              copy: 'Review every figure and explanation, then edit the copied letter to match what you can support from the source statement.',
            },
            {
              title: 'Ask for the underlying explanation',
              copy: 'Request an itemized clarification or corrected statement where appropriate. Repeated-looking services can be legitimate, so keep the question specific to the record.',
            },
            {
              title: 'Keep the response with your records',
              copy: 'Save a copy of what you send and any response outside the app. Return to the report or local vault when preparing another conversation.',
            },
          ]}
        />
      </section>
    </div>
  );
}
