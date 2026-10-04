# 📐 Architecture Plan — 100% Free Stack (Zero Cost, Maximum Users)
> *Permanently Documented from Architecture Diagram Blueprint*

---

## 🎯 Core Philosophy:
- **Starting Cost**: **₹0 (100% Free Forever)**
- **Capacity**: 10K – 50K Daily Active Users easily (up to 100K+ users with smart caching)
- **App Format**: PWA + Manual Admin Panel (TaskPay Style)
- **Multi-Store Ready**: Amazon Appstore, Vivo App Store, Xiaomi GetApps, Samsung, Google Play

---

## 🏗️ 1. Complete System Architecture:

```
[Users: Mobile/Desktop/PWA]
             │
             ▼
   ┌───────────────────┐
   │ Cloudflare Pages  │  ──> 100% Free Unlimited Static Requests, Global CDN
   └─────────┬─────────┘
             │
             ▼
   ┌───────────────────┐        ┌───────────────────┐
   │Cloudflare Workers │ ◄────► │   Supabase Auth   │  ──> 50K MAU Free
   │  (Backend / API)  │        │(Mobile/Email/OTP) │
   └─────────┬─────────┘        └───────────────────┘
             │
   ┌─────────┴─────────┐
   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌────────────────────────┐
│Cloudflare D1 │   │Cloudflare R2 │   │      Admin Panel       │
│  (Database)  │   │(File Storage)│   │(TaskPay Style In PWA)  │
│ 5GB, 5M/day  │   │10GB Free/mo  │   │Approve Proofs, Withdraw│
└──────────────┘   └──────────────┘   └────────────────────────┘
```

---

## 📱 2. User Flow (Kaise Kaam Karega):
1. **Login / Signup**: Supabase Auth (Mobile OTP / Email / Password) -> ₹50 Welcome Bonus.
2. **Home Screen**: Wallet Balance, Quick Actions (Tasks, Spin, Scratch, Refer, Bonus).
3. **Complete Task**: Open Partner App link, complete registration/task -> Submit Proof screenshot.
4. **Admin Approval**: Proof goes to Admin Queue -> Admin reviews -> ₹XX credited to Wallet.
5. **Withdraw**: Minimum ₹20 (1st time) / ₹100 (subsequent) -> Instant UPI / Bank Transfer.
6. **Profile / Passbook**: My Earnings, Task History, Referral History, Spin/Scratch History, Withdraw History.

---

## 📊 3. Free Tier Limits (Zero Cost Breakdown):
| Component | Service | Free Quota | Reset Cycle |
|---|---|---|---|
| **Frontend Hosting** | Cloudflare Pages | **Unlimited requests**, 500 builds/month | Monthly |
| **Backend API** | Cloudflare Workers | **100,000 requests/day** | Daily |
| **Database** | Cloudflare D1 | **5 GB Storage**, 5 Million reads/day, 100K writes/day | Daily |
| **File Storage** | Cloudflare R2 | **10 GB/month**, 1M Class-A ops, 10M Class-B ops | Monthly |
| **Authentication** | Supabase Auth | **50,000 MAU**, 1 GB storage, 5 GB egress | Monthly |

---

## 🗄️ 4. Database Structure (D1 - 11 Exact Tables in `schema.sql`):
1. `users` (id PK, name, phone/email, referral_code, referred_by, is_blocked, is_verified, created_at)
2. `tasks` (id PK, title, description, reward_amount, instructions, image_url, status, created_at)
3. `task_submissions` (id PK, user_id, task_id, proof_file_id, status, admin_note, submitted_at)
4. `wallets` (id PK, user_id, available_balance, pending_balance, lifetime_earned, lifetime_withdrawn, updated_at)
5. `ledger` (id PK, user_id, type, amount, status, reference_id, description, created_at)
6. `referrals` (id PK, referrer_id, referred_user_id, status, reward_amount, qualified_at, created_at)
7. `spin_history` (id PK, user_id, reward_amount, created_at)
8. `scratch_history` (id PK, user_id, reward_amount, created_at)
9. `withdrawals` (id PK, user_id, amount, method, upi_id, status, utr, requested_at, processed_at)
10. `daily_bonus` (id PK, user_id, amount, claim_date, created_at)
11. `admin_users` (id PK, name, email, role, password_hash, created_at)

---

## 🔄 5. Task Reward Flow Example:
1. User completes offer -> Uploads screenshot (compressed on client to <150 KB).
2. Image stored in Cloudflare R2 / Proof store (NOT inside database, keeping D1 super fast).
3. Admin reviews proof on Admin Panel -> Approves / Rejects with note.
4. Reward added to Wallet -> Ledger entry created -> Notification sent to user.
