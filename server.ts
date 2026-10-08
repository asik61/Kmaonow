import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON Body Parser for API requests (supports screenshot proof uploads)
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // =========================================================================
  // CLOUDFLARE WORKERS / EXPRESS REST API (11 D1 TABLES IMPLEMENTATION)
  // =========================================================================

  // Health & Architecture Status
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      stack: 'Cloudflare D1 (SQLite) + Workers API + R2 + PWA',
      timestamp: new Date().toISOString(),
    });
  });

  // Full Database Snapshot (For Backups / D1 Migration)
  app.get('/api/d1/snapshot', (_req, res) => {
    res.json(db.getSnapshot());
  });

  // 1. Users
  app.get('/api/user/:id', (req, res) => {
    const user = db.getUser(req.params.id);
    res.json(user);
  });

  app.get('/api/user/by-phone/:phone', (req, res) => {
    const user = db.getUserByPhone(req.params.phone);
    res.json(user || { ok: false, error: 'User not found' });
  });

  app.post('/api/user/sync', (req, res) => {
    try {
      const saved = db.saveUser(req.body);
      res.json({ ok: true, user: saved });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  });

  // 2. Tasks
  app.get('/api/tasks', (_req, res) => {
    res.json(db.getTasks());
  });

  app.get('/api/admin/tasks', (_req, res) => {
    res.json(db.getAllTasksAdmin());
  });

  app.post('/api/admin/tasks', (req, res) => {
    const updated = db.saveTask(req.body);
    res.json({ ok: true, tasks: updated });
  });

  app.delete('/api/admin/tasks/:id', (req, res) => {
    db.deleteTask(req.params.id);
    res.json({ ok: true });
  });

  // 3. Task Submissions (Screenshots / Proofs)
  app.post('/api/tasks/:id/submit', (req, res) => {
    try {
      const { userId, proofFileId } = req.body;
      if (!userId) return res.status(400).json({ ok: false, error: 'User ID is required' });
      const sub = db.submitTaskProof(userId, req.params.id, proofFileId);
      res.json({ ok: true, submission: sub });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  });

  app.get('/api/admin/submissions', (_req, res) => {
    const snapshot = db.getSnapshot();
    res.json(snapshot.task_submissions);
  });

  app.get('/api/submissions/:userId', (req, res) => {
    const snapshot = db.getSnapshot();
    const subs = snapshot.task_submissions.filter((s) => s.user_id === req.params.userId);
    res.json(subs);
  });

  app.get('/api/submissions/user/:userId', (req, res) => {
    const snapshot = db.getSnapshot();
    const subs = snapshot.task_submissions.filter((s) => s.user_id === req.params.userId);
    res.json(subs);
  });

  app.post('/api/admin/submissions/:id/approve', (req, res) => {
    const approved = db.approveSubmission(req.params.id, req.body.adminNote);
    if (!approved) return res.status(404).json({ ok: false, error: 'Submission not found or already reviewed' });
    res.json({ ok: true, submission: approved });
  });

  app.post('/api/admin/submissions/:id/reject', (req, res) => {
    const rejected = db.rejectSubmission(req.params.id, req.body.reason);
    if (!rejected) return res.status(404).json({ ok: false, error: 'Submission not found or already reviewed' });
    res.json({ ok: true, submission: rejected });
  });

  // 4. Wallets & Ledger
  app.get('/api/wallet/:userId', (req, res) => {
    const wallet = db.getWallet(req.params.userId);
    res.json(wallet);
  });

  app.post('/api/wallet/:userId/sync', (req, res) => {
    try {
      const synced = db.syncWallet(req.params.userId, req.body);
      res.json({ ok: true, wallet: synced });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  });

  app.get('/api/ledger/:userId', (req, res) => {
    const snapshot = db.getSnapshot();
    const ledger = snapshot.ledger.filter((l) => l.user_id === req.params.userId);
    res.json(ledger);
  });

  // 5. Spin History & Reward
  app.post('/api/spin', (req, res) => {
    const { userId, amount } = req.body;
    if (!userId) return res.status(400).json({ ok: false, error: 'User ID is required' });
    const result = db.recordSpinReward(userId, Number(amount));
    res.json(result);
  });

  // 6. Scratch History & Reward
  app.post('/api/scratch', (req, res) => {
    const { userId, amount } = req.body;
    if (!userId) return res.status(400).json({ ok: false, error: 'User ID is required' });
    const result = db.recordScratchReward(userId, Number(amount));
    res.json(result);
  });

  // 7. Daily Bonus
  app.post('/api/daily-bonus', (req, res) => {
    const { userId, amount } = req.body;
    if (!userId) return res.status(400).json({ ok: false, error: 'User ID is required' });
    const result = db.claimDailyBonus(userId, amount ? Number(amount) : 0.50);
    res.json(result);
  });

  // 8. Referrals
  app.get('/api/referrals/:userId', (req, res) => {
    const snapshot = db.getSnapshot();
    const refs = snapshot.referrals.filter((r) => r.referrer_id === req.params.userId);
    res.json(refs);
  });

  // 9. Withdrawals
  app.get('/api/withdrawals/:userId', (req, res) => {
    const snapshot = db.getSnapshot();
    const wdrs = snapshot.withdrawals.filter((w) => w.user_id === req.params.userId);
    res.json(wdrs);
  });

  app.post('/api/withdraw', (req, res) => {
    const result = db.requestWithdrawal(req.body);
    if (!result.ok) return res.status(400).json(result);
    res.json(result);
  });

  app.get('/api/admin/withdrawals', (_req, res) => {
    const snapshot = db.getSnapshot();
    res.json(snapshot.withdrawals);
  });

  app.post('/api/admin/withdrawals/:id/pay', (req, res) => {
    const paid = db.markWithdrawalPaid(req.params.id, req.body.utr || `UTR${Date.now()}`);
    if (!paid) return res.status(404).json({ ok: false, error: 'Withdrawal not found' });
    res.json({ ok: true, withdrawal: paid });
  });

  app.post('/api/admin/withdrawals/:id/reject', (req, res) => {
    const rejected = db.rejectWithdrawal(req.params.id, req.body.reason || 'Invalid payment details');
    if (!rejected) return res.status(404).json({ ok: false, error: 'Withdrawal not found' });
    res.json({ ok: true, withdrawal: rejected });
  });

  // 10. Admin Stats Overview
  app.get('/api/admin/stats', (_req, res) => {
    const snapshot = db.getSnapshot();
    const pendingSubs = snapshot.task_submissions.filter((s) => s.status === 'pending').length;
    const pendingWdrs = snapshot.withdrawals.filter((w) => w.status === 'pending').length;
    const totalUsers = snapshot.users.length;
    const totalPayouts = snapshot.withdrawals
      .filter((w) => w.status === 'approved')
      .reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      totalUsers,
      pendingSubmissions: pendingSubs,
      pendingWithdrawals: pendingWdrs,
      totalPayoutsDistributed: totalPayouts,
      totalActiveTasks: snapshot.tasks.filter((t) => t.status === 'active').length,
    });
  });

  // Spin & Scratch Daily Counts
  app.get('/api/spin-count/:userId', (req, res) => {
    const today = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const used = db.getSnapshot().spin_history.filter((s) => s.user_id === req.params.userId && (s.created_at || '').slice(0, 10) === today).length;
    res.json({ usedToday: used, remaining: Math.max(0, 3 - used) });
  });

  app.get('/api/scratch-count/:userId', (req, res) => {
    const today = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const used = db.getSnapshot().scratch_history.filter((s) => s.user_id === req.params.userId && (s.created_at || '').slice(0, 10) === today).length;
    res.json({ usedToday: used, remaining: Math.max(0, 3 - used) });
  });

  app.get('/api/daily-status/:userId', (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const row = db.getSnapshot().daily_bonus.find((d) => d.user_id === req.params.userId && d.claim_date === today);
    res.json({ claimedToday: !!row });
  });

  // Notices
  app.get('/api/notices', (_req, res) => {
    res.json((db.getSnapshot() as any).notices || []);
  });

  // Admin users list
  app.get('/api/admin/users', (_req, res) => {
    res.json(db.getSnapshot().users);
  });

  // User Upsert
  app.post('/api/users/upsert', (req, res) => {
    try {
      const saved = db.saveUser(req.body);
      res.json({ ok: true, user: saved });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  });

  // =========================================================================
  // VITE / STATIC SERVING
  // =========================================================================
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KamaoNow Cloudflare Workers/D1 Emulated Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
