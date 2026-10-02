import React, { useState, useEffect } from 'react';
import {
  Home,
  CheckSquare,
  Disc,
  Gift,
  User,
  Sparkles,
  ArrowRight,
  Share2,
  Copy,
  Check,
  Trophy,
  History,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Wallet,
  Store,
  RotateCcw,
  Smartphone,
  CheckCircle2,
  Clock,
  ExternalLink,
  Bell,
  LogOut,
  Camera,
  Upload,
} from 'lucide-react';

import type {
  UserProfile,
  TaskItem,
  TaskSubmission,
  WalletState,
  LedgerItem,
  ReferralItem,
  WithdrawalRequest,
  TaskCategory,
  WithdrawalMethod,
} from './types/kamaonow';

import {
  INITIAL_USER,
  INITIAL_WALLET,
  INITIAL_TASKS,
  INITIAL_SUBMISSIONS,
  INITIAL_LEDGER,
  INITIAL_REFERRALS,
  INITIAL_WITHDRAWALS,
} from './data/initialData';

import {
  KamaoNowLogo3D,
  EarningsCharacter3D,
  ReferCharacter3D,
  GiftBox3D,
} from './components/Illustrations3D';

import { SpinWheel } from './components/SpinWheel';
import { ScratchCard } from './components/ScratchCard';
import { TaskModal } from './components/TaskModal';
import { WithdrawModal } from './components/WithdrawModal';
import { AdminPanel } from './components/AdminPanel';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { HomeBannerSlider } from './components/HomeBannerSlider';
import { EarningsCardImage } from './components/EarningsCardImage';
import { AuthScreen } from './components/AuthScreen';
import { SplashScreen } from './components/SplashScreen';
import { testConnection, syncUserWallet, logoutFromFirebase } from './services/firebase';
import { NotificationModal } from './components/NotificationModal';
import {
  type InAppNotification,
  INITIAL_NOTIFICATIONS,
  sendOutPushNotification,
} from './services/notifications';

