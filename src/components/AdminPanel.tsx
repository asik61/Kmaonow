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
  Pause,
  Play,
  Megaphone,
  Send,
  Image,
  Upload,
  ExternalLink,
  Users,
  Smartphone,
  DollarSign,
  AlertTriangle,
  Eye,
  Sparkles,
  Lock,
} from 'lucide-react';
import type {
  TaskItem,
  TaskSubmission,
  WithdrawalRequest,
  UserProfile,
  WalletState,
  LedgerItem,
  ReferralItem,
  BroadcastNotice,
  TaskCategory,
} from '../types/kamaonow';
import { compressScreenshot } from '../utils/compressScreenshot';

interface AdminPanelProps {
  currentUser?: UserProfile;
  tasks: TaskItem[];
  submissions: TaskSubmission[];
  withdrawals: WithdrawalRequest[];
  users: UserProfile[];
  wallets: Record<string, WalletState>;
  ledger: LedgerItem[];
  referrals: ReferralItem[];
  notices: BroadcastNotice[];
  onApproveSubmission: (subId: string) => void;
  onRejectSubmission: (subId: string, note: string) => void;
  onApproveWithdrawal: (wdrId: string, utr: string) => void;
  onRejectWithdrawal: (wdrId: string, reason: string) => void;
  onSaveTask: (task: Partial<TaskItem>) => void;
  onToggleTaskActive: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleUserBlock: (userId: string) => void;
  onAdjustBalance: (userId: string, amount: number, note: string) => void;
  onSaveNotice: (notice: Partial<BroadcastNotice>) => void;
  onDeleteNotice: (noticeId: string) => void;
  onToggleNoticeActive: (noticeId: string) => void;
  onSendUserDirectMessage?: (userId: string, title: string, message: string) => void;
  onClose: () => void;
}

