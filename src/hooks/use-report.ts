'use client';
import { useEffect, useState } from 'react';
import { useAuditStore, hydrateVault } from '@/lib/store';
import { normalizeReport } from '@/lib/reports';
export function useReport(id: string) {
  const current = useAuditStore((s) => s.currentReport);
  const history = useAuditStore((s) => s.history);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const report = current?.id === id ? current : history.find((h) => h.id === id) || null;
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(null);
    (async () => {
      await hydrateVault();
      const local = useAuditStore.getState().history.find((h) => h.id === id);
      if (local && !id.startsWith('share_')) {
        useAuditStore.getState().setCurrentReport(local);
        return;
      }
      let response: Response;
      if (/^share_[A-Za-z0-9_-]{43}$/.test(id))
        response = await fetch(`/api/share?id=${encodeURIComponent(id)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
      else if (['sample_er_wrist_2026', 'sample_surgery_2026'].includes(id))
        response = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sampleId: id === 'sample_surgery_2026' ? 'outpatient_surgery' : 'er_visit_broken_wrist',
          }),
          signal: controller.signal,
        });
      else
        throw new Error(
          'Report not found in this browser. Open the original share link or start a new audit.',
        );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Report not found or expired.');
      if (active) {
        const fetched = normalizeReport(data);
        if (id.startsWith('share_')) {
          fetched.id = id;
          fetched.source = 'shared';
        }
        if (fetched.id !== id)
          throw new Error('Report identifier did not match the requested link.');
        useAuditStore.getState().setCurrentReport(fetched);
      }
    })()
      .catch((e) => {
        if (active && e.name !== 'AbortError') setError(e.message || 'Report could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [id]);
  return { report, loading, error };
}
