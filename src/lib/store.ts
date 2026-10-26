import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuditReport } from '@/types/audit';

interface AuditState {
  currentAudit: AuditReport | null;
  currentReport: AuditReport | null;
  history: AuditReport[];
  isAuditing: boolean;
  isCopilotOpen: boolean;
  auditProgress: {
    agent: 'AGENT_1' | 'AGENT_2' | 'AGENT_3' | 'COMPLETE';
    message: string;
    percent: number;
  };
  setAudit: (audit: AuditReport) => void;
  setCurrentReport: (audit: AuditReport) => void;
  addReportToHistory: (audit: AuditReport) => void;
  toggleItemDispute: (itemId: string) => void;
  startAuditing: () => void;
  updateAuditProgress: (
    agent: 'AGENT_1' | 'AGENT_2' | 'AGENT_3' | 'COMPLETE',
    message: string,
    percent: number
  ) => void;
  finishAuditing: (audit: AuditReport) => void;
  deleteAuditFromHistory: (id: string) => void;
  clearHistory: () => void;
  openCopilot: () => void;
  closeCopilot: () => void;
  toggleCopilot: () => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      currentAudit: null,
      currentReport: null,
      history: [],
      isAuditing: false,
      isCopilotOpen: false,
      auditProgress: {
        agent: 'AGENT_1',
        message: 'Initializing...',
        percent: 0,
      },

      setAudit: (audit: AuditReport) => {
        const history = get().history;
        const exists = history.some((h) => h.id === audit.id);
        const newHistory = exists
          ? history.map((h) => (h.id === audit.id ? audit : h))
          : [audit, ...history];

        set({
          currentAudit: audit,
          currentReport: audit,
          history: newHistory,
        });
      },

      setCurrentReport: (audit: AuditReport) => {
        get().setAudit(audit);
      },

      addReportToHistory: (audit: AuditReport) => {
        const history = get().history;
        if (!history.some((h) => h.id === audit.id)) {
          set({ history: [audit, ...history] });
        }
      },

      toggleItemDispute: (itemId: string) => {
        const current = get().currentAudit || get().currentReport;
        if (!current) return;

        const updatedItems = current.items.map((item) => {
          if (item.id === itemId) {
            return { ...item, isDisputed: !item.isDisputed };
          }
          return item;
        });

        // Recalculate potential savings from disputed items without double-counting
        const newSavings = updatedItems
          .filter((i) => i.isDisputed)
          .reduce((sum, i) => {
            if (i.anomalies.length === 0) return sum;
            const maxDispute = Math.max(...i.anomalies.map((a) => a.disputedAmount));
            const itemSaving = Math.min(i.billedAmount, maxDispute);
            return sum + (itemSaving > 0 ? itemSaving : 0);
          }, 0);

        const roundedSavings = Math.round(newSavings * 100) / 100;
        const updatedDisputePackage = current.disputePackage
          ? {
              ...current.disputePackage,
              formalLetterText: current.disputePackage.formalLetterText
                .replace(/Total Disputed Amount: \$[0-9.]+/g, `Total Disputed Amount: $${roundedSavings.toFixed(2)}`)
                .replace(/contains \$[0-9.]+ in computational/g, `contains $${roundedSavings.toFixed(2)} in computational`),
            }
          : current.disputePackage;

        const updatedAudit: AuditReport = {
          ...current,
          items: updatedItems,
          financials: {
            ...current.financials,
            totalPotentialSavings: roundedSavings,
          },
          disputePackage: updatedDisputePackage,
        };

        const updatedHistory = get().history.map((h) =>
          h.id === updatedAudit.id ? updatedAudit : h
        );

        set({
          currentAudit: updatedAudit,
          currentReport: updatedAudit,
          history: updatedHistory,
        });
      },

      startAuditing: () => {
        set({
          isAuditing: true,
          auditProgress: {
            agent: 'AGENT_1',
            message: 'Agent 1: Scanning document & extracting clinical CPT codes...',
            percent: 25,
          },
        });
      },

      updateAuditProgress: (agent, message, percent) => {
        set({
          auditProgress: { agent, message, percent },
        });
      },

      finishAuditing: (audit: AuditReport) => {
        const history = get().history;
        const exists = history.some((h) => h.id === audit.id);
        const newHistory = exists
          ? history.map((h) => (h.id === audit.id ? audit : h))
          : [audit, ...history];

        set({
          isAuditing: false,
          currentAudit: audit,
          currentReport: audit,
          history: newHistory,
          auditProgress: {
            agent: 'COMPLETE',
            message: 'Audit complete! Rendering forensic report...',
            percent: 100,
          },
        });
      },

      deleteAuditFromHistory: (id: string) => {
        set({
          history: get().history.filter((h) => h.id !== id),
          currentAudit: get().currentAudit?.id === id ? null : get().currentAudit,
          currentReport: get().currentReport?.id === id ? null : get().currentReport,
        });
      },

      clearHistory: () => {
        set({ history: [], currentAudit: null, currentReport: null });
      },

      openCopilot: () => set({ isCopilotOpen: true }),
      closeCopilot: () => set({ isCopilotOpen: false }),
      toggleCopilot: () => set((state) => ({ isCopilotOpen: !state.isCopilotOpen })),
    }),
    {
      name: 'unbill_vault_v1',
      skipHydration: true, // Prevents SSR window hydration mismatch in Next.js
      storage: {
        getItem: (name: string) => {
          if (typeof window === 'undefined' && typeof globalThis.localStorage === 'undefined') return null;
          const raw = globalThis.localStorage?.getItem(name);
          if (!raw) return null;
          try {
            const decoded = typeof Buffer !== 'undefined'
              ? Buffer.from(raw, 'base64').toString('utf8')
              : decodeURIComponent(Array.prototype.map.call(atob(raw), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(decoded);
          } catch {
            try { return JSON.parse(raw); } catch { return null; }
          }
        },
        setItem: (name: string, value: any) => {
          if (typeof window === 'undefined' && typeof globalThis.localStorage === 'undefined') return;
          const str = JSON.stringify(value);
          const encoded = typeof Buffer !== 'undefined'
            ? Buffer.from(str, 'utf8').toString('base64')
            : btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
          globalThis.localStorage?.setItem(name, encoded);
        },
        removeItem: (name: string) => {
          if (typeof window === 'undefined' && typeof globalThis.localStorage === 'undefined') return;
          globalThis.localStorage?.removeItem(name);
        },
      },
    }
  )
);
