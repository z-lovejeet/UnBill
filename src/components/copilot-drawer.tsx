'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuditStore } from '@/lib/store';
import { AuditReport } from '@/types/audit';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Building,
  User,
  DollarSign,
  Loader2,
  Trash2,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface CopilotDrawerProps {
  report?: AuditReport | null;
}

export function CopilotDrawer({ report }: CopilotDrawerProps = {}) {
  const { isCopilotOpen, closeCopilot, openCopilot, currentReport, currentAudit } = useAuditStore();
  const activeReport = report || currentReport || currentAudit;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset welcome message when report changes
  useEffect(() => {
    if (activeReport) {
      const facilityName = activeReport.facility.name;
      const accountNo = activeReport.patient.accountNumber;
      const savings = activeReport.financials.totalPotentialSavings.toFixed(2);
      const flaggedCount = activeReport.anomalies.length;

      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hello! I'm your **UnBill Copilot**, powered by Groq's ultra-low latency engine.\n\nI have loaded the full forensic audit for **${facilityName}** (Account #${accountNo}).\n\n- **Gross Billed:** $${activeReport.financials.totalBilledGross.toFixed(2)}\n- **Disputed Overcharges:** $${savings} across ${flaggedCount} flagged discrepancies\n- **Fair Market Rate:** $${(activeReport.financials.totalBilledGross - activeReport.financials.totalPotentialSavings).toFixed(2)}\n\nWhat would you like help with? I can roleplay phone negotiation scripts, clarify legal citations under FCBA Section 1666, or help negotiate a one-time cash settlement.`,
        },
      ]);
    } else {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content:
            "Hello! I'm your **UnBill Copilot**, powered by Groq's ultra-fast engine. I'm here to coach you through hospital phone calls, statutory dispute letters, and financial assistance applications.\n\nWhat can I help you negotiate today?",
        },
      ]);
    }
  }, [activeReport?.id]);

  useEffect(() => {
    if (isCopilotOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isCopilotOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: query.trim(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    const assistantMsgId = `asst_${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
    };
    setMessages([...newMessages, assistantMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          auditContext: activeReport || undefined,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Chat service encountered an error.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        streamedText += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: streamedText } : msg
          )
        );
      }
    } catch (err: any) {
      console.error('Streaming chat failed:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  '⚠️ Could not establish connection to Copilot. Please verify your internet connection or try again.',
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    if (activeReport) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Chat history cleared. Active context is still locked to **${activeReport.facility.name}** (Account #${activeReport.patient.accountNumber}). How can I help you negotiate?`,
        },
      ]);
    } else {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Chat history cleared. I'm ready for your negotiation questions!",
        },
      ]);
    }
  };

  const promptSuggestions = activeReport
    ? [
        `What do I say if ${activeReport.facility.name} says "Our rates are fixed"?`,
        `How do I formally dispute the $${activeReport.financials.totalPotentialSavings.toFixed(0)} in flagged charges?`,
        `Can ${activeReport.facility.name} send Account #${activeReport.patient.accountNumber} to collections while in dispute?`,
        `Help me negotiate a lump-sum settlement of $${(
          activeReport.financials.totalBilledGross - activeReport.financials.totalPotentialSavings
        ).toFixed(0)}.`,
      ]
    : [
        'What do I say if the rep says "Our chargemaster rates are fixed"?',
        'How do I dispute the unbundled lab panel on my bill?',
        'Can the hospital send this to collections while in dispute?',
        'Help me formulate a 1-time cash settlement offer.',
      ];

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right, rendered exclusively where CopilotDrawer is mounted) */}
      {!isCopilotOpen && (
        <button
          onClick={openCopilot}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm shadow-xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 border border-slate-700/60"
          aria-label="Open UnBill Copilot Assistant"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Ask Copilot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Slide-over Backdrop */}
      {isCopilotOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 transition-opacity"
          onClick={closeCopilot}
        />
      )}

      {/* Slide-over Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 transition-transform duration-300 ease-in-out ${
          isCopilotOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="UnBill Copilot Drawer"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-950 text-sm tracking-tight">UnBill Copilot</h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800">
                  Groq sub-350ms
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Statutory Negotiation Advocate</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="Clear conversation"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={closeCopilot}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Audit Context Banner */}
        {activeReport && (
          <div className="p-3 bg-emerald-50/70 border-b border-emerald-100 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <Building className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="font-semibold text-emerald-950 truncate">
                {activeReport.facility.name}
              </span>
              <span className="text-emerald-700 font-mono text-[11px]">
                ({activeReport.patient.accountNumber})
              </span>
            </div>
            <span className="shrink-0 font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
              ${activeReport.financials.totalPotentialSavings.toFixed(0)} Disputed
            </span>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-slate-950 text-white rounded-br-xs'
                    : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                }`}
              >
                <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed space-y-2">
                  {msg.content}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.role === 'user' ? 'You' : 'Copilot'}
              </span>
            </div>
          ))}

          {isStreaming && (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Copilot is formulating negotiation strategy...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="p-3 bg-slate-50/80 border-t border-slate-200">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">
              Suggested Questions for this Bill
            </p>
            <div className="flex flex-col gap-1.5">
              {promptSuggestions.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="text-left text-xs p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors truncate"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Ask about hospital negotiation, FCBA, or charity care..."
              className="flex-1 text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-sans"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white disabled:opacity-40 transition-colors shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center font-sans">
            Educational patient advocacy intelligence. Not formal legal counsel.
          </p>
        </div>
      </aside>
    </>
  );
}
