# 🚀 Real Money App - Cloudflare 100% Free Stack Setup Guide

Aapke architecture plan ke mutabiq yeh setup **100% Free (Zero Cost)** hai aur 50,000+ daily users ko easily handle karta hai.

---

## 🏗️ System Components & Hosting:
1. **Frontend Hosting**: **Cloudflare Pages** (100% Free Unlimited Bandwidth, Global Edge CDN, Free SSL)
2. **Custom Domain**: `realmoneyapp.online` (Cloudflare DNS se connected)
3. **Backend API**: Cloudflare Workers / Pages Functions (`functions/api/[[route]].ts`)
4. **Database**: Cloudflare D1 (5 GB Storage, 5 Million reads/day, 100K writes/day Free) / Firebase Firestore
5. **File Storage**: Cloudflare R2 (`realmoney-proofs` bucket for Screenshots - 10 GB Free)
6. **Mobile APK**: PWABuilder / TWA (Amazon, Vivo, Mi GetApps, Play Store ready)

---

## ⚡ 4 Simple Setup Steps:

### Step 1: Cloudflare CLI (Wrangler) Login
Apne terminal ya command prompt me run karein:
```bash
npx wrangler login
```
Yeh aapke browser me Cloudflare dashboard kholega aur login approve karne ko bolega.

---

### Step 2: Cloudflare D1 Database Banayein
Run karein:
```bash
npx wrangler d1 create kamaonow-d1
```
Terminal par aapko ek `database_id` milega (jaise `xxxx-xxxx-xxxx`).
Use `wrangler.toml` file me paste kar dein:
```toml
[[d1_databases]]
binding = "DB"
database_name = "kamaonow-d1"
database_id = "aapka-database-id-yahan"
```

---

### Step 3: D1 Database Me 11 Tables Create Karein (`schema.sql`)
Humari banayi hui `schema.sql` file ko ek command se execute karein:
```bash
npx wrangler d1 execute kamaonow-d1 --file=./schema.sql
```
Isse aapke D1 me saare **11 Tables** create ho jayenge:
- `users`
- `tasks`
- `task_submissions`
- `wallets`
- `ledger`
- `referrals`
- `spin_history`
- `scratch_history`
- `withdrawals`
- `daily_bonus`
- `admin_users`

---

### Step 4: Screenshot Storage (Cloudflare R2 Bucket) Banayein
Task proofs ke screenshots store karne ke liye R2 bucket banayein:
```bash
npx wrangler r2 bucket create kamaonow-proofs
```

---

### Step 5: Cloudflare Pages Par Deploy Karein
```bash
npm run build
npx wrangler pages deploy dist --project-name=kamaonow
```

Aapka app **Cloudflare par 100% Free live ho jayega!** 🎉
