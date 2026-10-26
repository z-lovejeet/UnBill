'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, FileText } from 'lucide-react';
import er from '../../public/samples/er_visit_broken_wrist.json';
import surgery from '../../public/samples/outpatient_surgery.json';
import { useAuditStore, hydrateVault } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
export function SampleBillCards() {
  const router = useRouter();
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  async function load(id: string) {
    setLoading(id);
    setError('');
    try {
      await hydrateVault();
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId: id }),
      });
      const report = await response.json();
      if (!response.ok) throw new Error(report.error);
      useAuditStore.getState().setAudit(report);
      router.push(`/results/${report.id}`);
    } catch {
      setError('The example could not be loaded. Please try again.');
    } finally {
      setLoading('');
    }
  }
  return (
    <section id="sample-tests" className="space-y-5 scroll-mt-24">
      <div>
        <p className="eyebrow">Explore the complete workflow</p>
        <h2 className="section-title mt-3">A real walkthrough. Synthetic details.</h2>
        <p className="mt-3 text-sm text-slate-600 leading-7 max-w-2xl">
          Open an example, explore its itemized findings and build a selected-charge review letter.
          No personal records, login or API keys needed. Examples run the review rules without
          calling document extraction.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {[
          { id: 'er_visit_broken_wrist', title: 'Emergency room · wrist injury', report: er },
          { id: 'outpatient_surgery', title: 'Outpatient procedure', report: surgery },
        ].map((sample) => (
          <button
            key={sample.id}
            disabled={!!loading}
            onClick={() => load(sample.id)}
            className="double-bezel text-left group disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700"
          >
            <span className="double-bezel-inner block p-6 space-y-4">
              <div className="flex justify-between items-center">
                <FileText className="h-7 w-7 text-emerald-700" />
                <span className="font-mono text-[10px] text-slate-500">Synthetic statement</span>
              </div>
              <span className="block text-lg font-semibold">{sample.title}</span>
              <span className="block text-sm text-slate-600">
                {formatCurrency(sample.report.financials.totalBilledGross)} in gross charges ·{' '}
                {sample.report.items.length} line items
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                {loading === sample.id ? 'Opening…' : 'Review this example'}
                <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs leading-6 text-slate-500">
        Want to test document reading too? Download the synthetic files on the scan page and upload
        them through the regular intake flow.
      </p>
      {error && (
        <p role="alert" className="text-sm text-rose-700">
          {error}
        </p>
      )}
    </section>
  );
}
