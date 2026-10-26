'use client';
import dynamic from 'next/dynamic';
import { MessageSquare } from 'lucide-react';
import { useAuditStore } from '@/lib/store';
import type { AuditReport } from '@/types/audit';
const Coach = dynamic(() => import('./billing-coach').then((module) => module.BillingCoach), {
  ssr: false,
});
export function CopilotDrawer({ report }: { report: AuditReport }) {
  const open = useAuditStore((s) => s.isCopilotOpen);
  return (
    <>
      <button
        onClick={() => useAuditStore.getState().openCopilot()}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-emerald-800 text-white px-5 py-3 text-sm font-semibold shadow-lg hover:bg-emerald-900 print:hidden flex gap-2 items-center"
        aria-label="Open billing coach"
      >
        <MessageSquare className="h-4 w-4" /> Billing Coach
      </button>
      {open && <Coach key={report.id} report={report} />}
    </>
  );
}
