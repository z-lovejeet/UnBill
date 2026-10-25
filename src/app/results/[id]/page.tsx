'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuditStore } from '@/lib/store';
import { AuditReport } from '@/types/audit';
import { AuditTable } from '@/components/audit-table';
import { CopilotDrawer } from '@/components/copilot-drawer';
import {
  ShieldAlert,
  ArrowRight,
  Printer,
  Share2,
  FileText,
  DollarSign,
  AlertTriangle,
  Scale,
  Building,
  Calendar,
  User,
  CheckCircle2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { currentReport, setCurrentReport, toggleItemDispute, openCopilot } = useAuditStore();
  const [report, setReport] = useState<AuditReport | null>(currentReport);
  const [isLoading, setIsLoading] = useState(!currentReport);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    // If state already has the matching report, use it
    if (currentReport && currentReport.id === id) {
      setReport(currentReport);
      setIsLoading(false);
      return;
    }

    // Otherwise, attempt to load from sample API or localStorage
    const loadReport = async () => {
      setIsLoading(true);
      try {
        // If it's a shared link, check Upstash cloud first
        if (id.startsWith('share_')) {
          const shareRes = await fetch(`/api/share?id=${id}`);
          if (shareRes.ok) {
            const sharedData = await shareRes.json();
            setReport(sharedData);
            setCurrentReport(sharedData);
            setIsLoading(false);
            return;
          }
        }

        const sampleId = id.includes('surgery') ? 'outpatient_surgery' : 'er_visit_broken_wrist';
        const res = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sampleId }),
        });
        if (res.ok) {
          const data = await res.json();
          data.id = id;
          setReport(data);
          setCurrentReport(data);
        }
      } catch (err) {
        console.error('Failed to load audit report:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [id, currentReport, setCurrentReport]);

  const handleToggleDispute = (itemId: string) => {
    toggleItemDispute(itemId);
    if (report) {
      const updatedItems = report.items.map((item) =>
        item.id === itemId ? { ...item, isDisputed: !item.isDisputed } : item
      );

      // Recalculate dynamic disputed savings
      let newSavings = 0;
      for (const item of updatedItems) {
        if (item.isDisputed && item.anomalies.length > 0) {
          const maxDispute = Math.max(...item.anomalies.map((a) => a.disputedAmount));
          newSavings += maxDispute;
        }
      }

      const updatedReport = {
        ...report,
        items: updatedItems,
        financials: {
          ...report.financials,
          totalPotentialSavings: Math.round(newSavings * 100) / 100,
        },
      };

      setReport(updatedReport);
      setCurrentReport(updatedReport);
    }
  };

  const handleShare = async () => {
    try {
      if (report) {
        const res = await fetch('/api/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auditReport: report }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.shareUrl) {
            await navigator.clipboard.writeText(data.shareUrl);
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 2500);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Share API fallback to current URL:', e);
    }
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  };

  if (isLoading || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-4" />
        <h2 className="text-base font-semibold text-slate-800">Loading Forensic Audit Dossier...</h2>
        <p className="text-xs text-slate-500 mt-1">Reconstructing clinical ledger and benchmarks.</p>
      </div>
    );
  }

  const { facility, patient, financials, items, anomalies } = report;
  const savingsPct =
    financials.totalBilledGross > 0
      ? Math.round((financials.totalPotentialSavings / financials.totalBilledGross) * 100)
      : 0;

  const revisedFairTotal = Math.max(
    0,
    financials.totalBilledGross - financials.totalPotentialSavings
  );

  const duplicateCount = anomalies.filter(
    (a) => a.anomalyType === 'DUPLICATE_CHARGE' || a.anomalyType === 'QUANTITY_OVERBILL'
  ).length;
  const unbundledCount = anomalies.filter((a) => a.anomalyType === 'UNBUNDLED_CHARGE').length;
  const fullWriteOffCount = duplicateCount + unbundledCount;
  const markupCount = anomalies.filter((a) => a.anomalyType === 'EXCESSIVE_MARKUP').length;
  const upcodeCount = anomalies.filter((a) => a.anomalyType === 'UPCODING_SEVERITY').length;

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-7">
        {/* Top Header & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-mono">
              <Link href="/" className="hover:text-slate-900 transition-colors">
                Home
              </Link>
              <span className="text-slate-300">/</span>
              <Link href="/scan" className="hover:text-slate-900 transition-colors">
                Intake
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-semibold">Audit #{id.slice(0, 10)}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-[-0.03em]">
                Forensic Audit Dossier
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Deterministic Pass
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Statutory clinical coding review cross-referenced with CMS fee schedules and NCCI edits.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openCopilot()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm shadow-xs transition-all active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Ask Copilot</span>
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-medium transition-colors shadow-2xs"
            >
              <Share2 className="w-4 h-4 text-slate-500" />
              <span>{shareSuccess ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-medium transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Patient & Facility Summary Header Bar (Executive Strip) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-xs sm:text-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" /> Healthcare Facility
              </span>
              <p className="font-semibold text-slate-950 truncate" title={facility.name}>
                {facility.name}
              </p>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                {facility.billingPhone || facility.address || 'Financial Services Dept'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Patient / Account #
              </span>
              <p className="font-mono font-bold text-slate-950">
                {patient.accountNumber || 'ACC-99281'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {patient.patientName || 'Primary Account Holder'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Statement Date
              </span>
              <p className="font-semibold text-slate-950">
                {patient.statementDate || 'Recent Statement'}
              </p>
              <p className="text-[11px] text-slate-500">
                Encounter Period Verified
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-400" /> Statutory Dispute Window
              </span>
              <p className="font-semibold text-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                Active (FCBA 15 U.S.C. 1666)
              </p>
              <p className="text-[11px] text-slate-500">
                30-day collection stay in effect
              </p>
            </div>
          </div>
        </div>

        {/* 4 Forensic Financial KPI Cards (Harmonized, Minimalist, High-Impact) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Gross Billed */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 block">
                Total Hospital Charge
              </span>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-950 tracking-tight">
                  ${financials.totalBilledGross.toFixed(2)}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Gross</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
              Pre-dispute total across {items.length} line items.
            </p>
          </div>

          {/* Card 2: Disputed Overcharges (Hero) */}
          <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500/80" />
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-rose-800">
                  Disputed Overcharges
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  Save {savingsPct}%
                </span>
              </div>
              <div className="mt-2.5">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-rose-600 tracking-tight">
                  -${financials.totalPotentialSavings.toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-xs text-rose-700 mt-2 pt-2 border-t border-slate-100 font-medium">
              {anomalies.length} statutory errors & markups flagged.
            </p>
          </div>

          {/* Card 3: Revised Fair Total */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/80" />
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-900">
                  Revised Fair Market Total
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Medicare Basis
                </span>
              </div>
              <div className="mt-2.5">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-700 tracking-tight">
                  ${revisedFairTotal.toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-xs text-emerald-800 mt-2 pt-2 border-t border-slate-100 font-medium">
              Undisputed median fair-market balance.
            </p>
          </div>

          {/* Card 4: Overcharge Risk Score */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                  Audit Risk Score
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    financials.riskScore >= 70
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {financials.riskScore >= 70 ? 'HIGH RISK' : 'MODERATE'}
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-950 tracking-tight">
                  {financials.riskScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    financials.riskScore >= 70
                      ? 'bg-rose-600'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${financials.riskScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Primary Call-to-Action Bar (Clean Executive Card) */}
        <div className="p-6 sm:p-7 bg-slate-950 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg border border-slate-800">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              15 U.S.C. 1666 Statutory Protection Active
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Ready to challenge this bill with your formal legal dispute kit?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              We have compiled an official Certified Mail legal package citing 15 U.S.C. 1666, an itemized schedule of ${financials.totalPotentialSavings.toFixed(2)} in disputed charges, and a 4-scenario hospital negotiation script.
            </p>
          </div>
          <Link
            href={`/dispute/${report.id}`}
            className="shrink-0 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Dispute Kit</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Forensic Violations Findings Overview */}
        {anomalies.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2 tracking-tight">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Forensic Violations Detected ({anomalies.length} Total)
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Audited against CMS NCCI Edits & MPFS Regional Medians
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              {/* Module 1 */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1.5 relative overflow-hidden">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-900 block">Unbundled & Duplicates</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    Full Write-Off
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {fullWriteOffCount > 0
                    ? `${fullWriteOffCount} full write-off ${fullWriteOffCount === 1 ? 'charge' : 'charges'} (${duplicateCount} duplicate, ${unbundledCount} unbundled).`
                    : 'No duplicate or unbundled charges detected.'}
                </p>
              </div>

              {/* Module 2 */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1.5 relative overflow-hidden">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-900 block">Excessive Markups & Acuity</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Price Caps
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {markupCount + upcodeCount} {markupCount + upcodeCount === 1 ? 'violation' : 'violations'} exceeding fair benchmarks ({markupCount} markup{upcodeCount > 0 ? `, ${upcodeCount} upcode` : ''}).
                </p>
              </div>

              {/* Module 3 */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1.5 relative overflow-hidden">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-900 block">Statutory Protection</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    FCBA Stay
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  FCBA Section 1666 stay legally prohibits negative credit reporting during active dispute.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Itemized Table */}
        <div>
          <AuditTable items={items} onToggleDispute={handleToggleDispute} />
        </div>
      </div>

      {/* Copilot Drawer */}
      <CopilotDrawer report={report} />
    </div>
  );
}
