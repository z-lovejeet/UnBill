'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UploadCloud, Loader2, FileText } from 'lucide-react';
import { hydrateVault, useAuditStore } from '@/lib/store';
import { MAX_FILE_BYTES } from '@/lib/validation';
import { PageIntro, GuideSteps } from '@/components/page-content';
import { ProcessingStatus, type ProcessingPhase } from '@/components/processing-status';
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
  const [phase, setPhase] = useState<ProcessingPhase>('request');
  const [sampleMode, setSampleMode] = useState(false);
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
    setSampleMode(!!sampleId);
    setPhase(!sampleId && tab === 'UPLOAD' ? 'reading' : 'request');
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
      setPhase('request');
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(125000)]),
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
      setPhase('saving');
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
    <div className="page-shell space-y-10 sm:space-y-14">
      <PageIntro
        eyebrow="01 / Bring your statement"
        title={
          <>
            A clear review starts
            <br />
            <span className="font-serif italic font-normal">with the itemized details.</span>
          </>
        }
        description="Upload a readable statement or paste its line items. We will organize the charges, check the extracted figures and prepare an item-by-item review you can explore."
      />
      <div className="grid lg:grid-cols-[1.65fr_1fr] gap-8 items-start">
        <div className="space-y-6 min-w-0">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 space-y-3">
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
          <div className="surface overflow-hidden">
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
                <>
                  <input
                    id="statement-file"
                    type="file"
                    ref={input}
                    accept={supported.join(',')}
                    disabled={busy}
                    onChange={(e) => {
                      if (e.target.files?.[0]) choose(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="statement-file"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (!busy && e.dataTransfer.files[0]) choose(e.dataTransfer.files[0]);
                    }}
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center space-y-3 cursor-pointer hover:border-emerald-400 transition-colors block"
                  >
                    <UploadCloud className="w-9 h-9 mx-auto text-slate-400" />
                    <p className="font-semibold text-sm">Itemized Statement File</p>
                    <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs">
                      <UploadCloud className="w-4 h-4" />
                      Choose File
                    </span>
                    <p className="text-xs text-slate-500">
                      Drag a file here or click anywhere in this area. PNG, JPEG, WebP or PDF · max
                      2.5 MB.
                    </p>
                    {file && (
                      <p className="text-sm break-all flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4 shrink-0" />
                        {file.name} · {(file.size / 1_000_000).toFixed(2)} MB
                      </p>
                    )}
                  </label>
                </>
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
                  I am using synthetic or de-identified data and authorize processing by Google
                  Gemini. Provider data handling depends on account settings.{' '}
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
                <button onClick={() => abort.current?.abort()} className="text-link">
                  Cancel review
                </button>
              )}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 text-rose-900 p-4 text-sm"
                >
                  <p>{error}</p>
                  <p className="mt-2">
                    You can correct the input and select Start Review again, or choose an example
                    above.
                  </p>
                </div>
              )}
            </div>
          </div>
          {busy && <ProcessingStatus phase={phase} sample={sampleMode} />}
        </div>
        <aside className="space-y-7 lg:sticky lg:top-24">
          <div className="quiet-panel">
            <p className="eyebrow">Before you begin</p>
            <h2 className="text-xl font-semibold mt-3 tracking-tight">
              Give the review a good source.
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-600 list-disc pl-4">
              <li>
                Use an itemized statement with a description, quantity and amount for each service.
              </li>
              <li>Include every page needed to reconcile the line items to the gross total.</li>
              <li>
                Keep service dates and printed codes readable. Missing information stays unknown.
              </li>
              <li>
                Remove names, account identifiers and other personal details before uploading to
                this public app.
              </li>
            </ul>
          </div>
          <div className="px-2 space-y-4">
            <h2 className="font-semibold">What you will get</h2>
            <p className="text-sm leading-7 text-slate-600">
              An itemized report, explanations for review findings, editable selections, a matching
              review letter and four phone prompts. The optional coach helps you phrase follow-up
              questions.
            </p>
            <Link href="/about" className="text-link">
              See how the review works
            </Link>
          </div>
          <div className="px-2 space-y-3">
            <h2 className="font-semibold">Your processing choices</h2>
            <p className="text-sm leading-7 text-slate-600">
              Uploads and pasted text go to Google Gemini after consent. Built-in examples skip that
              extraction step. Results are encrypted in this browser; sharing is a separate choice.
            </p>
            <Link href="/privacy" className="text-link">
              Follow the data journey
            </Link>
          </div>
        </aside>
      </div>
      <section className="editorial-section">
        <div>
          <p className="eyebrow">What happens next</p>
          <h2 className="section-title mt-4">
            From input to
            <br />a useful report.
          </h2>
        </div>
        <GuideSteps
          items={[
            {
              title: 'Extract the statement',
              copy: 'Supported files and pasted text are read into structured fields. A clear source helps preserve the actual services and amounts.',
            },
            {
              title: 'Validate and compare',
              copy: 'The server checks amounts, quantities and totals, then runs the review rules. Unsupported credits or incomplete statements need correction or manual review.',
            },
            {
              title: 'Explore and choose',
              copy: 'Your report separates gross charges, the reported balance and selected review amounts. Expand findings and decide what belongs in the letter.',
            },
          ]}
        />
      </section>
    </div>
  );
}
