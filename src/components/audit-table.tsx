'use client';

import React, { useState } from 'react';
import { AuditedLineItem, AnomalySeverity } from '@/types/audit';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Scale,
  DollarSign,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface AuditTableProps {
  items: AuditedLineItem[];
  onToggleDispute?: (itemId: string) => void;
}

export function AuditTable({ items, onToggleDispute }: AuditTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id || null);
  const [filter, setFilter] = useState<'ALL' | 'FLAGGED' | 'HIGH' | 'MARKUPS'>('ALL');

  const filteredItems = items.filter((item) => {
    if (filter === 'FLAGGED') return item.anomalies.length > 0;
    if (filter === 'HIGH')
      return item.anomalies.some(
        (a) => a.anomalyType === 'DUPLICATE_CHARGE' || a.anomalyType === 'UNBUNDLED_CHARGE'
      );
    if (filter === 'MARKUPS')
      return item.anomalies.some(
        (a) =>
          a.anomalyType === 'EXCESSIVE_MARKUP' || a.anomalyType === 'UPCODING_SEVERITY'
      );
    return true;
  });

  const flaggedCount = items.filter((i) => i.anomalies.length > 0).length;
  const writeOffCount = items.filter((i) =>
    i.anomalies.some(
      (a) => a.anomalyType === 'DUPLICATE_CHARGE' || a.anomalyType === 'UNBUNDLED_CHARGE'
    )
  ).length;
  const markupCount = items.filter((i) =>
    i.anomalies.some(
      (a) =>
        a.anomalyType === 'EXCESSIVE_MARKUP' || a.anomalyType === 'UPCODING_SEVERITY'
    )
  ).length;

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getItemBadge = (item: AuditedLineItem) => {
    if (!item.anomalies || item.anomalies.length === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Fair Rate
        </span>
      );
    }

    const hasDuplicate = item.anomalies.some(
      (a) => a.anomalyType === 'DUPLICATE_CHARGE' || a.anomalyType === 'QUANTITY_OVERBILL'
    );
    if (hasDuplicate) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          Duplicate Charge
        </span>
      );
    }

    const hasUnbundled = item.anomalies.some((a) => a.anomalyType === 'UNBUNDLED_CHARGE');
    if (hasUnbundled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          Unbundled (NCCI)
        </span>
      );
    }

    const hasUpcode = item.anomalies.some((a) => a.anomalyType === 'UPCODING_SEVERITY');
    if (hasUpcode) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <AlertCircle className="w-3 h-3 text-purple-600" />
          Suspected Upcoding
        </span>
      );
    }

    const hasMarkup = item.anomalies.some((a) => a.anomalyType === 'EXCESSIVE_MARKUP');
    if (hasMarkup) {
      const markupAnomaly = item.anomalies.find((a) => a.anomalyType === 'EXCESSIVE_MARKUP');
      const isExtreme = markupAnomaly?.severity === 'HIGH';
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isExtreme
              ? 'bg-amber-50 text-amber-900 border border-amber-300'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          <AlertCircle className="w-3 h-3 text-amber-600" />
          {isExtreme ? 'Severe Markup' : 'Excessive Markup'}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <Info className="w-3 h-3 text-blue-600" />
        Review Needed
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-950 text-base sm:text-lg flex items-center gap-2 tracking-tight">
            <Scale className="w-5 h-5 text-slate-700" />
            Itemized Clinical Ledger & Forensic Benchmarks
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-referenced against CMS Medicare Physician Fee Schedule (MPFS) and NCCI edits.
          </p>
        </div>

        {/* Minimalist Segmented Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all font-medium whitespace-nowrap ${
              filter === 'ALL'
                ? 'bg-slate-950 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setFilter('FLAGGED')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all font-medium whitespace-nowrap ${
              filter === 'FLAGGED'
                ? 'bg-slate-950 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            Flagged ({flaggedCount})
          </button>
          <button
            onClick={() => setFilter('HIGH')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all font-medium whitespace-nowrap ${
              filter === 'HIGH'
                ? 'bg-slate-950 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            Full Write-Offs ({writeOffCount})
          </button>
          <button
            onClick={() => setFilter('MARKUPS')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all font-medium whitespace-nowrap ${
              filter === 'MARKUPS'
                ? 'bg-slate-950 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            Excessive Markups ({markupCount})
          </button>
        </div>
      </div>

      {/* Table Structure */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100/80 text-xs font-semibold text-slate-600 border-b border-slate-200 uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-3 px-4 w-12 text-center">
                Dispute
              </th>
              <th scope="col" className="py-3 px-4">
                CPT Code & Description
              </th>
              <th scope="col" className="py-3 px-4">
                Clinical Status
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Billed Charge
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                CMS Median
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Potential Savings
              </th>
              <th scope="col" className="py-3 px-4 text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              const hasAnomalies = item.anomalies.length > 0;
              const maxDispute = hasAnomalies
                ? Math.max(...item.anomalies.map((a) => a.disputedAmount))
                : 0;

              return (
                <React.Fragment key={item.id}>
                  <tr
                    onClick={() => toggleRow(item.id)}
                    className={`cursor-pointer transition-colors ${
                      isExpanded
                        ? 'bg-slate-50'
                        : hasAnomalies
                        ? 'hover:bg-rose-50/30'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Checkbox for Dispute Selection */}
                    <td
                      className="py-3.5 px-4 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleDispute) onToggleDispute(item.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={item.isDisputed}
                        onChange={() => {
                          if (onToggleDispute) onToggleDispute(item.id);
                        }}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                        title="Toggle inclusion in formal dispute package"
                      />
                    </td>

                    {/* CPT Code & Raw Description */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {item.code}
                        </span>
                        <span className="font-medium text-slate-900 text-sm">
                          {item.rawDescription}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                        <span>Date: {item.dateOfService || 'Encounter date'}</span>
                        <span>Qty: {item.quantity}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">{item.clinicalCategory}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getItemBadge(item)}
                    </td>

                    {/* Billed Amount */}
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900">
                      ${item.billedAmount.toFixed(2)}
                    </td>

                    {/* CMS Benchmark Median */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                      ${item.benchmarkMedian.toFixed(2)}
                    </td>

                    {/* Potential Savings */}
                    <td className="py-3.5 px-4 text-right font-mono font-semibold">
                      {maxDispute > 0 ? (
                        <span className="text-rose-600">-${maxDispute.toFixed(2)}</span>
                      ) : (
                        <span className="text-emerald-700">$0.00</span>
                      )}
                    </td>

                    {/* Expand Arrow */}
                    <td className="py-3.5 px-4 text-center text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </td>
                  </tr>

                  {/* Expanded Detail Drawer */}
                  {isExpanded && (
                    <tr className="bg-slate-50/70 border-b border-slate-200">
                      <td colSpan={7} className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* Left Column: Plain-English Translation & Pricing Benchmarks */}
                          <div className="space-y-4">
                            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                              <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-blue-600" />
                                Plain-English Clinical Translation
                              </h4>
                              <p className="text-sm text-slate-800 leading-relaxed font-sans">
                                {item.plainEnglishDescription}
                              </p>
                            </div>

                            {/* Fair Market Range Visual */}
                            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                              <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                CMS Pricing Benchmark vs Hospital Charge
                              </h4>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center text-slate-600 pb-1.5 border-b border-slate-100">
                                  <span>Medicare Allowable Median:</span>
                                  <span className="font-mono font-semibold text-slate-900">
                                    ${item.benchmarkMedian.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600 pb-1.5 border-b border-slate-100">
                                  <span>Fair Market Range (50th - 80th %):</span>
                                  <span className="font-mono text-slate-800">
                                    ${item.fairMarketRange[0].toFixed(2)} – ${item.fairMarketRange[1].toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-slate-950 font-medium pt-0.5">
                                  <span>Hospital Billed Rate:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-slate-950">
                                      ${item.billedAmount.toFixed(2)}
                                    </span>
                                    {item.benchmarkMedian > 0 && (
                                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                                        {(item.billedAmount / item.benchmarkMedian).toFixed(1)}x Medicare
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Forensic Discrepancies & Remedies */}
                          <div className="space-y-3">
                            {hasAnomalies ? (
                              item.anomalies.map((anomaly, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5 relative overflow-hidden"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                                      <h5 className="font-bold text-slate-950 text-sm tracking-tight">
                                        {anomaly.title}
                                      </h5>
                                    </div>
                                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                                      Dispute: -${anomaly.disputedAmount.toFixed(2)}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                                    {anomaly.explanation}
                                  </p>

                                  <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-xs">
                                    <div className="text-slate-900 font-medium">
                                      <span className="text-emerald-700 font-bold">Actionable Remedy:</span>{' '}
                                      {anomaly.remedy}
                                    </div>
                                    {anomaly.statutoryBasis && (
                                      <div className="text-[11px] font-mono text-slate-500">
                                        <span className="text-slate-400 font-semibold">Statutory Basis:</span>{' '}
                                        {anomaly.statutoryBasis}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs text-center space-y-2">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                                <h5 className="font-bold text-slate-900 text-sm">
                                  No Clinical or Coding Violations
                                </h5>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                  This procedure was billed within the fair-market allowable range for this region with no duplicate or unbundled component flags.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
