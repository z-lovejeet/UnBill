'use client';
import { useState } from 'react';
import { ChevronDown, AlertTriangle, CheckCircle2, CircleHelp } from 'lucide-react';
import type { AuditedLineItem, AnomalyType } from '@/types/audit';
import { itemReviewAmount } from '@/lib/rules-engine';
import { formatCurrency } from '@/lib/utils';
import { findingLabels, findingSummary } from '@/lib/review-language';

const tones: Record<AnomalyType, string> = {
  DUPLICATE_CHARGE: 'border-rose-200 bg-rose-50 text-rose-900',
  UNBUNDLED_CHARGE: 'border-amber-200 bg-amber-50 text-amber-950',
  EXCESSIVE_MARKUP: 'border-sky-200 bg-sky-50 text-sky-900',
  QUANTITY_OVERBILL: 'border-orange-200 bg-orange-50 text-orange-950',
  UPCODING_SEVERITY: 'border-violet-200 bg-violet-50 text-violet-900',
};
export function AuditTable({
  items,
  onToggleDispute,
}: {
  items: AuditedLineItem[];
  onToggleDispute?: (id: string) => void;
}) {
  const [filter, setFilter] = useState('ALL');
  const visible = items.filter(
    (item) =>
      filter === 'ALL' ||
      (filter === 'FLAGGED'
        ? item.anomalies.length > 0
        : filter === 'PRICE'
          ? item.anomalies.some((finding) => finding.anomalyType === 'EXCESSIVE_MARKUP')
          : !item.referenceAmount),
  );
  return (
    <section id="bill-charges" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">What to check, charge by charge</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            Each concern is named below. Keep a charge selected to include its questions in your
            letter and phone script.
          </p>
        </div>
        <p className="text-xs font-medium text-slate-500">
          Showing {visible.length} of {items.length} charges
        </p>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Filter line items">
        {[
          ['ALL', 'All charges'],
          ['FLAGGED', 'Charges to check'],
          ['PRICE', 'Price comparisons'],
          ['UNKNOWN', 'No price reference'],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${filter === value ? 'border-emerald-800 bg-emerald-800 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {visible.map((item) => (
          <ItemRow key={item.id} item={item} onToggle={onToggleDispute} />
        ))}
        {visible.length === 0 && (
          <p className="surface p-8 text-sm text-slate-500">No charges match this filter.</p>
        )}
      </div>
    </section>
  );
}
function ItemRow({ item, onToggle }: { item: AuditedLineItem; onToggle?: (id: string) => void }) {
  const flagged = item.anomalies.length > 0;
  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white ${flagged ? (item.anomalies.some((finding) => finding.anomalyType === 'DUPLICATE_CHARGE') ? 'border-rose-200' : 'border-amber-200') : 'border-slate-200'}`}
    >
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono font-semibold text-slate-700">
              {item.code ? `Code ${item.code}` : 'Code not listed'}
            </span>
            <span className="text-slate-500">
              {item.dateOfService || 'Date not listed'} · {item.quantity}{' '}
              {item.quantity === 1 ? 'unit' : 'units'}
            </span>
          </div>
          <h3 className="mt-3 text-base font-semibold leading-7 text-slate-950">
            {item.rawDescription}
          </h3>
          <label className="mt-3 inline-flex items-center gap-2.5 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 accent-emerald-700"
              aria-label={`Include ${item.code || 'uncoded service'}: ${item.rawDescription}`}
              checked={item.isDisputed}
              disabled={!onToggle || !flagged}
              onChange={() => onToggle?.(item.id)}
            />
            {flagged ? 'Include in my letter and phone script' : 'No flagged concern to include'}
          </label>
        </div>
        <dl className="grid grid-cols-2 gap-5 rounded-xl bg-slate-50 px-4 py-3 lg:min-w-[260px] lg:self-start">
          <div>
            <dt className="text-xs text-slate-500">Billed charge</dt>
            <dd className="mt-1 font-mono text-lg font-semibold text-slate-950">
              {formatCurrency(item.billedAmount)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Selected to question</dt>
            <dd
              className={`mt-1 font-mono text-lg font-semibold ${flagged ? 'text-amber-800' : 'text-slate-500'}`}
            >
              {formatCurrency(item.isDisputed ? itemReviewAmount(item) : 0)}
            </dd>
          </div>
        </dl>
      </div>
      <div className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
        {item.anomalies.map((finding, index) => (
          <div
            key={`${finding.anomalyType}-${index}`}
            className={`rounded-xl border p-4 ${tones[finding.anomalyType]}`}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <h4 className="text-sm font-semibold">{findingLabels[finding.anomalyType]}</h4>
            </div>
            <p className="mt-2 text-sm leading-6">{findingSummary(item, finding)}</p>
          </div>
        ))}
        {!flagged && (
          <div
            className={`flex items-start gap-2 rounded-xl p-4 text-sm leading-6 ${item.referenceAmount ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-100 text-slate-600'}`}
          >
            {item.referenceAmount ? (
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" />
            ) : (
              <CircleHelp className="mt-1 h-4 w-4 shrink-0" />
            )}
            {item.referenceAmount
              ? 'No concern found by the available checks. This does not confirm that the charge is correct.'
              : 'Not assessed for price: this code has no example price. Ask the billing office to explain this charge.'}
          </div>
        )}
        <details className="group rounded-xl border border-slate-200 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-slate-600">
            Service explanation & questions to ask
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-4 border-t border-slate-100 p-4 text-sm leading-7 text-slate-600">
            <p>{item.plainEnglishDescription}</p>
            {!!item.referenceAmount && (
              <p>
                Example price:{' '}
                <strong className="text-slate-900">
                  {formatCurrency(item.referenceAmount)} per unit
                </strong>{' '}
                ({formatCurrency(item.referenceAmount * item.quantity)} for {item.quantity}{' '}
                {item.quantity === 1 ? 'unit' : 'units'}). This catalog is illustrative; actual
                insurer and provider prices vary.
              </p>
            )}
            {item.anomalies.map((finding, index) => (
              <div key={index}>
                <p className="font-semibold text-slate-900">{findingLabels[finding.anomalyType]}</p>
                <p>{finding.explanation}</p>
                <p className="mt-1">
                  <strong className="text-emerald-900">Ask the billing office: </strong>
                  {finding.remedy}
                </p>
              </div>
            ))}
          </div>
        </details>
      </div>
    </article>
  );
}
