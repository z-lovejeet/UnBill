'use client';
import { useEffect, useRef, useState } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { useAuditStore } from '@/lib/store';
import type { AuditReport } from '@/types/audit';
import { formatCurrency } from '@/lib/utils';
type Message = { role: 'user' | 'assistant'; content: string };
export function CopilotDrawer({ report }: { report: AuditReport }) {
  const open = useAuditStore((s) => s.isCopilotOpen);
  return (
    <>
      <button
        onClick={() => useAuditStore.getState().openCopilot()}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-slate-950 text-white px-5 py-3 text-sm font-semibold shadow-xl print:hidden flex gap-2 items-center"
        aria-label="Open billing coach"
      >
        <MessageSquare className="h-4 w-4" />
        Billing Coach
      </button>
      {open && <Coach key={report.id} report={report} />}
    </>
  );
}
function Coach({ report }: { report: AuditReport }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    input.current?.focus();
    return () => {
      abort.current?.abort();
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);
  async function send(query = text) {
    if (!query.trim() || busy || !consent) return;
    const next: Message[] = [...messages.slice(-18), { role: 'user', content: query.trim() }];
    setMessages([...next, { role: 'assistant', content: '' }]);
    setText('');
    setBusy(true);
    setError('');
    const controller = new AbortController();
    abort.current = controller;
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, auditContext: report, consent: true }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'The coach is unavailable.');
      }
      if (!response.body) throw new Error('No response stream was received.');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        content += decoder.decode(part.value, { stream: true });
        setMessages([...next, { role: 'assistant', content }]);
      }
      if (!content.trim()) throw new Error('The coach returned an empty response. Please retry.');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.name === 'AbortError'
            ? 'Response stopped.'
            : e.message
          : 'The response was interrupted. Use the phone guide or retry.',
      );
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }
  return (
    <dialog
      ref={dialog}
      aria-labelledby="coach-title"
      onCancel={() => useAuditStore.getState().closeCopilot()}
      className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-full sm:w-[460px] max-w-full p-0 bg-white shadow-2xl backdrop:bg-slate-950/40 print:hidden"
    >
      <div className="flex flex-col h-full">
        <header className="p-5 border-b flex items-start justify-between">
          <div>
            <h2 id="coach-title" className="font-bold text-lg">
              Billing Coach
            </h2>
            <p className="text-xs text-slate-500 mt-1">Streaming advice · latency varies</p>
          </div>
          <button
            aria-label="Close billing coach"
            onClick={() => useAuditStore.getState().closeCopilot()}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="p-4 bg-emerald-50 text-xs text-emerald-950">
          Selected review amount:{' '}
          <strong>{formatCurrency(report.financials.totalPotentialSavings)}</strong>. Advice is
          educational; verify it with the billing team or a qualified adviser.
        </div>
        <div
          className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4"
          role="log"
          aria-label="Billing coach conversation"
          aria-live="polite"
        >
          {messages.length === 0 && (
            <p className="text-sm text-slate-600 leading-relaxed">
              Ask for help preparing questions about selected charges, insurer adjustments or
              financial assistance. Patient identifiers are omitted from the context sent to Groq.
            </p>
          )}
          {messages.map((m, index) => (
            <div
              key={index}
              className={`rounded-xl p-4 text-sm whitespace-pre-wrap break-words leading-relaxed ${m.role === 'user' ? 'bg-slate-950 text-white ml-6' : 'bg-slate-100 mr-4'}`}
            >
              <span className="sr-only">{m.role === 'user' ? 'You' : 'Coach'}: </span>
              {m.content || 'Preparing a response…'}
            </div>
          ))}
          <div ref={end} />
        </div>
        <div className="p-4 border-t space-y-3">
          <label className="flex gap-2 text-xs leading-relaxed">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={busy}
            />
            <span>
              I authorize sending my questions and de-identified bill context to Groq. I will not
              enter personal identifiers.
            </span>
          </label>
          {error && (
            <p role="alert" className="text-xs text-rose-700">
              {error}
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2"
          >
            <label htmlFor="coach-question" className="sr-only">
              Question for the billing coach
            </label>
            <input
              id="coach-question"
              ref={input}
              value={text}
              maxLength={4000}
              onChange={(e) => setText(e.target.value)}
              disabled={busy}
              placeholder="Ask a billing question…"
              className="min-w-0 flex-1 rounded-xl border p-3 text-sm"
            />
            <button
              type="submit"
              aria-label="Send question"
              disabled={!consent || busy || !text.trim()}
              className="rounded-xl bg-slate-950 text-white px-3 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex justify-between text-xs">
            <button
              onClick={() => {
                setMessages([]);
                setError('');
              }}
              disabled={busy}
              className="underline"
            >
              Clear Conversation
            </button>
            {busy && (
              <button onClick={() => abort.current?.abort()} className="underline">
                Stop Response
              </button>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
