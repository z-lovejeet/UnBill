'use client';
import { useEffect, useRef, useState } from 'react';
import { X, Send, MessageSquare, ArrowUpRight, Loader2 } from 'lucide-react';
import { useAuditStore } from '@/lib/store';
import type { AuditReport } from '@/types/audit';
import { formatCurrency } from '@/lib/utils';
import { CoachMessage } from './coach-message';
type Message = { role: 'user' | 'assistant'; content: string };
export function BillingCoach({ report }: { report: AuditReport }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const abort = useRef<AbortController | null>(null);
  const conversation = useRef<HTMLDivElement>(null);
  const followBottom = useRef(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    if (!dialog.current?.open) dialog.current?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    input.current?.focus();
    return () => {
      abort.current?.abort();
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    if (followBottom.current && conversation.current) {
      conversation.current.scrollTop = conversation.current.scrollHeight;
    }
  }, [messages]);
  async function send(query = text) {
    if (!query.trim() || busy || !consent) return;
    const next: Message[] = [
      ...messages.filter((message) => message.content.trim()).slice(-18),
      { role: 'user', content: query.trim() },
    ];
    setMessages([...next, { role: 'assistant', content: '' }]);
    followBottom.current = true;
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
      content += decoder.decode();
      setMessages([...next, { role: 'assistant', content }]);
      if (!content.trim()) throw new Error('The coach returned an empty response. Please retry.');
    } catch (e) {
      setMessages((current) => current.filter((message) => message.content.trim()));
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
      className="coach-dialog bg-white shadow-2xl backdrop:bg-slate-950/40 backdrop:backdrop-blur-sm print:hidden"
    >
      <div className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_auto]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <h2 id="coach-title" className="text-lg font-semibold tracking-tight">
                Billing Coach
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">Clear answers. A practical next step.</p>
            </div>
          </div>
          <button
            aria-label="Close billing coach"
            onClick={() => useAuditStore.getState().closeCopilot()}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-emerald-900">Amount you want explained</span>
            <strong className="font-mono text-emerald-950">
              {formatCurrency(report.financials.totalPotentialSavings)}
            </strong>
          </div>
          <p className="mt-1 text-xs leading-5 text-emerald-800">
            Part of the original charges, not promised savings or a new balance.
          </p>
        </div>
        <div
          ref={conversation}
          className="min-h-0 overflow-y-auto overscroll-contain bg-slate-50/70 px-4 py-5 sm:px-6"
          role="log"
          aria-label="Billing coach conversation"
          aria-live="polite"
          aria-busy={busy}
          onScroll={(event) => {
            const node = event.currentTarget;
            followBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80;
          }}
        >
          {messages.length === 0 && (
            <div className="space-y-5">
              <div className="pt-2">
                <p className="text-xl font-semibold tracking-tight text-slate-950">
                  What would you like to clarify?
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Understand a flagged charge, prepare for a call, or plan your next question.
                  Choose a starting point below.
                </p>
              </div>
              <div className="space-y-2">
                {[
                  'Explain the concerns found in my bill in simple words.',
                  'Write a short phone script about my selected charges.',
                  'What should I ask my insurer about this balance?',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setText(prompt);
                      input.current?.focus();
                    }}
                    className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left text-sm leading-6 text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    {prompt}
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-emerald-700" />
                  </button>
                ))}
              </div>
              <p className="text-xs leading-5 text-slate-500">
                Advice is educational. Confirm corrections and payment amounts with your billing
                team or insurer.
              </p>
            </div>
          )}
          <div className="space-y-5">
            {messages.map((message, index) => (
              <div key={index} className={message.role === 'user' ? 'ml-8' : ''}>
                <p
                  className={`mb-1.5 text-[11px] font-semibold uppercase tracking-wider ${message.role === 'user' ? 'text-right text-emerald-800' : 'text-slate-500'}`}
                >
                  {message.role === 'user' ? 'You' : 'Billing Coach'}
                </p>
                <div
                  className={
                    message.role === 'user'
                      ? 'rounded-2xl rounded-tr-sm bg-emerald-800 px-4 py-3 text-sm leading-6 text-white whitespace-pre-wrap break-words'
                      : 'min-w-0 rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700'
                  }
                >
                  {message.role === 'user' ? (
                    message.content
                  ) : message.content ? (
                    <CoachMessage content={message.content} />
                  ) : (
                    <span className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Preparing your answer…
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="coach-composer space-y-3 border-t border-slate-200 bg-white p-4 sm:px-6">
          <label className="flex items-start gap-2.5 text-xs leading-5 text-slate-600">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 accent-emerald-700"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={busy}
            />
            <span>
              I allow my questions and de-identified bill details to be sent to Groq. I will leave
              out personal identifiers.
            </span>
          </label>
          {error && (
            <p role="alert" className="rounded-lg bg-rose-50 p-2.5 text-xs leading-5 text-rose-800">
              {error}
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-end gap-2"
          >
            <label htmlFor="coach-question" className="sr-only">
              Question for the billing coach
            </label>
            <textarea
              id="coach-question"
              ref={input}
              rows={2}
              value={text}
              maxLength={4000}
              onChange={(e) => setText(e.target.value)}
              disabled={busy}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={
                consent
                  ? 'Ask a question about your bill…'
                  : 'Write a question, then check consent above…'
              }
              className="min-w-0 flex-1 resize-none rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm leading-6 focus:border-emerald-700 focus:bg-white"
            />
            <button
              type="submit"
              aria-label="Send question"
              disabled={!consent || busy || !text.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <button
              onClick={() => {
                setMessages([]);
                setError('');
              }}
              disabled={busy}
              className="underline underline-offset-4 disabled:opacity-40"
            >
              Clear conversation
            </button>
            {busy ? (
              <button
                onClick={() => abort.current?.abort()}
                className="font-semibold text-rose-700 underline underline-offset-4"
              >
                Stop response
              </button>
            ) : (
              <span>Enter to send · Shift + Enter for a new line</span>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
