# 🏆 Real Money App (`realmoneyapp.online`)

Bharat Ka #1 Real Cash & Daily Earning Platform (Zero Investment, Instant UPI Withdrawals).

---

## 📁 Project File Directory & Separate Modules

Sabhi features aur SEO files alag-alag modules me organized hain:

### 1. 🔍 SEO, Google Verification & Crawlers
* **[index.html](index.html)** - Meta Verification Tag (`tcMdgLFWorHB45aC4gxGkTuOJdHTI1R3eyvQOv9P8o4`), Schema.org JSON-LD (FAQPage, WebApplication, Organization) & OpenGraph tags.
* **[public/sitemap.xml](public/sitemap.xml)** - Sabhi URLs aur dynamic tabs (`/`, `?tab=tasks`, `?tab=offers`, `?tab=spin`, `?tab=scratch`, `?tab=refer`) ka full sitemap.
* **[public/robots.txt](public/robots.txt)** - Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot ke liye optimized crawling rules.
* **[public/googletcMdgLFWorHB45aC4gxGkTuOJdHTI1R3eyvQOv9P8o4.html](public/googletcMdgLFWorHB45aC4gxGkTuOJdHTI1R3eyvQOv9P8o4.html)** - Google Search Console standalone HTML verification file.

---

### 2. 🎡 Daily Free Rewards (Strict 1/Day Rule)
* **[src/components/SpinWheel.tsx](src/components/SpinWheel.tsx)** - Daily 1 Free Lucky Spin with live midnight (12:00 AM) countdown timer & audio win celebration.
* **[src/components/ScratchCard.tsx](src/components/ScratchCard.tsx)** - Daily 1 Free Scratch Card with scratch canvas & live countdown timer.

---

### 3. 💼 Main Application & Offers
* **[src/App.tsx](src/App.tsx)** - Main App component with zero demo task clutter, clean real offers list, wallet tracking, and SEO footer.
* **[src/components/AdminPanel.tsx](src/components/AdminPanel.tsx)** - Admin Control Desk (+ Naya Offer Banayein, task approvals, user withdrawals, proof verification).
* **[src/types/kamaonow.ts](src/types/kamaonow.ts)** - TypeScript interfaces for Tasks, Wallets, Submissions & Users.

---

### 4. ⚡ Backend, Cloudflare & Database
* **[functions/api/[[route]].ts](functions/api/[[route]].ts)** - Cloudflare Pages / Workers REST API endpoints.
* **[schema.sql](schema.sql)** - Cloudflare D1 SQL Schema (11 tables: users, tasks, withdrawals, ledger, etc.).
* **[CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md)** - 100% Free hosting setup instructions.
* **[server.ts](server.ts)** - Node.js Express full-stack API server.

---

## 📱 Mobile PWA & APK
* **[public/manifest.json](public/manifest.json)** - Progressive Web App configuration.
* **[public/icon.svg](public/icon.svg)** - High-resolution 3D App Vector Icon.
* **[APK_STORE_PUBLISH_GUIDE.md](APK_STORE_PUBLISH_GUIDE.md)** - Vivo, Xiaomi, Oppo, Amazon Appstore packaging guide.
  ..
