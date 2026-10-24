'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, FileCheck, Stethoscope, Scissors, Sparkles } from 'lucide-react';
import { useAuditStore } from '@/lib/store';
import { AuditReport } from '@/types/audit';

export function SampleBillCards() {
  const router = useRouter();
  const setAudit = useAuditStore((state) => state.setAudit);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  const handleLoadSample = async (samplePath: string, sampleId: string) => {
    try {
      setLoadingSample(sampleId);
      const res = await fetch(samplePath);
      if (!res.ok) throw new Error('Failed to load sample');
      const audit: AuditReport = await res.json();

      // Update store
      setAudit(audit);

      // Navigate to results
      router.push(`/results/${audit.id}`);
    } catch (err) {
      console.error('Failed to load sample audit:', err);
      alert('Could not load sample bill. Please try again.');
    } finally {
      setLoadingSample(null);
    }
  };

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-[-0.03em] flex items-center gap-2">
            <span>Verified Synthetic Test Dossiers</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Instant 1-Click
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 tracking-[-0.01em]">
            Test the complete multi-agent forensic engine without needing personal medical records:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: ER Broken Wrist */}
        <div
          onClick={() => handleLoadSample('/samples/er_visit_broken_wrist.json', 'er_wrist')}
          className="double-bezel cursor-pointer group active:scale-[0.99] transition-transform"
        >
          <div className="double-bezel-inner p-6 space-y-4 hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 tracking-tight">
                $1,650 Disputed
              </span>
            </div>

            <div>
              <h4 className="font-bold text-slate-950 text-base sm:text-lg tracking-[-0.02em] group-hover:text-emerald-800 transition-colors">
                Emergency Room Encounter (Broken Wrist)
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed tracking-[-0.005em]">
                Hospital gross billed $4,820.00. UnBill detects duplicate lab panels (CPT 80053 billed twice within 1 min), duplicate venipunctures, and an excessive Level 4 ER facility markup.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] font-medium text-slate-400">
                Facility: Mercy General Hospital
              </span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-emerald-700">
                <span>{loadingSample === 'er_wrist' ? 'Loading Dossier...' : 'Run Forensic Audit'}</span>
                <div className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3 h-3 text-slate-700 group-hover:text-emerald-800" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Outpatient Joint Surgery */}
        <div
          onClick={() => handleLoadSample('/samples/outpatient_surgery.json', 'surgery')}
          className="double-bezel cursor-pointer group active:scale-[0.99] transition-transform"
        >
          <div className="double-bezel-inner p-6 space-y-4 hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-100 flex items-center justify-center">
                <Scissors className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 tracking-tight">
                $2,350 Disputed
              </span>
            </div>

            <div>
              <h4 className="font-bold text-slate-950 text-base sm:text-lg tracking-[-0.02em] group-hover:text-emerald-800 transition-colors">
                Outpatient Ambulatory Surgery (Knee Arthroscopy)
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed tracking-[-0.005em]">
                Hospital gross billed $8,420.00. UnBill flags improper CCI unbundling (separate charges for Albumin & Alk Phos already included in CMP) and a 7.2x facility markup on chest imaging.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] font-medium text-slate-400">
                Facility: St. Luke&apos;s Surgical Pavilion
              </span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-emerald-700">
                <span>{loadingSample === 'surgery' ? 'Loading Dossier...' : 'Run Forensic Audit'}</span>
                <div className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3 h-3 text-slate-700 group-hover:text-emerald-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
