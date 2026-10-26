'use client';
import { useState } from 'react';
import type { AuditedLineItem } from '@/types/audit';
import { itemReviewAmount } from '@/lib/rules-engine';
import { formatCurrency } from '@/lib/utils';
export function AuditTable({
  items,
  onToggleDispute,
}: {
  items: AuditedLineItem[];
  onToggleDispute?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(items[0]?.id || null);
  const [filter, setFilter] = useState('ALL');
  const visible = items.filter(
    (i) =>
      filter === 'ALL' ||
      (filter === 'FLAGGED'
        ? i.anomalies.length > 0
        : filter === 'PRICE'
          ? i.anomalies.some((a) => a.anomalyType === 'EXCESSIVE_MARKUP')
          : !i.referenceAmount),
  );
  return (
    <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b space-y-3">
        <h2 className="font-bold text-lg">Itemized Review</h2>
        <p className="text-xs text-slate-600">
          Select findings for your review request. Reference prices are illustrative per-unit
          values, not official rates.
        </p>
        <div className="flex flex-wrap gap-2" aria-label="Filter line items">
          {[
            ['ALL', 'All Items'],
            ['FLAGGED', 'Findings'],
            ['PRICE', 'Price Comparisons'],
            ['UNKNOWN', 'No Reference'],
          ].map(([value, label]) => (
            <button
              key={value}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`text-xs rounded-lg border px-3 py-2 ${filter === value ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Billed services, review selections and illustrative comparisons
          </caption>
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="p-4">Include</th>
              <th className="p-4">Service & Finding</th>
              <th className="p-4 text-right">Billed</th>
              <th className="p-4 text-right">Reference / Unit</th>
              <th className="p-4 text-right">Review Amount</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                expanded={expanded === item.id}
                onExpand={() => setExpanded(expanded === item.id ? null : item.id)}
                onToggle={onToggleDispute}
              />
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="p-6 text-sm text-slate-500">No items match this filter.</p>
        )}
      </div>
    </section>
  );
}
function ItemRow({
  item,
  expanded,
  onExpand,
  onToggle,
}: {
  item: AuditedLineItem;
  expanded: boolean;
  onExpand: () => void;
  onToggle?: (id: string) => void;
}) {
  const panel = `detail-${item.id}`;
  return (
    <>
      <tr className="border-t border-slate-100">
        <td className="p-4 align-top">
          <input
            type="checkbox"
            aria-label={`Include ${item.code || 'uncoded service'}: ${item.rawDescription}`}
            checked={item.isDisputed}
            disabled={!onToggle || !item.anomalies.length}
            onChange={() => onToggle?.(item.id)}
          />
        </td>
        <td className="p-4 min-w-64">
          <button
            aria-expanded={expanded}
            aria-controls={panel}
            onClick={onExpand}
            className="text-left rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700"
          >
            <span className="font-mono font-semibold mr-2">{item.code || 'No Code'}</span>
            <span className="font-medium">{item.rawDescription}</span>
            <span className="block text-xs text-slate-500 mt-1">
              {item.dateOfService || 'Date not provided'} · Qty {item.quantity} ·{' '}
              {expanded ? 'Hide' : 'Show'} Details
            </span>
          </button>
          <span
            className={`inline-block mt-2 text-xs rounded-full px-2 py-1 ${item.anomalies.length ? 'bg-amber-50 text-amber-900' : 'bg-slate-100 text-slate-600'}`}
          >
            {item.anomalies.length
              ? `${item.anomalies.length} review ${item.anomalies.length === 1 ? 'note' : 'notes'}`
              : item.referenceAmount
                ? 'No rule findings'
                : 'Unassessed: no reference'}
          </span>
        </td>
        <td className="p-4 text-right font-mono align-top">{formatCurrency(item.billedAmount)}</td>
        <td className="p-4 text-right font-mono align-top">
          {item.referenceAmount ? formatCurrency(item.referenceAmount) : 'Unavailable'}
        </td>
        <td className="p-4 text-right font-mono align-top">
          {formatCurrency(itemReviewAmount(item))}
        </td>
      </tr>
      {expanded && (
        <tr id={panel}>
          <td colSpan={5} className="p-5 bg-slate-50">
            <p className="text-sm leading-relaxed">{item.plainEnglishDescription}</p>
            {!!item.referenceAmount && (
              <p className="text-xs mt-2 text-slate-500">
                Illustrative comparison for {item.quantity} unit(s):{' '}
                {formatCurrency(item.referenceAmount * item.quantity)}. Differences require review;
                this is not an allowed or legally owed rate.
              </p>
            )}
            <div className="space-y-3 mt-4">
              {item.anomalies.map((a, index) => (
                <div key={`${a.anomalyType}-${index}`} className="bg-white border rounded-xl p-4">
                  <h3 className="text-sm font-semibold">{a.title}</h3>
                  <p className="text-xs mt-1 leading-relaxed text-slate-600">{a.explanation}</p>
                  <p className="text-xs mt-2 leading-relaxed">
                    <strong>Next step:</strong> {a.remedy}
                  </p>
                </div>
              ))}
              {!item.anomalies.length && (
                <p className="text-xs text-slate-600">
                  No configured rule flagged this row. That does not confirm its accuracy, medical
                  necessity, or price.
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
