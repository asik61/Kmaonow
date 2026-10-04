// =========================================================================
// KamaoNow Frontend API Client (Cloudflare Workers / D1 API Interface)
// Offline-First with local fallback
// =========================================================================

import type {
  TaskItem,
  TaskSubmission,
  WalletState,
  LedgerItem,
  ReferralItem,
  WithdrawalRequest,
} from '../types/kamaonow';

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  // Tasks
  getTasks: async (): Promise<TaskItem[]> => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API getTasks fallback to local:', e);
    }
    return [];
  },

  submitTaskProof: async (taskId: string, userId: string, proofFileId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, proofFileId }),
      });
      return await res.json();
    } catch (e) {
      console.warn('API submitTaskProof fallback:', e);
      return { ok: false };
    }
  },

  // Wallet & Ledger
  getWallet: async (userId: string): Promise<WalletState | null> => {
    try {
      const res = await fetch(`/api/wallet/${userId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API getWallet fallback:', e);
    }
    return null;
  },

  getLedger: async (userId: string): Promise<LedgerItem[]> => {
    try {
      const res = await fetch(`/api/ledger/${userId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API getLedger fallback:', e);
    }
    return [];
  },

  // Spin & Scratch & Daily Bonus
  recordSpin: async (userId: string, amount: number) => {
    try {
      const res = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
      });
      return await res.json();
    } catch (e) {
      console.warn('API recordSpin fallback:', e);
      return { ok: false };
    }
  },

  recordScratch: async (userId: string, amount: number) => {
    try {
      const res = await fetch('/api/scratch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
      });
      return await res.json();
    } catch (e) {
      console.warn('API recordScratch fallback:', e);
      return { ok: false };
    }
  },

  claimDailyBonus: async (userId: string, amount = 0.5) => {
    try {
      const res = await fetch('/api/daily-bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
      });
      return await res.json();
    } catch (e) {
      console.warn('API claimDailyBonus fallback:', e);
      return { ok: false };
    }
  },

  // Withdrawals
  requestWithdrawal: async (payload: {
    userId: string;
    amount: number;
    method: string;
    upiId?: string;
    bankAccount?: string;
    bankIfsc?: string;
  }) => {
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      console.warn('API requestWithdrawal fallback:', e);
      return { ok: false, error: 'Network error' };
    }
  },

  // Admin APIs
  adminApproveSubmission: async (subId: string, adminNote?: string) => {
    try {
      const res = await fetch(`/api/admin/submissions/${subId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote }),
      });
      return await res.json();
    } catch (e) {
      console.warn('API adminApproveSubmission fallback:', e);
      return { ok: false };
    }
  },

  adminRejectSubmission: async (subId: string, reason?: string) => {
    try {
      const res = await fetch(`/api/admin/submissions/${subId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      return await res.json();
    } catch (e) {
      console.warn('API adminRejectSubmission fallback:', e);
      return { ok: false };
    }
  },

  adminPayWithdrawal: async (wdrId: string, utr: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${wdrId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utr }),
      });
      return await res.json();
    } catch (e) {
      console.warn('API adminPayWithdrawal fallback:', e);
      return { ok: false };
    }
  },

  adminRejectWithdrawal: async (wdrId: string, reason: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${wdrId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      return await res.json();
    } catch (e) {
      console.warn('API adminRejectWithdrawal fallback:', e);
      return { ok: false };
    }
  },

  adminSaveTask: async (taskData: Partial<TaskItem>) => {
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      return await res.json();
    } catch (e) {
      console.warn('API adminSaveTask fallback:', e);
      return { ok: false };
    }
  },

  adminDeleteTask: async (taskId: string) => {
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('API adminDeleteTask fallback:', e);
      return { ok: false };
    }
  },

  adminGetStats: async () => {
    try {
      const res = await fetch('/api/admin/stats');
      return await res.json();
    } catch {
      return null;
    }
  },

  getD1Snapshot: async () => {
    try {
      const res = await fetch('/api/d1/snapshot');
      return await res.json();
    } catch {
      return null;
    }
  },
};
