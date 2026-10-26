import React from 'react';
import { AlertCircle, CircleCheck, ReceiptText, Wallet, MessageSquare } from 'lucide-react';
import type { AuditReport, AnomalyType } from '@/types/audit';
import { formatCurrency } from '@/lib/utils';
import { findingLabels } from '@/lib/review-language';

const categories: Array<{ type: AnomalyType; color: string }> = [
  { type: 'DUPLICATE_CHARGE', color: 'bg-rose-50 border-rose-200 text-rose-900' },
  { type: 'UNBUNDLED_CHARGE', color: 'bg-amber-50 border-amber-200 text-amber-950' },
  { type: 'EXCESSIVE_MARKUP', color: 'bg-sky-50 border-sky-200 text-sky-900' },
  { type: 'QUANTITY_OVERBILL', color: 'bg-orange-50 border-orange-200 text-orange-950' },
  { type: 'UPCODING_SEVERITY', color: 'bg-violet-50 border-violet-200 text-violet-900' },
];
export function ReviewSummary({ report }: { report: AuditReport }) {
  const flagged = report.items.filter((item) => item.anomalies.length > 0);
  const unassessed = report.items.filter((item) => !item.referenceAmount).length;
  const selected = report.items.filter((item) => item.isDisputed && item.anomalies.length).length;
  const hasBalance = report.financials.patientResponsibility !== null;
  return (
    <section className="space-y-5" aria-label="Your bill at a glance">
      <div
        className={`rounded-2xl border p-5 sm:p-7 ${flagged.length ? 'border-amber-200 bg-amber-50/70' : 'border-emerald-200 bg-emerald-50/70'}`}
      >
        <div className="flex items-start gap-3">
          {flagged.length ? (
            <AlertCircle className="mt-1 h-6 w-6 shrink-0 text-amber-700" />
          ) : (
            <CircleCheck className="mt-1 h-6 w-6 shrink-0 text-emerald-700" />
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-950">
              {flagged.length
                ? `${flagged.length} of ${report.items.length} charges ${flagged.length === 1 ? 'needs' : 'need'} a closer look.`
                : 'No concerns found by the available checks.'}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              {flagged.length
                ? 'Here is what stood out. These are specific questions for the billing office; they are not confirmed billing errors.'
                : 'This does not confirm that every charge is correct. Our checks only cover the codes and information available in this statement.'}
            </p>
          </div>
        </div>
        {flagged.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2.5">
            {categories.map(({ type, color }) => {
              const count = report.items.filter((item) =>
                item.anomalies.some((finding) => finding.anomalyType === type),
              ).length;
              return count ? (
                <a
                  key={type}
                  href="#bill-charges"
                  className={`rounded-xl border px-3.5 py-2 text-sm font-medium ${color}`}
                >
                  <strong>{count}</strong> · {findingLabels[type]}
                </a>
              ) : null;
            })}
          </div>
        )}
        {unassessed > 0 && (
          <p className="mt-4 text-xs leading-6 text-slate-600">
            {unassessed} {unassessed === 1 ? 'charge has' : 'charges have'} no price reference.
            Those prices could not be compared.
          </p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 sm:p-6">
          <ReceiptText className="h-5 w-5 text-sky-700" />
          <h3 className="mt-4 text-sm font-semibold text-sky-950">Total on the bill</h3>
          <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(report.financials.totalBilledGross)}
          </p>
          <p className="mt-3 text-xs leading-6 text-sky-900">
            All itemized charges before insurance adjustments and payments.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6">
          <Wallet className="h-5 w-5 text-emerald-700" />
          <h3 className="mt-4 text-sm font-semibold text-emerald-950">
            Balance shown on the statement
          </h3>
          <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-slate-950">
            {hasBalance ? formatCurrency(report.financials.patientResponsibility!) : 'Not listed'}
          </p>
          <p className="mt-3 text-xs leading-6 text-emerald-900">
            {hasBalance
              ? 'The amount the statement says you owe. Compare it with your insurer’s explanation of benefits, if insured.'
              : 'The source did not give a patient balance. Ask the billing office what you currently owe.'}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
          <MessageSquare className="h-5 w-5 text-amber-700" />
          <h3 className="mt-4 text-sm font-semibold text-amber-950">Amount to question</h3>
          <p
            className="mt-2 font-mono text-3xl font-semibold tracking-tight text-slate-950"
            data-testid="review-total"
          >
            {formatCurrency(report.financials.totalPotentialSavings)}
          </p>
          <p className="mt-3 text-xs leading-6 text-amber-950">
            Parts of {selected} selected {selected === 1 ? 'charge' : 'charges'} to discuss. This is
            not a promised refund, discount or new balance.
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm leading-7 text-slate-600">
        <strong className="text-slate-950">Why the amounts differ: </strong>
        The amount to question comes from the original charges. Do not subtract it from the balance
        shown on your statement. The billing office and insurer must explain how any confirmed
        correction changes what you owe.
        {flagged.length > 0 && (
          <span className="mt-1 block text-xs text-slate-500">
            One charge can have several concerns. It is counted once in the charge total and once in
            the selected amount.
          </span>
        )}
      </div>
    </section>
  );
}
