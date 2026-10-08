// =========================================================================
// Cloudflare Pages Functions (Edge Worker for Cloudflare D1 & R2)
// This file executes natively on Cloudflare Workers edge network
// Binding: env.DB (Cloudflare D1 Database)
// Binding: env.BUCKET (Cloudflare R2 Bucket for Screenshot Proofs)
// =========================================================================

interface Env {
  DB: D1Database;
  BUCKET?: R2Bucket;
}

interface D1Database {
  prepare: (query: string) => D1PreparedStatement;
  batch: (statements: D1PreparedStatement[]) => Promise<D1Result[]>;
  exec: (query: string) => Promise<D1ExecResult>;
}

interface D1PreparedStatement {
  bind: (...values: any[]) => D1PreparedStatement;
  all: <T = any>() => Promise<D1Result<T>>;
  first: <T = any>(colName?: string) => Promise<T | null>;
  run: () => Promise<D1Result>;
}

interface D1Result<T = any> {
  results?: T[];
  success: boolean;
  meta?: any;
  error?: string;
}

interface D1ExecResult {
  count: number;
  duration: number;
}

interface R2Bucket {
  put: (key: string, value: any, options?: any) => Promise<any>;
  get: (key: string) => Promise<any>;
  delete: (key: string) => Promise<any>;
}

type PagesFunction<T = any> = (context: {
  request: Request;
  env: T;
  params?: Record<string, string | string[]>;
  data?: Record<string, unknown>;
  next?: () => Promise<Response>;
  waitUntil?: (promise: Promise<unknown>) => void;
}) => Promise<Response> | Response;

