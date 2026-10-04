export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'bonus' | 'withdrawal' | 'task' | 'system' | 'referral';
  timestamp: string;
  read: boolean;
  actionTab?: string;
}

export const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    title: '🎯 Pehla Task Mission: ₹5 Bonus!',
    message: 'Apna 1st task complete karein aur ₹5.00 Sign-up Welcome bonus seedha wallet me unlock karein.',
    type: 'bonus',
    timestamp: new Date().toISOString(),
    read: false,
    actionTab: 'tasks',
  },
  {
    id: 'notif-2',
    title: '⚡ Pehla Withdrawal Sirf ₹20 Par!',
    message: 'Naye users ke liye pehla withdrawal minimum sirf ₹20 hai! (Uske baad minimum ₹100 rahega).',
    type: 'withdrawal',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    actionTab: 'withdraw',
  },
  {
    id: 'notif-3',
    title: '🎡 Daily Lucky Spin Ready!',
    message: 'Aaj ka free spin ghumayein aur seedha apne wallet me cash jeetein.',
    type: 'task',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    actionTab: 'spin',
  },
];

// =========================================================================
// OUT-OF-APP PUSH NOTIFICATIONS (Web Push / Native System Notification)
// =========================================================================

/**
 * Request system notification permission from browser / PWA APK
 */
export async function requestPushPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser environment.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }

  return false;
}

/**
 * Send an Out-of-App push notification to phone lockscreen/tray
 */
export async function sendOutPushNotification(
  title: string,
  options: {
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
    vibrate?: number[];
  }
): Promise<boolean> {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    // If Service Worker is active, send via SW for background reliability
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const reg = await navigator.serviceWorker.ready;
      await (reg as any).showNotification(title, {
        body: options.body,
        icon: options.icon || '/pwa-192x192.png',
        badge: options.badge || '/icon.svg',
        data: options.data || { url: '/' },
        vibrate: options.vibrate || [200, 100, 200],
      });
      return true;
    }

    // Direct Notification fallback
    new Notification(title, {
      body: options.body,
      icon: options.icon || '/pwa-192x192.png',
      badge: options.badge || '/icon.svg',
    });
    return true;
  } catch (err) {
    console.warn('Could not dispatch out-of-app notification:', err);
    return false;
  }
}
