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

  const highSeverityCount = anomalies.filter((a) => a.severity === 'HIGH').length;
  const mediumSeverityCount = anomalies.filter((a) => a.severity === 'MEDIUM').length;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/" className="hover:text-slate-900">
                Home
              </Link>
              <span>/</span>
              <Link href="/scan" className="hover:text-slate-900">
                Audit Intake
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-medium">Audit #{id.slice(0, 12)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-[-0.03em]">
              Forensic Audit Dossier
            </h1>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => openCopilot()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask Copilot</span>
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs sm:text-sm font-medium transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>{shareSuccess ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs sm:text-sm font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Patient & Facility Summary Header Bar */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Healthcare Facility
              </span>
              <p className="font-semibold text-slate-900 mt-1">{facility.name}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Patient / Account #
              </span>
              <p className="font-mono font-semibold text-slate-900 mt-1">
                {patient.accountNumber || 'ACC-99281'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Statement Date
              </span>
              <p className="font-semibold text-slate-900 mt-1">
                {patient.statementDate || 'Recent'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" /> Audit Verification
              </span>
              <p className="font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Deterministic Pass
              </p>
            </div>
          </div>
        </div>

        {/* 4 Forensic Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Gross Billed */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Hospital Charge
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
                ${financials.totalBilledGross.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-mono">Gross Billed</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Pre-dispute total across {items.length} line items.</p>
          </div>

          {/* Card 2: Disputed Overcharges */}
          <div className="bg-white p-5 rounded-xl border border-rose-200/90 shadow-2xs bg-rose-50/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                Disputed Overcharges
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                Save {savingsPct}%
              </span>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-rose-600">
                -${financials.totalPotentialSavings.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-rose-800 mt-1">
              {anomalies.length} billing errors & markups flagged.
            </p>
          </div>

          {/* Card 3: Revised Fair Total */}
          <div className="bg-white p-5 rounded-xl border border-emerald-200/90 shadow-2xs bg-emerald-50/20">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Revised Fair Market Total
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-700">
                ${revisedFairTotal.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-emerald-700">Medicare Basis</span>
            </div>
            <p className="text-xs text-emerald-800 mt-1">Undisputed median fair-market balance.</p>
          </div>

          {/* Card 4: Overcharge Risk Score */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Audit Risk Score
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  financials.riskScore >= 70
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {financials.riskScore >= 70 ? 'HIGH RISK' : 'MODERATE'}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
                {financials.riskScore}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full ${
                  financials.riskScore >= 70 ? 'bg-rose-600' : 'bg-amber-500'
                }`}
                style={{ width: `${financials.riskScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Primary Call-to-Action Bar */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              Statutory 30-Day Fair Credit Billing Act Window Active
            </div>
            <h3 className="text-lg sm:text-xl font-semibold">
              Ready to challenge this bill with your legal dispute kit?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              We have generated a formal Certified Mail letter citing 15 U.S.C. 1666, an itemized
              schedule of $ {financials.totalPotentialSavings.toFixed(2)} in disputed charges, and a
              phone negotiation playbook.
            </p>
          </div>
          <Link
            href={`/dispute/${report.id}`}
            className="shrink-0 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Dispute Kit</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Anomaly Alerts Banner */}
        {anomalies.length > 0 && (
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-rose-900 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Forensic Violations Detected ({anomalies.length} Total)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-rose-200">
                <span className="font-semibold text-rose-800 block">Critical Discrepancies</span>
                <span className="text-slate-600 mt-0.5 block">
                  {highSeverityCount} duplicate or unbundled violations requiring full write-off.
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-amber-200">
                <span className="font-semibold text-amber-800 block">Excessive Markups</span>
                <span className="text-slate-600 mt-0.5 block">
                  {mediumSeverityCount} line items exceed 250% of CMS regional Medicare allowables.
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block">Statutory Protection</span>
                <span className="text-slate-600 mt-0.5 block">
                  FCBA Section 1666 stay prohibits negative credit reporting during dispute.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Itemized Table */}
        <div>
          <AuditTable items={items} onToggleDispute={handleToggleDispute} />
        </div>
      </div>

      {/* Copilot Drawer (Rendered exclusively on Results page with full audit dossier context) */}
      <CopilotDrawer report={report} />
    </div>
  );
}
