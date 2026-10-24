import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  ServerOff,
  Trash2,
  HardDrive,
  FileCheck,
  Scale,
} from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy & Zero-Retention Architecture — UnBill',
  description:
    'UnBill guarantees zero remote retention of Protected Health Information (PHI). All audits are executed in your browser and stored in local encrypted memory.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Zero Server Retention Guarantee
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-950 tracking-[-0.035em]">
            Patient Privacy & Zero-Retention Architecture
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Medical bills contain sensitive clinical diagnoses and personal financial details.
            UnBill is intentionally architected to ensure your data stays exclusively under your control.
          </p>
        </div>

        {/* 4 Pillars of UnBill Privacy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">
              1. Local-First Browser Vault
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              All audited statements, CPT codes, and generated dispute letters are saved directly in
              your browser&apos;s encrypted LocalStorage / IndexedDB. No backend database stores your
              history.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <ServerOff className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">
              2. Zero Remote Server Storage
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We operate zero persistent SQL or NoSQL patient databases. We never log or retain
              patient names, insurance ID numbers, medical conditions, or facility account balances on
              our servers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">
              3. Ephemeral AI Inference
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Document extraction via Google Gemini Vision and Groq Copilot is strictly ephemeral.
              Data is transmitted via encrypted HTTPS TLS 1.3, processed in memory, and immediately
              returned to your browser without being used for model training.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">
              4. Immediate 1-Click Erasure
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You maintain absolute data sovereignty. Clicking &ldquo;Clear Vault&rdquo; on the History page
              permanently obliterates all cached audit reports and dispute packages from your local
              device.
            </p>
          </div>
        </div>

        {/* Detailed Legal & HIPAA Stance */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-8 sm:p-10 space-y-6">
            <h2 className="text-xl font-bold text-slate-950 tracking-[-0.025em]">
              Our Patient Data Commitments
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div>
                <h4 className="font-semibold text-slate-900">No Advertising or Data Monetization</h4>
                <p className="mt-1">
                  UnBill will never sell, rent, or monetize patient billing data, insurance records,
                  or contact information to debt buyers, commercial insurance brokers, or pharmaceutical
                  marketers.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900">Anonymous Share Links</h4>
                <p className="mt-1">
                  When you voluntarily create a shareable report link, the report is assigned an
                  anonymous cryptographic identifier and stored with a mandatory 30-day Time-To-Live
                  (TTL) in our edge cache, after which it is automatically deleted.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900">Statutory Transparency</h4>
                <p className="mt-1">
                  UnBill is an independent consumer technology tool designed to assist patients in
                  exercising their statutory rights under the Fair Credit Billing Act (15 U.S.C. 1666)
                  and the federal No Surprises Act. UnBill does not provide formal legal representation
                  or bill collection agency services.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Last updated: October 2026 • Devpost Build With AI Hackathon
              </span>
              <Link
                href="/"
                className="text-xs font-semibold text-slate-900 hover:text-emerald-700 transition-colors"
              >
                &larr; Return to UnBill Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
