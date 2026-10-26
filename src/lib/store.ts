import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuditReport } from '@/types/audit';
import { recalculateReport } from './rules-engine';
import { normalizeReport } from './reports';
import { encryptedStateStorage, clearLegacyArchive } from './vault-storage';
export interface OwnedShare {
  shareId: string;
  revokeToken: string;
  shareUrl: string;
  expiresAt: string;
}
interface AuditState {
  currentAudit: AuditReport | null;
  currentReport: AuditReport | null;
  history: AuditReport[];
  ownedShares: OwnedShare[];
  isCopilotOpen: boolean;
  vaultError: string | null;
  setAudit: (audit: AuditReport) => void;
  setCurrentReport: (audit: AuditReport) => void;
  addReportToHistory: (audit: AuditReport) => void;
  toggleItemDispute: (id: string) => void;
  deleteAuditFromHistory: (id: string) => void;
  clearHistory: () => void;
  openCopilot: () => void;
  closeCopilot: () => void;
  toggleCopilot: () => void;
  addOwnedShare: (share: OwnedShare) => void;
  removeOwnedShare: (id: string) => void;
}
export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      currentAudit: null,
      currentReport: null,
      history: [],
      ownedShares: [],
      isCopilotOpen: false,
      vaultError: null,
      setAudit: (audit) => {
        const canonical = recalculateReport(audit);
        set({
          currentAudit: canonical,
          currentReport: canonical,
          history: [canonical, ...get().history.filter((h) => h.id !== canonical.id)].slice(0, 30),
        });
      },
      setCurrentReport: (audit) => get().setAudit(audit),
      addReportToHistory: (audit) => get().setAudit(audit),
      toggleItemDispute: (id) => {
        const current = get().currentReport;
        if (current)
          get().setAudit(
            recalculateReport({
              ...current,
              items: current.items.map((i) =>
                i.id === id ? { ...i, isDisputed: !i.isDisputed } : i,
              ),
            }),
          );
      },
      deleteAuditFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
          currentAudit: state.currentAudit?.id === id ? null : state.currentAudit,
          currentReport: state.currentReport?.id === id ? null : state.currentReport,
        })),
      clearHistory: () => {
        set({ history: [], currentAudit: null, currentReport: null, isCopilotOpen: false });
        void clearLegacyArchive();
      },
      openCopilot: () => set({ isCopilotOpen: true }),
      closeCopilot: () => set({ isCopilotOpen: false }),
      toggleCopilot: () => set((s) => ({ isCopilotOpen: !s.isCopilotOpen })),
      addOwnedShare: (share) =>
        set((s) => ({ ownedShares: [share, ...s.ownedShares].slice(0, 100) })),
      removeOwnedShare: (id) =>
        set((s) => ({ ownedShares: s.ownedShares.filter((x) => x.shareId !== id) })),
    }),
    {
      name: 'unbill_vault_v2',
      version: 2,
      skipHydration: true,
      storage: createJSONStorage(() => encryptedStateStorage),
      partialize: (s) => ({ history: s.history, ownedShares: s.ownedShares }),
      migrate: (p) => p as { history: AuditReport[]; ownedShares: OwnedShare[] },
      merge: (persisted, current) => {
        const saved = persisted as { history?: unknown[]; ownedShares?: OwnedShare[] } | undefined;
        const history: AuditReport[] = [];
        for (const report of (saved?.history || []).slice(0, 30)) {
          try {
            history.push(normalizeReport(report));
          } catch {
            /* Keep malformed legacy data out of the active app. */
          }
        }
        return {
          ...current,
          history,
          ownedShares: (saved?.ownedShares || [])
            .filter((s) => /^share_[\w-]{43}$/.test(s.shareId) && /^[\w-]{43}$/.test(s.revokeToken))
            .slice(0, 100),
        };
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error)
          useAuditStore.setState({
            vaultError:
              'Saved history could not be opened. This tab can still run new audits. Export anything you need before resetting browser data.',
          });
      },
    },
  ),
);
let hydration: Promise<void> | undefined;
export function hydrateVault() {
  if (!hydration)
    hydration = Promise.resolve(useAuditStore.persist.rehydrate()).then(() => {
      if (!useAuditStore.getState().vaultError)
        useAuditStore.setState({ history: [...useAuditStore.getState().history] });
    });
  return hydration;
}
