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
    if (filter === 'HIGH') return item.status === 'HIGH';
    if (filter === 'MARKUPS')
      return item.anomalies.some((a) => a.anomalyType === 'EXCESSIVE_MARKUP');
    return true;
  });

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
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-base sm:text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-slate-700" />
            Itemized Clinical Ledger & Forensic Benchmarks
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cross-referenced against CMS Medicare Physician Fee Schedule (MPFS) and NCCI edits.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setFilter('FLAGGED')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === 'FLAGGED'
                ? 'bg-rose-700 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Flagged Errors ({items.filter((i) => i.anomalies.length > 0).length})
          </button>
          <button
            onClick={() => setFilter('HIGH')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === 'HIGH'
                ? 'bg-rose-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Critical Violations
          </button>
          <button
            onClick={() => setFilter('MARKUPS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === 'MARKUPS'
                ? 'bg-amber-700 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Excessive Markups
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
                    <tr className="bg-slate-50/90 border-b border-slate-200">
                      <td colSpan={7} className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Left Column: Plain-English Translation & Clinical Purpose */}
                          <div className="space-y-3">
                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-blue-600" />
                                Plain-English Translation (No Jargon)
                              </h4>
                              <p className="text-sm text-slate-800 leading-relaxed font-sans">
                                {item.plainEnglishDescription}
                              </p>
                            </div>

                            {/* Fair Market Range Visual */}
                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                CMS Pricing Benchmark vs Billed Rate
                              </h4>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs text-slate-600">
                                  <span>Medicare Allowable Median:</span>
                                  <span className="font-mono font-semibold text-slate-800">
                                    ${item.benchmarkMedian.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-600">
                                  <span>Fair Market Range (50th - 80th %):</span>
                                  <span className="font-mono text-slate-700">
                                    ${item.fairMarketRange[0].toFixed(2)} – $
                                    {item.fairMarketRange[1].toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-900 font-medium pt-1 border-t border-slate-100">
                                  <span>Hospital Billed Rate:</span>
                                  <span
                                    className={`font-mono font-bold ${
                                      item.billedAmount > item.benchmarkMedian * 2
                                        ? 'text-rose-600'
                                        : 'text-slate-900'
                                    }`}
                                  >
                                    ${item.billedAmount.toFixed(2)}
                                    {item.benchmarkMedian > 0 && (
                                      <span className="text-xs font-normal text-slate-500 ml-1">
                                        ({(item.billedAmount / item.benchmarkMedian).toFixed(1)}x
                                        Medicare)
                                      </span>
                                    )}
                                  </span>
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
                                  className="bg-white p-4 rounded-lg border border-rose-200/90 shadow-2xs space-y-2"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                                      <h5 className="font-semibold text-rose-900 text-sm">
                                        {anomaly.title}
                                      </h5>
                                    </div>
                                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                                      Dispute: ${anomaly.disputedAmount.toFixed(2)}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-700 leading-relaxed">
                                    {anomaly.explanation}
                                  </p>

                                  <div className="pt-2 border-t border-slate-100 text-xs">
                                    <p className="text-slate-800 font-medium">
                                      <span className="text-emerald-700 font-semibold">
                                        Actionable Remedy:
                                      </span>{' '}
                                      {anomaly.remedy}
                                    </p>
                                    {anomaly.statutoryBasis && (
                                      <p className="text-slate-500 text-[11px] mt-1 font-mono">
                                        Basis: {anomaly.statutoryBasis}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-2xs flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                  <h5 className="font-semibold text-emerald-900 text-sm">
                                    No Clinical or Billing Errors Flagged
                                  </h5>
                                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    This charge conforms to standard regional Medicare median fee
                                    guidelines and contains no duplicate occurrences or unbundled
                                    sub-codes.
                                  </p>
                                </div>
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
