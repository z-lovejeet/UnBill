import React from 'react';
import Link from 'next/link';
import {
  Scale,
  ShieldCheck,
  Building2,
  FileCheck2,
  Brain,
  Cpu,
  ArrowRight,
  BookOpen,
  Sparkles,
  Lock,
} from 'lucide-react';

export const metadata = {
  title: 'About UnBill — Mission, Forensic Methodology & Statutory Grounds',
  description:
    'Learn how UnBill combines deterministic clinical coding algorithms with Gemini vision OCR and Groq conversational AI to defend patients against predatory hospital billing.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            Independent Patient Financial Defense
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-950 tracking-[-0.035em]">
            Democratizing Forensic Hospital Bill Auditing
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed tracking-[-0.01em]">
            Healthcare is the only major purchase where Americans are denied upfront pricing, handed
            indecipherable 5-digit codes, and threatened with collections for bills that contain an
            estimated 80% error rate.
          </p>
        </div>

        {/* The Problem & Our Mission */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-8 sm:p-12 space-y-6">
            <h2 className="text-2xl font-bold text-slate-950 tracking-[-0.025em]">
              The Asymmetry of Medical Debt
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed tracking-[-0.005em]">
              <p>
                American hospitals employ armies of revenue-cycle consultants, automated upcoding
                software, and aggressive debt collectors. In contrast, the average patient receives a
                cryptic paper bill listing codes like <code className="font-mono text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-xs font-semibold">99285</code> or <code className="font-mono text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-xs font-semibold">80053</code> with zero itemization or benchmark context.
              </p>
              <p>
                According to the Consumer Financial Protection Bureau (CFPB), over <strong>$88 billion</strong> in medical debt sits on consumer credit reports. Studies by medical billing advocacy groups consistently find that <strong>over 80% of hospital statements contain billing errors</strong>—including duplicate entries, unbundled tests, inflated room fees, and markups exceeding 400% of regional Medicare allowables.
              </p>
              <p>
                <strong>UnBill was engineered to balance the playing field.</strong> We give every patient access to institutional-grade clinical coding forensics, statutory dispute mechanics, and real-time negotiation strategies.
              </p>
            </div>
          </div>
        </div>

        {/* The 4-Agent Sequential Architecture */}
        <div className="space-y-6">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
              Architecture
            </span>
            <h2 className="text-3xl font-bold text-slate-950 tracking-[-0.03em] mt-1">
              Why We Rejected Brittle AI Loops
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto mt-2">
              In financial and legal matters, hallucinations destroy trust. UnBill strictly isolates
              generative models to perception, delegating arithmetic and statutory checks to
              deterministic algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Agent 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center">
                <Brain className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-slate-950 text-base tracking-tight">
                Agent 1: Clinical Ingestion (Gemini 3.5 Flash Lite)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Reads raw photos, patient portal PDFs, and OCR statements. Extracts facility names,
                patient account numbers, statement dates, and itemized CPT/HCPCS codes into a strict
                JSON schema without guessing.
              </p>
            </div>

            {/* Agent 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center">
                <Cpu className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-slate-950 text-base tracking-tight">
                Agent 2: Forensic CPT & Pricing Auditor (Deterministic Engine)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Zero generative hallucinations. Performs mathematical duplicate detection, CMS
                National Correct Coding Initiative (NCCI) unbundling checks, and compares gross hospital
                rates against Medicare Physician Fee Schedule (MPFS) medians.
              </p>
            </div>

            {/* Agent 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-slate-950 text-base tracking-tight">
                Agent 3: Legal & Dispute Advocate (Statutory Matcher)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Matches flagged discrepancies to federal consumer statutes: Fair Credit Billing Act
                (15 U.S.C. 1666), the federal No Surprises Act, and IRS Section 501(r) Amounts Generally
                Billed rules, assembling formal certified dispute packages.
              </p>
            </div>

            {/* Agent 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-slate-950 text-base tracking-tight">
                Agent 4: UnBill Copilot (Groq Sub-350ms Engine)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Streams real-time conversational negotiation coaching with sub-350ms first-token
                latency. Injected with the patient&apos;s active audit dossier, it delivers instant phone
                scripts to refute billing department objections.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Verification Sources */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-800" />
            <h2 className="text-xl font-bold text-slate-950 tracking-[-0.025em]">
              Authoritative Forensic Data Sources
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            UnBill cross-references charges against official federal healthcare benchmarks:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-emerald-600 font-bold">•</span>
              <div>
                <strong>CMS Medicare Physician Fee Schedule (MPFS):</strong> Official federal
                allowable rates for outpatient, laboratory, and procedural codes.
              </div>
            </li>
            <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-emerald-600 font-bold">•</span>
              <div>
                <strong>CMS National Correct Coding Initiative (NCCI):</strong> Federal procedure-to-procedure
                (PTP) code edit tables preventing improper component billing.
              </div>
            </li>
            <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-emerald-600 font-bold">•</span>
              <div>
                <strong>Federal No Surprises Act (Public Law 116-260):</strong> Statutory bans on
                out-of-network balance billing for emergency medical encounters.
              </div>
            </li>
            <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-emerald-600 font-bold">•</span>
              <div>
                <strong>Internal Revenue Code Section 501(r):</strong> Federal mandates prohibiting
                non-profit hospitals from billing eligible patients gross chargemaster rates.
              </div>
            </li>
          </ul>
        </div>

        {/* Call to Action Card */}
        <div className="p-1.5 sm:p-2 rounded-3xl bg-slate-200/70 border border-slate-300/80 shadow-xs">
          <div className="p-8 sm:p-10 text-center rounded-2xl bg-slate-950 text-white space-y-4 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-24 bg-emerald-500/10 blur-2xl pointer-events-none rounded-full" />
            <h3 className="relative z-10 text-2xl font-bold text-white tracking-tight">
              Ready to Audit Your Medical Statement?
            </h3>
            <p className="relative z-10 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              Test with one of our synthetic patient hospital scenarios or upload your own bill. 100%
              free, client-side private, and zero server data retention.
            </p>
            <div className="relative z-10 pt-2 flex justify-center">
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-sm active:scale-98"
              >
                <span>Audit a Bill Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