// Universal response helper with CORS
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // 1. HEALTH CHECK
  if (pathname === '/api/health') {
    return json({
      status: 'ok',
      engine: 'Cloudflare Pages Functions + D1 + R2',
      timestamp: new Date().toISOString(),
    });
  }

  // 1B. APP VERSION (Bug 4 Fix)
  if (pathname === '/api/version' && method === 'GET') {
    const res = json({
      version: '2.5.1',
      buildId: 'kamaonow-v2.5.1',
      timestamp: 1728374400000,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return res;
  }

  // 1C. ADMIN STATS (Bug 4 Fix)
  if (pathname === '/api/admin/stats' && method === 'GET') {
    try {
      const [usersCount, subsCount, wdrsCount, tasksCount]: any[] = await Promise.all([
        env.DB.prepare('SELECT COUNT(*) as count FROM users').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM task_submissions WHERE status = "pending"').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM withdrawals WHERE status = "pending"').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM tasks WHERE status = "active"').first(),
      ]);
      return json({
        totalUsers: usersCount?.count || 0,
        pendingSubmissions: subsCount?.count || 0,
        pendingWithdrawals: wdrsCount?.count || 0,
        totalActiveTasks: tasksCount?.count || 0,
      });
    } catch (e: any) {
      return json({ error: e.message }, 500);
    }
  }

  // 2. GET ACTIVE TASKS
  if (pathname === '/api/tasks' && method === 'GET') {
    try {
      const res = await env.DB.prepare(
        'SELECT * FROM tasks WHERE status = "active" ORDER BY created_at DESC'
      ).all();
      const tasks = (res.results || []).map((t: any) => ({
        ...t,
        instructions: typeof t.instructions === 'string' ? JSON.parse(t.instructions) : t.instructions,
      }));
      return json(tasks);
    } catch (e: any) {
      return json({ error: e.message }, 500);
    }
  }

  // 2B. GET ALL TASKS FOR ADMIN (Bug 4 Fix)
  if (pathname === '/api/admin/tasks' && method === 'GET') {
    try {
      const res = await env.DB.prepare('SELECT * FROM tasks WHERE status != "deleted" ORDER BY created_at DESC').all();
      const tasks = (res.results || []).map((t: any) => ({
        ...t,
        is_active: t.status === 'active' || t.is_active === 1,
        is_top_offer: Boolean(t.is_top_offer),
        is_trending: Boolean(t.is_trending),
        is_admin_created: true,
        instructions: typeof t.instructions === 'string' ? JSON.parse(t.instructions) : (t.instructions || []),
      }));
      return json(tasks);
    } catch (e: any) {
      return json({ error: e.message }, 500);
    }
  }

  // 3. GET WALLET FOR USER
  if (pathname.startsWith('/api/wallet/') && method === 'GET') {
    const userId = pathname.split('/').pop();
    if (!userId) return json({ error: 'User ID is required' }, 400);
    try {
      let wallet = await env.DB.prepare('SELECT * FROM wallets WHERE user_id = ?')
        .bind(userId)
        .first();

      if (!wallet) {
        const newId = `wal-${Date.now()}`;
        await env.DB.prepare(
          'INSERT INTO wallets (id, user_id, available_balance, pending_balance, lifetime_earned, lifetime_withdrawn) VALUES (?, ?, 0, 0, 0, 0)'
        )
          .bind(newId, userId)
          .run();
        wallet = { id: newId, user_id: userId, available_balance: 0, pending_balance: 0, lifetime_earned: 0, lifetime_withdrawn: 0 };
      }
      return json(wallet);
    } catch (e: any) {
      return json({ error: e.message }, 500);
    }
  }

  // 4. GET LEDGER FOR USER
  if (pathname.startsWith('/api/ledger/') && method === 'GET') {
    const userId = pathname.split('/').pop();
    if (!userId) return json({ error: 'User ID is required' }, 400);
    try {
      const res = await env.DB.prepare(
        'SELECT * FROM ledger WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
      )
        .bind(userId)
        .all();
      return json(res.results || []);
    } catch (e: any) {
      return json({ error: e.message }, 500);
    }
  }

  // 5. SUBMIT TASK PROOF (Supports Cloudflare R2 Upload)
  if (pathname.startsWith('/api/tasks/') && pathname.endsWith('/submit') && method === 'POST') {
    try {
      const parts = pathname.split('/');
      const taskId = parts[parts.length - 2];
      const body: any = await request.json();
      const userId = body.userId;
      if (!userId) return json({ ok: false, error: 'User ID is required' }, 400);
      let proofFileId = body.proofFileId;

      // Optional: Store Base64 screenshot into Cloudflare R2
      if (env.BUCKET && proofFileId && proofFileId.startsWith('data:image')) {
        const fileKey = `proofs/${userId}/${taskId}-${Date.now()}.png`;
        const base64Data = proofFileId.split(',')[1];
        const binary = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        await env.BUCKET.put(fileKey, binary, { httpMetadata: { contentType: 'image/png' } });
        proofFileId = `/api/r2/file/${fileKey}`;
      }

      const task: any = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(taskId).first();
      const user: any = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();

      if (!task) return json({ ok: false, error: 'Task not found' }, 404);

      const subId = `sub-${Date.now()}`;
      await env.DB.prepare(
        `INSERT INTO task_submissions (id, user_id, user_name, user_phone, task_id, task_title, reward_amount, proof_file_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
      )
        .bind(
          subId,
          userId,
          user?.name || 'User',
          user?.phone || '',
          taskId,
          task.title,
          task.reward_amount,
          proofFileId
        )
        .run();

      // Update pending balance in wallet
      await env.DB.prepare(
        'UPDATE wallets SET pending_balance = pending_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
      )
        .bind(task.reward_amount, userId)
        .run();

      return json({ ok: true, submissionId: subId });
    } catch (e: any) {
      return json({ ok: false, error: e.message }, 500);
    }
  }

  // 6. RECORD SPIN REWARD (D1 server-side daily 3 limit check)
  if (pathname === '/api/spin' && method === 'POST') {
    try {
      const body: any = await request.json();
      const userId = body.userId;
      if (!userId) return json({ ok: false, error: 'User ID is required' }, 400);
      const amount = Number(body.amount);
      const DAILY_SPIN_LIMIT = 3;

      // D1 se aaj ke spins count karo (Indian timezone: UTC+5:30)
      const todayIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const countRow: any = await env.DB.prepare(
        "SELECT COUNT(*) as cnt FROM spin_history WHERE user_id = ? AND date(created_at, '+5 hours 30 minutes') = ?"
      )
        .bind(userId, todayIST)
        .first();

      const usedToday = countRow?.cnt ?? 0;
      if (usedToday >= DAILY_SPIN_LIMIT) {
        return json({ ok: false, error: `Aaj ke ${DAILY_SPIN_LIMIT} free spins complete ho gaye. Kal wapas aao!`, limitReached: true }, 429);
      }

      const remaining = DAILY_SPIN_LIMIT - usedToday - 1;

      await env.DB.prepare(
        'INSERT INTO spin_history (id, user_id, reward_amount) VALUES (?, ?, ?)'
      )
        .bind(`spin-${Date.now()}`, userId, amount)
        .run();

      await env.DB.prepare(
        'UPDATE wallets SET available_balance = available_balance + ?, lifetime_earned = lifetime_earned + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
      )
        .bind(amount, amount, userId)
        .run();

      await env.DB.prepare(
        'INSERT INTO ledger (id, user_id, type, amount, status, description) VALUES (?, ?, "spin_reward", ?, "credit", ?)'
      )
        .bind(`led-${Date.now()}`, userId, amount, `Fortune Spin Win: ₹${amount.toFixed(2)}`)
        .run();

      return json({ ok: true, remaining, usedToday: usedToday + 1, dailyLimit: DAILY_SPIN_LIMIT });
    } catch (e: any) {
      return json({ ok: false, error: e.message }, 500);
    }
  }

  // 7. RECORD SCRATCH REWARD (D1 server-side daily 3 limit check)
  if (pathname === '/api/scratch' && method === 'POST') {
    try {
      const body: any = await request.json();
      const userId = body.userId;
      if (!userId) return json({ ok: false, error: 'User ID is required' }, 400);
      const amount = Number(body.amount);
      const DAILY_SCRATCH_LIMIT = 3;

      // D1 se aaj ke scratches count karo (Indian timezone: UTC+5:30)
      const todayIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const countRow: any = await env.DB.prepare(
        "SELECT COUNT(*) as cnt FROM scratch_history WHERE user_id = ? AND date(created_at, '+5 hours 30 minutes') = ?"
      )
        .bind(userId, todayIST)
        .first();

      const usedToday = countRow?.cnt ?? 0;
      if (usedToday >= DAILY_SCRATCH_LIMIT) {
        return json({ ok: false, error: `Aaj ke ${DAILY_SCRATCH_LIMIT} free scratch cards complete ho gaye. Kal wapas aao!`, limitReached: true }, 429);
      }

      const remaining = DAILY_SCRATCH_LIMIT - usedToday - 1;

      await env.DB.prepare(
        'INSERT INTO scratch_history (id, user_id, reward_amount) VALUES (?, ?, ?)'
      )
        .bind(`sc-${Date.now()}`, userId, amount)
        .run();

      await env.DB.prepare(
        'UPDATE wallets SET available_balance = available_balance + ?, lifetime_earned = lifetime_earned + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
      )
        .bind(amount, amount, userId)
        .run();

      await env.DB.prepare(
        'INSERT INTO ledger (id, user_id, type, amount, status, description) VALUES (?, ?, "scratch_reward", ?, "credit", ?)'
      )
        .bind(`led-${Date.now()}`, userId, amount, `Scratch Card Win: ₹${amount.toFixed(2)}`)
        .run();

      return json({ ok: true, remaining, usedToday: usedToday + 1, dailyLimit: DAILY_SCRATCH_LIMIT });
    } catch (e: any) {
      return json({ ok: false, error: e.message }, 500);
    }
  }

  // 8. CLAIM DAILY BONUS
  if (pathname === '/api/daily-bonus' && method === 'POST') {
    try {
      const body: any = await request.json();
      const userId = body.userId;
      if (!userId) return json({ ok: false, error: 'User ID is required' }, 400);
      const amount = 0.50;
      const today = new Date().toISOString().slice(0, 10);

      const existing = await env.DB.prepare(
        'SELECT id FROM daily_bonus WHERE user_id = ? AND claim_date = ?'
      )
        .bind(userId, today)
        .first();

      if (existing) {
        return json({ ok: false, error: 'Already claimed today' }, 400);
      }

      await env.DB.prepare(
        'INSERT INTO daily_bonus (id, user_id, amount, claim_date) VALUES (?, ?, ?, ?)'
      )
        .bind(`db-${Date.now()}`, userId, amount, today)
        .run();

      await env.DB.prepare(
        'UPDATE wallets SET available_balance = available_balance + ?, lifetime_earned = lifetime_earned + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
      )
        .bind(amount, amount, userId)
        .run();

      await env.DB.prepare(
        'INSERT INTO ledger (id, user_id, type, amount, status, description) VALUES (?, ?, "daily_bonus", ?, "credit", "Daily Check-in Bonus: ₹0.50")'
      )
        .bind(`led-${Date.now()}`, userId, amount)
        .run();

      return json({ ok: true });
    } catch (e: any) {
      return json({ ok: false, error: e.message }, 500);
    }
  }

  // 9. REQUEST WITHDRAWAL
  if (pathname === '/api/withdraw' && method === 'POST') {
    try {
      const body: any = await request.json();
      const { userId, amount, method: wdrMethod, upiId, bankAccount, bankIfsc } = body;

      const wallet: any = await env.DB.prepare('SELECT available_balance FROM wallets WHERE user_id = ?')
        .bind(userId)
        .first();

      if (!wallet || wallet.available_balance < amount) {
        return json({ ok: false, error: 'Insufficient balance' }, 400);
      }

      const user: any = await env.DB.prepare('SELECT name, phone FROM users WHERE id = ?').bind(userId).first();
      const wdrId = `wdr-${Date.now()}`;

      await env.DB.prepare(
        `INSERT INTO withdrawals (id, user_id, user_name, user_phone, amount, method, upi_id, bank_account, bank_ifsc, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
      )
        .bind(
          wdrId,
          userId,
          user?.name || 'User',
          user?.phone || '',
          amount,
          wdrMethod,
          upiId || null,
          bankAccount || null,
          bankIfsc || null
        )
        .run();

      await env.DB.prepare(
        'UPDATE wallets SET available_balance = available_balance - ?, pending_balance = pending_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
      )
        .bind(amount, amount, userId)
        .run();

      await env.DB.prepare(
        'INSERT INTO ledger (id, user_id, type, amount, status, reference_id, description) VALUES (?, ?, "withdrawal", ?, "debit", ?, ?)'
      )
        .bind(
          `led-${Date.now()}`,
          userId,
          amount,
          wdrId,
          `Withdrawal Request via ${wdrMethod} (${upiId || bankAccount})`
        )
        .run();

      return json({ ok: true, withdrawalId: wdrId });
    } catch (e: any) {
      return json({ ok: false, error: e.message }, 500);
    }
  }

  // 10. ADMIN APPROVE PROOF
  if (pathname.startsWith('/api/admin/submissions/') && pathname.endsWith('/approve') && method === 'POST') {
    try {
      const parts = pathname.split('/');
      const subId = parts[parts.length - 2];
      const body: any = await request.json().catch(() => ({}));
      const adminNote = body.adminNote || 'Verified and approved by admin.';

      const sub: any = await env.DB.prepare('SELECT * FROM task_submissions WHERE id = ? AND status = "pending"')
        .bind(subId)
        .first();

      if (!sub) return json({ ok: false, error: 'Submission not pending or not found' }, 404);

      await env.DB.prepare(
        'UPDATE task_submissions SET status = "approved", admin_note = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?'
      )
        .bind(adminNote, subId)
        .run();

      await env.DB.prepare(
        'UPDATE wallets SET pending_balance = MAX(0, pending_balance - ?), available_balance = available_balance + ?, lifetime_earned = lifetime_earned + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
      )
        .bind(sub.reward_amount, sub.reward_amount, sub.reward_amount, sub.user_id)
        .run();

      await env.DB.prepare(
        'INSERT INTO ledger (id, user_id, type, amount, status, reference_id, description) VALUES (?, ?, "task_reward", ?, "credit", ?, ?)'
      )
        .bind(`led-${Date.now()}`, sub.user_id, sub.reward_amount, sub.task_id, `Task Approved: ${sub.task_title}`)
        .run();

      // Check referral qualification
      const ref: any = await env.DB.prepare(
        'SELECT * FROM referrals WHERE referred_user_id = ? AND status = "pending"'
      )
        .bind(sub.user_id)
        .first();

      if (ref) {
        await env.DB.prepare(
          'UPDATE referrals SET status = "qualified", qualified_at = CURRENT_TIMESTAMP WHERE id = ?'
        )
          .bind(ref.id)
          .run();

        await env.DB.prepare(
          'UPDATE wallets SET available_balance = available_balance + ?, lifetime_earned = lifetime_earned + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
        )
          .bind(ref.reward_amount, ref.reward_amount, ref.referrer_id)
          .run();

        await env.DB.prepare(
          'INSERT INTO ledger (id, user_id, type, amount, status, reference_id, description) VALUES (?, ?, "referral_bonus", ?, "credit", ?, "Referral Qualified: Friend completed 1st task")'
        )
          .bind(`led-${Date.now()}`, ref.referrer_id, ref.reward_amount, ref.id)
          .run();
      }

      return json({ ok: true });
    } catch (e: any) {
      return json({ ok: false, error: e.message }, 500);
    }
  }

  // 11. ADMIN PAY WITHDRAWAL
  if (pathname.startsWith('/api/admin/withdrawals/') && pathname.endsWith('/pay') && method === 'POST') {
    try {
      const parts = pathname.split('/');
      const wdrId = parts[parts.length - 2];
      const body: any = await request.json().catch(() => ({}));
      const utr = body.utr || `UTR${Date.now()}`;

      const wdr: any = await env.DB.prepare('SELECT * FROM withdrawals WHERE id = ? AND status = "pending"')
        .bind(wdrId)
        .first();

      if (!wdr) return json({ ok: false, error: 'Withdrawal not found' }, 404);

      await env.DB.prepare(
        'UPDATE withdrawals SET status = "approved", utr = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?'
      )
        .bind(utr, wdrId)
        .run();

      await env.DB.prepare(
        'UPDATE wallets SET pending_balance = MAX(0, pending_balance - ?), lifetime_withdrawn = lifetime_withdrawn + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
      )
        .bind(wdr.amount, wdr.amount, wdr.user_id)
        .run();

      return json({ ok: true, utr });
    } catch (e: any) {
      return json({ ok: false, error: e.message }, 500);
    }
  }

  // 12. GET SUBMISSIONS FOR USER
  if (pathname.startsWith('/api/submissions/') && method === 'GET') {
    const userId = pathname.split('/').pop()!;
    try {
      const res = await env.DB.prepare(
        'SELECT * FROM task_submissions WHERE user_id = ? ORDER BY submitted_at DESC'
      ).bind(userId).all();
      return json(res.results || []);
    } catch (e: any) { return json({ error: e.message }, 500); }
  }

  // 13. GET ALL SUBMISSIONS (Admin)
  if (pathname === '/api/admin/submissions' && method === 'GET') {
    try {
      const res = await env.DB.prepare(
        'SELECT * FROM task_submissions ORDER BY submitted_at DESC LIMIT 200'
      ).all();
      return json(res.results || []);
    } catch (e: any) { return json({ error: e.message }, 500); }
  }

  // 14. GET WITHDRAWALS FOR USER
  if (pathname.startsWith('/api/withdrawals/') && method === 'GET') {
    const userId = pathname.split('/').pop()!;
    try {
      const res = await env.DB.prepare(
        'SELECT * FROM withdrawals WHERE user_id = ? ORDER BY requested_at DESC'
      ).bind(userId).all();
      return json(res.results || []);
    } catch (e: any) { return json({ error: e.message }, 500); }
  }

  // 15. GET ALL WITHDRAWALS (Admin)
  if (pathname === '/api/admin/withdrawals' && method === 'GET') {
    try {
      const res = await env.DB.prepare(
        'SELECT * FROM withdrawals ORDER BY requested_at DESC LIMIT 200'
      ).all();
      return json(res.results || []);
    } catch (e: any) { return json({ error: e.message }, 500); }
  }

  // 16. GET REFERRALS FOR USER
  if (pathname.startsWith('/api/referrals/') && method === 'GET') {
    const userId = pathname.split('/').pop()!;
    try {
      const res = await env.DB.prepare(
        'SELECT * FROM referrals WHERE referrer_id = ? ORDER BY created_at DESC'
      ).bind(userId).all();
      return json(res.results || []);
    } catch (e: any) { return json({ error: e.message }, 500); }
  }

  // 17. SPIN COUNT TODAY
  if (pathname.startsWith('/api/spin-count/') && method === 'GET') {
    const userId = pathname.split('/').pop()!;
    const date = url.searchParams.get('date') || new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
    try {
      const row: any = await env.DB.prepare(
        "SELECT COUNT(*) as cnt FROM spin_history WHERE user_id = ? AND date(created_at, '+5 hours 30 minutes') = ?"
      ).bind(userId, date).first();
      return json({ usedToday: row?.cnt ?? 0, remaining: Math.max(0, 3 - (row?.cnt ?? 0)) });
    } catch (e: any) { return json({ usedToday: 0, remaining: 3 }); }
  }

  // 18. SCRATCH COUNT TODAY
  if (pathname.startsWith('/api/scratch-count/') && method === 'GET') {
    const userId = pathname.split('/').pop()!;
    const date = url.searchParams.get('date') || new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
    try {
      const row: any = await env.DB.prepare(
        "SELECT COUNT(*) as cnt FROM scratch_history WHERE user_id = ? AND date(created_at, '+5 hours 30 minutes') = ?"
      ).bind(userId, date).first();
      return json({ usedToday: row?.cnt ?? 0, remaining: Math.max(0, 3 - (row?.cnt ?? 0)) });
    } catch (e: any) { return json({ usedToday: 0, remaining: 3 }); }
  }

  // 19. DAILY BONUS STATUS
  if (pathname.startsWith('/api/daily-status/') && method === 'GET') {
    const userId = pathname.split('/').pop()!;
    const today = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
    try {
      const row = await env.DB.prepare(
        'SELECT id FROM daily_bonus WHERE user_id = ? AND claim_date = ?'
      ).bind(userId, today).first();
      return json({ claimedToday: !!row });
    } catch { return json({ claimedToday: false }); }
  }

  // 20. GET NOTICES (active only)
  if (pathname === '/api/notices' && method === 'GET') {
    try {
      const res = await env.DB.prepare(
        'SELECT * FROM notices WHERE is_active = 1 ORDER BY created_at DESC LIMIT 20'
      ).all();
      return json(res.results || []);
    } catch (e: any) { return json([]); }
  }

  // 21. SAVE NOTICE (Admin)
  if (pathname === '/api/admin/notices' && method === 'POST') {
    try {
      const body: any = await request.json();
      if (body.id) {
        await env.DB.prepare(
          'UPDATE notices SET title=?, message=?, type=?, is_active=? WHERE id=?'
        ).bind(body.title, body.message, body.type || 'success', body.is_active ? 1 : 0, body.id).run();
      } else {
        const id = `notice-${Date.now()}`;
        await env.DB.prepare(
          'INSERT INTO notices (id, title, message, type, is_active, author) VALUES (?, ?, ?, ?, 1, "Admin")'
        ).bind(id, body.title, body.message, body.type || 'success').run();
      }
      return json({ ok: true });
    } catch (e: any) { return json({ ok: false, error: e.message }, 500); }
  }

  // 22. DELETE NOTICE (Admin)
  if (pathname.startsWith('/api/admin/notices/') && method === 'DELETE') {
    const noticeId = pathname.split('/').pop()!;
    try {
      await env.DB.prepare('DELETE FROM notices WHERE id = ?').bind(noticeId).run();
      return json({ ok: true });
    } catch (e: any) { return json({ ok: false, error: e.message }, 500); }
  }

  // 22B. TOGGLE NOTICE ACTIVE (Admin)
  if (pathname.startsWith('/api/admin/notices/') && pathname.endsWith('/toggle') && method === 'POST') {
    const parts = pathname.split('/');
    const noticeId = parts[parts.length - 2];
    try {
      const notice: any = await env.DB.prepare('SELECT is_active FROM notices WHERE id=?').bind(noticeId).first();
      const newVal = notice?.is_active ? 0 : 1;
      await env.DB.prepare('UPDATE notices SET is_active=? WHERE id=?').bind(newVal, noticeId).run();
      return json({ ok: true, is_active: !!newVal });
    } catch (e: any) { return json({ ok: false, error: e.message }, 500); }
  }

  // 23. SAVE TASK (Admin create/update)
  if (pathname === '/api/admin/tasks' && method === 'POST') {
    try {
      const body: any = await request.json();
      if (body.id) {
        await env.DB.prepare(
          `UPDATE tasks SET title=?, subtitle=?, description=?, category=?, reward_amount=?,
           instructions=?, partner_url=?, icon_label=?, icon_bg=?, image_url=?,
           is_active=?, is_top_offer=?, is_trending=? WHERE id=?`
        ).bind(
          body.title, body.subtitle, body.description, body.category,
          body.reward_amount, JSON.stringify(body.instructions || []),
          body.partner_url, body.icon_label, body.icon_bg, body.image_url || '',
          body.is_active ? 1 : 0, body.is_top_offer ? 1 : 0, body.is_trending ? 1 : 0,
          body.id
        ).run();
      } else {
        const id = `task-admin-${Date.now()}`;
        await env.DB.prepare(
          `INSERT INTO tasks (id, title, subtitle, description, category, reward_amount,
           instructions, partner_url, icon_label, icon_bg, image_url, is_active,
           is_top_offer, is_trending, created_by, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 'admin', 'active')`
        ).bind(
          id, body.title, body.subtitle, body.description, body.category,
          body.reward_amount, JSON.stringify(body.instructions || []),
          body.partner_url, body.icon_label || 'NEW', body.icon_bg || '#059669',
          body.image_url || '', body.is_top_offer ? 1 : 0, body.is_trending ? 1 : 0
        ).run();
      }
      return json({ ok: true });
    } catch (e: any) { return json({ ok: false, error: e.message }, 500); }
  }

  // 24. DELETE TASK (Admin)
  if (pathname.startsWith('/api/admin/tasks/') && method === 'DELETE') {
    const taskId = pathname.split('/').pop()!;
    try {
      await env.DB.prepare("UPDATE tasks SET status='deleted', is_active=0 WHERE id=?").bind(taskId).run();
      return json({ ok: true });
    } catch (e: any) { return json({ ok: false, error: e.message }, 500); }
  }

  // 25. TOGGLE TASK ACTIVE (Admin)
  if (pathname.startsWith('/api/admin/tasks/') && pathname.endsWith('/toggle') && method === 'POST') {
    const taskId = pathname.split('/')[pathname.split('/').length - 2];
    try {
      const task: any = await env.DB.prepare('SELECT is_active FROM tasks WHERE id=?').bind(taskId).first();
      const newVal = task?.is_active ? 0 : 1;
      await env.DB.prepare('UPDATE tasks SET is_active=? WHERE id=?').bind(newVal, taskId).run();
      return json({ ok: true, is_active: !!newVal });
    } catch (e: any) { return json({ ok: false, error: e.message }, 500); }
  }

  // 26. REJECT SUBMISSION (Admin)
  if (pathname.startsWith('/api/admin/submissions/') && pathname.endsWith('/reject') && method === 'POST') {
    try {
      const parts = pathname.split('/');
      const subId = parts[parts.length - 2];
      const body: any = await request.json().catch(() => ({}));
      const note = body.reason || 'Rejected by admin.';
      const sub: any = await env.DB.prepare('SELECT * FROM task_submissions WHERE id=? AND status="pending"')
        .bind(subId).first();
      if (!sub) return json({ ok: false, error: 'Not found' }, 404);
      await env.DB.prepare(
        'UPDATE task_submissions SET status="rejected", admin_note=?, proof_file_id="", reviewed_at=CURRENT_TIMESTAMP WHERE id=?'
      ).bind(note, subId).run();
      await env.DB.prepare(
        'UPDATE wallets SET pending_balance=MAX(0, pending_balance - ?), updated_at=CURRENT_TIMESTAMP WHERE user_id=?'
      ).bind(sub.reward_amount, sub.user_id).run();
      return json({ ok: true });
    } catch (e: any) { return json({ ok: false, error: e.message }, 500); }
  }

  // 27. REJECT WITHDRAWAL (Admin)
  if (pathname.startsWith('/api/admin/withdrawals/') && pathname.endsWith('/reject') && method === 'POST') {
    try {
      const parts = pathname.split('/');
      const wdrId = parts[parts.length - 2];
      const body: any = await request.json().catch(() => ({}));
      const reason = body.reason || 'Rejected by admin.';
      const wdr: any = await env.DB.prepare('SELECT * FROM withdrawals WHERE id=? AND status="pending"')
        .bind(wdrId).first();
      if (!wdr) return json({ ok: false, error: 'Not found' }, 404);
      await env.DB.prepare(
        'UPDATE withdrawals SET status="rejected", rejection_reason=?, processed_at=CURRENT_TIMESTAMP WHERE id=?'
      ).bind(reason, wdrId).run();
      await env.DB.prepare(
        'UPDATE wallets SET pending_balance=MAX(0, pending_balance - ?), available_balance=available_balance + ?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?'
      ).bind(wdr.amount, wdr.amount, wdr.user_id).run();
      return json({ ok: true });
    } catch (e: any) { return json({ ok: false, error: e.message }, 500); }
  }

  // 28. GET ALL USERS (Admin)
  if (pathname === '/api/admin/users' && method === 'GET') {
    try {
      const res = await env.DB.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT 500').all();
      return json(res.results || []);
    } catch (e: any) { return json([], 500); }
  }

  // 29. BLOCK/UNBLOCK USER (Admin)
  if (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/toggle-block') && method === 'POST') {
    const userId = pathname.split('/')[pathname.split('/').length - 2];
    try {
      const u: any = await env.DB.prepare('SELECT is_blocked FROM users WHERE id=?').bind(userId).first();
      const newVal = u?.is_blocked ? 0 : 1;
      await env.DB.prepare('UPDATE users SET is_blocked=? WHERE id=?').bind(newVal, userId).run();
      return json({ ok: true, is_blocked: !!newVal });
    } catch (e: any) { return json({ ok: false, error: e.message }, 500); }
  }

  // 30. ADMIN ADJUST BALANCE
  if (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/adjust') && method === 'POST') {
    const userId = pathname.split('/')[pathname.split('/').length - 2];
    try {
      const body: any = await request.json();
      const amount = Number(body.amount);
      const note = body.note || 'Admin adjustment';
      await env.DB.prepare(
        'UPDATE wallets SET available_balance=MAX(0, available_balance + ?), lifetime_earned=lifetime_earned + ?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?'
      ).bind(amount, amount > 0 ? amount : 0, userId).run();
      await env.DB.prepare(
        'INSERT INTO ledger (id, user_id, type, amount, status, description) VALUES (?, ?, "admin_adjust", ?, ?, ?)'
      ).bind(`led-${Date.now()}`, userId, Math.abs(amount), amount >= 0 ? 'credit' : 'debit', `Admin: ${note}`).run();
      return json({ ok: true });
    } catch (e: any) { return json({ ok: false, error: e.message }, 500); }
  }

  // 31. UPSERT USER (login ke baad user D1 mein save)
  if (pathname === '/api/users/upsert' && method === 'POST') {
    try {
      const body: any = await request.json();
      const existing = await env.DB.prepare('SELECT id FROM users WHERE id=?').bind(body.id).first();
      if (!existing) {
        await env.DB.prepare(
          `INSERT INTO users (id, name, email, phone, photo_url, referral_code, referred_by, is_blocked)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0)`
        ).bind(
          body.id, body.name, body.email || '', body.phone || '',
          body.photo_url || '', body.referral_code || '',
          body.referred_by || null
        ).run();
        // Wallet create karo
        await env.DB.prepare(
          'INSERT OR IGNORE INTO wallets (id, user_id, available_balance, pending_balance, lifetime_earned, lifetime_withdrawn) VALUES (?, ?, 0, 0, 0, 0)'
        ).bind(`wal-${body.id}`, body.id).run();
        // Referral record karo agar referred_by hai
        if (body.referred_by) {
          const referrer: any = await env.DB.prepare(
            'SELECT id FROM users WHERE referral_code=? OR id=?'
          ).bind(body.referred_by, body.referred_by).first();
          if (referrer) {
            await env.DB.prepare(
              `INSERT OR IGNORE INTO referrals (id, referrer_id, referred_user_id, referred_name, status, reward_amount)
               VALUES (?, ?, ?, ?, 'pending', 5.0)`
            ).bind(`ref-${Date.now()}`, referrer.id, body.id, body.name).run();
          }
        }
        return json({ ok: true, isNewUser: true });
      } else {
        await env.DB.prepare(
          'UPDATE users SET name=?, email=?, photo_url=? WHERE id=?'
        ).bind(body.name, body.email || '', body.photo_url || '', body.id).run();
        return json({ ok: true, isNewUser: false });
      }
    } catch (e: any) { return json({ ok: false, error: e.message }, 500); }
  }

  // 32. D1 SNAPSHOT (Admin stats)
  if (pathname === '/api/d1/snapshot' && method === 'GET') {
    try {
      const [users, wallets, subs, wdrs] = await env.DB.batch([
        env.DB.prepare('SELECT COUNT(*) as cnt FROM users'),
        env.DB.prepare('SELECT SUM(available_balance) as total FROM wallets'),
        env.DB.prepare('SELECT COUNT(*) as cnt FROM task_submissions WHERE status="pending"'),
        env.DB.prepare('SELECT COUNT(*) as cnt FROM withdrawals WHERE status="pending"'),
      ]);
      return json({
        totalUsers: (users.results?.[0] as any)?.cnt ?? 0,
        totalWalletBalance: (wallets.results?.[0] as any)?.total ?? 0,
        pendingSubmissions: (subs.results?.[0] as any)?.cnt ?? 0,
        pendingWithdrawals: (wdrs.results?.[0] as any)?.cnt ?? 0,
      });
    } catch (e: any) { return json({ error: e.message }, 500); }
  }

  return json({ error: 'Endpoint not found' }, 404);
};
