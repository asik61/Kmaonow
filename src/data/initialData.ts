import type {
  UserProfile,
  TaskItem,
  TaskSubmission,
  WalletState,
  LedgerItem,
  ReferralItem,
  WithdrawalRequest,
  SpinRecord,
  ScratchRecord,
  BroadcastNotice,
} from '../types/kamaonow';

export const INITIAL_USER: UserProfile = {
  id: '',
  name: 'User',
  phone: '',
  email: '',
  referral_code: '',
  referred_by: null,
  is_blocked: false,
  is_verified: true,
  role: 'user',
  avatar_url: '',
  created_at: new Date().toISOString(),
};

export const INITIAL_ADMIN: UserProfile = {
  id: 'usr-6202636470',
  name: 'Asik Khan (Master Admin)',
  phone: '+91 62026 36470',
  email: 'asik94906@gmail.com',
  referral_code: 'REALHQ',
  referred_by: null,
  is_blocked: false,
  is_verified: true,
  role: 'admin',
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
};

export const INITIAL_WALLET: WalletState = {
  id: 'wal-initial',
  user_id: '',
  available_balance: 0.00,
  pending_balance: 0.00,
  lifetime_earned: 0.00,
  lifetime_withdrawn: 0.00,
  updated_at: new Date().toISOString(),
};

export const NAVI_TASK: TaskItem = {
  id: 'task-admin-navi-01',
  title: 'Navi: UPI, Loans & Mutual Funds',
  subtitle: 'Install & Register with Mobile',
  description: 'Download Navi app from Play Store, complete registration using your mobile number, setup UPI or start investing with just ₹10 to unlock ₹25 instant cash reward.',
  category: 'Register',
  reward_amount: 25.00,
  instructions: [
    'Click on "Start Offer" button to open Navi App in Google Play Store.',
    'Download and install the official Navi app on your mobile phone.',
    'Open the app and complete registration with your active mobile number and OTP.',
    'Link your bank account with UPI or complete KYC verification.',
    'Take a clear screenshot of the Navi home screen / registered profile page.',
    'Upload the screenshot here and tap Submit Proof to receive ₹25 cash reward directly in your wallet!'
  ],
  partner_url: 'https://play.google.com/store/apps/details?id=com.naviapp',
  icon_label: 'NAVI',
  icon_bg: '#059669',
  image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
  is_active: true,
  is_top_offer: true,
  is_trending: true,
  is_admin_created: true,
  created_by: 'admin',
  created_at: new Date().toISOString(),
};

export const INITIAL_TASKS: TaskItem[] = [NAVI_TASK];

export const INITIAL_SUBMISSIONS: TaskSubmission[] = [];

export const INITIAL_LEDGER: LedgerItem[] = [];

export const INITIAL_REFERRALS: ReferralItem[] = [];

export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [];

export const INITIAL_USERS_LIST: UserProfile[] = [
  INITIAL_ADMIN,
];

export const INITIAL_WALLETS_MAP: Record<string, WalletState> = {};

export const INITIAL_NOTICES: BroadcastNotice[] = [
  {
    id: 'notice-welcome-bonus',
    title: '📢 Welcome Bonus: ₹5 on 1st Task Completion!',
    message: 'Naye users ko Sign-up bonus ₹5.00 apna pehla task successfully complete karne par turant credit ho jata hai!',
    type: 'success',
    is_active: false,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    author: 'Admin Ops Desk',
  },
  {
    id: 'notice-refer-bonus',
    title: '👥 Refer & Earn: ₹5 per Friend!',
    message: 'Apne dosto ko invite karein. Jab dost 1st task complete karega, aapko ₹5 seedha wallet me mil jayenge!',
    type: 'info',
    is_active: false,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    author: 'Admin Finance Team',
  },
  {
    id: 'notice-fairplay-warning',
    title: '🛡️ 1 Phone = 1 Account Strict FairPlay Engine',
    message: 'Ek hi phone me multiple fake accounts ya app cloner use karna sakht mana hai. Aise accounts ko system permanent ban karta hai.',
    type: 'alert',
    is_active: false,
    created_at: new Date().toISOString(),
    author: 'Admin Security',
  },
];
