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

  // 3. GET WALLET FOR USER
  if (pathname.startsWith('/api/wallet/') && method === 'GET') {
    const userId = pathname.split('/').pop() || 'usr-demo-001';
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
    const userId = pathname.split('/').pop() || 'usr-demo-001';
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
      const userId = body.userId || 'usr-demo-001';
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

  // 6. RECORD SPIN REWARD
  if (pathname === '/api/spin' && method === 'POST') {
    try {
      const body: any = await request.json();
      const userId = body.userId || 'usr-demo-001';
      const amount = Number(body.amount);

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

      return json({ ok: true });
    } catch (e: any) {
      return json({ ok: false, error: e.message }, 500);
    }
  }

  // 7. RECORD SCRATCH REWARD
  if (pathname === '/api/scratch' && method === 'POST') {
    try {
      const body: any = await request.json();
      const userId = body.userId || 'usr-demo-001';
      const amount = Number(body.amount);

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

      return json({ ok: true });
    } catch (e: any) {
      return json({ ok: false, error: e.message }, 500);
    }
  }

  // 8. CLAIM DAILY BONUS
  if (pathname === '/api/daily-bonus' && method === 'POST') {
    try {
      const body: any = await request.json();
      const userId = body.userId || 'usr-demo-001';
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

  return json({ error: 'Endpoint not found' }, 404);
};
