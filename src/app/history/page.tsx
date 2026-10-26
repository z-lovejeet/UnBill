'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { hydrateVault, useAuditStore } from '@/lib/store';
import { legacyArchive } from '@/lib/vault-storage';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageIntro, GuideSteps } from '@/components/page-content';
import { ArrowUpRight, FolderOpen } from 'lucide-react';
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
    <div className="page-shell space-y-10 sm:space-y-14">
      <PageIntro
        eyebrow="Your local vault"
        title={
          <>
            Keep the details.
            <br />
            <span className="font-serif italic font-normal">Pick up where you left off.</span>
          </>
        }
        description="Return to a statement, revisit your selected findings and open its preparation kit before the next conversation. Your recent reports stay encrypted in this browser."
      >
        <Link href="/scan" className="action-primary">
          Review another statement <ArrowUpRight className="h-4 w-4" />
        </Link>
      </PageIntro>
      <dl className="grid sm:grid-cols-3 border-y border-slate-200 py-6 gap-7">
        {[
          ['Saved reports', history.length + ' / 30', 'Recent reviews on this device'],
          ['Share controls', String(shares.length), 'Links managed from this browser'],
          ['Storage location', 'This browser', 'No account or cross-device sync'],
        ].map(([label, value, copy]) => (
          <div key={label}>
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="text-2xl font-semibold tracking-tight mt-2">{value}</dd>
            <dd className="text-xs text-slate-500 mt-2">{copy}</dd>
          </div>
        ))}
      </dl>
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
              <article key={report.id} className="surface p-6 sm:p-7 space-y-4">
                <p className="text-xs text-slate-500">
                  {formatDate(report.createdAt)} ·{' '}
                  {report.source === 'sample'
                    ? 'Synthetic example'
                    : report.source === 'shared'
                      ? 'Redacted shared copy'
                      : 'Statement review'}
                </p>
                <h2 className="text-lg font-semibold tracking-tight break-words">
                  {report.facility.name}
                </h2>
                <p className="text-sm text-slate-600">Account {report.patient.accountNumber}</p>
                <div className="border-y border-slate-100 py-4">
                  <p className="text-xs text-slate-500">Selected for review</p>
                  <p className="font-mono text-2xl mt-2">
                    {formatCurrency(report.financials.totalPotentialSavings)}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    {report.items.length} line items ·{' '}
                    {report.items.filter((item) => item.isDisputed).length} selected
                  </p>
                </div>
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
        <section className="surface p-8 sm:p-12 grid sm:grid-cols-[auto_1fr] gap-6 items-start">
          <FolderOpen className="h-10 w-10 text-emerald-700" />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Your first report starts here.
            </h2>
            <p className="text-sm leading-7 text-slate-600 mt-3 max-w-xl">
              Open a synthetic example or review a de-identified statement. Its findings and
              selection will appear here so you can return to the same letter and phone guide later.
            </p>
            <Link href="/scan" className="text-link mt-5">
              Explore an example <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
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
      <section className="surface p-6 sm:p-8 space-y-5">
        <div>
          <p className="eyebrow">Sharing controls</p>
          <h2 className="text-2xl tracking-tight font-semibold mt-3">Links you can revoke</h2>
        </div>
        <p className="text-sm leading-7 text-slate-600 max-w-3xl">
          Shared reports are separate redacted copies. They expire after 30 days, and you can
          withdraw access sooner using the private control stored here. Deleting a local report does
          not revoke its link. Keep this browser available while a link is active.
        </p>
        {shares.length === 0 ? (
          <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-5">
            No share links created in this browser. To create one, open a report and choose the
            redacted sharing option.
          </p>
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
      <section className="editorial-section">
        <div>
          <p className="eyebrow">A workspace for the follow-up</p>
          <h2 className="section-title mt-4">
            Return with
            <br />
            the context intact.
          </h2>
        </div>
        <GuideSteps
          items={[
            {
              title: 'Reopen the exact review',
              copy: 'Choose a saved report to see its itemized findings. The latest selection determines the review amount and matching preparation kit.',
            },
            {
              title: 'Prepare before the call',
              copy: 'Review the letter, keep the phone prompts nearby and check source figures against the statement and any insurer explanation of benefits.',
            },
            {
              title: 'Manage access separately',
              copy: 'Remove local reports when they are no longer needed and revoke shared copies independently. Clearing all site data removes this browser’s reports, keys and private link controls.',
            },
          ]}
        />
      </section>
      <p className="text-xs leading-6 text-slate-500 max-w-3xl">
        The browser stores the encryption key; this is not password protection. Changing devices or
        clearing site data can make the vault unavailable.{' '}
        <Link href="/privacy#local-history" className="underline underline-offset-4">
          Read about storage and recovery.
        </Link>
      </p>
    </div>
  );
}