// Popular Preset Icons for Indian Earning & Fintech Offers
const PRESET_ICONS = [
  { name: 'Navi', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=120&q=80', label: 'NV', bg: '#059669' },
  { name: 'Paytm', url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=120&q=80', label: 'PT', bg: '#0284C7' },
  { name: 'GPay', url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=120&q=80', label: 'GP', bg: '#2563EB' },
  { name: 'PhonePe', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=120&q=80', label: 'PP', bg: '#6D28D9' },
  { name: 'AngelOne', url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=120&q=80', label: 'AO', bg: '#DC2626' },
  { name: 'Upstox', url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=120&q=80', label: 'UP', bg: '#7C3AED' },
  { name: 'Groww', url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=120&q=80', label: 'GW', bg: '#059669' },
  { name: 'WinZO', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=120&q=80', label: 'WNZ', bg: '#E11D48' },
  { name: 'Dream11', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=120&q=80', label: 'D11', bg: '#DC2626' },
  { name: 'Zupee', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=120&q=80', label: 'ZUP', bg: '#D97706' },
  { name: 'CoinDCX', url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=120&q=80', label: 'DCX', bg: '#7C3AED' },
  { name: 'RozDhan', url: 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?auto=format&fit=crop&w=120&q=80', label: 'RD', bg: '#F59E0B' },
  { name: 'Meesho', url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=120&q=80', label: 'MS', bg: '#BE185D' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  tasks,
  submissions,
  withdrawals,
  users,
  wallets,
  ledger,
  referrals,
  notices,
  onApproveSubmission,
  onRejectSubmission,
  onApproveWithdrawal,
  onRejectWithdrawal,
  onSaveTask,
  onToggleTaskActive,
  onDeleteTask,
  onToggleUserBlock,
  onAdjustBalance,
  onSendUserDirectMessage,
  onSaveNotice,
  onDeleteNotice,
  onToggleNoticeActive,
  onClose,
}) => {
  // STRICT MASTER ADMIN AUTHENTICATION: ONLY asik94906@gmail.com CAN OPEN ADMIN PANEL
  const isMasterAdmin = currentUser?.email?.trim().toLowerCase() === 'asik94906@gmail.com';

  if (!isMasterAdmin) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-4 flex items-center justify-center text-white">
        <div className="w-full max-w-md rounded-3xl bg-[#091510] border-2 border-rose-500/50 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 bg-rose-950/70 border border-rose-800/60 px-3 py-1 rounded-full">
              Access Restricted
            </span>
            <h2 className="text-xl font-black text-white mt-2">
              Admin Desk Locked 🔒
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Yeh Admin Control Desk sirf Master Admin account <strong className="text-amber-300 font-mono">asik94906@gmail.com</strong> se hi khul sakta hai.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-left space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Current Logged-in Account:</div>
            <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{currentUser?.name || 'User'} ({currentUser?.email || 'Guest / Non-admin'})</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm transition-all shadow-md active:scale-98 cursor-pointer"
          >
            App Par Wapas Jayein
          </button>
        </div>
      </div>
    );
  }

  const [tab, setTab] = useState<'tasks' | 'notices' | 'users' | 'proofs' | 'withdrawals' | 'database'>('tasks');

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
  const [rewardAmountInput, setRewardAmountInput] = useState<string>('10');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [newStepText, setNewStepText] = useState('');

  const handleOpenCreateTask = () => {
    setEditingTask({
      title: '',
      subtitle: 'Install & Register',
      description: 'Complete registration with mobile number and upload screenshot.',
      category: 'Register',
      reward_amount: 10,
      partner_url: 'https://play.google.com',
      icon_label: 'NEW',
      icon_bg: '#059669',
      image_url: '',
      instructions: [
        'Install the app via given button link.',
        'Register with your active mobile number.',
        'Take a screenshot of the home screen and submit proof.',
      ],
      is_active: true,
      is_top_offer: true,
      is_trending: false,
    });
    setRewardAmountInput('10');
    setNewStepText('');
  };

  const handleOpenEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setRewardAmountInput(
      task.reward_amount !== undefined && task.reward_amount !== null
        ? String(task.reward_amount)
        : '10'
    );
    setNewStepText('');
  };

  // Notice edit state
  const [editingNotice, setEditingNotice] = useState<Partial<BroadcastNotice> | null>(null);

  // User adjust, search & message state
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [adjustingUserId, setAdjustingUserId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('50');
  const [adjustNote, setAdjustNote] = useState<string>('Campaign manual bonus');
  const [messagingUser, setMessagingUser] = useState<UserProfile | null>(null);
  const [userMsgTitle, setUserMsgTitle] = useState('📢 Important Account Update');
  const [userMsgBody, setUserMsgBody] = useState('');

  // DB Table state
  const [dbTable, setDbTable] = useState<string>('users');

  const pendingProofs = submissions.filter((s) => s.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(taskSearch.toLowerCase());
    if (taskFilter === 'active') return matchesSearch && t.is_active !== false;
    if (taskFilter === 'paused') return matchesSearch && t.is_active === false;
    return matchesSearch;
  });

  // Filter users
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchesSearch = (
      u.name.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.referral_code.toLowerCase().includes(q)
    );
    if (userFilter === 'active') return matchesSearch && !u.is_blocked;
    if (userFilter === 'blocked') return matchesSearch && u.is_blocked;
    return matchesSearch;
  });

  // Handle local image file upload for offer icon with automatic crisp compression
  const handleIconFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await compressScreenshot(file, 35 * 1024);
      if (editingTask) {
        setEditingTask({ ...editingTask, image_url: res.dataUrl });
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (editingTask) {
          setEditingTask({ ...editingTask, image_url: dataUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-5 text-white flex flex-col">
      <div className="w-full max-w-6xl mx-auto rounded-3xl bg-[#032319] border border-emerald-500/40 shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* ========================================================= */}
        {/* TOP HEADER & ADMIN IDENTITY                               */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-emerald-500/20 bg-[#021A13]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider">
                Real Money App Admin Master Control
              </span>
              <span className="text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                asik94906@gmail.com
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white mt-0.5">
              Operations, Offers &amp; Users Command Desk
            </h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB NAVIGATION                                            */}
        {/* ========================================================= */}
        <div className="flex items-center gap-1.5 p-2 bg-[#021811] border-b border-emerald-500/20 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            type="button"
            onClick={() => setTab('tasks')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              tab === 'tasks'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Manage Offers ({tasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('notices')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              tab === 'notices'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Broadcast Messages ({notices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('users')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              tab === 'users'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users &amp; Balances ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('proofs')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              tab === 'proofs'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Proof Reviews ({pendingProofs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('withdrawals')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              tab === 'withdrawals'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Withdrawals ({pendingWithdrawals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('database')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              tab === 'database'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database Tables</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* MAIN BODY                                                 */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 max-h-[74vh] overflow-y-auto space-y-5">
          {/* ======================================================= */}
          {/* TAB 1: MANAGE OFFERS (FULL A-Z CONTROL)                 */}
          {/* ======================================================= */}
          {tab === 'tasks' && (
            <div className="space-y-4">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>CPA Offers &amp; Task Master</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      Total: {tasks.length}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Naya offer add karein, icon upload karein, edit karein, pause karein ya delete karein.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateTask}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Naya Offer Add Karein</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    placeholder="Search offers by name, category..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
                  <button
                    type="button"
                    onClick={() => setTaskFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      taskFilter === 'all' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300'
                    }`}
                  >
                    All ({tasks.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskFilter('active')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      taskFilter === 'active' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300'
                    }`}
                  >
                    Active ({tasks.filter((t) => t.is_active !== false).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskFilter('paused')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      taskFilter === 'paused' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300'
                    }`}
                  >
                    Paused ({tasks.filter((t) => t.is_active === false).length})
                  </button>
                </div>
              </div>

              {/* OFFER EDIT / CREATE MODAL FORM */}
              {editingTask && (
                <div className="p-5 rounded-2xl bg-[#043327] border-2 border-emerald-400/50 shadow-2xl space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                    <div className="font-black text-sm text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>{editingTask.id ? 'Edit Offer Details' : 'Create New CPA Offer'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingTask(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    {/* Offer Name */}
                    <div>
                      <label className="text-slate-300 font-bold">Offer Name / Title *</label>
                      <input
                        type="text"
                        value={editingTask.title || ''}
                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                        placeholder="e.g. Navi Finserv"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-white font-bold"
                      />
                    </div>

                    {/* Subtitle */}
                    <div>
                      <label className="text-slate-300 font-bold">Short Subtitle *</label>
                      <input
                        type="text"
                        value={editingTask.subtitle || ''}
                        onChange={(e) => setEditingTask({ ...editingTask, subtitle: e.target.value })}
                        placeholder="e.g. Install & Complete KYC"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-white"
                      />
                    </div>

                    {/* Reward Amount */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-slate-300 font-bold">Reward (₹ INR Payout) *</label>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          ₹{Number(rewardAmountInput || 0).toFixed(0)} Payout
                        </span>
                      </div>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-2.5 text-emerald-400 font-bold text-sm">₹</span>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={rewardAmountInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRewardAmountInput(val);
                            const num = parseFloat(val);
                            setEditingTask((prev) =>
                              prev ? { ...prev, reward_amount: isNaN(num) ? 0 : num } : null
                            );
                          }}
                          placeholder="Type amount (e.g. 10)"
                          className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 font-mono text-emerald-400 font-black text-sm focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                      {/* Quick preset chips for rapid 1-tap selection */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-[10px] text-slate-400">Quick set:</span>
                        {[5, 10, 15, 20, 25, 50, 100].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setRewardAmountInput(String(amt));
                              setEditingTask((prev) => (prev ? { ...prev, reward_amount: amt } : null));
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono transition-all cursor-pointer ${
                              rewardAmountInput === String(amt)
                                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-slate-300 font-bold">Category</label>
                      <select
                        value={editingTask.category || 'Register'}
                        onChange={(e) =>
                          setEditingTask({ ...editingTask, category: e.target.value as TaskCategory })
                        }
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-white font-bold"
                      >
                        <option value="Register">Register</option>
                        <option value="Installed">Installed</option>
                        <option value="Survey">Survey</option>
                        <option value="All">All</option>
                      </select>
                    </div>

                    {/* Partner URL */}
                    <div className="sm:col-span-2">
                      <label className="text-slate-300 font-bold">Partner / Tracking Link URL *</label>
                      <input
                        type="url"
                        value={editingTask.partner_url || ''}
                        onChange={(e) => setEditingTask({ ...editingTask, partner_url: e.target.value })}
                        placeholder="https://play.google.com/store/apps/..."
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* ================= CUSTOM ICON SECTION ================= */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                        <Image className="w-4 h-4" />
                        <span>Offer Custom Icon (Photo / URL / Preset)</span>
                      </label>
                      {editingTask.image_url && (
                        <button
                          type="button"
                          onClick={() => setEditingTask({ ...editingTask, image_url: '' })}
                          className="text-[11px] text-red-400 hover:underline cursor-pointer"
                        >
                          Remove Photo Icon
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Image URL input */}
                      <div>
                        <span className="text-[11px] text-slate-400">Direct Image URL:</span>
                        <input
                          type="text"
                          value={editingTask.image_url || ''}
                          onChange={(e) => setEditingTask({ ...editingTask, image_url: e.target.value })}
                          placeholder="https://... (PlayStore / Imgur / Drive)"
                          className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-emerald-500/30 text-white font-mono text-[11px]"
                        />
                      </div>

                      {/* File Upload Button */}
                      <div>
                        <span className="text-[11px] text-slate-400">Upload Icon from Device:</span>
                        <label className="w-full mt-1 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Image File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleIconFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Presets Row */}
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1.5">Quick Popular Brand Presets:</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {PRESET_ICONS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() =>
                              setEditingTask({
                                ...editingTask,
                                image_url: p.url,
                                icon_label: p.label,
                                icon_bg: p.bg,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500 text-[11px] font-bold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <img src={p.url} alt={p.name} className="w-4 h-4 rounded-full object-cover" />
                            <span>{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Badge Initials & Color Picker */}
                    <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400">Badge Letters (if no photo):</span>
                        <input
                          type="text"
                          maxLength={4}
                          value={editingTask.icon_label || ''}
                          onChange={(e) => setEditingTask({ ...editingTask, icon_label: e.target.value.toUpperCase() })}
                          placeholder="e.g. AO, WIN, 50"
                          className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-emerald-500/30 text-white font-mono font-bold text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400">Pick Badge Background Color:</span>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {[
                            '#059669', // Emerald
                            '#0284C7', // Sky
                            '#2563EB', // Blue
                            '#7C3AED', // Purple
                            '#DC2626', // Red
                            '#EA580C', // Orange
                            '#D97706', // Amber
                            '#BE185D', // Pink
                            '#0D9488', // Teal
                            '#111827', // Slate Dark
                          ].map((col) => (
                            <button
                              key={col}
                              type="button"
                              onClick={() => setEditingTask({ ...editingTask, icon_bg: col })}
                              style={{ backgroundColor: col }}
                              className={`w-6 h-6 rounded-lg transition-transform cursor-pointer border ${
                                editingTask.icon_bg === col ? 'ring-2 ring-white scale-110' : 'border-white/20'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Live Icon Preview */}
                    <div className="flex items-center gap-3 pt-1 border-t border-white/10">
                      <span className="text-xs text-slate-400">Selected Icon:</span>
                      {editingTask.image_url ? (
                        <img
                          src={editingTask.image_url}
                          alt="Preview"
                          className="w-10 h-10 rounded-xl object-cover border border-emerald-400 shadow-md"
                        />
                      ) : (
                        <div
                          style={{ backgroundColor: editingTask.icon_bg || '#059669' }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-md border border-white/30"
                        >
                          {editingTask.icon_label || 'NEW'}
                        </div>
                      )}
                      <div className="text-[11px] text-emerald-400">
                        {editingTask.image_url ? '✓ Custom Photo Icon Active' : '✓ Text initials badge active'}
                      </div>
                    </div>

                    {/* Live App Card Mockup Preview */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
                      <div className="text-[11px] font-bold text-emerald-400 flex items-center justify-between">
                        <span>👁️ App Me Aisa Dikhega (Live Offer Card Preview):</span>
                        <span className="text-[10px] text-slate-400 font-mono">Home &amp; Tasks Screen</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-slate-900 shadow-md">
                        <div className="flex items-center gap-3 min-w-0">
                          {editingTask.image_url ? (
                            <img
                              src={editingTask.image_url}
                              alt="Preview"
                              className="w-11 h-11 rounded-2xl object-cover shadow-md border border-slate-200 shrink-0 bg-white"
                            />
                          ) : (
                            <div
                              style={{ backgroundColor: editingTask.icon_bg || '#059669' }}
                              className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-xs shrink-0 shadow-md border border-white/30"
                            >
                              {editingTask.icon_label || 'NEW'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-slate-900 truncate">
                              {editingTask.title || 'Offer Title'}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate font-medium">
                              {editingTask.subtitle || 'Install & Register'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="font-mono font-black text-emerald-600 text-base">
                            ₹{Number(rewardAmountInput || editingTask.reward_amount || 0).toFixed(0)}
                          </span>
                          <button
                            type="button"
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-sm flex items-center gap-1 cursor-default"
                          >
                            <span>Start Offer</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step-by-Step Instructions Builder */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">
                      Step-by-Step User Instructions ({editingTask.instructions?.length || 0}):
                    </label>
                    <div className="space-y-1.5">
                      {editingTask.instructions?.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={step}
                            onChange={(e) => {
                              const updated = [...(editingTask.instructions || [])];
                              updated[idx] = e.target.value;
                              setEditingTask({ ...editingTask, instructions: updated });
                            }}
                            className="grow px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingTask.instructions?.filter((_, i) => i !== idx);
                              setEditingTask({ ...editingTask, instructions: updated });
                            }}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newStepText}
                        onChange={(e) => setNewStepText(e.target.value)}
                        placeholder="Add another instruction step..."
                        className="grow px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-white text-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newStepText.trim()) {
                            e.preventDefault();
                            setEditingTask({
                              ...editingTask,
                              instructions: [...(editingTask.instructions || []), newStepText.trim()],
                            });
                            setNewStepText('');
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newStepText.trim()) return;
                          setEditingTask({
                            ...editingTask,
                            instructions: [...(editingTask.instructions || []), newStepText.trim()],
                          });
                          setNewStepText('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                      >
                        + Add Step
                      </button>
                    </div>
                  </div>

                  {/* Active / Paused Toggles */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-emerald-500/20 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTask.is_active !== false}
                        onChange={(e) => setEditingTask({ ...editingTask, is_active: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span className="font-bold text-emerald-300">Offer Active (Show to Users)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editingTask.is_top_offer}
                        onChange={(e) => setEditingTask({ ...editingTask, is_top_offer: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span className="text-slate-300">Mark as Top Offer</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editingTask.is_trending}
                        onChange={(e) => setEditingTask({ ...editingTask, is_trending: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span className="text-slate-300">Mark as Trending</span>
                    </label>
                  </div>

                  {/* Submit Actions */}
                  <div className="flex justify-end gap-2.5 pt-3 border-t border-emerald-500/20">
                    <button
                      type="button"
                      onClick={() => setEditingTask(null)}
                      className="px-4 py-2 rounded-xl border border-white/20 text-xs text-slate-300 hover:bg-white/5 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editingTask.title?.trim()) {
                          alert('Kripya offer title daalein!');
                          return;
                        }
                        const parsedReward = parseFloat(rewardAmountInput);
                        const finalReward =
                          !isNaN(parsedReward) && parsedReward > 0
                            ? parsedReward
                            : editingTask.reward_amount || 10;
                        onSaveTask({
                          ...editingTask,
                          reward_amount: finalReward,
                        });
                        setEditingTask(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                    >
                      ✓ Save &amp; Publish Offer
                    </button>
                  </div>
                </div>
              )}

              {/* OFFERS LIST */}
              <div className="space-y-2.5">
                {filteredTasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-[#021A13] rounded-2xl border border-emerald-500/10">
                    No offers found matching your filter.
                  </div>
                ) : (
                  filteredTasks.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3.5 sm:p-4 rounded-2xl bg-[#021A13] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        t.is_active === false
                          ? 'border-amber-500/30 opacity-75'
                          : 'border-emerald-500/20 hover:border-emerald-500/40'
                      }`}
                    >
                      {/* Left: Icon + Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        {t.image_url ? (
                          <img
                            src={t.image_url}
                            alt={t.title}
                            className="w-11 h-11 rounded-2xl object-cover shrink-0 border border-white/20 shadow-md"
                          />
                        ) : (
                          <div
                            style={{ backgroundColor: t.icon_bg || '#059669' }}
                            className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-xs shrink-0 shadow-md border border-white/20"
                          >
                            {t.icon_label || 'NEW'}
                          </div>
                        )}

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{t.title}</span>
                            {t.is_active === false ? (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/40">
                                ⏸️ PAUSED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/40">
                                🟢 ACTIVE
                              </span>
                            )}
                            {t.is_top_offer && (
                              <span className="px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-300 text-[10px] font-bold">
                                TOP
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-xs truncate">{t.subtitle}</div>
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="font-black text-emerald-400 text-xs">
                              ₹{t.reward_amount.toFixed(2)}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{t.category}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{t.instructions?.length || 0} steps</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Pause / Resume Button */}
                        <button
                          type="button"
                          onClick={() => onToggleTaskActive(t.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                            t.is_active === false
                              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                          }`}
                        >
                          {t.is_active === false ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                          <span>{t.is_active === false ? 'Resume' : 'Pause'}</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditTask(t)}
                          className="px-3 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Kya aap "${t.title}" offer ko delete karna chahte hain?`)) {
                              onDeleteTask(t.id);
                            }
                          }}
                          className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer"
                          title="Delete offer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 2: BROADCAST NOTICES & FLASH MESSAGES               */}
          {/* ======================================================= */}
          {tab === 'notices' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-emerald-400" />
                    <span>Global Broadcast Notices &amp; User Alerts</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sabhi users ko home screen par flash notification, offers update ya important notice bhejein.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditingNotice({
                      title: '📢 Special Announcement',
                      message: 'Complete 2 tasks today and get ₹20 bonus in your wallet!',
                      type: 'success',
                      is_active: true,
                    })
                  }
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Naya Message Bhejein</span>
                </button>
              </div>

              {/* Notice Composer Modal/Form */}
              {editingNotice && (
                <div className="p-5 rounded-2xl bg-[#043327] border-2 border-emerald-400/50 shadow-2xl space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between pb-2.5 border-b border-emerald-500/20">
                    <div className="font-black text-sm text-white flex items-center gap-2">
                      <Send className="w-4 h-4 text-emerald-400" />
                      <span>Compose Broadcast Notice</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingNotice(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="text-slate-300 font-bold">Notice Title *</label>
                      <input
                        type="text"
                        value={editingNotice.title || ''}
                        onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
                        placeholder="e.g. 📢 Weekend Bonus Double Offer!"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold">Alert Banner Style</label>
                      <select
                        value={editingNotice.type || 'success'}
                        onChange={(e) =>
                          setEditingNotice({
                            ...editingNotice,
                            type: e.target.value as BroadcastNotice['type'],
                          })
                        }
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-white font-bold"
                      >
                        <option value="success">Success Green (Bonus / Payout)</option>
                        <option value="info">Info Blue (Update / Guide)</option>
                        <option value="warning">Warning Amber (Maintenance)</option>
                        <option value="alert">Alert Red (Anti-Fraud / Ban)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-bold">Message Content *</label>
                    <textarea
                      rows={2}
                      value={editingNotice.message || ''}
                      onChange={(e) => setEditingNotice({ ...editingNotice, message: e.target.value })}
                      placeholder="Detailed notice text shown to users..."
                      className="w-full mt-1 p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-white text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={editingNotice.is_active !== false}
                        onChange={(e) => setEditingNotice({ ...editingNotice, is_active: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span className="font-bold text-emerald-300">Broadcast Now (Visible on Home Screen)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingNotice(null)}
                        className="px-3.5 py-1.5 rounded-xl border border-white/20 text-xs text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!editingNotice.title?.trim() || !editingNotice.message?.trim()) {
                            alert('Title aur message dono zaroori hain!');
                            return;
                          }
                          onSaveNotice(editingNotice);
                          setEditingNotice(null);
                        }}
                        className="px-5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                      >
                        ✓ Send Notice
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notices List */}
              <div className="space-y-3">
                {notices.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-[#021A13] rounded-2xl border border-emerald-500/10">
                    No broadcast notices sent yet.
                  </div>
                ) : (
                  notices.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        n.is_active
                          ? 'bg-[#022419] border-emerald-500/40'
                          : 'bg-[#021A13] border-slate-700/50 opacity-60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm">{n.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              n.type === 'success'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : n.type === 'warning'
                                ? 'bg-amber-500/20 text-amber-300'
                                : n.type === 'alert'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {n.type}
                          </span>
                          {n.is_active ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                              LIVE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 text-[10px] font-bold">
                              PAUSED
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">{n.message}</p>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Posted: {new Date(n.created_at).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => onToggleNoticeActive(n.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                            n.is_active
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {n.is_active ? 'Pause Banner' : 'Make Live'}
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteNotice(n.id)}
                          className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 3: USERS & COMPLETE DIRECTORY CONTROL               */}
          {/* ======================================================= */}
          {tab === 'users' && (
            <div className="space-y-4">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-[#021A13] border border-emerald-500/20">
                  <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Total Users</div>
                  <div className="text-2xl font-black text-white mt-0.5">{users.length}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {users.filter((u) => !u.is_blocked).length} Active · {users.filter((u) => u.is_blocked).length} Blocked
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#021A13] border border-emerald-500/20">
                  <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Combined Wallets</div>
                  <div className="text-2xl font-black text-emerald-400 mt-0.5">
                    ₹
                    {users
                      .reduce((acc, u) => acc + (wallets[u.id]?.available_balance || 0), 0)
                      .toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Available for payouts</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#021A13] border border-emerald-500/20">
                  <div className="text-[10px] text-blue-400 font-mono font-bold uppercase">Payouts Given</div>
                  <div className="text-2xl font-black text-white mt-0.5">
                    ₹
                    {withdrawals
                      .filter((w) => w.status === 'approved')
                      .reduce((acc, w) => acc + w.amount, 0)
                      .toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {withdrawals.filter((w) => w.status === 'approved').length} successful transfers
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#021A13] border border-emerald-500/20">
                  <div className="text-[10px] text-amber-400 font-mono font-bold uppercase">Pending Proofs</div>
                  <div className="text-2xl font-black text-amber-400 mt-0.5">{pendingProofs.length}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Awaiting verification</div>
                </div>
              </div>

              {/* User Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search user by Name, Mobile (+91...), Email, Referral Code..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-emerald-500/30 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setUserFilter('all')}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      userFilter === 'all'
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    All Users ({users.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserFilter('active')}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      userFilter === 'active'
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    🟢 Active ({users.filter((u) => !u.is_blocked).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserFilter('blocked')}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      userFilter === 'blocked'
                        ? 'bg-red-500 text-white font-black shadow-md'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    🚫 Blocked ({users.filter((u) => u.is_blocked).length})
                  </button>
                </div>
              </div>

              {/* Direct Message Modal to Specific User */}
              {messagingUser && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#043327] border-2 border-sky-400/50 shadow-2xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="font-black text-sm text-white flex items-center gap-2">
                      <Send className="w-4 h-4 text-sky-400" />
                      <span>Direct Message to {messagingUser.name} ({messagingUser.phone})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMessagingUser(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-slate-300 font-bold">Message Subject / Title *</label>
                      <input
                        type="text"
                        value={userMsgTitle}
                        onChange={(e) => setUserMsgTitle(e.target.value)}
                        placeholder="e.g. KYC Verified / Bonus Added"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-sky-500/40 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-bold">Personal Notice Message *</label>
                      <textarea
                        rows={2}
                        value={userMsgBody}
                        onChange={(e) => setUserMsgBody(e.target.value)}
                        placeholder="Write direct message to this user..."
                        className="w-full mt-1 p-3 rounded-xl bg-slate-900 border border-sky-500/40 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setMessagingUser(null)}
                      className="px-3 py-1.5 rounded-xl border border-white/20 text-xs text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!userMsgTitle.trim() || !userMsgBody.trim()) {
                          alert('Title aur message dono daalein!');
                          return;
                        }
                        if (onSendUserDirectMessage) {
                          onSendUserDirectMessage(messagingUser.id, userMsgTitle.trim(), userMsgBody.trim());
                        }
                        setMessagingUser(null);
                      }}
                      className="px-5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                    >
                      ✓ Send Direct Notification
                    </button>
                  </div>
                </div>
              )}

              {/* User Cards List */}
              <div className="space-y-3">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-[#021A13] rounded-2xl border border-emerald-500/10">
                    No users found matching "{userSearch}".
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const w = wallets[u.id] || {
                      available_balance: 0,
                      pending_balance: 0,
                      lifetime_earned: 0,
                      lifetime_withdrawn: 0,
                    };
                    const userWithdrawals = withdrawals.filter((wdr) => wdr.user_id === u.id);
                    const userSubmissions = submissions.filter((s) => s.user_id === u.id);

                    return (
                      <div
                        key={u.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 text-xs ${
                          u.is_blocked
                            ? 'bg-[#1C0D0D] border-red-500/40'
                            : 'bg-[#021A13] border-emerald-500/20 hover:border-emerald-500/40'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Left: Avatar & Info */}
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                u.avatar_url ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                              }
                              alt={u.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-emerald-500/30 shrink-0"
                            />
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-white text-sm">{u.name}</span>
                                <span className="font-mono text-emerald-400 font-bold">{u.phone}</span>
                                {u.is_blocked ? (
                                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                                    BLOCKED / BANNED
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                    ACTIVE
                                  </span>
                                )}
                                {u.role === 'admin' && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black">
                                    ADMIN
                                  </span>
                                )}
                              </div>

                              <div className="text-slate-400 text-[11px]">
                                Email: <span className="text-slate-200">{u.email}</span> · Ref Code:{' '}
                                <span className="text-emerald-300 font-mono font-bold">{u.referral_code}</span>
                              </div>

                              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 flex-wrap">
                                <span>User ID: {u.id}</span>
                                <span>·</span>
                                <span>Joined: {new Date(u.created_at).toLocaleDateString('en-IN')}</span>
                                {u.device_model && (
                                  <>
                                    <span>·</span>
                                    <span className="text-emerald-400 font-bold">📱 {u.device_model}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Balances & Stats */}
                          <div className="flex items-center gap-4 sm:text-right font-mono self-start sm:self-auto">
                            <div>
                              <div className="text-[10px] text-slate-400">Available Wallet</div>
                              <div className="text-base font-black text-emerald-400">
                                ₹{w.available_balance.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400">Withdrawn</div>
                              <div className="text-sm font-bold text-white">
                                ₹{w.lifetime_withdrawn?.toFixed(2) || '0.00'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400">Tasks / Proofs</div>
                              <div className="text-sm font-bold text-slate-200">
                                {userSubmissions.length} submitted
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* User Actions Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setAdjustingUserId(u.id)}
                              className="px-3 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 font-bold cursor-pointer"
                            >
                              ± Adjust Wallet (₹)
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setMessagingUser(u);
                                setUserMsgTitle(`📢 Notice for ${u.name}`);
                                setUserMsgBody(`Hello ${u.name}, `);
                              }}
                              className="px-3 py-1.5 rounded-xl border border-sky-500/40 text-sky-300 hover:bg-sky-500/20 font-bold cursor-pointer flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Message User</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onToggleUserBlock(u.id)}
                              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                                u.is_blocked
                                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                  : 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                              }`}
                            >
                              {u.is_blocked ? '✓ Unblock Account' : '🚫 Block / Ban User'}
                            </button>
                          </div>

                          <div className="text-[11px] text-slate-400 font-mono">
                            {userWithdrawals.length} withdrawal requests recorded
                          </div>
                        </div>

                        {/* Balance Adjusting Drawer */}
                        {adjustingUserId === u.id && (
                          <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 flex flex-wrap items-center gap-2 animate-fade-in">
                            <span className="text-xs text-slate-300 font-bold">Amount (₹):</span>
                            <input
                              type="number"
                              value={adjustAmount}
                              onChange={(e) => setAdjustAmount(e.target.value)}
                              placeholder="+50 or -20"
                              className="w-24 px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-white font-mono text-xs"
                            />
                            <input
                              type="text"
                              value={adjustNote}
                              onChange={(e) => setAdjustNote(e.target.value)}
                              placeholder="Reason / Note for ledger..."
                              className="grow px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-white text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                onAdjustBalance(u.id, Number(adjustAmount), adjustNote);
                                setAdjustingUserId(null);
                              }}
                              className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs cursor-pointer"
                            >
                              Apply
                            </button>
                            <button
                              type="button"
                              onClick={() => setAdjustingUserId(null)}
                              className="px-2 text-slate-400 text-xs hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 4: PROOFS REVIEW                                    */}
          {/* ======================================================= */}
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

          {/* ======================================================= */}
          {/* TAB 5: WITHDRAWALS                                      */}
          {/* ======================================================= */}
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
                                navigator.clipboard.writeText(wdr.upi_id!);
                                setCopiedUpi(wdr.id);
                                setTimeout(() => setCopiedUpi(null), 2000);
                              }}
                              className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {copiedUpi === wdr.id ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedUpi === wdr.id ? 'Copied!' : 'Copy UPI'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {wdr.status === 'pending' ? (
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                            <input
                              type="text"
                              placeholder="Bank UTR Number..."
                              value={utrInput[wdr.id] || ''}
                              onChange={(e) =>
                                setUtrInput({ ...utrInput, [wdr.id]: e.target.value })
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
                              Approve &amp; Pay
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
                              Reject &amp; Refund
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
                            {wdr.status === 'approved' ? `Paid (UTR: ${wdr.utr || 'Auto'})` : 'Rejected'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 6: DATABASE TABLES INSPECTOR                        */}
          {/* ======================================================= */}
          {tab === 'database' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  'users',
                  'tasks',
                  'notices',
                  'task_submissions',
                  'wallets',
                  'ledger',
                  'referrals',
                  'withdrawals',
                ].map((tbl) => (
                  <button
                    key={tbl}
                    type="button"
                    onClick={() => setDbTable(tbl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      dbTable === tbl ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {tbl}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/20 font-mono text-xs text-emerald-300 max-h-80 overflow-auto">
                <pre>
                  {dbTable === 'users' && JSON.stringify(users, null, 2)}
                  {dbTable === 'tasks' && JSON.stringify(tasks, null, 2)}
                  {dbTable === 'notices' && JSON.stringify(notices, null, 2)}
                  {dbTable === 'task_submissions' && JSON.stringify(submissions, null, 2)}
                  {dbTable === 'wallets' && JSON.stringify(wallets, null, 2)}
                  {dbTable === 'ledger' && JSON.stringify(ledger, null, 2)}
                  {dbTable === 'referrals' && JSON.stringify(referrals, null, 2)}
                  {dbTable === 'withdrawals' && JSON.stringify(withdrawals, null, 2)}
                </pre>
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
                Approve &amp; Credit ₹{zoomedSub.reward_amount.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
