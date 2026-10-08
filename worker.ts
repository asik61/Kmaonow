// =========================================================================
// Cloudflare Worker Entry Point (Serving Static Assets + D1 Database API)
// =========================================================================

interface Env {
  DB: any;
  ASSETS?: any;
}

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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
        engine: 'Cloudflare Worker + D1 Database + Static Assets',
        timestamp: new Date().toISOString(),
      });
    }

    // App Version & Real-Time Auto-Update (Stable buildId to prevent reload loop)
    if (pathname === '/api/version') {
      const res = json({
        version: '2.5.1',
        buildId: 'kamaonow-v2.5.1',
        timestamp: 1728374400000,
      });
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      return res;
    }

    // 2. GET ACTIVE TASKS
    if (pathname === '/api/tasks' && method === 'GET') {
      try {
        const res = await env.DB.prepare(
          'SELECT * FROM tasks WHERE status = "active" ORDER BY created_at DESC'
        ).all();
        const tasks = (res.results || []).map((t: any) => {
          let parsedInstructions = t.instructions;
          if (typeof t.instructions === 'string') {
            try {
              parsedInstructions = JSON.parse(t.instructions);
            } catch {
              parsedInstructions = [t.instructions];
            }
          }
          return {
            ...t,
            is_active: t.status === 'active',
            is_top_offer: Boolean(t.is_top_offer),
            is_trending: Boolean(t.is_trending),
            is_admin_created: true,
            instructions: Array.isArray(parsedInstructions) ? parsedInstructions : (t.instructions ? [t.instructions] : []),
          };
        });
        return json(tasks);
      } catch (e: any) {
        return json({ error: e.message }, 500);
      }
    }

    // 2A. GET ALL TASKS FOR ADMIN (Active & Paused)
    if (pathname === '/api/admin/tasks' && method === 'GET') {
      try {
        const res = await env.DB.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
        const tasks = (res.results || []).map((t: any) => {
          let parsedInstructions = t.instructions;
          if (typeof t.instructions === 'string') {
            try {
              parsedInstructions = JSON.parse(t.instructions);
            } catch {
              parsedInstructions = [t.instructions];
            }
          }
          return {
            ...t,
            is_active: t.status === 'active',
            is_top_offer: Boolean(t.is_top_offer),
            is_trending: Boolean(t.is_trending),
            is_admin_created: true,
            instructions: Array.isArray(parsedInstructions) ? parsedInstructions : (t.instructions ? [t.instructions] : []),
          };
        });
        return json(tasks);
      } catch (e: any) {
        return json({ error: e.message }, 500);
      }
    }

    // 2B. CREATE OR UPDATE TASK (Admin D1 Persistence)
    if (pathname === '/api/admin/tasks' && method === 'POST') {
      try {
        const t: any = await request.json();
        const taskId = t.id || `task-admin-${Date.now()}`;
        const status = (t.is_active === false || t.status === 'paused') ? 'paused' : 'active';
        const instructions = JSON.stringify(
          Array.isArray(t.instructions) ? t.instructions : ['Install app', 'Complete registration', 'Upload proof']
        );

        await env.DB.prepare(
          `INSERT INTO tasks (id, title, subtitle, description, category, reward_amount, instructions, partner_url, image_url, icon_label, icon_bg, status, is_top_offer, is_trending)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             title = excluded.title,
             subtitle = excluded.subtitle,
             description = excluded.description,
             category = excluded.category,
             reward_amount = excluded.reward_amount,
             instructions = excluded.instructions,
             partner_url = excluded.partner_url,
             image_url = excluded.image_url,
             icon_label = excluded.icon_label,
             icon_bg = excluded.icon_bg,
             status = excluded.status,
             is_top_offer = excluded.is_top_offer,
             is_trending = excluded.is_trending`
        )
          .bind(
            taskId,
            t.title || 'New CPA Task',
            t.subtitle || 'Install & Register',
            t.description || 'Complete registration and submit proof.',
            t.category || 'Register',
            Number(t.reward_amount) || 50,
            instructions,
            t.partner_url || 'https://google.com',
            t.image_url || '',
            t.icon_label || 'TASK',
            t.icon_bg || '#059669',
            status,
            t.is_top_offer ? 1 : 0,
            t.is_trending ? 1 : 0
          )
          .run();

        return json({ ok: true, taskId });
      } catch (e: any) {
        return json({ ok: false, error: e.message }, 500);
      }
    }

    // 2C. TOGGLE TASK STATUS (Admin)
    if (pathname.startsWith('/api/admin/tasks/') && pathname.endsWith('/toggle') && method === 'POST') {
      const parts = pathname.split('/');
      const taskId = parts[parts.length - 2];
      try {
        const task: any = await env.DB.prepare('SELECT status FROM tasks WHERE id = ?').bind(taskId).first();
        if (!task) return json({ ok: false, error: 'Task not found' }, 404);
        const newStatus = task.status === 'active' ? 'paused' : 'active';
        await env.DB.prepare('UPDATE tasks SET status = ? WHERE id = ?').bind(newStatus, taskId).run();
        return json({ ok: true, status: newStatus });
      } catch (e: any) {
        return json({ ok: false, error: e.message }, 500);
      }
    }

    // 2D. DELETE TASK (Admin)
    if (pathname.startsWith('/api/admin/tasks/') && method === 'DELETE') {
      const taskId = pathname.split('/').pop() || '';
      try {
        await env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(taskId).run();
        return json({ ok: true });
      } catch (e: any) {
        return json({ ok: false, error: e.message }, 500);
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

    // 3A. USER LOOKUP BY PHONE (For Re-login after Clear Data / Reinstall)
    if (pathname.startsWith('/api/user/by-phone/') && method === 'GET') {
      const rawPhone = pathname.split('/').pop() || '';
      const clean = rawPhone.replace(/\D/g, '');
      try {
        const user = await env.DB.prepare(
          'SELECT * FROM users WHERE phone LIKE ? OR phone LIKE ?'
        )
          .bind(`%${clean}%`, clean)
          .first();
        if (user) return json(user);
        return json({ ok: false, error: 'User not found' }, 404);
      } catch (e: any) {
        return json({ error: e.message }, 500);
      }
    }

    // 3B. USER LOOKUP BY ID
    if (pathname.startsWith('/api/user/') && !pathname.includes('/sync') && !pathname.includes('/by-phone') && method === 'GET') {
      const userId = pathname.split('/').pop() || '';
      try {
        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
        if (user) return json(user);
        return json({ ok: false, error: 'User not found' }, 404);
      } catch (e: any) {
        return json({ error: e.message }, 500);
      }
    }

    // 3C. USER SYNC / UPSERT (Persistent User Database)
    if ((pathname === '/api/user/sync' || pathname === '/api/users/upsert') && method === 'POST') {
      try {
        const u: any = await request.json();
        const userId = u.id || `usr-${(u.phone || '').replace(/\D/g, '')}`;
        const refCode = u.referral_code || `RM${(u.phone || '').slice(-4)}`;
        await env.DB.prepare(
          `INSERT INTO users (id, name, phone, email, referral_code, referred_by, is_blocked, is_verified, role)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name = excluded.name,
             phone = COALESCE(excluded.phone, users.phone),
             email = COALESCE(excluded.email, users.email)`
        )
          .bind(
            userId,
            u.name || 'User',
            u.phone || null,
            u.email || null,
            refCode,
            u.referred_by || null,
            u.is_blocked ? 1 : 0,
            u.is_verified ? 1 : 0,
            u.role || 'user'
          )
          .run();

        // Also ensure wallet exists in D1
        let wallet = await env.DB.prepare('SELECT * FROM wallets WHERE user_id = ?').bind(userId).first();
        if (!wallet) {
          await env.DB.prepare(
            'INSERT INTO wallets (id, user_id, available_balance, pending_balance, lifetime_earned, lifetime_withdrawn) VALUES (?, ?, 0, 0, 0, 0)'
          )
            .bind(`wal-${userId}`, userId)
            .run();
        }

        return json({ ok: true, userId });
      } catch (e: any) {
        return json({ error: e.message }, 500);
      }
    }

    // 3D. USER SUBMISSIONS (Persistent Task Proofs)
    if (pathname.startsWith('/api/submissions/') && method === 'GET') {
      const userId = pathname.split('/').pop() || '';
      try {
        const res = await env.DB.prepare(
          'SELECT * FROM task_submissions WHERE user_id = ? ORDER BY submitted_at DESC'
        )
          .bind(userId)
          .all();
        return json(res.results || []);
      } catch (e: any) {
        return json({ error: e.message }, 500);
      }
    }

    // 3E. USER WITHDRAWALS (Persistent Payout History)
    if (pathname.startsWith('/api/withdrawals/') && method === 'GET') {
      const userId = pathname.split('/').pop() || '';
      try {
        const res = await env.DB.prepare(
          'SELECT * FROM withdrawals WHERE user_id = ? ORDER BY requested_at DESC'
        )
          .bind(userId)
          .all();
        return json(res.results || []);
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

    // 5. SUBMIT TASK PROOF
    if (pathname.startsWith('/api/tasks/') && pathname.endsWith('/submit') && method === 'POST') {
      try {
        const parts = pathname.split('/');
        const taskId = parts[parts.length - 2];
        const body: any = await request.json();
        const userId = body.userId || 'usr-demo-001';
        const proofFileId = body.proofFileId;

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

    // 11B. ADMIN REJECT WITHDRAWAL
    if (pathname.startsWith('/api/admin/withdrawals/') && pathname.endsWith('/reject') && method === 'POST') {
      try {
        const parts = pathname.split('/');
        const wdrId = parts[parts.length - 2];
        const body: any = await request.json().catch(() => ({}));
        const reason = body.reason || 'Invalid bank or UPI details.';

        const wdr: any = await env.DB.prepare('SELECT * FROM withdrawals WHERE id = ? AND status = "pending"')
          .bind(wdrId)
          .first();

        if (!wdr) return json({ ok: false, error: 'Withdrawal not found' }, 404);

        await env.DB.prepare(
          'UPDATE withdrawals SET status = "rejected", rejection_reason = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?'
        )
          .bind(reason, wdrId)
          .run();

        // Refund back to available balance
        await env.DB.prepare(
          'UPDATE wallets SET available_balance = available_balance + ?, pending_balance = MAX(0, pending_balance - ?), updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
        )
          .bind(wdr.amount, wdr.amount, wdr.user_id)
          .run();

        return json({ ok: true });
      } catch (e: any) {
        return json({ ok: false, error: e.message }, 500);
      }
    }

    // 11C. ADMIN REJECT SUBMISSION
    if (pathname.startsWith('/api/admin/submissions/') && pathname.endsWith('/reject') && method === 'POST') {
      try {
        const parts = pathname.split('/');
        const subId = parts[parts.length - 2];
        const body: any = await request.json().catch(() => ({}));
        const reason = body.reason || 'Screenshot proof rejected.';

        const sub: any = await env.DB.prepare('SELECT * FROM task_submissions WHERE id = ? AND status = "pending"')
          .bind(subId)
          .first();

        if (!sub) return json({ ok: false, error: 'Submission not pending or not found' }, 404);

        await env.DB.prepare(
          'UPDATE task_submissions SET status = "rejected", admin_note = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?'
        )
          .bind(reason, subId)
          .run();

        await env.DB.prepare(
          'UPDATE wallets SET pending_balance = MAX(0, pending_balance - ?), updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
        )
          .bind(sub.reward_amount, sub.user_id)
          .run();

        return json({ ok: true });
      } catch (e: any) {
        return json({ ok: false, error: e.message }, 500);
      }
    }

    // 11D. ADMIN ALL SUBMISSIONS
    if (pathname === '/api/admin/submissions' && method === 'GET') {
      try {
        const res = await env.DB.prepare('SELECT * FROM task_submissions ORDER BY submitted_at DESC LIMIT 100').all();
        return json(res.results || []);
      } catch (e: any) {
        return json({ error: e.message }, 500);
      }
    }

    // 11E. ADMIN ALL WITHDRAWALS
    if (pathname === '/api/admin/withdrawals' && method === 'GET') {
      try {
        const res = await env.DB.prepare('SELECT * FROM withdrawals ORDER BY requested_at DESC LIMIT 100').all();
        return json(res.results || []);
      } catch (e: any) {
        return json({ error: e.message }, 500);
      }
    }

    // 11F. ADMIN ALL USERS
    if (pathname === '/api/admin/users' && method === 'GET') {
      try {
        const res = await env.DB.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT 100').all();
        return json(res.results || []);
      } catch (e: any) {
        return json({ error: e.message }, 500);
      }
    }

    // 11G. ADMIN STATS
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

    // 11H. ADMIN BLOCK/UNBLOCK USER (Bug 2 Fix)
    if (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/toggle-block') && method === 'POST') {
      const parts = pathname.split('/');
      const userId = parts[parts.length - 2];
      try {
        const u: any = await env.DB.prepare('SELECT is_blocked FROM users WHERE id = ?').bind(userId).first();
        const newVal = u?.is_blocked ? 0 : 1;
        await env.DB.prepare('UPDATE users SET is_blocked = ? WHERE id = ?').bind(newVal, userId).run();
        return json({ ok: true, is_blocked: !!newVal });
      } catch (e: any) {
        return json({ ok: false, error: e.message }, 500);
      }
    }

    // 11I. ADMIN ADJUST BALANCE (Bug 3 Fix)
    if (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/adjust') && method === 'POST') {
      const parts = pathname.split('/');
      const userId = parts[parts.length - 2];
      try {
        const body: any = await request.json();
        const amount = Number(body.amount);
        const note = body.note || 'Admin adjustment';
        await env.DB.prepare(
          'UPDATE wallets SET available_balance = MAX(0, available_balance + ?), lifetime_earned = lifetime_earned + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
        ).bind(amount, amount > 0 ? amount : 0, userId).run();
        await env.DB.prepare(
          'INSERT INTO ledger (id, user_id, type, amount, status, description) VALUES (?, ?, "admin_adjust", ?, ?, ?)'
        ).bind(`led-${Date.now()}`, userId, Math.abs(amount), amount >= 0 ? 'credit' : 'debit', `Admin: ${note}`).run();
        return json({ ok: true });
      } catch (e: any) {
        return json({ ok: false, error: e.message }, 500);
      }
    }

    // 11J. NOTICES: GET ACTIVE NOTICES
    if (pathname === '/api/notices' && method === 'GET') {
      try {
        const res = await env.DB.prepare(
          'SELECT * FROM notices WHERE is_active = 1 ORDER BY created_at DESC LIMIT 20'
        ).all();
        return json(res.results || []);
      } catch (e: any) {
        return json([]);
      }
    }

    // 11K. NOTICES: SAVE / UPDATE NOTICE (Bug 13 Fix)
    if (pathname === '/api/admin/notices' && method === 'POST') {
      try {
        const body: any = await request.json();
        if (body.id) {
          await env.DB.prepare(
            'UPDATE notices SET title=?, message=?, type=?, is_active=? WHERE id=?'
          ).bind(body.title, body.message, body.type || 'success', body.is_active !== false ? 1 : 0, body.id).run();
        } else {
          const id = `notice-${Date.now()}`;
          await env.DB.prepare(
            'INSERT INTO notices (id, title, message, type, is_active, author) VALUES (?, ?, ?, ?, ?, ?)'
          ).bind(id, body.title, body.message, body.type || 'success', body.is_active !== false ? 1 : 0, body.author || 'Admin').run();
        }
        return json({ ok: true });
      } catch (e: any) {
        return json({ ok: false, error: e.message }, 500);
      }
    }

    // 11L. NOTICES: DELETE NOTICE (Bug 17 Fix)
    if (pathname.startsWith('/api/admin/notices/') && method === 'DELETE') {
      const noticeId = pathname.split('/').pop()!;
      try {
        await env.DB.prepare('DELETE FROM notices WHERE id = ?').bind(noticeId).run();
        return json({ ok: true });
      } catch (e: any) {
        return json({ ok: false, error: e.message }, 500);
      }
    }

    // 11M. NOTICES: TOGGLE NOTICE (Bug 17 Fix)
    if (pathname.startsWith('/api/admin/notices/') && pathname.endsWith('/toggle') && method === 'POST') {
      const parts = pathname.split('/');
      const noticeId = parts[parts.length - 2];
      try {
        const notice: any = await env.DB.prepare('SELECT is_active FROM notices WHERE id=?').bind(noticeId).first();
        const newVal = notice?.is_active ? 0 : 1;
        await env.DB.prepare('UPDATE notices SET is_active=? WHERE id=?').bind(newVal, noticeId).run();
        return json({ ok: true, is_active: !!newVal });
      } catch (e: any) {
        return json({ ok: false, error: e.message }, 500);
      }
    }

    // 11N. USER UPSERT (Login sync)
    if (pathname === '/api/users/upsert' && method === 'POST') {
      try {
        const body: any = await request.json();
        const existing = await env.DB.prepare('SELECT id FROM users WHERE id=?').bind(body.id).first();
        if (!existing) {
          await env.DB.prepare(
            `INSERT INTO users (id, name, email, phone, referral_code, referred_by, is_blocked)
             VALUES (?, ?, ?, ?, ?, ?, 0)`
          ).bind(
            body.id, body.name, body.email || '', body.phone || '',
            body.referral_code || '', body.referred_by || null
          ).run();
          await env.DB.prepare(
            'INSERT OR IGNORE INTO wallets (id, user_id, available_balance, pending_balance, lifetime_earned, lifetime_withdrawn) VALUES (?, ?, 0, 0, 0, 0)'
          ).bind(`wal-${body.id}`, body.id).run();
          return json({ ok: true, isNewUser: true });
        } else {
          await env.DB.prepare(
            'UPDATE users SET name=?, email=?, phone=? WHERE id=?'
          ).bind(body.name, body.email || '', body.phone || '', body.id).run();
          return json({ ok: true, isNewUser: false });
        }
      } catch (e: any) {
        return json({ ok: false, error: e.message }, 500);
      }
    }


    // 12. FALLBACK TO STATIC ASSETS (Frontend PWA files in dist)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('KamaoNow Worker Running', { status: 200 });
  },
};
