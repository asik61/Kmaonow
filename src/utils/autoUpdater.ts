import { APP_VERSION, APP_BUILD_ID } from '../version';

let isRefreshing = false;

/**
 * Force purge all CacheStorage caches
 */
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      console.log('[AutoUpdater] Purged cache keys:', keys);
    } catch (err) {
      console.warn('[AutoUpdater] Failed to clear caches:', err);
    }
  }
}

/**
 * Check if the server has a newer version deployed
 */
export async function checkServerVersion(): Promise<boolean> {
  try {
    const res = await fetch(`/api/version?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    if (!res.ok) return false;

    const data = await res.json();
    const storedBuild = localStorage.getItem('kamao_current_build');

    // If client has no stored build yet, sync with current APP_BUILD_ID
    if (!storedBuild) {
      localStorage.setItem('kamao_current_build', data.buildId || APP_BUILD_ID);
      return false;
    }

    // Check if server version is genuinely different from stored build
    if (data.buildId && data.buildId !== storedBuild) {
      console.log(`[AutoUpdater] New version detected: server=${data.buildId}, client=${storedBuild}`);
      localStorage.setItem('kamao_current_build', data.buildId);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Apply the update safely: throttled to prevent any reload loops
 */
export async function applyUpdate(): Promise<void> {
  if (isRefreshing) return;

  // Strict anti-loop throttle: Never reload more than once every 30 seconds
  const lastReload = Number(sessionStorage.getItem('kamao_last_reload') || '0');
  if (Date.now() - lastReload < 30000) {
    console.warn('[AutoUpdater] Reload throttled to prevent reload loop');
    return;
  }
  sessionStorage.setItem('kamao_last_reload', String(Date.now()));

  isRefreshing = true;

  try {
    await clearAllCaches();

    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        await reg.update().catch(() => {});
      }
    }
  } finally {
    // Reload cleanly
    window.location.reload();
  }
}

/**
 * Initialize automatic update listeners:
 * - Checks when user resumes app
 * - Checks periodically in the background
 * - Prevents infinite boot reloads
 */
export function initAutoUpdater() {
  // Sync client build ID and clean legacy dynamic timestamped values
  const currentBuild = localStorage.getItem('kamao_current_build');
  if (!currentBuild || currentBuild.includes('Date.now') || currentBuild.startsWith('kamaonow-build-1')) {
    localStorage.setItem('kamao_current_build', APP_BUILD_ID);
  }

  // 1. Service Worker Registration with updateViaCache: 'none'
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((reg) => {
          reg.update().catch(() => {});

          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[AutoUpdater] New service worker ready. Applying update...');
                  applyUpdate();
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[AutoUpdater] SW registration note:', err);
        });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!isRefreshing) {
        const lastReload = Number(sessionStorage.getItem('kamao_last_reload') || '0');
        if (Date.now() - lastReload < 30000) return;
        sessionStorage.setItem('kamao_last_reload', String(Date.now()));
        isRefreshing = true;
        window.location.reload();
      }
    });
  }

  // 2. Delay initial check by 4 seconds so the app boots smoothly first
  setTimeout(() => {
    checkServerVersion().then((hasUpdate) => {
      if (hasUpdate) applyUpdate();
    });
  }, 4000);

  // 3. Foreground / Visibility change (when switching back to app)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkServerVersion().then((hasUpdate) => {
        if (hasUpdate) applyUpdate();
      });
    }
  });

  // 4. Periodic background check every 60 seconds
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      checkServerVersion().then((hasUpdate) => {
        if (hasUpdate) applyUpdate();
      });
    }
  }, 60000);
}
