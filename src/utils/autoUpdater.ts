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

    // If server has different buildId or version, and we have a stored build that differs
    if (data.buildId && storedBuild && storedBuild !== data.buildId) {
      console.log(`[AutoUpdater] New version detected: server=${data.buildId}, client=${storedBuild}`);
      localStorage.setItem('kamao_current_build', data.buildId);
      return true;
    }

    // Set initial build if not present
    if (!storedBuild && data.buildId) {
      localStorage.setItem('kamao_current_build', data.buildId);
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Apply the update immediately: clear caches and reload window
 */
export async function applyUpdate(): Promise<void> {
  if (isRefreshing) return;
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
    // Reload without using cache
    window.location.reload();
  }
}

/**
 * Initialize automatic update listeners:
 * - Checks when app opens
 * - Checks when user resumes app (switches back from another app)
 * - Checks when window focuses
 * - Checks periodically in the background
 */
export function initAutoUpdater() {
  // Store current client build ID in localStorage
  const currentBuild = localStorage.getItem('kamao_current_build');
  if (!currentBuild) {
    localStorage.setItem('kamao_current_build', APP_BUILD_ID);
  }

  // 1. Service Worker Registration with updateViaCache: 'none'
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // updateViaCache: 'none' forces browser to bypass HTTP cache for sw.js
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((reg) => {
          // Immediately check for updates
          reg.update().catch(() => {});

          // If there is already a waiting worker, activate it
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          // Listen for new service worker installation
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[AutoUpdater] New service worker installed! Applying update...');
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[AutoUpdater] SW registration note:', err);
        });
    });

    // When the new service worker takes over, reload the window automatically
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!isRefreshing) {
        isRefreshing = true;
        console.log('[AutoUpdater] Service worker controller changed. Reloading page...');
        window.location.reload();
      }
    });

    // Listen for messages from sw.js
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SW_ACTIVATED') {
        console.log('[AutoUpdater] Service worker reported activation:', event.data.version);
      }
    });
  }

  // 2. Immediate check on startup
  checkServerVersion().then((hasUpdate) => {
    if (hasUpdate) applyUpdate();
  });

  // 3. Check when user returns to app (visibilitychange - foregrounding)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('[AutoUpdater] App brought to foreground. Checking for updates...');
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          reg?.update().catch(() => {});
        });
      }
      checkServerVersion().then((hasUpdate) => {
        if (hasUpdate) applyUpdate();
      });
    }
  });

  // 4. Check on window focus (useful on mobile web & desktop)
  window.addEventListener('focus', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.update().catch(() => {});
      });
    }
    checkServerVersion().then((hasUpdate) => {
      if (hasUpdate) applyUpdate();
    });
  });

  // 5. Check when coming back online
  window.addEventListener('online', () => {
    checkServerVersion().then((hasUpdate) => {
      if (hasUpdate) applyUpdate();
    });
  });

  // 6. Periodic background check every 45 seconds
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      checkServerVersion().then((hasUpdate) => {
        if (hasUpdate) applyUpdate();
      });
    }
  }, 45000);
}
