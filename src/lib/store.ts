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

        // Recalculate potential savings from disputed items
        const newSavings = updatedItems
          .filter((i) => i.isDisputed)
          .reduce((sum, i) => {
            const itemAnomalies = i.anomalies.reduce((aSum, a) => aSum + a.disputedAmount, 0);
            return sum + (itemAnomalies > 0 ? itemAnomalies : 0);
          }, 0);

        const updatedAudit: AuditReport = {
          ...current,
          items: updatedItems,
          financials: {
            ...current.financials,
            totalPotentialSavings: Math.round(newSavings * 100) / 100,
          },
        };

        set({
          currentAudit: updatedAudit,
          currentReport: updatedAudit,
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
    }
  )
);
