'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { hydrateVault, useAuditStore } from '@/lib/store';
import { legacyArchive } from '@/lib/vault-storage';
import { formatCurrency, formatDate } from '@/lib/utils';
export default function HistoryPage() {
  const history = useAuditStore((s) => s.history);
  const shares = useAuditStore((s) => s.ownedShares);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');
  const [recovery, setRecovery] = useState<string | null>(null);
  useEffect(() => {
    hydrateVault()
      .then(() => legacyArchive())
      .then(setRecovery)
      .catch(() => setMessage('The legacy recovery copy could not be opened on this device.'))
      .finally(() => setLoaded(true));
  }, []);
  async function revoke(id: string, token: string) {
    setBusy(id);
    setMessage('');
    try {
      const response = await fetch('/api/share', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId: id, revokeToken: token }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      useAuditStore.getState().removeOwnedShare(id);
      useAuditStore.getState().deleteAuditFromHistory(id);
      setMessage('The share link has been revoked.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Revocation failed. Please retry.');
    } finally {
      setBusy('');
    }
  }
  if (!loaded)
    return (
      <div role="status" className="p-12 text-center">
        Opening Encrypted Vault…
      </div>
    );
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-7">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Your Local Vault</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Up to 30 recent reports are encrypted on this device. The browser stores the key; this is
          not password protection. Clearing browser storage or switching devices can make reports
          and private share-revocation controls unavailable.
        </p>
        <Link href="/scan" className="inline-block text-sm font-semibold underline">
          Review Another Statement
        </Link>
      </header>
      {history.length > 0 ? (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">
              {history.length} saved {history.length === 1 ? 'report' : 'reports'}
            </p>
            <button
              onClick={() => {
                if (
                  confirm(
                    'Delete the saved reports from this browser? Your public share links remain active until revoked below or expired.',
                  )
                )
                  useAuditStore.getState().clearHistory();
              }}
              className="text-sm text-rose-700 underline"
            >
              Clear Saved Reports
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {history.map((report) => (
              <article key={report.id} className="rounded-xl border bg-white p-5 space-y-3">
                <p className="text-xs text-slate-500">
                  {formatDate(report.createdAt)} ·{' '}
                  {report.source === 'sample'
                    ? 'Synthetic example'
                    : report.source === 'shared'
                      ? 'Redacted shared copy'
                      : 'Statement review'}
                </p>
                <h2 className="font-semibold break-words">{report.facility.name}</h2>
                <p className="text-sm text-slate-600">Account {report.patient.accountNumber}</p>
                <p className="text-sm">
                  <strong>{formatCurrency(report.financials.totalPotentialSavings)}</strong>{' '}
                  selected for review
                </p>
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`/results/${report.id}`}
                    className="text-sm font-semibold text-emerald-800 underline"
                  >
                    Open Report
                  </Link>
                  <button
                    aria-label={`Delete report for ${report.patient.accountNumber}`}
                    onClick={() => {
                      if (confirm('Delete this local report?'))
                        useAuditStore.getState().deleteAuditFromHistory(report.id);
                    }}
                    className="text-xs text-rose-700 underline"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <p className="border rounded-xl p-8 text-sm text-slate-500 bg-white">
          No saved reports yet. Start with a synthetic example.
        </p>
      )}
      {recovery && (
        <button
          className="text-sm underline"
          onClick={() => {
            const url = URL.createObjectURL(new Blob([recovery], { type: 'application/json' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'unbill-legacy-recovery.json';
            link.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download Legacy Recovery Copy (May Contain Private Data)
        </button>
      )}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Links You Can Revoke</h2>
        <p className="text-xs text-slate-500">
          Revocation controls are private and encrypted in this browser. Deleting a local report
          does not revoke its public link.
        </p>
        {shares.length === 0 ? (
          <p className="text-sm text-slate-500">No share links created in this browser.</p>
        ) : (
          shares.map((share) => (
            <div key={share.shareId} className="border rounded-xl p-4 bg-white space-y-2">
              <a
                href={share.shareUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs underline break-all"
              >
                {share.shareUrl}
              </a>
              <p className="text-xs text-slate-500">Expires {formatDate(share.expiresAt)}</p>
              <button
                disabled={busy === share.shareId}
                onClick={() => revoke(share.shareId, share.revokeToken)}
                className="text-sm text-rose-700 underline disabled:opacity-50"
              >
                {busy === share.shareId ? 'Revoking…' : 'Revoke Link'}
              </button>
            </div>
          ))
        )}
        {message && (
          <p role="status" className="text-sm">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
