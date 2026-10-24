'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuditStore } from '@/lib/store';
import { AuditReport } from '@/types/audit';
import {
  Archive,
  ArrowRight,
  Building,
  Calendar,
  DollarSign,
  FileText,
  ShieldCheck,
  Trash2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const { history, deleteAuditFromHistory, clearHistory, setCurrentReport } = useAuditStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Zustand persist with skipHydration requires manual trigger or waiting for mount
    useAuditStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate cumulative lifetime metrics
  const totalAudits = history.length;
  const totalGross = history.reduce((sum, h) => sum + h.financials.totalBilledGross, 0);
  const totalSavings = history.reduce((sum, h) => sum + h.financials.totalPotentialSavings, 0);

  const handleOpenAudit = (audit: AuditReport) => {
    setCurrentReport(audit);
    router.push(`/results/${audit.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Encrypted Local Storage • Zero Remote Tracking
            </div>
            <h1 className="text-3xl font-bold text-slate-950 tracking-[-0.035em]">
              Local Audit Vault
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Your private client-side ledger of scanned hospital statements and generated dispute kits.
            </p>
          </div>

          {totalAudits > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete all scans from your local browser vault?')) {
                  clearHistory();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-3 py-2 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Vault</span>
            </button>
          )}
        </div>

        {/* Lifetime Financial Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Audits Conducted
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-slate-900">{totalAudits}</span>
              <span className="text-xs text-slate-400">statements</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Stored locally in your browser.</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Gross Billed Analyzed
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-slate-900">
                ${totalGross.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Across all audited procedures.</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-emerald-200/90 shadow-2xs bg-emerald-50/20">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Cumulative Disputed Savings
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-emerald-700">
                ${totalSavings.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-1">Identified hospital overcharges & errors.</p>
          </div>
        </div>

        {/* Audits List */}
        {totalAudits === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
              <Archive className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Your Vault is Empty</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Scan a medical bill or try a synthetic test scenario to start tracking your hospital audits.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/scan"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs"
              >
                Audit a Hospital Bill
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Saved Audit Dossiers ({totalAudits})
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {history.map((audit) => {
                const highErrors = audit.anomalies.filter((a) => a.severity === 'HIGH').length;

                return (
                  <div
                    key={audit.id}
                    className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-base">
                          {audit.facility.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            audit.financials.riskScore >= 70
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          Risk {audit.financials.riskScore}/100
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="font-mono">Account #{audit.patient.accountNumber}</span>
                        <span>•</span>
                        <span>Date: {audit.patient.statementDate}</span>
                        <span>•</span>
                        <span>{audit.items.length} Line Items</span>
                        {highErrors > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-rose-600 font-semibold">
                              {highErrors} Critical Errors
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Potential Savings</div>
                        <div className="text-lg font-mono font-bold text-emerald-700">
                          ${audit.financials.totalPotentialSavings.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          of ${audit.financials.totalBilledGross.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenAudit(audit)}
                          className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>Open Dossier</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteAuditFromHistory(audit.id)}
                          title="Delete from local vault"
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
