'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UploadCloud, Loader2, FileText } from 'lucide-react';
import { hydrateVault, useAuditStore } from '@/lib/store';
import { MAX_FILE_BYTES } from '@/lib/validation';
const supported = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
export default function ScanPage() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  const [tab, setTab] = useState<'UPLOAD' | 'PASTE'>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => () => abort.current?.abort(), []);
  function choose(candidate: File) {
    setError('');
    if (!supported.includes(candidate.type)) {
      setError('Use a PNG, JPEG, WebP or PDF file.');
      return;
    }
    if (candidate.size > MAX_FILE_BYTES || candidate.size === 0) {
      setError('Choose a nonempty file no larger than 2.5 MB.');
      return;
    }
    setFile(candidate);
  }
  async function run(sampleId?: string) {
    if (busy) return;
    setError('');
    if (!sampleId && !consent) {
      setError('Confirm the data-processing notice before continuing.');
      return;
    }
    if (!sampleId && tab === 'UPLOAD' && !file) {
      setError('Choose a supported statement file.');
      return;
    }
    if (!sampleId && tab === 'PASTE' && !text.trim()) {
      setError('Paste the itemized statement text.');
      return;
    }
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;
    try {
      let payload: Record<string, unknown> = { sampleId };
      if (!sampleId) {
        payload = { consent: true };
        if (tab === 'PASTE') payload.rawText = text.trim();
        else {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error('The file could not be read.'));
            controller.signal.addEventListener(
              'abort',
              () => {
                reader.abort();
                reject(new DOMException('Cancelled', 'AbortError'));
              },
              { once: true },
            );
            reader.readAsDataURL(file!);
          });
          payload.imageBase64 = base64;
          payload.mimeType = file!.type;
        }
      }
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(45000)]),
      });
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(
          response.status === 413
            ? 'This deployment rejected the file size. Use a smaller file or paste text.'
            : 'The server response was interrupted. Please retry.',
        );
      }
      if (!response.ok) throw new Error(data.error || 'The statement could not be processed.');
      await hydrateVault();
      useAuditStore.getState().setAudit(data);
      router.push(`/results/${data.id}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.name === 'AbortError'
            ? 'Review cancelled. You can retry or choose an example.'
            : e.name === 'TimeoutError'
              ? 'The review timed out. Try again, paste the text, or use a synthetic example.'
              : e.message
          : 'The review could not be completed.',
      );
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-7">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">
          Statement intake
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Start a billing review</h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Use a synthetic or de-identified itemized statement. Uploads and pasted text are sent
          through our server to Google Gemini. Review every extracted figure before acting.
        </p>
      </header>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-semibold">Try without uploading data</h2>
        <div className="flex flex-wrap gap-3">
          <button
            disabled={busy}
            onClick={() => run('er_visit_broken_wrist')}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Synthetic ER Example
          </button>
          <button
            disabled={busy}
            onClick={() => run('outpatient_surgery')}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Synthetic Surgery Example
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Examples run deterministic checks without calling document AI.
        </p>
        <div className="flex flex-wrap gap-4 text-xs underline">
          <a href="/samples/er_visit_broken_wrist.pdf" download>
            Download Synthetic ER PDF
          </a>
          <a href="/samples/er_visit_broken_wrist.png" download>
            Download Synthetic ER Image
          </a>
          <a href="/samples/er_visit_broken_wrist.txt" download>
            Download Statement Text
          </a>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex border-b" role="tablist" aria-label="Statement input method">
          {(['UPLOAD', 'PASTE'] as const).map((value) => (
            <button
              role="tab"
              aria-selected={tab === value}
              key={value}
              onClick={() => setTab(value)}
              disabled={busy}
              className={`flex-1 py-4 text-sm font-semibold ${tab === value ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'}`}
            >
              {value === 'UPLOAD' ? 'Upload a File' : 'Paste Text'}
            </button>
          ))}
        </div>
        <div className="p-6 sm:p-8 space-y-5">
          {tab === 'UPLOAD' ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!busy && e.dataTransfer.files[0]) choose(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center space-y-3"
            >
              <UploadCloud className="w-9 h-9 mx-auto text-slate-500" />
              <label htmlFor="statement-file" className="block font-semibold text-sm">
                Itemized Statement File
              </label>
              <input
                id="statement-file"
                type="file"
                ref={input}
                accept={supported.join(',')}
                disabled={busy}
                onChange={(e) => {
                  if (e.target.files?.[0]) choose(e.target.files[0]);
                }}
                className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-semibold"
              />
              <p className="text-xs text-slate-500">
                Drag a file here or use Browse. PNG, JPEG, WebP or PDF · maximum 2.5 MB.
              </p>
              {file && (
                <p className="text-sm break-all flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4 shrink-0" />
                  {file.name} · {(file.size / 1_000_000).toFixed(2)} MB
                </p>
              )}
            </div>
          ) : (
            <div>
              <label htmlFor="statement-text" className="block text-sm font-semibold mb-2">
                Itemized Statement Text
              </label>
              <textarea
                id="statement-text"
                value={text}
                maxLength={50000}
                onChange={(e) => setText(e.target.value)}
                disabled={busy}
                rows={12}
                placeholder="Facility, account (redacted if needed), statement date, and each item: code, description, service date, quantity, line total. Include insurance adjustments and patient balance if printed."
                className="w-full border border-slate-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-700"
              />
              <p className="text-xs text-slate-500 mt-1">
                {text.length.toLocaleString()} / 50,000 characters. Credits and non-itemized
                statements require manual review.
              </p>
            </div>
          )}
          <label className="flex gap-3 text-xs text-slate-600 leading-relaxed">
            <input
              type="checkbox"
              checked={consent}
              disabled={busy}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 shrink-0"
            />
            <span>
              I am using synthetic or de-identified data and authorize processing by Google Gemini.
              Provider data handling depends on account settings.{' '}
              <Link href="/privacy" className="underline">
                Read the data notice.
              </Link>
            </span>
          </label>
          <button
            disabled={busy}
            onClick={() => run()}
            className="w-full rounded-xl bg-slate-950 text-white py-3.5 text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
          >
            {busy ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                Reading Statement & Running Checks…
              </span>
            ) : (
              'Start Review'
            )}
          </button>
          {busy && (
            <div role="status" className="text-sm text-slate-600 space-y-3">
              <p>
                Waiting for extraction and validation. This can take up to 40 seconds; checks are
                not marked complete until the response arrives.
              </p>
              <button onClick={() => abort.current?.abort()} className="underline font-semibold">
                Cancel Review
              </button>
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 text-rose-900 p-4 text-sm"
            >
              <p>{error}</p>
              <p className="mt-2">
                You can correct the input and select Start Review again, or choose an example above.
              </p>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">
        The limited reference catalog cannot establish fraud, medical necessity or a legal price
        limit. Your results are encrypted in this browser after processing; uploads are not saved by
        the application. Optional sharing has a separate disclosure.
      </p>
    </div>
  );
}