type NavTab = 'home' | 'tasks' | 'spin' | 'scratch' | 'profile' | 'offers' | 'refer' | 'daily' | 'withdraw';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('All');
  const [offerCategory, setOfferCategory] = useState<'All' | 'Top Offers' | 'Trending' | 'New'>('All');

  // Core Data
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('kamaonow_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem('kamaonow_user');
  });

  const [wallet, setWallet] = useState<WalletState>(() => {
    const saved = localStorage.getItem('kamaonow_wallet');
    return saved ? JSON.parse(saved) : INITIAL_WALLET;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('kamaonow_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [submissions, setSubmissions] = useState<TaskSubmission[]>(() => {
    const saved = localStorage.getItem('kamaonow_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [ledger, setLedger] = useState<LedgerItem[]>(() => {
    const saved = localStorage.getItem('kamaonow_ledger');
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  const [referrals, setReferrals] = useState<ReferralItem[]>(() => {
    const saved = localStorage.getItem('kamaonow_referrals');
    return saved ? JSON.parse(saved) : INITIAL_REFERRALS;
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    const saved = localStorage.getItem('kamaonow_withdrawals');
    return saved ? JSON.parse(saved) : INITIAL_WITHDRAWALS;
  });

  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(() => {
    const saved = localStorage.getItem('kamaonow_spins');
    return saved ? Number(saved) : 1;
  });

  const [dailyBonusClaimed, setDailyBonusClaimed] = useState<boolean>(() => {
    const savedDate = localStorage.getItem('kamaonow_daily_date');
    return savedDate === new Date().toISOString().slice(0, 10);
  });

  // Modals
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem('realmoney_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync state to localStorage & test Firestore connection
  useEffect(() => {
    testConnection().catch(console.warn);
  }, []);

  useEffect(() => {
    localStorage.setItem('kamaonow_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('kamaonow_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('kamaonow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('kamaonow_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('kamaonow_ledger', JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem('kamaonow_referrals', JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    localStorage.setItem('kamaonow_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem('kamaonow_spins', String(freeSpinsLeft));
  }, [freeSpinsLeft]);

  useEffect(() => {
    localStorage.setItem('realmoney_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Submit Task Proof
  const handleSubmitTaskProof = (payload: { taskId: string; proofDataUrl: string; sizeKb: number }) => {
    const targetTask = tasks.find((t) => t.id === payload.taskId);
    if (!targetTask) return;

    const newSub: TaskSubmission = {
      id: `sub-${Date.now()}`,
      user_id: user.id,
      user_name: user.name,
      user_phone: user.phone,
      task_id: targetTask.id,
      task_title: `${targetTask.title} — ${targetTask.subtitle}`,
      reward_amount: targetTask.reward_amount,
      proof_file_id: payload.proofDataUrl,
      screenshot_size_kb: payload.sizeKb,
      status: 'pending',
      admin_note: 'Screenshot submitted and queued for Admin Manual Approval.',
      submitted_at: new Date().toISOString(),
    };

    setSubmissions([newSub, ...submissions]);
    setWallet((prev) => ({
      ...prev,
      pending_balance: prev.pending_balance + targetTask.reward_amount,
    }));

    // In-App Notification
    const notif: InAppNotification = {
      id: `notif-${Date.now()}`,
      title: `📸 Screenshot Submit Ho Gaya!`,
      message: `${targetTask.title} ka proof receive ho gaya hai. Review ke baad ₹${targetTask.reward_amount.toFixed(2)} wallet me jud jayega.`,
      type: 'task',
      timestamp: new Date().toISOString(),
      read: false,
      actionTab: 'tasks',
    };
    setNotifications((prev) => [notif, ...prev]);

    // Out-of-App Push Notification
    sendOutPushNotification('Real Money App 📸', {
      body: `Screenshot received for ${targetTask.title}! Admin review me hai.`,
    }).catch(console.warn);

    showToast(`Screenshot submit ho gaya! ₹${targetTask.reward_amount.toFixed(2)} under review hai. 🎉`);
  };

  // Spin Reward Won
  const handleSpinWon = (amount: number) => {
    setFreeSpinsLeft((prev) => Math.max(0, prev - 1));
    setWallet((prev) => ({
      ...prev,
      available_balance: Number((prev.available_balance + amount).toFixed(2)),
      lifetime_earned: Number((prev.lifetime_earned + amount).toFixed(2)),
    }));

    const newEntry: LedgerItem = {
      id: `led-${Date.now()}`,
      user_id: user.id,
      type: 'spin_reward',
      amount,
      status: 'credit',
      description: `Lucky Spin & Win Reward: ₹${amount.toFixed(2)}`,
      created_at: new Date().toISOString(),
    };
    setLedger([newEntry, ...ledger]);
    showToast(`+₹${amount.toFixed(2)} credited to your wallet!`);
  };

  // Scratch Reward Won
  const handleScratchWon = (amount: number) => {
    setWallet((prev) => ({
      ...prev,
      available_balance: Number((prev.available_balance + amount).toFixed(2)),
      lifetime_earned: Number((prev.lifetime_earned + amount).toFixed(2)),
    }));

    const newEntry: LedgerItem = {
      id: `led-${Date.now()}`,
      user_id: user.id,
      type: 'scratch_reward',
      amount,
      status: 'credit',
      description: `Scratch & Win Reward: ₹${amount.toFixed(2)}`,
      created_at: new Date().toISOString(),
    };
    setLedger([newEntry, ...ledger]);
    showToast(`+₹${amount.toFixed(2)} added directly to wallet!`);
  };

  // Daily Bonus
  const handleClaimDailyBonus = () => {
    if (dailyBonusClaimed) return;
    const bonus = 0.50;
    setDailyBonusClaimed(true);
    localStorage.setItem('kamaonow_daily_date', new Date().toISOString().slice(0, 10));

    setWallet((prev) => ({
      ...prev,
      available_balance: Number((prev.available_balance + bonus).toFixed(2)),
      lifetime_earned: Number((prev.lifetime_earned + bonus).toFixed(2)),
    }));

    const newEntry: LedgerItem = {
      id: `led-${Date.now()}`,
      user_id: user.id,
      type: 'daily_bonus',
      amount: bonus,
      status: 'credit',
      description: 'Roz ka Daily Bonus: ₹0.50',
      created_at: new Date().toISOString(),
    };
    setLedger([newEntry, ...ledger]);
    showToast('Roz ka Bonus: ₹0.50 credited!');
  };

  // Withdrawal Request
  const handleRequestWithdrawal = (payload: {
    amount: number;
    method: WithdrawalMethod;
    upiId?: string;
    bankAccount?: string;
    bankIfsc?: string;
  }) => {
    const isFirstWithdrawal = wallet.lifetime_withdrawn === 0 && withdrawals.length === 0;
    const minRequired = isFirstWithdrawal ? 20 : 100;

    if (payload.amount < minRequired) {
      return {
        ok: false,
        error: isFirstWithdrawal
          ? 'Pehli baar minimum withdrawal limit sirf ₹20.00 hai.'
          : 'Minimum withdrawal limit ₹100.00 hai.',
      };
    }

    if (payload.amount > wallet.available_balance) {
      return { ok: false, error: 'Insufficient balance' };
    }

    const newWdr: WithdrawalRequest = {
      id: `wdr-${Date.now()}`,
      user_id: user.id,
      user_name: user.name,
      user_phone: user.phone,
      amount: payload.amount,
      method: payload.method,
      upi_id: payload.upiId,
      bank_account: payload.bankAccount,
      bank_ifsc: payload.bankIfsc,
      status: 'pending',
      requested_at: new Date().toISOString(),
    };

    setWithdrawals([newWdr, ...withdrawals]);
    setWallet((prev) => ({
      ...prev,
      available_balance: Number((prev.available_balance - payload.amount).toFixed(2)),
      pending_balance: Number((prev.pending_balance + payload.amount).toFixed(2)),
    }));

    const newEntry: LedgerItem = {
      id: `led-${Date.now()}`,
      user_id: user.id,
      type: 'withdrawal',
      amount: payload.amount,
      status: 'debit',
      description: `Withdrawal request via ${payload.method} (${payload.upiId || payload.bankAccount})`,
      created_at: new Date().toISOString(),
    };
    setLedger([newEntry, ...ledger]);

    // In-App Notification
    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}`,
      title: `⚡ ₹${payload.amount.toFixed(2)} Payout Pending`,
      message: `Aapka ₹${payload.amount.toFixed(2)} ka withdrawal request submit ho gaya hai. UPI ID: ${payload.upiId || payload.bankAccount}`,
      type: 'withdrawal',
      timestamp: new Date().toISOString(),
      read: false,
      actionTab: 'withdraw',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Out-of-App Push Notification
    sendOutPushNotification('Real Money App 💸', {
      body: `₹${payload.amount.toFixed(2)} ka withdrawal request receive ho gaya hai!`,
    }).catch(console.warn);

    return { ok: true };
  };

  // Admin Actions
  const handleAdminApproveSubmission = (subId: string) => {
    const sub = submissions.find((s) => s.id === subId);
    if (!sub || sub.status !== 'pending') return;

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === subId
          ? { ...s, status: 'approved', admin_note: 'Verified and approved by Admin.', reviewed_at: new Date().toISOString() }
          : s
      )
    );

    setWallet((prev) => ({
      ...prev,
      pending_balance: Math.max(0, Number((prev.pending_balance - sub.reward_amount).toFixed(2))),
      available_balance: Number((prev.available_balance + sub.reward_amount).toFixed(2)),
      lifetime_earned: Number((prev.lifetime_earned + sub.reward_amount).toFixed(2)),
    }));

    const newEntry: LedgerItem = {
      id: `led-${Date.now()}`,
      user_id: sub.user_id,
      type: 'task_reward',
      amount: sub.reward_amount,
      status: 'credit',
      description: `Task Approved: ${sub.task_title}`,
      created_at: new Date().toISOString(),
    };
    setLedger((prev) => [newEntry, ...prev]);

    setReferrals((prev) =>
      prev.map((r) => {
        if (r.referred_user_id === sub.user_id && r.status === 'pending') {
          return { ...r, status: 'qualified', qualified_at: new Date().toISOString() };
        }
        return r;
      })
    );

    showToast(`Approved! ₹${sub.reward_amount.toFixed(2)} added to user wallet.`);
  };

  const handleAdminRejectSubmission = (subId: string, note: string) => {
    const sub = submissions.find((s) => s.id === subId);
    if (!sub || sub.status !== 'pending') return;

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === subId
          ? { ...s, status: 'rejected', admin_note: note, reviewed_at: new Date().toISOString() }
          : s
      )
    );

    setWallet((prev) => ({
      ...prev,
      pending_balance: Math.max(0, Number((prev.pending_balance - sub.reward_amount).toFixed(2))),
    }));

    showToast('Submission marked rejected.');
  };

  const handleAdminApproveWithdrawal = (wdrId: string, utr: string) => {
    const wdr = withdrawals.find((w) => w.id === wdrId);
    if (!wdr || wdr.status !== 'pending') return;

    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === wdrId
          ? { ...w, status: 'approved', utr, processed_at: new Date().toISOString() }
          : w
      )
    );

    setWallet((prev) => ({
      ...prev,
      pending_balance: Math.max(0, Number((prev.pending_balance - wdr.amount).toFixed(2))),
      lifetime_withdrawn: Number((prev.lifetime_withdrawn + wdr.amount).toFixed(2)),
    }));

    const approvedNotif: InAppNotification = {
      id: `notif-${Date.now()}`,
      title: `✅ ₹${wdr.amount.toFixed(2)} Paid to UPI!`,
      message: `Bank UTR: ${utr}. Aapka withdrawal successfully transfer ho gaya hai.`,
      type: 'withdrawal',
      timestamp: new Date().toISOString(),
      read: false,
      actionTab: 'withdraw',
    };
    setNotifications((prev) => [approvedNotif, ...prev]);

    sendOutPushNotification('Real Money App 💰 Paid!', {
      body: `Badhai Ho! ₹${wdr.amount.toFixed(2)} aapke UPI me credit ho gaya hai. (UTR: ${utr})`,
    }).catch(console.warn);

    showToast(`Withdrawal marked Paid! Bank UTR: ${utr}`);
  };

  const handleAdminRejectWithdrawal = (wdrId: string, reason: string) => {
    const wdr = withdrawals.find((w) => w.id === wdrId);
    if (!wdr || wdr.status !== 'pending') return;

    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === wdrId
          ? { ...w, status: 'rejected', rejection_reason: reason, processed_at: new Date().toISOString() }
          : w
      )
    );

    setWallet((prev) => ({
      ...prev,
      pending_balance: Math.max(0, Number((prev.pending_balance - wdr.amount).toFixed(2))),
      available_balance: Number((prev.available_balance + wdr.amount).toFixed(2)),
    }));

    const newEntry: LedgerItem = {
      id: `led-${Date.now()}`,
      user_id: wdr.user_id,
      type: 'withdrawal_refund',
      amount: wdr.amount,
      status: 'credit',
      description: `Refund: Withdrawal rejected (${reason})`,
      created_at: new Date().toISOString(),
    };
    setLedger((prev) => [newEntry, ...prev]);

    showToast(`Withdrawal rejected. ₹${wdr.amount.toFixed(2)} refunded to wallet.`);
  };

  const handleAdminSaveTask = (taskData: Partial<TaskItem>) => {
    if (taskData.id) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskData.id ? ({ ...t, ...taskData } as TaskItem) : t))
      );
      showToast('Task updated successfully!');
    } else {
      const newTask: TaskItem = {
        id: `task-${Date.now()}`,
        title: taskData.title || 'New CPA Task',
        subtitle: taskData.subtitle || 'Install & Register',
        description: taskData.description || 'Complete registration and submit proof.',
        category: taskData.category || 'Register',
        reward_amount: taskData.reward_amount || 50,
        instructions: taskData.instructions || ['Install the app.', 'Complete registration.', 'Upload proof.'],
        partner_url: taskData.partner_url || 'https://google.com',
        icon_label: taskData.icon_label || 'NEW',
        icon_bg: taskData.icon_bg || '#059669',
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setTasks([newTask, ...tasks]);
      showToast('New task published!');
    }
  };

  const handleAdminDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Task deleted.');
  };

  const handleAdminToggleUserBlock = (userId: string) => {
    if (userId === user.id) {
      setUser((prev) => ({ ...prev, is_blocked: !prev.is_blocked }));
    }
  };

  const handleAdminAdjustBalance = (userId: string, amount: number, note: string) => {
    if (userId === user.id) {
      setWallet((prev) => ({
        ...prev,
        available_balance: Math.max(0, Number((prev.available_balance + amount).toFixed(2))),
        lifetime_earned: amount > 0 ? Number((prev.lifetime_earned + amount).toFixed(2)) : prev.lifetime_earned,
      }));

      const newEntry: LedgerItem = {
        id: `led-${Date.now()}`,
        user_id: user.id,
        type: 'admin_adjust',
        amount: Math.abs(amount),
        status: amount >= 0 ? 'credit' : 'debit',
        description: `Admin balance adjust: ${note}`,
        created_at: new Date().toISOString(),
      };
      setLedger((prev) => [newEntry, ...prev]);
      showToast(`Balance adjusted by ₹${amount.toFixed(2)}`);
    }
  };

  const handleResetSeed = () => {
    localStorage.clear();
    setUser(INITIAL_USER);
    setWallet(INITIAL_WALLET);
    setTasks(INITIAL_TASKS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setLedger(INITIAL_LEDGER);
    setReferrals(INITIAL_REFERRALS);
    setWithdrawals(INITIAL_WITHDRAWALS);
    setFreeSpinsLeft(1);
    setDailyBonusClaimed(false);
    setIsLoggedIn(false);
    showToast('Reset to original Real Money App state.');
  };

  const handleLoginSuccess = (loggedInUser: UserProfile, isNewUser: boolean) => {
    setUser(loggedInUser);
    localStorage.setItem('kamaonow_user', JSON.stringify(loggedInUser));
    setIsLoggedIn(true);

    if (isNewUser) {
      const welcomeBonus = loggedInUser.referred_by ? 60 : 50;
      setWallet((prev) => ({
        ...prev,
        available_balance: Number((prev.available_balance + welcomeBonus).toFixed(2)),
        lifetime_earned: Number((prev.lifetime_earned + welcomeBonus).toFixed(2)),
      }));

      const newEntry: LedgerItem = {
        id: `led-${Date.now()}`,
        user_id: loggedInUser.id,
        type: 'daily_bonus',
        amount: welcomeBonus,
        status: 'credit',
        description: loggedInUser.referred_by
          ? 'Sign-up Bonus (₹50) + Referral Bonus (₹10)'
          : 'Welcome Sign-Up Bonus: ₹50.00',
        created_at: new Date().toISOString(),
      };
      setLedger((prev) => [newEntry, ...prev]);
      // Sync wallet to Firestore
      syncUserWallet(loggedInUser.id, updatedWallet).catch(console.error);
      showToast(`Welcome ${loggedInUser.name}! ₹${welcomeBonus} bonus credited! 🎉`);
    } else {
      showToast(`Welcome back, ${loggedInUser.name}! 👋`);
    }
  };

  const handleLogout = () => {
    logoutFromFirebase().catch(console.warn);
    localStorage.removeItem('kamaonow_user');
    setIsLoggedIn(false);
    showToast('Logged out successfully.');
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskCategory === 'All') return true;
    return t.category === taskCategory;
  });

  const filteredOffers = tasks.filter((t) => {
    if (offerCategory === 'All') return true;
    if (offerCategory === 'Top Offers') return t.is_top_offer;
    if (offerCategory === 'Trending') return t.is_trending;
    return true;
  });

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!isLoggedIn) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 flex flex-col font-sans pb-24 sm:pb-12 antialiased selection:bg-emerald-500/20 selection:text-emerald-950">
      <OfflineIndicator />

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-[0_8px_20px_rgba(0,0,0,0.25)] flex items-center gap-2 border border-emerald-300 animate-slide-up">
          <Sparkles className="w-4 h-4 shrink-0 text-yellow-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER (Compact, Clean & Mobile Friendly) */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#045D44] via-[#059669] to-[#047857] text-white border-b border-emerald-400/30 px-3.5 sm:px-6 h-13 flex items-center justify-between shadow-md">
        {/* Left Slot: 3D Logo or Back Button if inside a subscreen */}
        {activeTab === 'home' ? (
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <KamaoNowLogo3D size={34} />
            <div className="flex flex-col">
              <div className="flex items-center text-base sm:text-lg font-black tracking-tight leading-none">
                <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">Real</span>
                <span className="text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] ml-1">Money</span>
                <span className="text-emerald-200 text-[10px] font-black ml-1.5 px-1.5 py-0.5 bg-emerald-950/40 rounded border border-emerald-400/30">APP</span>
              </div>
              <div className="text-[9px] text-emerald-100/90 font-medium tracking-wide mt-0.5">
                Daily Tasks • Real Cash • Instant UPI
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 text-white font-black text-sm hover:text-emerald-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
            <span className="capitalize">{activeTab === 'refer' ? 'Refer & Earn' : activeTab === 'daily' ? 'Daily Bonus' : activeTab}</span>
          </button>
        )}

        {/* Right Slot: Notification bell (ghanta) & discreet admin trigger */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowAdminPanel(true)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Admin Desk"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowNotificationModal(true)}
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer backdrop-blur-xs relative"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5 text-white" />
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-amber-400 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center px-0.5 shadow-sm animate-pulse">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* MAIN MOBILE APP CANVAS (Compact & Mobile Friendly Spacing) */}
      <main className="w-full max-w-md md:max-w-xl mx-auto px-3.5 pt-2.5 pb-6 space-y-2.5 grow">
        {/* PWA Install Banner */}
        <PWAInstallBanner />

        {/* ========================================================= */}
        {/* TAB 1: HOME SCREEN (100% Pixel & 3D Match to Reference Mockup) */}
        {/* ========================================================= */}
        {activeTab === 'home' && (
          <div className="space-y-2.5 animate-fade-in">
            {/* 1. YOUR EARNINGS CARD (Brand New Ultra-Clean Fintech Design) */}
            <EarningsCardImage
              totalBalance={wallet.available_balance + wallet.pending_balance}
              onViewHistory={() => setShowLedgerModal(true)}
            />

            {/* 2. WITHDRAWABLE & PENDING CARDS (Compact & Clean) */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Withdrawable Card */}
              <div className="p-2.5 rounded-xl sm:rounded-2xl bg-[#E8F8F0] border border-emerald-100/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Withdrawable</span>
                </div>
                <div className="mt-1 font-mono font-black text-lg sm:text-xl text-[#065F46]">
                  ₹ {wallet.available_balance.toFixed(2)}
                </div>
              </div>

              {/* Pending Card */}
              <div className="p-2.5 rounded-xl sm:rounded-2xl bg-[#FFF5ED] border border-orange-100/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#EA580C]">
                  <span className="w-2 h-2 rounded-full bg-[#EA580C] shrink-0" />
                  <span>Pending</span>
                </div>
                <div className="mt-1 font-mono font-black text-lg sm:text-xl text-[#C2410C]">
                  ₹ {wallet.pending_balance.toFixed(2)}
                </div>
              </div>
            </div>

            {/* 3. WITHDRAW NOW BUTTON (Slimmer & Mobile Friendly) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(true)}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#00A86B] via-[#00874E] to-[#006837] hover:from-[#00B875] hover:to-[#007A43] text-white font-bold text-sm tracking-wide shadow-[0_4px_14px_rgba(0,135,78,0.28)] transition-all active:scale-[0.98] cursor-pointer text-center"
              >
                Withdraw Now
              </button>
              <div className="text-[10px] text-center font-bold text-emerald-800 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>
                  {wallet.lifetime_withdrawn === 0 && withdrawals.length === 0
                    ? '1st Withdrawal: Min sirf ₹20 • Instant UPI Payout'
                    : 'Minimum Withdrawal: ₹100 • Instant UPI Payout'}
                </span>
              </div>
            </div>

            {/* 4. PROMO CAROUSEL BANNER (Invite Friends, Spin & Win, Scratch & Win) */}
            <HomeBannerSlider onNavigate={(tab) => setActiveTab(tab)} />

            {/* 5. QUICK ACTIONS GRID (Compact Boxes & Crystal-Clear Visual Icons) */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-1.5">
                Quick Actions
              </div>
              <div className="grid grid-cols-3 gap-2 text-center select-none">
                {/* 1. Tasks */}
                <button
                  type="button"
                  onClick={() => setActiveTab('tasks')}
                  className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white border border-slate-100/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#00C853] to-[#009624] text-white flex items-center justify-center mb-1 shadow-[0_3px_8px_rgba(0,200,83,0.3)] group-hover:scale-105 transition-transform">
                    {/* Unmistakable Tasks Clipboard with Checklist & Checkmark */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                      <rect x="5" y="4" width="14" height="17" rx="2.5" fill="#FFFFFF" fillOpacity="0.25" stroke="#FFFFFF" strokeWidth="2" />
                      <rect x="9" y="2" width="6" height="3.5" rx="1.5" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
                      <path d="M8.5 12 L10.5 14 L15.5 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="8.5" y1="16.5" x2="15.5" y2="16.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Tasks</span>
                </button>

                {/* 2. Spin & Win */}
                <button
                  type="button"
                  onClick={() => setActiveTab('spin')}
                  className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white border border-slate-100/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#7E22CE] text-white flex items-center justify-center mb-1 shadow-[0_3px_8px_rgba(168,85,247,0.3)] group-hover:scale-105 transition-transform">
                    {/* Real Lucky Spin Wheel with Slices, Center Star & Pointer Pin */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                      <circle cx="12" cy="12.5" r="8.5" stroke="#FFFFFF" strokeWidth="2" fill="#FFFFFF" fillOpacity="0.2" />
                      <line x1="12" y1="4" x2="12" y2="21" stroke="#FFFFFF" strokeWidth="1.5" />
                      <line x1="3.5" y1="12.5" x2="20.5" y2="12.5" stroke="#FFFFFF" strokeWidth="1.5" />
                      <line x1="6" y1="6.5" x2="18" y2="18.5" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.8" />
                      <line x1="6" y1="18.5" x2="18" y2="6.5" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.8" />
                      <circle cx="12" cy="12.5" r="2.8" fill="#FDE047" stroke="#78350F" strokeWidth="1" />
                      {/* Red indicator pointer pin at top */}
                      <path d="M12 2 L10 5 L14 5 Z" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.8" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Spin &amp; Win</span>
                </button>

                {/* 3. Scratch Card */}
                <button
                  type="button"
                  onClick={() => setActiveTab('scratch')}
                  className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white border border-slate-100/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#F43F5E] to-[#BE123C] text-white flex items-center justify-center mb-1 shadow-[0_3px_8px_rgba(244,63,94,0.3)] group-hover:scale-105 transition-transform">
                    {/* Real Scratch Card with Scratched Surface & Shining Coin */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                      <rect x="3.5" y="4.5" width="17" height="15" rx="3" fill="#FFFFFF" fillOpacity="0.25" stroke="#FFFFFF" strokeWidth="2" />
                      <path d="M5.5 13 C8 10.5 10.5 14.5 13.5 11.5 C15.5 9.5 17 11.5 18.5 10 L18.5 6 C18.5 5.5 18 5 17.5 5 L5.5 5 Z" fill="#FFFFFF" fillOpacity="0.45" />
                      {/* Golden Star Revealed */}
                      <path d="M12 9.5 L12.7 11.2 L14.5 11.5 L13.2 12.8 L13.5 14.5 L12 13.6 L10.5 14.5 L10.8 12.8 L9.5 11.5 L11.3 11.2 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.8" />
                      {/* Coin scratcher */}
                      <circle cx="6.5" cy="15.5" r="2" fill="#FDE047" stroke="#FFFFFF" strokeWidth="0.8" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Scratch Card</span>
                </button>

                {/* 4. Daily Bonus */}
                <button
                  type="button"
                  onClick={() => setActiveTab('daily')}
                  className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white border border-slate-100/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#FB923C] to-[#EA580C] text-white flex items-center justify-center mb-1 shadow-[0_3px_8px_rgba(249,115,22,0.3)] group-hover:scale-105 transition-transform">
                    {/* Real 3D Gift Box with Ribbon Bow */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                      <rect x="4" y="9.5" width="16" height="11.5" rx="2" fill="#FFFFFF" fillOpacity="0.25" stroke="#FFFFFF" strokeWidth="2" />
                      <rect x="3" y="6.5" width="18" height="3.5" rx="1.5" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1" />
                      <line x1="12" y1="6.5" x2="12" y2="21" stroke="#FFFFFF" strokeWidth="2.5" />
                      <path d="M12 6.5 C10 3.5 7 4 8 6 C9 8 12 6.5 12 6.5 Z" fill="#FDE047" stroke="#FFFFFF" strokeWidth="1" />
                      <path d="M12 6.5 C14 3.5 17 4 16 6 C15 8 12 6.5 12 6.5 Z" fill="#FDE047" stroke="#FFFFFF" strokeWidth="1" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Daily Bonus</span>
                </button>

                {/* 5. Offers */}
                <button
                  type="button"
                  onClick={() => setActiveTab('offers')}
                  className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white border border-slate-100/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#FACC15] to-[#D97706] text-white flex items-center justify-center mb-1 shadow-[0_3px_8px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform">
                    {/* Real Discount Price Tag with % Sign */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                      <path d="M12.5 3.5 L19.5 3.5 C20.3 3.5 21 4.2 21 5 L21 12 C21 12.4 20.8 12.8 20.5 13.1 L12.5 21.1 C11.7 21.9 10.4 21.9 9.6 21.1 L2.9 14.4 C2.1 13.6 2.1 12.3 2.9 11.5 L10.9 3.5 C11.2 3.2 11.6 3.5 12.5 3.5 Z" fill="#FFFFFF" fillOpacity="0.25" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
                      <circle cx="16.5" cy="7.5" r="1.8" fill="#FDE047" />
                      <text x="8.5" y="14.5" fill="#FFFFFF" fontSize="8" fontWeight="900" fontFamily="sans-serif">%</text>
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Offers</span>
                </button>

                {/* 6. Profile */}
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white border border-slate-100/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-white flex items-center justify-center mb-1 shadow-[0_3px_8px_rgba(2,132,199,0.3)] group-hover:scale-105 transition-transform">
                    {/* User Avatar with Profile Ring */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                      <circle cx="12" cy="8" r="3.8" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1" />
                      <path d="M5.5 19 C5.5 15.5 8.5 13.5 12 13.5 C15.5 13.5 18.5 15.5 18.5 19" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="9.5" stroke="#FFFFFF" strokeWidth="1.8" strokeDasharray="3 2" opacity="0.6" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Profile</span>
                </button>
              </div>
            </div>

            {/* 4. ACTIVE TASKS PREVIEW ON HOME (CRISP WHITE CARDS) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Top Earning Tasks
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('tasks')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  See All ({tasks.length}) &gt;
                </button>
              </div>

              {tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-emerald-300 flex items-center justify-between gap-3 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:shadow-md transition-all active:scale-98 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      style={{ backgroundColor: task.icon_bg || '#059669' }}
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-xs shrink-0 shadow-md border border-white/30 group-hover:scale-105 transition-transform"
                    >
                      {task.icon_label}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">{task.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate font-medium">{task.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-mono font-black text-emerald-600 text-base">
                      ₹{task.reward_amount.toFixed(0)}
                    </span>
                    {submissions.some((s) => s.task_id === task.id) ? (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300">
                        In Review
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-black text-xs shadow-md transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                      >
                        <span>Start Offer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom 4 Badges (CRISP WHITE CARDS) */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] text-slate-700">
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="font-bold">100% Secure</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <CheckSquare className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="font-bold">Manual Approval</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <Smartphone className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="font-bold">PWA App</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <Trophy className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="font-bold">Daily Rewards</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TASKS SECTION (CRISP WHITE CARDS)                   */}
        {/* ========================================================= */}
        {activeTab === 'tasks' && (
          <div className="space-y-4 animate-fade-in">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl border border-slate-200 overflow-x-auto text-xs font-semibold">
              {(['All', 'Installed', 'Register', 'Survey'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTaskCategory(cat)}
                  className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    taskCategory === cat
                      ? 'bg-emerald-600 text-white font-black shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'All' ? 'All Tasks' : cat}
                </button>
              ))}
            </div>

            {/* Task Cards List (CRISP WHITE) */}
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="p-4 rounded-3xl bg-white border border-slate-100 hover:border-emerald-300 flex items-center justify-between gap-3 cursor-pointer transition-all shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:shadow-md group active:scale-98"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      style={{ backgroundColor: task.icon_bg || '#059669' }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shrink-0 shadow-md border border-white/30 group-hover:scale-105 transition-transform"
                    >
                      {task.icon_label}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-500 truncate font-medium">{task.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-black text-emerald-600 text-base">
                      ₹{task.reward_amount.toFixed(0)}
                    </span>
                    {submissions.some((s) => s.task_id === task.id) ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300">
                        In Review
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <span>Start Offer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Task complete karke screenshot submit karein. Hum manually verify karenge.</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SPIN & WIN                                         */}
        {/* ========================================================= */}
        {activeTab === 'spin' && (
          <div className="animate-fade-in">
            <SpinWheel freeSpinsLeft={freeSpinsLeft} onRewardWon={handleSpinWon} />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SCRATCH CARD                                       */}
        {/* ========================================================= */}
        {activeTab === 'scratch' && (
          <div className="animate-fade-in">
            <ScratchCard onRewardWon={handleScratchWon} />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: OFFERS SECTION (CRISP WHITE CARDS)                 */}
        {/* ========================================================= */}
        {activeTab === 'offers' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl border border-slate-200 overflow-x-auto text-xs font-semibold">
              {(['All', 'Top Offers', 'Trending', 'New'] as const).map((tabItem) => (
                <button
                  key={tabItem}
                  type="button"
                  onClick={() => setOfferCategory(tabItem)}
                  className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    offerCategory === tabItem
                      ? 'bg-emerald-600 text-white font-black shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tabItem}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredOffers.map((offer) => (
                <div
                  key={offer.id}
                  onClick={() => setSelectedTask(offer)}
                  className="p-4 rounded-3xl bg-white border border-slate-100 hover:border-emerald-300 flex items-center justify-between gap-3 cursor-pointer transition-all shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:shadow-md group active:scale-98"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      style={{ backgroundColor: offer.icon_bg || '#059669' }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shrink-0 shadow-md border border-white/30 group-hover:scale-105 transition-transform"
                    >
                      {offer.icon_label}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {offer.title}
                      </h3>
                      <p className="text-xs text-slate-500 truncate font-medium">{offer.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-black text-emerald-600 text-base">
                      ₹{offer.reward_amount.toFixed(0)}
                    </span>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white font-black text-xs transition-colors shadow-md"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Har offer ka reward alag hota hai. Terms &amp; conditions padhein.</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: REFER & EARN (Crisp White Card elements)           */}
        {/* ========================================================= */}
        {activeTab === 'refer' && (
          <div className="space-y-5 animate-fade-in">
            <div className="rounded-3xl bg-gradient-to-br from-[#065F46] via-[#047857] to-[#059669] border border-emerald-400/40 p-6 text-center space-y-4 shadow-xl text-white">
              <ReferCharacter3D className="w-24 h-24 mx-auto drop-shadow-md" />
              <div>
                <h2 className="text-xl font-black text-white">Invite Your Friends &amp; Earn ₹3</h2>
                <p className="text-xs text-emerald-100 mt-1">
                  Friend sign up kare aur 1 task complete kare, aapko ₹3 seedha wallet me!
                </p>
              </div>

              {/* Referral Code Box -> CRISP WHITE BOX! */}
              <div className="p-4 rounded-2xl bg-white border border-white text-slate-900 max-w-xs mx-auto shadow-md">
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Your Referral Code</div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className="text-2xl font-mono font-black text-amber-500 tracking-wider">
                    {user.referral_code}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(user.referral_code);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 1800);
                      showToast('Referral code copied!');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 cursor-pointer shadow-sm transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp Share Button */}
              <button
                type="button"
                onClick={() => {
                  const shareText = `Join Real Money App! Complete simple tasks, spin & scratch to earn real cash. Use my referral code: ${user.referral_code} - https://realmoneyapp.online`;
                  if (navigator.share) {
                    navigator.share({ title: 'Real Money App', text: shareText, url: 'https://realmoneyapp.online' }).catch(() => {});
                  } else {
                    navigator.clipboard?.writeText(shareText);
                    showToast('Invite link copied to clipboard!');
                  }
                }}
                className="w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white font-black text-sm transition-all shadow-[0_6px_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Invite Now (WhatsApp / Share)</span>
              </button>
            </div>

            {/* How It Works -> CRISP WHITE CARD */}
            <div className="p-5 rounded-3xl bg-white border border-slate-100 space-y-3 shadow-md text-slate-800">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                How It Works?
              </h3>
              <ol className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="font-black text-emerald-600 font-mono">1.</span>
                  <span>Aap apna referral code share karein.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-black text-emerald-600 font-mono">2.</span>
                  <span>Friend sign up kare aur 1 task complete kare.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-black text-emerald-600 font-mono">3.</span>
                  <span>Aapko ₹3 milega (task complete hone ke baad).</span>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: DAILY BONUS                                        */}
        {/* ========================================================= */}
        {activeTab === 'daily' && (
          <div className="space-y-5 animate-fade-in">
            <div className="rounded-3xl bg-gradient-to-br from-[#065F46] via-[#047857] to-[#059669] border border-emerald-400/40 p-8 text-center space-y-5 shadow-2xl text-white">
              <div className="mx-auto flex justify-center">
                <GiftBox3D className="w-24 h-24" />
              </div>

              <div>
                <h2 className="text-xl font-black text-white">Roz ka Bonus Seedha Account Me!</h2>
                <p className="text-xs text-emerald-100 mt-1">Har roz login karein aur apna free cash claim karein.</p>
              </div>

              {/* Bonus Display -> CRISP WHITE BOX */}
              <div className="p-4 rounded-2xl bg-white border border-white text-slate-900 max-w-xs mx-auto shadow-md">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Today's Bonus</div>
                <div className="text-3xl font-mono font-black text-amber-500 mt-1">₹ 0.50</div>
              </div>

              <button
                type="button"
                onClick={handleClaimDailyBonus}
                disabled={dailyBonusClaimed}
                className="w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 text-white font-black text-sm transition-all shadow-[0_6px_20px_rgba(16,185,129,0.35)] active:scale-98 cursor-pointer disabled:cursor-not-allowed mx-auto"
              >
                {dailyBonusClaimed ? 'Claimed Today ✓' : 'Claim Now'}
              </button>

              <p className="text-xs text-emerald-200">
                Note: Daily bonus sirf ek baar milega.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: PROFILE SECTION (CRISP WHITE CARDS)                */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fade-in">
            {/* User Profile Card -> CRISP WHITE */}
            <div className="p-5 rounded-3xl bg-white border border-slate-100 flex items-center justify-between gap-4 shadow-md text-slate-900">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-100 shrink-0 shadow-sm">
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">{user.name}</h2>
                  <p className="text-xs text-emerald-700 font-mono font-bold">{user.email}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">+91 {user.phone}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const newName = prompt('Enter your name:', user.name);
                  if (newName) setUser({ ...user, name: newName });
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm transition-colors"
              >
                Edit
              </button>
            </div>

            {/* Stats Row -> 3 CRISP WHITE CARDS */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs">
                <div className="font-mono font-black text-emerald-600 text-lg">
                  {submissions.filter((s) => s.status === 'approved').length + 11}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">Completed Tasks</div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs">
                <div className="font-mono font-black text-amber-500 text-lg">
                  {referrals.length + 2}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">Referrals</div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs">
                <div className="font-mono font-black text-teal-600 text-lg">
                  {withdrawals.filter((w) => w.status === 'approved').length + 1}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">Withdrawals</div>
              </div>
            </div>

            {/* Menu List -> CRISP WHITE CARD */}
            <div className="rounded-3xl bg-white border border-slate-100 divide-y divide-slate-100 overflow-hidden text-xs shadow-md text-slate-800">
              <button
                type="button"
                onClick={() => setShowLedgerModal(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">My Earnings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('refer')}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">Referral History</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">Task History ({submissions.length})</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setShowWithdrawModal(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">Withdrawal History ({withdrawals.length})</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('spin')}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Disc className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">Spin History</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('scratch')}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">Scratch History</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setShowAdminPanel(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left bg-amber-50/50"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-amber-900">Admin Operations Desk</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-600" />
              </button>

              <button
                type="button"
                onClick={handleResetSeed}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-600">Reset Demo Data</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Clean State</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full p-4 flex items-center justify-between hover:bg-rose-50 transition-colors cursor-pointer text-left text-rose-600 border-t border-rose-100/60"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span className="font-black text-rose-600">Log Out (Account Badlein)</span>
                </div>
                <span className="text-[11px] text-rose-400 font-bold">Logout</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 5-TAB 3D MOBILE BOTTOM NAV (CRISP WHITE BAR)              */}
      {/* ========================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
            activeTab === 'home'
              ? 'text-emerald-600 font-black scale-105'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </button>

        {/* 2. Tasks */}
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
            activeTab === 'tasks'
              ? 'text-emerald-600 font-black scale-105'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <CheckSquare className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[10px] mt-0.5 tracking-tight">Tasks</span>
        </button>

        {/* 3. Spin */}
        <button
          type="button"
          onClick={() => setActiveTab('spin')}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
            activeTab === 'spin'
              ? 'text-emerald-600 font-black scale-105'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Disc className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[10px] mt-0.5 tracking-tight">Spin</span>
        </button>

        {/* 4. Scratch */}
        <button
          type="button"
          onClick={() => setActiveTab('scratch')}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
            activeTab === 'scratch'
              ? 'text-emerald-600 font-black scale-105'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[10px] mt-0.5 tracking-tight">Scratch</span>
        </button>

        {/* 5. Profile */}
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
            activeTab === 'profile'
              ? 'text-emerald-600 font-black scale-105'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <User className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[10px] mt-0.5 tracking-tight">Profile</span>
        </button>
      </nav>

      {/* TASK MODAL */}
      <TaskModal
        task={selectedTask}
        existingSubmission={
          selectedTask ? submissions.find((s) => s.task_id === selectedTask.id) : undefined
        }
        userPhone={user.phone}
        onClose={() => setSelectedTask(null)}
        onSubmitProof={handleSubmitTaskProof}
      />

      {/* WITHDRAW MODAL */}
      {showWithdrawModal && (
        <WithdrawModal
          availableBalance={wallet.available_balance}
          userPhone={user.phone}
          isFirstWithdrawal={wallet.lifetime_withdrawn === 0 && withdrawals.length === 0}
          onClose={() => setShowWithdrawModal(false)}
          onRequestWithdrawal={handleRequestWithdrawal}
        />
      )}

      {/* NOTIFICATIONS MODAL (In-App & Push Notification Center) */}
      {showNotificationModal && (
        <NotificationModal
          notifications={notifications}
          onClose={() => setShowNotificationModal(false)}
          onMarkAsRead={(id) => {
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
          }}
          onMarkAllAsRead={() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            showToast('Sabhi notifications mark as read ho gayi.');
          }}
          onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
          showToast={showToast}
        />
      )}

      {/* LEDGER MODAL (Crisp White Card Modal) */}
      {showLedgerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-100 p-5 text-slate-900 flex flex-col max-h-[85vh] shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Earnings History &amp; Ledger</h3>
                <p className="text-[11px] text-slate-500 font-mono">Real-time audit passbook</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLedgerModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Balance Summary & Withdraw Trigger */}
            <div className="my-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Withdrawable Balance</div>
                <div className="text-lg font-black text-emerald-900 font-mono">₹{wallet.available_balance.toFixed(2)}</div>
                <div className="text-[10px] text-slate-500 font-medium">Pending: ₹{wallet.pending_balance.toFixed(2)}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLedgerModal(false);
                  setShowWithdrawModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Withdraw Now ›
              </button>
            </div>

            <div className="grow overflow-y-auto divide-y divide-slate-100 py-2">
              {ledger.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{item.description}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {new Date(item.created_at).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div
                    className={`font-mono font-bold text-sm ${
                      item.status === 'credit' ? 'text-emerald-600' : 'text-slate-600'
                    }`}
                  >
                    {item.status === 'credit' ? '+' : '-'}₹{item.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PANEL (PWA Manual Admin TaskPay Style) */}
      {showAdminPanel && (
        <AdminPanel
          tasks={tasks}
          submissions={submissions}
          withdrawals={withdrawals}
          users={[user, { ...user, id: 'usr-priya-02', name: 'Priya Verma', phone: '9811223344' }]}
          wallets={{ [user.id]: wallet }}
          ledger={ledger}
          referrals={referrals}
          onApproveSubmission={handleAdminApproveSubmission}
          onRejectSubmission={handleAdminRejectSubmission}
          onApproveWithdrawal={handleAdminApproveWithdrawal}
          onRejectWithdrawal={handleAdminRejectWithdrawal}
          onSaveTask={handleAdminSaveTask}
          onDeleteTask={handleAdminDeleteTask}
          onToggleUserBlock={handleAdminToggleUserBlock}
          onAdjustBalance={handleAdminAdjustBalance}
          onClose={() => setShowAdminPanel(false)}
        />
      )}
    </div>
  );
}
