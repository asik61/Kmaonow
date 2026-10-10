export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  referral_code: string;
  referred_by: string | null;
  is_blocked: boolean;
  is_verified: boolean;
  role: 'user' | 'admin';
  avatar_url?: string;
  created_at: string;
  device_id?: string;
  device_model?: string;
  last_active?: string;
}

export type TaskCategory = 'All' | 'Installed' | 'Register' | 'Survey';

export interface TaskItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: TaskCategory;
  reward_amount: number; // in ₹ INR
  instructions: string[];
  partner_url: string;
  image_url?: string;
  icon_label: string;
  icon_bg?: string;
  is_active: boolean;
  is_top_offer?: boolean;
  is_trending?: boolean;
  is_admin_created?: boolean;
  created_by?: string;
  created_at: string;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface TaskSubmission {
  id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  task_id: string;
  task_title: string;
  reward_amount: number;
  proof_file_id: string; // base64 or image url
  proof_screenshot_url?: string;
  screenshot_size_kb?: number;
  status: SubmissionStatus;
  admin_note?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface WalletState {
  id: string;
  user_id: string;
  available_balance: number; // e.g. ₹18.50
  pending_balance: number;   // e.g. ₹6.25
  lifetime_earned: number;   // e.g. ₹24.75
  lifetime_withdrawn: number;
  updated_at: string;
}

export type LedgerType =
  | 'task_reward'
  | 'spin_reward'
  | 'scratch_reward'
  | 'daily_bonus'
  | 'bonus'
  | 'referral_bonus'
  | 'withdrawal'
  | 'withdrawal_refund'
  | 'admin_adjust';

export interface LedgerItem {
  id: string;
  user_id: string;
  type: LedgerType;
  amount: number;
  status: 'credit' | 'debit';
  reference_id?: string;
  description: string;
  created_at: string;
}

export interface ReferralItem {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  referred_name: string;
  status: 'pending' | 'qualified';
  reward_amount: number; // ₹3
  qualified_at?: string;
  created_at: string;
}

export interface SpinRecord {
  id: string;
  user_id: string;
  reward_amount: number;
  created_at: string;
}

export interface ScratchRecord {
  id: string;
  user_id: string;
  reward_amount: number;
  scratch_code: string;
  created_at: string;
}

export type WithdrawalMethod = 'UPI' | 'Bank';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  amount: number;
  method: WithdrawalMethod;
  upi_id?: string;
  bank_account?: string;
  bank_ifsc?: string;
  status: WithdrawalStatus;
  utr?: string;
  rejection_reason?: string;
  requested_at: string;
  processed_at?: string;
}

export interface DailyBonusRecord {
  id: string;
  user_id: string;
  amount: number; // ₹0.50
  claim_date: string;
  created_at: string;
}

export interface BroadcastNotice {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  is_active: boolean;
  created_at: string;
  author?: string;
  target_user_id?: string;
  action_tab?: string;
}

declare global {
  interface Window {
    AndroidBridge?: {
      isNativeApp?: () => boolean;
      showToast?: (msg: string) => void;
      getDeviceId?: () => string;
      getDeviceModel?: () => string;
      getDeviceBrand?: () => string;
      getAppVersion?: () => string;
      launchGoogleAccountChooser?: () => void;
    };
    onNativeGoogleLoginSuccess?: (data: string) => void;
    onNativeGoogleLoginError?: (err: string) => void;
  }
}

