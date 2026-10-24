'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuditStore } from '@/lib/store';
import { AuditReport } from '@/types/audit';
import {
  Printer,
  Copy,
  Check,
  Shield,
  PhoneCall,
  Scale,
  FileText,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export default function DisputePage() {
  const params = useParams();
  const id = params?.id as string;

  const { currentReport, setCurrentReport } = useAuditStore();
  const [report, setReport] = useState<AuditReport | null>(currentReport);
  const [isLoading, setIsLoading] = useState(!currentReport);
  const [activeTab, setActiveTab] = useState<'LETTER' | 'PHONE' | 'STATUTES'>('LETTER');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentReport && currentReport.id === id) {
      setReport(currentReport);
      setIsLoading(false);
      return;
    }

    const loadReport = async () => {
      setIsLoading(true);
      try {
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
        console.error('Failed to load dispute report:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [id, currentReport, setCurrentReport]);

  const handleCopyText = () => {
    if (report?.disputePackage?.formalLetterText) {
      navigator.clipboard.writeText(report.disputePackage.formalLetterText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-4" />
        <h2 className="text-base font-semibold text-slate-800">Compiling Statutory Dispute Kit...</h2>
      </div>
    );
  }

  const { facility, patient, financials, disputePackage } = report;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Header & Breadcrumb (Hidden during Print) */}
        <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/" className="hover:text-slate-900">
                Home
              </Link>
              <span>/</span>
              <Link href={`/results/${report.id}`} className="hover:text-slate-900">
                Audit Dossier
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-medium">Dispute Toolkit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-[-0.03em]">
              Statutory Dispute & Negotiation Kit
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Certified Mail dispute package under 15 U.S.C. 1666 for Account #{patient.accountNumber} ($
              {financials.totalPotentialSavings.toFixed(2)} in disputed charges).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs sm:text-sm font-medium transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Letter Copied!' : 'Copy Letter'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation (Hidden during Print) */}
        <div className="print:hidden flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-2xs">
          <button
            onClick={() => setActiveTab('LETTER')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'LETTER'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Certified FCBA Dispute Letter</span>
          </button>
          <button
            onClick={() => setActiveTab('PHONE')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'PHONE'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Phone Negotiation Playbook (4 Scripts)</span>
          </button>
          <button
            onClick={() => setActiveTab('STATUTES')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'STATUTES'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Federal Statutory Protections</span>
          </button>
        </div>

        {/* TAB 1: FORMAL DISPUTE LETTER */}
        {activeTab === 'LETTER' && (
          <div className="space-y-6">
            {/* Certified Mail Instructions Card (Hidden during print) */}
            <div className="print:hidden p-4 sm:p-5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs sm:text-sm flex items-start gap-3.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-950">
                  Critical Step for Legal Protection: Send via USPS Certified Mail
                </h4>
                <p className="mt-1 leading-relaxed text-amber-900">
                  To legally trigger the mandatory credit reporting freeze under the Fair Credit
                  Billing Act (15 U.S.C. 1666), this written notice should be sent via{' '}
                  <strong>USPS Certified Mail with Return Receipt Requested (PS Form 3800)</strong>.
                  Keep the postmarked receipt and green return card in your records.
                </p>
              </div>
            </div>

            {/* Letter Paper Container */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-8 sm:p-14 print:p-0 print:border-none print:shadow-none">
              <div className="max-w-3xl mx-auto font-mono text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap select-text">
                {disputePackage.formalLetterText}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PHONE NEGOTIATION PLAYBOOK */}
        {activeTab === 'PHONE' && (
          <div className="space-y-6 print:hidden">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Patient Phone Defense Strategy</h4>
                <p className="mt-1 text-emerald-900">
                  When calling hospital billing, hospital representatives are trained with 4 standard
                  scripts to deflect disputes. Below are your exact counter-scripts backed by federal
                  statute. Always ask for the representative&apos;s name and direct extension.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {disputePackage.phoneNegotiationPoints.map((point, idx) => {
                const parts = point.split(':');
                const title = parts[0];
                const dialogue = parts.slice(1).join(':').trim();

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                      <PhoneCall className="w-4 h-4 text-emerald-700" />
                      <span>{title}</span>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed">
                      {dialogue}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>Tactical purpose: Formal statutory notice</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(dialogue.replace(/^"|"$/g, ''));
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="text-slate-700 hover:text-slate-900 font-medium flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Script
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: STATUTORY LEGAL RIGHTS */}
        {activeTab === 'STATUTES' && (
          <div className="space-y-4 print:hidden">
            {/* Statute 1: FCBA */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  15 U.S.C. 1666
                </span>
                <span className="text-xs text-slate-500">Federal Consumer Credit Protection</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Fair Credit Billing Act (FCBA) & Regulation Z
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Protects consumers against unfair billing practices and computational errors. When a
                patient submits timely written notice within 60 days of the bill statement:
              </p>
              <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-700 space-y-1.5">
                <li>
                  The creditor must acknowledge receipt of the dispute within <strong>30 days</strong>.
                </li>
                <li>
                  The creditor must investigate and correct the bill or explain why it believes the
                  charge is correct within <strong>two billing cycles (max 90 days)</strong>.
                </li>
                <li>
                  <strong>Negative Credit Reporting Stay:</strong> The creditor may NOT report the
                  disputed balance to any credit reporting bureau while the dispute is pending.
                </li>
              </ul>
            </div>

            {/* Statute 2: NSA */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Public Law 116-260
                </span>
                <span className="text-xs text-slate-500">Emergency & Surprise Medical Bills</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Federal No Surprises Act (42 U.S.C. 300gg-111)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Eliminates surprise balance billing for emergency services at out-of-network
                facilities, and for non-emergency services provided by out-of-network doctors at
                in-network hospitals without 72-hour advance written consent. Patient cost-sharing is
                capped at in-network rates.
              </p>
            </div>

            {/* Statute 3: IRC 501(r) */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  26 U.S.C. 501(r)
                </span>
                <span className="text-xs text-slate-500">IRS Nonprofit Hospital Mandates</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                IRC Section 501(r) Amounts Generally Billed (AGB)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Under the Affordable Care Act, tax-exempt 501(c)(3) hospitals are legally prohibited
                from charging individuals eligible for financial assistance gross chargemaster prices.
                Charges must be discounted to the Amounts Generally Billed (AGB) based on Medicare and
                commercial payer blended rates (typically a 50%–70% discount).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
