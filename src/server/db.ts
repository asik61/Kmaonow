import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '../../data/db.json');

// Interface matching the 11 D1 Database Tables
export interface D1Database {
  users: Array<{
    id: string;
    name: string;
    phone: string;
    email: string;
    referral_code: string;
    referred_by: string | null;
    is_blocked: boolean;
    is_verified: boolean;
    role: 'user' | 'admin';
    created_at: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    subtitle: string;
    description: string;
    category: string;
    reward_amount: number;
    instructions: string[];
    partner_url: string;
    image_url?: string;
    icon_label: string;
    icon_bg: string;
    status: 'active' | 'paused';
    is_top_offer: boolean;
    is_trending: boolean;
    created_at: string;
  }>;
  task_submissions: Array<{
    id: string;
    user_id: string;
    user_name: string;
    user_phone: string;
    task_id: string;
    task_title: string;
    reward_amount: number;
    proof_file_id: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_note?: string;
    submitted_at: string;
    reviewed_at?: string;
  }>;
  wallets: Array<{
    id: string;
    user_id: string;
    available_balance: number;
    pending_balance: number;
    lifetime_earned: number;
    lifetime_withdrawn: number;
    updated_at: string;
  }>;
  ledger: Array<{
    id: string;
    user_id: string;
    type: string;
    amount: number;
    status: 'credit' | 'debit';
    reference_id?: string;
    description: string;
    created_at: string;
  }>;
  referrals: Array<{
    id: string;
    referrer_id: string;
    referred_user_id: string;
    referred_user_name: string;
    status: 'pending' | 'qualified' | 'paid';
    reward_amount: number;
    qualified_at?: string;
    created_at: string;
  }>;
  spin_history: Array<{
    id: string;
    user_id: string;
    reward_amount: number;
    created_at: string;
  }>;
  scratch_history: Array<{
    id: string;
    user_id: string;
    reward_amount: number;
    created_at: string;
  }>;
  withdrawals: Array<{
    id: string;
    user_id: string;
    user_name: string;
    user_phone: string;
    amount: number;
    method: string;
    upi_id?: string;
    bank_account?: string;
    bank_ifsc?: string;
    status: 'pending' | 'approved' | 'rejected';
    utr?: string;
    rejection_reason?: string;
    requested_at: string;
    processed_at?: string;
  }>;
  daily_bonus: Array<{
    id: string;
    user_id: string;
    amount: number;
    claim_date: string;
    created_at: string;
  }>;
  admin_users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    password_hash: string;
    created_at: string;
  }>;
}

const INITIAL_DB_DATA: D1Database = {
  users: [
    {
      id: 'usr-6202636470',
      name: 'Asik Khan (Master Admin)',
      phone: '+91 62026 36470',
      email: 'asik94906@gmail.com',
      referral_code: 'REALHQ',
      referred_by: null,
      is_blocked: false,
      is_verified: true,
      role: 'admin',
      created_at: '2026-10-01T10:00:00Z',
    },
  ],
  tasks: [
    {
      id: 'task-admin-navi-01',
      title: 'Navi: UPI, Loans & Mutual Funds',
      subtitle: 'Install & Register with Mobile',
      description: 'Download Navi app from Play Store, complete registration using your mobile number, setup UPI or start investing with just ₹10 to unlock ₹25 instant cash reward.',
      category: 'Register',
      reward_amount: 25,
      instructions: [
        'Click on "Start Offer" button to open Navi App in Google Play Store.',
        'Download and install the official Navi app on your mobile phone.',
        'Open the app and complete registration with your active mobile number and OTP.',
        'Link your bank account with UPI or complete KYC verification.',
        'Take a clear screenshot of the Navi home screen / registered profile page.',
        'Upload the screenshot here and tap Submit Proof to receive ₹25 cash reward directly in your wallet!',
      ],
      partner_url: 'https://play.google.com/store/apps/details?id=com.naviapp',
      icon_label: 'NAVI',
      icon_bg: '#059669',
      image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      is_top_offer: true,
      is_trending: true,
      created_at: new Date().toISOString(),
    },
  ],
  task_submissions: [],
  wallets: [
    {
      id: 'wal-6202636470',
      user_id: 'usr-6202636470',
      available_balance: 0.00,
      pending_balance: 0.00,
      lifetime_earned: 0.00,
      lifetime_withdrawn: 0.00,
      updated_at: new Date().toISOString(),
    },
  ],
  ledger: [],
  referrals: [],
  spin_history: [],
  scratch_history: [],
  withdrawals: [],
  daily_bonus: [],
  admin_users: [
    {
      id: 'adm-1',
      name: 'Asik Khan (Master Admin)',
      email: 'asik94906@gmail.com',
      role: 'super_admin',
      password_hash: 'admin123',
      created_at: '2026-09-01T00:00:00Z',
    },
  ],
};

