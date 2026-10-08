-- =========================================================================
-- KamaoNow (TaskPay Style) - Cloudflare D1 Database Schema
-- 100% Free Stack Architecture (11 Tables Matching Architecture Diagram)
-- =========================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by TEXT,
    is_blocked INTEGER NOT NULL DEFAULT 0,
    is_verified INTEGER NOT NULL DEFAULT 1,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Register',
    reward_amount REAL NOT NULL,
    instructions TEXT, -- JSON array of step-by-step instructions
    partner_url TEXT NOT NULL,
    image_url TEXT,
    icon_label TEXT DEFAULT 'TASK',
    icon_bg TEXT DEFAULT '#059669',
    status TEXT NOT NULL DEFAULT 'active', -- 'active' or 'paused'
    is_top_offer INTEGER NOT NULL DEFAULT 0,
    is_trending INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. TASK SUBMISSIONS TABLE (Screenshot Proofs)
CREATE TABLE IF NOT EXISTS task_submissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_phone TEXT,
    task_id TEXT NOT NULL,
    task_title TEXT,
    reward_amount REAL NOT NULL,
    proof_file_id TEXT NOT NULL, -- Stored in Cloudflare R2 / Object Storage
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_note TEXT,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- 4. WALLETS TABLE
CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    available_balance REAL NOT NULL DEFAULT 0.00,
    pending_balance REAL NOT NULL DEFAULT 0.00,
    lifetime_earned REAL NOT NULL DEFAULT 0.00,
    lifetime_withdrawn REAL NOT NULL DEFAULT 0.00,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 5. LEDGER TABLE (Audit Trail for Every Single Rupee)
CREATE TABLE IF NOT EXISTS ledger (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'task_reward', 'spin_reward', 'scratch_reward', 'daily_bonus', 'referral_bonus', 'withdrawal', 'withdrawal_refund', 'admin_adjust'
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'credit', -- 'credit' or 'debit'
    reference_id TEXT, -- Task ID, Withdrawal ID, etc.
    description TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 6. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    referrer_id TEXT NOT NULL,
    referred_user_id TEXT NOT NULL,
    referred_user_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' (until 1st task), 'qualified', 'paid'
    reward_amount REAL NOT NULL DEFAULT 3.00,
    qualified_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(id),
    FOREIGN KEY (referred_user_id) REFERENCES users(id)
);

-- 7. SPIN HISTORY TABLE
CREATE TABLE IF NOT EXISTS spin_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reward_amount REAL NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 8. SCRATCH HISTORY TABLE
CREATE TABLE IF NOT EXISTS scratch_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reward_amount REAL NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 9. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS withdrawals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_phone TEXT,
    amount REAL NOT NULL,
    method TEXT NOT NULL, -- 'UPI', 'Bank', 'AmazonPay'
    upi_id TEXT,
    bank_account TEXT,
    bank_ifsc TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    utr TEXT, -- Bank transaction reference number once paid
    rejection_reason TEXT,
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 10. DAILY BONUS TABLE
CREATE TABLE IF NOT EXISTS daily_bonus (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0.50,
    claim_date TEXT NOT NULL, -- YYYY-MM-DD
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, claim_date),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 11. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin', -- 'admin', 'super_admin'
    password_hash TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

-- Broadcast Notices table
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'success',
  is_active INTEGER DEFAULT 1,
  author TEXT DEFAULT 'Admin',
  created_at TEXT DEFAULT (datetime('now'))
);
