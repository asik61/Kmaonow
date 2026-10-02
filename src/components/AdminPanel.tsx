import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ZoomIn,
  ZoomOut,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  Search,
  Database,
  X,
  FileCheck2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import type {
  TaskItem,
  TaskSubmission,
  WithdrawalRequest,
  UserProfile,
  WalletState,
  LedgerItem,
  ReferralItem,
} from '../types/kamaonow';

interface AdminPanelProps {
  tasks: TaskItem[];
  submissions: TaskSubmission[];
  withdrawals: WithdrawalRequest[];
  users: UserProfile[];
  wallets: Record<string, WalletState>;
  ledger: LedgerItem[];
  referrals: ReferralItem[];
  onApproveSubmission: (subId: string) => void;
  onRejectSubmission: (subId: string, note: string) => void;
  onApproveWithdrawal: (wdrId: string, utr: string) => void;
  onRejectWithdrawal: (wdrId: string, reason: string) => void;
  onSaveTask: (task: Partial<TaskItem>) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleUserBlock: (userId: string) => void;
  onAdjustBalance: (userId: string, amount: number, note: string) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  tasks,
  submissions,
  withdrawals,
  users,
  wallets,
  ledger,
  referrals,
  onApproveSubmission,
  onRejectSubmission,
  onApproveWithdrawal,
  onRejectWithdrawal,
  onSaveTask,
  onDeleteTask,
  onToggleUserBlock,
  onAdjustBalance,
  onClose,
}) => {
  const [tab, setTab] = useState<'proofs' | 'withdrawals' | 'tasks' | 'users' | 'database'>('proofs');

  // Proofs state
  const [zoomedSub, setZoomedSub] = useState<TaskSubmission | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rejectNote, setRejectNote] = useState('Screenshot is unclear or registration steps incomplete.');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // Withdrawals state
  const [utrInput, setUtrInput] = useState<Record<string, string>>({});
  const [copiedUpi, setCopiedUpi] = useState<string | null>(null);

  // Task edit state
  const [editingTask, setEditingTask] = useState<Partial<TaskItem> | null>(null);

  // User adjust state
  const [adjustingUserId, setAdjustingUserId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('50');
  const [adjustNote, setAdjustNote] = useState<string>('Campaign manual bonus');

  // DB Table state
  const [dbTable, setDbTable] = useState<string>('task_submissions');

  const pendingProofs = submissions.filter((s) => s.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 text-white flex flex-col">
      <div className="w-full max-w-6xl mx-auto rounded-3xl bg-[#032319] border border-emerald-500/40 shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-500/20 bg-[#021A13]">
          <div>
            <div className="text-xs text-emerald-400 font-mono">PWA Manual Admin (TaskPay Style)</div>
            <h1 className="text-lg sm:text-xl font-bold text-white">KamaoNow Operations & Treasury Desk</h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-2 bg-[#021811] border-b border-emerald-500/20 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('proofs')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              tab === 'proofs'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            Proof Reviews ({pendingProofs.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('withdrawals')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              tab === 'withdrawals'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            Withdrawals ({pendingWithdrawals.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('tasks')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              tab === 'tasks'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            Manage Tasks ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              tab === 'users'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            Users & Balances ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('database')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              tab === 'database'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            Database Tables (D1)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[72vh] overflow-y-auto space-y-6">
          {/* TAB 1: PROOFS REVIEW */}
          {tab === 'proofs' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Inspect uploaded task screenshots with zoom, approve (+₹ cash to user wallet and ledger) or reject with note.
              </div>

              {submissions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-[#021A13] rounded-2xl">
                  No submissions yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-[#021A13] border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        {sub.proof_file_id ? (
                          <img
                            src={sub.proof_file_id}
                            alt="Proof"
                            onClick={() => {
                              setZoomedSub(sub);
                              setZoomLevel(1.5);
                            }}
                            className="w-16 h-20 object-cover rounded-xl border border-emerald-500/30 cursor-pointer hover:scale-105 transition-transform shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-20 rounded-xl bg-slate-800 flex items-center justify-center text-xs text-slate-400 shrink-0">
                            Receipt
                          </div>
                        )}
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{sub.user_name}</span>
                            <span className="font-mono text-emerald-400">+91 {sub.user_phone}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(sub.submitted_at).toLocaleTimeString('en-IN')}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-200">{sub.task_title}</div>
                          <div className="font-mono font-bold text-emerald-400 text-sm">
                            ₹{sub.reward_amount.toFixed(2)}
                          </div>
                          {sub.admin_note && (
                            <div className="text-slate-400 text-[11px] italic">{sub.admin_note}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {sub.status === 'pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onApproveSubmission(sub.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-colors cursor-pointer"
                            >
                              Approve (+₹{sub.reward_amount.toFixed(2)})
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectingId(sub.id)}
                              className="px-3.5 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/20 font-bold text-xs transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold font-mono capitalize ${
                              sub.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {sub.status}
                          </span>
                        )}
                      </div>

                      {/* Reject Form */}
                      {rejectingId === sub.id && (
                        <div className="w-full pt-3 border-t border-emerald-500/20 flex items-center gap-2">
                          <input
                            type="text"
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            className="grow px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              onRejectSubmission(sub.id, rejectNote);
                              setRejectingId(null);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-red-500 text-white font-bold text-xs cursor-pointer"
                          >
                            Confirm Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingId(null)}
                            className="px-2.5 py-1.5 rounded-xl text-xs text-slate-400"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WITHDRAWALS */}
          {tab === 'withdrawals' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Transfer money to user UPI ID / Bank and enter Bank UTR number to mark Approved & Paid.
              </div>

              {withdrawals.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-[#021A13] rounded-2xl">
                  No withdrawal requests yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((wdr) => (
                    <div
                      key={wdr.id}
                      className="p-4 rounded-2xl bg-[#021A13] border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{wdr.user_name}</span>
                          <span className="font-mono text-emerald-400">+91 {wdr.user_phone}</span>
                        </div>
                        <div className="font-mono font-extrabold text-base text-white">
                          ₹{wdr.amount.toFixed(2)}{' '}
                          <span className="text-xs text-emerald-400 font-semibold font-sans">
                            via {wdr.method}
                          </span>
                        </div>
                        <div className="text-slate-300 font-mono flex items-center gap-2">
                          <span>{wdr.upi_id || `A/C: ${wdr.bank_account} (${wdr.bank_ifsc})`}</span>
                          {wdr.upi_id && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(wdr.upi_id!);
                                setCopiedUpi(wdr.id);
                                setTimeout(() => setCopiedUpi(null), 1500);
                              }}
                              className="text-[11px] text-emerald-400 underline cursor-pointer"
                            >
                              {copiedUpi === wdr.id ? 'Copied!' : 'Copy'}
                            </button>
                          )}
                        </div>
                        {wdr.utr && (
                          <div className="text-emerald-400 font-mono font-bold">
                            Bank UTR: {wdr.utr}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {wdr.status === 'pending' ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              placeholder="Enter Bank UTR (e.g. 428190281)"
                              value={utrInput[wdr.id] || ''}
                              onChange={(e) =>
                                setUtrInput((prev) => ({ ...prev, [wdr.id]: e.target.value }))
                              }
                              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs font-mono text-white w-48"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const utr =
                                  utrInput[wdr.id] ||
                                  `4281${Math.floor(10000000 + Math.random() * 90000000)}`;
                                onApproveWithdrawal(wdr.id, utr);
                              }}
                              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs cursor-pointer"
                            >
                              Approve & Pay
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onRejectWithdrawal(
                                  wdr.id,
                                  'UPI VPA could not be verified by remitter bank.'
                                )
                              }
                              className="px-3 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/20 font-bold text-xs cursor-pointer"
                            >
                              Reject & Refund
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold font-mono capitalize ${
                              wdr.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {wdr.status === 'approved' ? 'Paid' : 'Rejected'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MANAGE TASKS */}
          {tab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Configure active CPA tasks & offers</span>
                <button
                  type="button"
                  onClick={() =>
                    setEditingTask({
                      title: '',
                      subtitle: 'Install & Register',
                      description: 'Complete mobile verification and submit proof.',
                      category: 'Register',
                      reward_amount: 50.0,
                      partner_url: 'https://',
                      icon_label: 'NEW',
                      icon_bg: '#059669',
                      instructions: [
                        'Install the app via partner link.',
                        'Complete registration.',
                        'Upload screenshot.',
                      ],
                      is_active: true,
                    })
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Task</span>
                </button>
              </div>

              {/* Editing Form */}
              {editingTask && (
                <div className="p-4 rounded-2xl bg-[#042F24] border border-emerald-500/30 space-y-3">
                  <div className="font-bold text-sm text-white">
                    {editingTask.id ? 'Edit Task' : 'Create New CPA Task'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-slate-300">Task Title</label>
                      <input
                        type="text"
                        value={editingTask.title || ''}
                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/30 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300">Reward (₹ INR)</label>
                      <input
                        type="number"
                        value={editingTask.reward_amount || 50}
                        onChange={(e) =>
                          setEditingTask({ ...editingTask, reward_amount: Number(e.target.value) })
                        }
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/30 font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300">Category</label>
                      <select
                        value={editingTask.category || 'Register'}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            category: e.target.value as TaskItem['category'],
                          })
                        }
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/30 text-white"
                      >
                        <option value="Register">Register</option>
                        <option value="Installed">Installed</option>
                        <option value="Survey">Survey</option>
                        <option value="All">All</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingTask(null)}
                      className="px-3 py-1.5 rounded-xl border border-white/20 text-xs text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSaveTask(editingTask);
                        setEditingTask(null);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                    >
                      Save Task
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-[#021A13] border border-emerald-500/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: t.icon_bg || '#059669' }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                      >
                        {t.icon_label}
                      </div>
                      <div>
                        <div className="font-bold text-white">{t.title}</div>
                        <div className="text-slate-400 font-mono">
                          ₹{t.reward_amount.toFixed(2)} · {t.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingTask(t)}
                        className="px-2.5 py-1 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTask(t.id)}
                        className="px-2.5 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: USERS & BALANCES */}
          {tab === 'users' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Registered profiles, wallet balances, block status, and manual credit/debit adjustments.
              </div>

              <div className="space-y-3">
                {users.map((u) => {
                  const w = wallets[u.id] || {
                    available_balance: 0,
                    pending_balance: 0,
                    lifetime_earned: 0,
                  };
                  return (
                    <div
                      key={u.id}
                      className="p-4 rounded-2xl bg-[#021A13] border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{u.name}</span>
                          {u.is_blocked && (
                            <span className="text-red-400 font-semibold">(Blocked)</span>
                          )}
                        </div>
                        <div className="text-slate-400 font-mono">
                          Phone: +91 {u.phone} · Ref: {u.referral_code}
                        </div>
                        <div className="font-mono text-emerald-400 font-bold">
                          Available: ₹{w.available_balance.toFixed(2)} | Pending: ₹
                          {w.pending_balance.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAdjustingUserId(u.id)}
                          className="px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-bold"
                        >
                          ± Adjust ₹
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleUserBlock(u.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold ${
                            u.is_blocked
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {u.is_blocked ? 'Unblock' : 'Block'}
                        </button>
                      </div>

                      {adjustingUserId === u.id && (
                        <div className="w-full pt-3 border-t border-emerald-500/20 flex items-center gap-2">
                          <input
                            type="number"
                            value={adjustAmount}
                            onChange={(e) => setAdjustAmount(e.target.value)}
                            placeholder="Amount (e.g. 50 or -20)"
                            className="w-28 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-white font-mono"
                          />
                          <input
                            type="text"
                            value={adjustNote}
                            onChange={(e) => setAdjustNote(e.target.value)}
                            placeholder="Reason..."
                            className="grow px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              onAdjustBalance(u.id, Number(adjustAmount), adjustNote);
                              setAdjustingUserId(null);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold"
                          >
                            Apply
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdjustingUserId(null)}
                            className="text-slate-400 text-xs px-2"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: DATABASE TABLES (CLOUDFLARE D1) INSPECTOR */}
          {tab === 'database' && (
            <div className="space-y-4">
              {/* Cloudflare Architecture Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#021A13] border border-emerald-500/20">
                  <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Database</div>
                  <div className="text-sm font-black text-white mt-0.5">Cloudflare D1</div>
                  <div className="text-[10px] text-slate-400 mt-1">5 GB Free · 5M Reads/day</div>
                </div>

                <div className="p-3 rounded-2xl bg-[#021A13] border border-emerald-500/20">
                  <div className="text-[10px] text-blue-400 font-mono font-bold uppercase">Backend API</div>
                  <div className="text-sm font-black text-white mt-0.5">Cloudflare Workers</div>
                  <div className="text-[10px] text-slate-400 mt-1">100K req/day Free</div>
                </div>

                <div className="p-3 rounded-2xl bg-[#021A13] border border-emerald-500/20">
                  <div className="text-[10px] text-purple-400 font-mono font-bold uppercase">File Storage</div>
                  <div className="text-sm font-black text-white mt-0.5">Cloudflare R2</div>
                  <div className="text-[10px] text-slate-400 mt-1">10 GB Free for Proofs</div>
                </div>

                <div className="p-3 rounded-2xl bg-[#021A13] border border-emerald-500/20">
                  <div className="text-[10px] text-amber-400 font-mono font-bold uppercase">Frontend Hosting</div>
                  <div className="text-sm font-black text-white mt-0.5">Cloudflare Pages</div>
                  <div className="text-[10px] text-slate-400 mt-1">Unlimited Free CDN</div>
                </div>
              </div>

              {/* 11 D1 Tables Selector */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-300">11 D1 Database Tables:</div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    'users',
                    'tasks',
                    'task_submissions',
                    'wallets',
                    'ledger',
                    'referrals',
                    'spin_history',
                    'scratch_history',
                    'withdrawals',
                    'daily_bonus',
                    'admin_users',
                  ].map((tbl) => (
                    <button
                      key={tbl}
                      type="button"
                      onClick={() => setDbTable(tbl)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                        dbTable === tbl ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {tbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live JSON Data Viewer */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/20 font-mono text-xs text-emerald-300 max-h-80 overflow-auto">
                <pre>
                  {dbTable === 'users' && JSON.stringify(users, null, 2)}
                  {dbTable === 'tasks' && JSON.stringify(tasks, null, 2)}
                  {dbTable === 'task_submissions' && JSON.stringify(submissions, null, 2)}
                  {dbTable === 'wallets' && JSON.stringify(wallets, null, 2)}
                  {dbTable === 'ledger' && JSON.stringify(ledger, null, 2)}
                  {dbTable === 'referrals' && JSON.stringify(referrals, null, 2)}
                  {dbTable === 'withdrawals' && JSON.stringify(withdrawals, null, 2)}
                  {dbTable === 'spin_history' && JSON.stringify([
                    { id: 'spin-1', user_id: 'usr-demo-001', reward_amount: 0.50, created_at: new Date().toISOString() }
                  ], null, 2)}
                  {dbTable === 'scratch_history' && JSON.stringify([
                    { id: 'sc-1', user_id: 'usr-demo-001', reward_amount: 0.35, created_at: new Date().toISOString() }
                  ], null, 2)}
                  {dbTable === 'daily_bonus' && JSON.stringify([
                    { id: 'db-1', user_id: 'usr-demo-001', amount: 0.50, claim_date: new Date().toISOString().slice(0, 10) }
                  ], null, 2)}
                  {dbTable === 'admin_users' && JSON.stringify([
                    { id: 'adm-1', name: 'Super Admin', email: 'admin@kamaonow.com', role: 'super_admin' }
                  ], null, 2)}
                </pre>
              </div>

              {/* Cloudflare D1 Deployment Guide Box */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
                <div className="font-bold text-emerald-300 mb-1">⚡ Cloudflare D1 Setup Commands (Zero Cost):</div>
                <div className="font-mono text-[11px] text-slate-300 space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/10 select-all">
                  <div>1. npx wrangler d1 create kamaonow-d1</div>
                  <div>2. npx wrangler d1 execute kamaonow-d1 --file=./schema.sql</div>
                  <div>3. npx wrangler r2 bucket create kamaonow-proofs</div>
                  <div>4. npx wrangler pages deploy dist</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ZOOM LIGHTBOX MODAL */}
      {zoomedSub && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-2xl bg-[#032319] border border-emerald-500/40 rounded-3xl p-5 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <div className="text-xs font-bold text-white">
                Proof Lightbox: {zoomedSub.task_title} ({zoomedSub.user_name})
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
                  className="p-1.5 rounded-lg bg-white/10 text-white"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs font-bold px-1">{zoomLevel}x</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.5))}
                  className="p-1.5 rounded-lg bg-white/10 text-white"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomedSub(null)}
                  className="p-1.5 rounded-lg bg-white/10 text-white ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grow overflow-auto p-4 flex items-center justify-center">
              <img
                src={zoomedSub.proof_file_id}
                alt="Zoomed Proof"
                style={{ transform: `scale(${zoomLevel})` }}
                className="max-h-[60vh] object-contain rounded-xl transition-transform"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={() => {
                  onApproveSubmission(zoomedSub.id);
                  setZoomedSub(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Approve & Credit ₹{zoomedSub.reward_amount.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
