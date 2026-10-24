import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Scale, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-12 mt-20 text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Top Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Zero-Storage Architecture</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Documents processed ephemerally in RAM and purged immediately. Your bills stay 100% in your local browser vault.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Statutory Rights Grounding</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Disputes compiled strictly in compliance with the Fair Credit Billing Act (15 U.S.C. 1666) & the federal No Surprises Act.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Informational Advocacy Tool</p>
              <p className="text-[11px] text-slate-500 mt-0.5">UnBill is a forensic audit aid and consumer empowerment tool, not a substitute for licensed legal or clinical advice.</p>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400">
            © 2026 UnBill AI. Built for the <span className="text-slate-600 font-medium">Build With AI: Basics</span> hackathon on Devpost.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-slate-800 transition-colors">Methodology</Link>
            <Link href="/privacy" className="hover:text-slate-800 transition-colors">Privacy Guarantee</Link>
            <a 
              href="https://github.com/challengepost/learn-ai-basics" 
              target="_blank" 
              rel="noreferrer"
              className="text-emerald-700 hover:text-emerald-800 font-medium"
            >
              Skill Pack Verified
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