class D1DatabaseManager {
  private data: D1Database;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): D1Database {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (e) {
      console.warn('Could not load db.json, using initial seed data:', e);
    }

    this.saveDatabase(INITIAL_DB_DATA);
    return INITIAL_DB_DATA;
  }

  private saveDatabase(data: D1Database) {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save to db.json:', e);
    }
  }

  // Get current DB snapshot
  getSnapshot(): D1Database {
    return this.data;
  }

  // User & Wallet
  getUser(userId: string) {
    return this.data.users.find((u) => u.id === userId) || null;
  }

  getUserByPhone(phone: string) {
    const clean = phone.replace(/\D/g, '');
    if (!clean) return null;
    const last10 = clean.slice(-10);
    return (
      this.data.users.find((u) => {
        const uClean = (u.phone || '').replace(/\D/g, '');
        return uClean.endsWith(last10);
      }) || null
    );
  }

  saveUser(user: any) {
    const cleanPhone = (user.phone || '').replace(/\D/g, '');
    const normEmail = (user.email || '').trim().toLowerCase();
    const idx = this.data.users.findIndex((u) => {
      if (u.id === user.id) return true;
      if (cleanPhone && (u.phone || '').replace(/\D/g, '') === cleanPhone) return true;
      if (normEmail && (u.email || '').trim().toLowerCase() === normEmail) return true;
      return false;
    });

    if (idx >= 0) {
      this.data.users[idx] = { ...this.data.users[idx], ...user };
      this.saveDatabase(this.data);
      return this.data.users[idx];
    }

    const newUser = {
      id: user.id || `usr-${cleanPhone || Date.now()}`,
      name: user.name || 'User',
      phone: user.phone || '',
      email: user.email || '',
      referral_code: user.referral_code || `RM${cleanPhone ? cleanPhone.slice(-4) : '0000'}`,
      referred_by: user.referred_by || null,
      is_blocked: user.is_blocked || false,
      is_verified: user.is_verified ?? true,
      role: user.role || 'user',
      created_at: user.created_at || new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.saveDatabase(this.data);
    return newUser;
  }

  getWallet(userId: string) {
    let wallet = this.data.wallets.find((w) => w.user_id === userId);
    if (!wallet) {
      wallet = {
        id: `wal-${Date.now()}`,
        user_id: userId,
        available_balance: 0,
        pending_balance: 0,
        lifetime_earned: 0,
        lifetime_withdrawn: 0,
        updated_at: new Date().toISOString(),
      };
      this.data.wallets.push(wallet);
      this.saveDatabase(this.data);
    }
    return wallet;
  }

  syncWallet(userId: string, incoming: any) {
    let wallet = this.data.wallets.find((w) => w.user_id === userId);
    const avail = Number(incoming.available_balance ?? incoming.balance ?? 0);
    const pend = Number(incoming.pending_balance ?? 0);
    const earned = Number(incoming.lifetime_earned ?? 0);
    const withdrawn = Number(incoming.lifetime_withdrawn ?? 0);

    if (!wallet) {
      wallet = {
        id: incoming.id || `wal-${Date.now()}`,
        user_id: userId,
        available_balance: avail,
        pending_balance: pend,
        lifetime_earned: Math.max(earned, avail),
        lifetime_withdrawn: withdrawn,
        updated_at: new Date().toISOString(),
      };
      this.data.wallets.push(wallet);
    } else {
      // Protect against wiping an existing positive balance to 0 on client reinstall
      if (avail === 0 && wallet.available_balance > 0 && withdrawn === (wallet.lifetime_withdrawn || 0)) {
        // Retain existing balance
      } else {
        wallet.available_balance = avail;
      }
      wallet.pending_balance = Math.max(wallet.pending_balance || 0, pend);
      wallet.lifetime_earned = Math.max(wallet.lifetime_earned || 0, earned, wallet.available_balance);
      wallet.lifetime_withdrawn = Math.max(wallet.lifetime_withdrawn || 0, withdrawn);
      wallet.updated_at = new Date().toISOString();
    }
    this.saveDatabase(this.data);
    return wallet;
  }

  // Tasks
  getTasks() {
    return this.data.tasks.filter((t) => t.status === 'active');
  }

  getAllTasksAdmin() {
    return this.data.tasks;
  }

  saveTask(taskData: any) {
    if (taskData.id) {
      const idx = this.data.tasks.findIndex((t) => t.id === taskData.id);
      if (idx !== -1) {
        this.data.tasks[idx] = { ...this.data.tasks[idx], ...taskData };
      }
    } else {
      const newTask = {
        id: `task-${Date.now()}`,
        title: taskData.title || 'New Task',
        subtitle: taskData.subtitle || 'Complete & Earn',
        description: taskData.description || 'Follow instructions and upload screenshot.',
        category: taskData.category || 'Register',
        reward_amount: Number(taskData.reward_amount) || 10,
        instructions: taskData.instructions || ['Install the app', 'Open and submit proof'],
        partner_url: taskData.partner_url || 'https://google.com',
        icon_label: taskData.icon_label || 'TASK',
        icon_bg: taskData.icon_bg || '#059669',
        status: 'active' as const,
        is_top_offer: false,
        is_trending: false,
        created_at: new Date().toISOString(),
      };
      this.data.tasks.unshift(newTask);
    }
    this.saveDatabase(this.data);
    return this.data.tasks;
  }

  deleteTask(taskId: string) {
    this.data.tasks = this.data.tasks.filter((t) => t.id !== taskId);
    this.saveDatabase(this.data);
    return true;
  }

  toggleTask(taskId: string) {
    const task = this.data.tasks.find((t) => t.id === taskId);
    if (!task) return null;
    task.status = task.status === 'active' ? 'paused' : 'active';
    this.saveDatabase(this.data);
    return task;
  }

  // Submissions
  submitTaskProof(userId: string, taskId: string, proofFileId: string) {
    const task = this.data.tasks.find((t) => t.id === taskId);
    const user = this.getUser(userId);
    if (!task) throw new Error('Task not found');

    const sub = {
      id: `sub-${Date.now()}`,
      user_id: userId,
      user_name: user?.name || 'User',
      user_phone: user?.phone || '+91 98765 43210',
      task_id: taskId,
      task_title: task.title,
      reward_amount: task.reward_amount,
      proof_file_id: proofFileId,
      status: 'pending' as const,
      admin_note: 'Submitted. Under review by admin.',
      submitted_at: new Date().toISOString(),
    };

    this.data.task_submissions.unshift(sub);

    // Update Wallet pending balance
    const wallet = this.getWallet(userId);
    wallet.pending_balance = Number((wallet.pending_balance + task.reward_amount).toFixed(2));
    wallet.updated_at = new Date().toISOString();

    this.saveDatabase(this.data);
    return sub;
  }

  approveSubmission(subId: string, adminNote = 'Proof verified and approved.') {
    const sub = this.data.task_submissions.find((s) => s.id === subId);
    if (!sub || sub.status !== 'pending') return null;

    sub.status = 'approved';
    sub.admin_note = adminNote;
    sub.reviewed_at = new Date().toISOString();

    // Move pending balance to available balance
    const wallet = this.getWallet(sub.user_id);
    wallet.pending_balance = Math.max(0, Number((wallet.pending_balance - sub.reward_amount).toFixed(2)));
    wallet.available_balance = Number((wallet.available_balance + sub.reward_amount).toFixed(2));
    wallet.lifetime_earned = Number((wallet.lifetime_earned + sub.reward_amount).toFixed(2));
    wallet.updated_at = new Date().toISOString();

    // Create Ledger Entry
    this.data.ledger.unshift({
      id: `led-${Date.now()}`,
      user_id: sub.user_id,
      type: 'task_reward',
      amount: sub.reward_amount,
      status: 'credit',
      reference_id: sub.task_id,
      description: `Task Approved: ${sub.task_title}`,
      created_at: new Date().toISOString(),
    });

    // Check if user was referred, mark qualified
    this.data.referrals.forEach((r) => {
      if (r.referred_user_id === sub.user_id && r.status === 'pending') {
        r.status = 'qualified';
        r.qualified_at = new Date().toISOString();

        // Award Referrer ₹3.00
        const refWallet = this.getWallet(r.referrer_id);
        refWallet.available_balance = Number((refWallet.available_balance + r.reward_amount).toFixed(2));
        refWallet.lifetime_earned = Number((refWallet.lifetime_earned + r.reward_amount).toFixed(2));

        this.data.ledger.unshift({
          id: `led-${Date.now()}`,
          user_id: r.referrer_id,
          type: 'referral_bonus',
          amount: r.reward_amount,
          status: 'credit',
          reference_id: r.id,
          description: `Referral Qualified: ${r.referred_user_name} completed task`,
          created_at: new Date().toISOString(),
        });
      }
    });

    this.saveDatabase(this.data);
    return sub;
  }

  rejectSubmission(subId: string, reason = 'Proof rejected: Invalid or blurred screenshot.') {
    const sub = this.data.task_submissions.find((s) => s.id === subId);
    if (!sub || sub.status !== 'pending') return null;

    sub.status = 'rejected';
    sub.admin_note = reason;
    sub.reviewed_at = new Date().toISOString();

    // Deduct pending balance
    const wallet = this.getWallet(sub.user_id);
    wallet.pending_balance = Math.max(0, Number((wallet.pending_balance - sub.reward_amount).toFixed(2)));
    wallet.updated_at = new Date().toISOString();

    this.saveDatabase(this.data);
    return sub;
  }

  // Spin & Scratch
  recordSpinReward(userId: string, amount: number) {
    const today = new Date().toISOString().slice(0, 10);
    const usedToday = this.data.spin_history.filter(
      (s) => s.user_id === userId && (s.created_at || '').slice(0, 10) === today
    ).length;

    this.data.spin_history.unshift({
      id: `spin-${Date.now()}`,
      user_id: userId,
      reward_amount: amount,
      created_at: new Date().toISOString(),
    });

    const wallet = this.getWallet(userId);
    wallet.available_balance = Number((wallet.available_balance + amount).toFixed(2));
    wallet.lifetime_earned = Number((wallet.lifetime_earned + amount).toFixed(2));
    wallet.updated_at = new Date().toISOString();

    const newUsed = usedToday + 1;
    const remaining = Math.max(0, 3 - newUsed);

    this.data.ledger.unshift({
      id: `led-${Date.now()}`,
      user_id: userId,
      type: 'spin_reward',
      amount,
      status: 'credit',
      description: `Daily Lucky Spin #${newUsed} Reward: ₹${amount.toFixed(2)}`,
      created_at: new Date().toISOString(),
    });

    this.saveDatabase(this.data);
    return {
      ok: true,
      available_balance: wallet.available_balance,
      remaining,
      usedToday: newUsed,
      dailyLimit: 3,
    };
  }

  recordScratchReward(userId: string, amount: number) {
    const today = new Date().toISOString().slice(0, 10);
    const usedToday = this.data.scratch_history.filter(
      (s) => s.user_id === userId && (s.created_at || '').slice(0, 10) === today
    ).length;

    this.data.scratch_history.unshift({
      id: `sc-${Date.now()}`,
      user_id: userId,
      reward_amount: amount,
      created_at: new Date().toISOString(),
    });

    const wallet = this.getWallet(userId);
    wallet.available_balance = Number((wallet.available_balance + amount).toFixed(2));
    wallet.lifetime_earned = Number((wallet.lifetime_earned + amount).toFixed(2));
    wallet.updated_at = new Date().toISOString();

    const newUsed = usedToday + 1;
    const remaining = Math.max(0, 3 - newUsed);

    this.data.ledger.unshift({
      id: `led-${Date.now()}`,
      user_id: userId,
      type: 'scratch_reward',
      amount,
      status: 'credit',
      description: `Daily Scratch Card #${newUsed} Reward: ₹${amount.toFixed(2)}`,
      created_at: new Date().toISOString(),
    });

    this.saveDatabase(this.data);
    return {
      ok: true,
      available_balance: wallet.available_balance,
      remaining,
      usedToday: newUsed,
      dailyLimit: 3,
    };
  }

  claimDailyBonus(userId: string, amount = 0.50) {
    const today = new Date().toISOString().slice(0, 10);
    const existing = this.data.daily_bonus.find((d) => d.user_id === userId && d.claim_date === today);
    if (existing) {
      return { ok: false, error: 'Daily bonus already claimed for today' };
    }

    this.data.daily_bonus.unshift({
      id: `db-${Date.now()}`,
      user_id: userId,
      amount,
      claim_date: today,
      created_at: new Date().toISOString(),
    });

    const wallet = this.getWallet(userId);
    wallet.available_balance = Number((wallet.available_balance + amount).toFixed(2));
    wallet.lifetime_earned = Number((wallet.lifetime_earned + amount).toFixed(2));
    wallet.updated_at = new Date().toISOString();

    this.data.ledger.unshift({
      id: `led-${Date.now()}`,
      user_id: userId,
      type: 'daily_bonus',
      amount,
      status: 'credit',
      description: `Daily Check-in Bonus: ₹${amount.toFixed(2)}`,
      created_at: new Date().toISOString(),
    });

    this.saveDatabase(this.data);
    return { ok: true, available_balance: wallet.available_balance };
  }

  // Withdrawals
  requestWithdrawal(payload: {
    userId: string;
    amount: number;
    method: string;
    upiId?: string;
    bankAccount?: string;
    bankIfsc?: string;
  }) {
    const wallet = this.getWallet(payload.userId);
    if (payload.amount > wallet.available_balance) {
      return { ok: false, error: 'Insufficient balance' };
    }

    const user = this.getUser(payload.userId);

    const wdr = {
      id: `wdr-${Date.now()}`,
      user_id: payload.userId,
      user_name: user?.name || 'User',
      user_phone: user?.phone || '',
      amount: payload.amount,
      method: payload.method,
      upi_id: payload.upiId,
      bank_account: payload.bankAccount,
      bank_ifsc: payload.bankIfsc,
      status: 'pending' as const,
      requested_at: new Date().toISOString(),
    };

    this.data.withdrawals.unshift(wdr);

    wallet.available_balance = Number((wallet.available_balance - payload.amount).toFixed(2));
    wallet.pending_balance = Number((wallet.pending_balance + payload.amount).toFixed(2));
    wallet.updated_at = new Date().toISOString();

    this.data.ledger.unshift({
      id: `led-${Date.now()}`,
      user_id: payload.userId,
      type: 'withdrawal',
      amount: payload.amount,
      status: 'debit',
      reference_id: wdr.id,
      description: `Withdrawal request via ${payload.method}`,
      created_at: new Date().toISOString(),
    });

    this.saveDatabase(this.data);
    return { ok: true, withdrawal: wdr };
  }

  markWithdrawalPaid(wdrId: string, utr: string) {
    const wdr = this.data.withdrawals.find((w) => w.id === wdrId);
    if (!wdr || wdr.status !== 'pending') return null;

    wdr.status = 'approved';
    wdr.utr = utr;
    wdr.processed_at = new Date().toISOString();

    const wallet = this.getWallet(wdr.user_id);
    wallet.pending_balance = Math.max(0, Number((wallet.pending_balance - wdr.amount).toFixed(2)));
    wallet.lifetime_withdrawn = Number((wallet.lifetime_withdrawn + wdr.amount).toFixed(2));
    wallet.updated_at = new Date().toISOString();

    this.saveDatabase(this.data);
    return wdr;
  }

  rejectWithdrawal(wdrId: string, reason: string) {
    const wdr = this.data.withdrawals.find((w) => w.id === wdrId);
    if (!wdr || wdr.status !== 'pending') return null;

    wdr.status = 'rejected';
    wdr.rejection_reason = reason;
    wdr.processed_at = new Date().toISOString();

    const wallet = this.getWallet(wdr.user_id);
    wallet.pending_balance = Math.max(0, Number((wallet.pending_balance - wdr.amount).toFixed(2)));
    wallet.available_balance = Number((wallet.available_balance + wdr.amount).toFixed(2));
    wallet.updated_at = new Date().toISOString();

    this.data.ledger.unshift({
      id: `led-${Date.now()}`,
      user_id: wdr.user_id,
      type: 'withdrawal_refund',
      amount: wdr.amount,
      status: 'credit',
      reference_id: wdr.id,
      description: `Refund: Withdrawal rejected (${reason})`,
      created_at: new Date().toISOString(),
    });

    this.saveDatabase(this.data);
    return wdr;
  }
}

export const db = new D1DatabaseManager();
