import React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ShieldAlert,
  FileText,
  CheckCircle2,
  DollarSign,
  Scale,
  Brain,
  Cpu,
  FileCheck2,
  Sparkles,
  Lock,
  AlertTriangle,
  Flame,
  Check,
  X,
  ChevronRight,
  HelpCircle,
  Clock,
  ShieldCheck,
  PhoneCall,
  Zap,
} from 'lucide-react';
import { SampleBillCards } from '@/components/sample-bill-cards';

export default function HomePage() {
  return (
    <div className="w-full font-sans">
      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-tight shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Independent Patient Financial Advocacy</span>
            </div>

            {/* Ultra-Clean Modern Geometric Headline with Delicate Italic Accent */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-950 tracking-[-0.04em] leading-[1.06]">
              80% of hospital bills contain errors.{' '}
              <span className="font-serif italic font-normal text-emerald-800 underline decoration-emerald-400 decoration-wavy decoration-2 tracking-normal">
                Don&apos;t pay
              </span>{' '}
              until you audit.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-sans tracking-[-0.01em]">
              Upload your medical statement. Our multi-agent forensic engine decodes clinical CPT
              codes into plain English, flags duplicate and unbundled charges against Medicare
              benchmarks, and drafts legally enforceable Fair Credit Billing Act dispute letters.
            </p>

            {/* Luxury Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                href="/scan"
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm px-7 py-4 rounded-xl shadow-sm transition-all active:scale-[0.98] group"
              >
                <span>Upload Statement to Audit</span>
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                </div>
              </Link>

              <a
                href="#sample-tests"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm px-6 py-4 rounded-xl border border-slate-200 shadow-2xs transition-all"
              >
                <span>Test with Live Samples</span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Free
                </span>
              </a>
            </div>

            {/* Double-Bezel Real Stats Bar */}
            <div className="pt-6">
              <div className="double-bezel">
                <div className="double-bezel-inner grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 text-left">
                  <div className="p-2 border-r border-slate-100">
                    <p className="text-xs text-slate-400 font-medium">Prevalence Rate</p>
                    <p className="text-2xl font-bold text-slate-950 font-mono mt-0.5 tracking-tight">
                      80%
                    </p>
                    <p className="text-[11px] text-slate-500">Bills contain errors</p>
                  </div>
                  <div className="p-2 sm:border-r border-slate-100">
                    <p className="text-xs text-slate-400 font-medium">National Debt</p>
                    <p className="text-2xl font-bold text-slate-950 font-mono mt-0.5 tracking-tight">
                      $88B
                    </p>
                    <p className="text-[11px] text-slate-500">Consumer medical debt</p>
                  </div>
                  <div className="p-2 border-r border-slate-100">
                    <p className="text-xs text-slate-400 font-medium">Dispute Success</p>
                    <p className="text-2xl font-bold text-emerald-700 font-mono mt-0.5 tracking-tight">
                      74%
                    </p>
                    <p className="text-[11px] text-slate-500">Corrected if contested</p>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-slate-400 font-medium">Inaction Rate</p>
                    <p className="text-2xl font-bold text-slate-950 font-mono mt-0.5 tracking-tight">
                      86%
                    </p>
                    <p className="text-[11px] text-slate-500">Never dispute out of fear</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Problem Section: The Broken Healthcare Billing Machine */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-rose-600 tracking-wider">
              The Predatory Reality
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-950 tracking-[-0.035em]">
              Why American Medical Bills Are Broken
            </h2>
            <p className="text-sm text-slate-600">
              Healthcare billing is designed to be opaque, intimidating, and non-negotiable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Problem Card 1 */}
            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-950 text-lg tracking-tight">
                Arbitrary Chargemaster Markups
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hospitals set internal chargemaster prices arbitrarily—frequently marking up routine
                lab panels and imaging by <strong>300% to 1,000%</strong> above the regional Medicare
                allowable rates. Uninsured and high-deductible patients bear the brunt of these phantom rates.
              </p>
            </div>

            {/* Problem Card 2 */}
            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-950 text-lg tracking-tight">
                Cryptic CPT Jargon & Unbundling
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Statements hide behind 5-digit CPT codes without plain-English explanations. Hospitals
                frequently &ldquo;unbundle&rdquo; comprehensive blood panels (e.g. billing separate fees for
                albumin, bilirubin, and calcium when they are already included in a Comprehensive
                Metabolic Panel).
              </p>
            </div>

            {/* Problem Card 3 */}
            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-slate-950 text-lg tracking-tight">
                Collection Fear & Asymmetric Info
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hospitals weaponize automated collection countdowns. 86% of patients blindly pay or
                suffer credit damage because they don&apos;t know that filing a formal dispute under the
                <strong>Fair Credit Billing Act (15 U.S.C. 1666)</strong> legally freezes all collection
                actions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 1-Click Samples Section */}
      <section id="sample-tests" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <SampleBillCards />
      </section>

      {/* 4. The Multi-Agent AI Architecture (Hackathon Core) */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-emerald-700 tracking-wider">
              Autonomous Multi-Agent Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-950 tracking-[-0.035em]">
              How UnBill Eliminates Medical Hallucinations
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              In healthcare finance, mathematical errors destroy lives. We reject non-deterministic
              loops in favor of a <strong>Deterministic Sequential Agent Pipeline</strong>:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Agent 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold font-mono text-sm">
                <Brain className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  1. Clinical Ingestion
                </h3>
                <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded font-semibold text-slate-700 whitespace-nowrap shrink-0 inline-flex items-center">
                  Gemini 3.5
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Multimodal vision OCR extracts statement headers, account numbers, CPT/HCPCS codes,
                quantities, and line-item charges into a validated JSON schema.
              </p>
            </div>

            {/* Agent 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold font-mono text-sm">
                <Cpu className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  2. Forensic Auditor
                </h3>
                <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded font-semibold text-slate-700 whitespace-nowrap shrink-0 inline-flex items-center">
                  TypeScript
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zero hallucinations. Deterministic algorithms run duplicate checks, CMS NCCI
                unbundling audits, and compare charges against regional Medicare allowable medians.
              </p>
            </div>

            {/* Agent 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold font-mono text-sm">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  3. Legal Advocate
                </h3>
                <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded font-semibold text-slate-700 whitespace-nowrap shrink-0 inline-flex items-center">
                  15 U.S.C. 1666
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Synthesizes statutory rights under the Fair Credit Billing Act to compile certified
                dispute letters that invoke a 30-day investigation window and freeze collections.
              </p>
            </div>

            {/* Agent 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold font-mono text-sm">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  4. Groq Copilot
                </h3>
                <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded font-semibold text-slate-700 whitespace-nowrap shrink-0 inline-flex items-center">
                  Sub-350ms
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ultra-fast streaming conversational coach on results page. Injected with your exact
                bill numbers to provide instant spoken scripts for phone calls with hospital billing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Competitive Comparison Table: Why UnBill Wins */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">
            Comparative Benchmark
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-950 tracking-[-0.035em]">
            Why Generic AI & Human Advocates Fall Short
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            How UnBill compares against traditional medical advocates and generic chatbots:
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-semibold font-mono">
                <tr>
                  <th className="py-4 px-6">Evaluation Criteria</th>
                  <th className="py-4 px-6 text-slate-400">Manual Advocates</th>
                  <th className="py-4 px-6 text-slate-400">Generic Chatbots</th>
                  <th className="py-4 px-6 text-emerald-800 bg-emerald-50/70 font-bold font-sans">
                    UnBill Forensic AI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">Cost to Patient</td>
                  <td className="py-4 px-6">$500 – $1,500 retainer</td>
                  <td className="py-4 px-6">$20/month subscription</td>
                  <td className="py-4 px-6 font-bold text-emerald-700 bg-emerald-50/30">
                    100% Free & Open
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">Audit Turnaround</td>
                  <td className="py-4 px-6">3 to 6 Weeks</td>
                  <td className="py-4 px-6">15 to 30 Seconds</td>
                  <td className="py-4 px-6 font-bold text-emerald-700 bg-emerald-50/30">
                    &lt; 3.5 Seconds (Instant)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">Mathematical Precision</td>
                  <td className="py-4 px-6">High (Human Audited)</td>
                  <td className="py-4 px-6 text-rose-600">
                    Poor (Severe Math Hallucinations)
                  </td>
                  <td className="py-4 px-6 font-bold text-emerald-700 bg-emerald-50/30">
                    100% Deterministic (Zero Hallucination)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">
                    CMS NCCI Unbundling Edits
                  </td>
                  <td className="py-4 px-6">Manual lookup</td>
                  <td className="py-4 px-6 text-rose-600">Unreliable / Invented</td>
                  <td className="py-4 px-6 font-bold text-emerald-700 bg-emerald-50/30">
                    Automated Procedure-to-Procedure Cross-Ref
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">Dispute Letter Assembly</td>
                  <td className="py-4 px-6">Custom Legal Letter</td>
                  <td className="py-4 px-6">Generic template</td>
                  <td className="py-4 px-6 font-bold text-emerald-700 bg-emerald-50/30">
                    Statutory FCBA Section 1666 Certified Package
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-900">PHI Privacy & Storage</td>
                  <td className="py-4 px-6">Stored on 3rd-party servers</td>
                  <td className="py-4 px-6 text-rose-600">Logged for model training</td>
                  <td className="py-4 px-6 font-bold text-emerald-700 bg-emerald-50/30">
                    Zero Server Retention (Local Browser Vault)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. Federal Statutory Protections Strip - The Big Four */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-emerald-700 tracking-wider">
              The Big Four Federal Safeguards
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-950 tracking-[-0.035em]">
              Grounded in Federal Law, Not AI Guesswork
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Hospital billing departments count on patient confusion. UnBill anchors every discrepancy
              in the four foundational federal statutes and CMS coding mandates that govern American healthcare:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Statute 1: FCBA */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center whitespace-nowrap">
                    15 U.S.C. 1666
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-blue-800 bg-blue-100/70 px-1.5 py-0.5 rounded">
                    Freeze Collections
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  1. Fair Credit Billing Act & Reg Z
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Requires hospital billing departments to acknowledge written dispute notices within 30 days.
                  Legally prohibits negative credit bureau reporting or debt collection while an investigation is underway.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 text-[11px] font-medium text-slate-500">
                Remedy: Immediate statutory hold & ledger correction.
              </div>
            </div>

            {/* Statute 2: CMS NCCI */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300 inline-flex items-center whitespace-nowrap">
                    CMS NCCI Policy
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded">
                    $0.00 Write-Off
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  2. National Correct Coding Initiative
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enforces federal Procedure-to-Procedure (PTP) bundling rules. Hospitals are strictly prohibited
                  from unbundling diagnostic panels (e.g. charging separately for Albumin when a CMP is already billed).
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 text-[11px] font-medium text-slate-500">
                Remedy: Component charges written off to $0.00.
              </div>
            </div>

            {/* Statute 3: IRC 501(r) */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center whitespace-nowrap">
                    26 U.S.C. 501(r)
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-amber-900 bg-amber-100/70 px-1.5 py-0.5 rounded">
                    AGB Price Caps
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  3. Nonprofit Charity Care Mandate
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Affects ~60% of all US hospitals. Prohibits billing eligible uninsured or self-pay patients gross chargemaster
                  rates, legally capping charges to Amounts Generally Billed (AGB) based on regional Medicare averages.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 text-[11px] font-medium text-slate-500">
                Remedy: 50% to 85% price recalculation via AGB formula.
              </div>
            </div>

            {/* Statute 4: No Surprises Act */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center whitespace-nowrap">
                    42 U.S.C. 300gg-111
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                    Balance Billing Ban
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  4. Federal No Surprises Act
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bans surprise out-of-network balance billing for emergency department encounters and involuntary
                  ancillary physicians (radiologists, anesthesiologists, pathologists) at in-network facilities.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 text-[11px] font-medium text-slate-500">
                Remedy: Patient responsibility capped at in-network rates.
              </div>
            </div>
          </div>

          {/* Complementary Protections Strip */}
          <div className="mt-8 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-center text-xs text-slate-500 font-sans">
            <span className="font-semibold text-slate-700">Additional Embedded Protections:</span> Enforces the $400 Good Faith Estimate (GFE) dispute threshold (45 C.F.R. 149.610), CFPB Debt Validation requirements, and the nationwide credit bureau $500 medical debt removal rules.
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions (FAQ) */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">
            Patient Questions & Answers
          </span>
          <h2 className="text-3xl font-bold text-slate-950 tracking-[-0.035em]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <h3 className="font-bold text-slate-950 text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              How is my medical data kept private?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              UnBill uses a 100% zero-retention local-first architecture. All audited records are
              stored directly in your browser&apos;s encrypted LocalStorage / IndexedDB. We operate zero
              backend patient databases, and we never log or store your Protected Health Information (PHI)
              on our servers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <h3 className="font-bold text-slate-950 text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              Can the hospital send my bill to collections while in dispute?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              No. Under the Fair Credit Billing Act (15 U.S.C. 1666) and Regulation Z, once you
              submit a timely written dispute notice, the creditor is legally prohibited from reporting
              the disputed account as delinquent or initiating debt collection activities while the
              mandatory 30-day investigation is underway.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <h3 className="font-bold text-slate-950 text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              What if the hospital billing representative claims prices are non-negotiable?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Hospital representatives are trained to deflect casual questions. However, federal law
              (IRC Section 501(r)) legally prohibits non-profit hospitals from billing eligible patients gross
              chargemaster rates. Our built-in Phone Negotiation Playbook gives you exact verbal counter-scripts
              referencing the hospital&apos;s Amounts Generally Billed (AGB) percentage to force a recalculation.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Final High-Impact CTA Banner */}
      <section className="pb-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-1.5 sm:p-2 rounded-3xl bg-slate-200/70 border border-slate-300/80 shadow-xs">
          <div className="p-10 sm:p-14 text-center rounded-2xl bg-slate-950 text-white space-y-6 relative overflow-hidden border border-slate-800 shadow-xl">
            {/* Ambient top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

            <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Free • Open Access • Zero Tracking</span>
            </div>

            <h2 className="relative z-10 text-3xl sm:text-5xl font-extrabold text-white tracking-[-0.035em] max-w-2xl mx-auto leading-tight">
              Don&apos;t Let Hospitals Overcharge You in Silence.
            </h2>

            <p className="relative z-10 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Audit your statement in 30 seconds. Uncover duplicate entries, unbundled tests, and
              excessive markups with institutional forensic precision.
            </p>

            <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/scan"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md active:scale-98"
              >
                <span>Audit a Medical Bill Now</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm transition-colors border border-slate-700/80"
              >
                <span>Read Audit Methodology</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
