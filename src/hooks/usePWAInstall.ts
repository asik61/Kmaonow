import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Global declaration
declare global {
  interface Window {
    __pwa_prompt?: BeforeInstallPromptEvent | null;
  }
}

// Check if currently running in standalone installed mode (PWA, TWA, or native Android APK)
export const checkIsPWAInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;

  const isStandaloneMatch =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches;

  const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  // Check URL parameters commonly set by PWA / TWA (PWABuilder / Bubblewrap sets ?source=pwa or ?utm_source=twa)
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const isUrlPWA =
    search.includes('source=pwa') ||
    search.includes('utm_source=twa') ||
    search.includes('source=apk') ||
    search.includes('android-app') ||
    hash.includes('source=pwa');

  // Check if running inside Android TWA / WebView
  const ua = (window.navigator.userAgent || '').toLowerCase();
  const isAndroidApp =
    ua.includes('wv') || // Android WebView indicator
    ua.includes('bubblewrap') ||
    ua.includes('twa') ||
    document.referrer.includes('android-app://');

  const isStorageMarked = localStorage.getItem('pwa_app_installed') === 'true';

  if (isStandaloneMatch || isIOSStandalone || isUrlPWA || isAndroidApp) {
    localStorage.setItem('pwa_app_installed', 'true');
    return true;
  }

  return isStorageMarked;
};

// Capture early beforeinstallprompt event immediately
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // If already installed, don't capture or show prompt
    if (checkIsPWAInstalled()) return;
    
    e.preventDefault();
    window.__pwa_prompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('pwa_prompt_available'));
  });

  window.addEventListener('appinstalled', () => {
    localStorage.setItem('pwa_app_installed', 'true');
    window.__pwa_prompt = null;
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && !checkIsPWAInstalled() && window.__pwa_prompt) {
      return window.__pwa_prompt;
    }
    return null;
  });

  const [isInstalled, setIsInstalled] = useState<boolean>(() => checkIsPWAInstalled());
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const installed = checkIsPWAInstalled();
    setIsInstalled(installed);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));
    setIsAndroid(/android/.test(ua));

    if (installed) {
      setDeferredPrompt(null);
      return;
    }

    if (window.__pwa_prompt) {
      setDeferredPrompt(window.__pwa_prompt);
    }

    const handlePrompt = (e: Event) => {
      if (checkIsPWAInstalled()) return;
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwa_prompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handlePromptReady = () => {
      if (!checkIsPWAInstalled() && window.__pwa_prompt) {
        setDeferredPrompt(window.__pwa_prompt);
      }
    };

    const handleInstalled = () => {
      localStorage.setItem('pwa_app_installed', 'true');
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__pwa_prompt = null;
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('pwa_prompt_available', handlePromptReady);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('pwa_prompt_available', handlePromptReady);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const markAsInstalled = () => {
    localStorage.setItem('pwa_app_installed', 'true');
    setIsInstalled(true);
    setDeferredPrompt(null);
    if (typeof window !== 'undefined') {
      window.__pwa_prompt = null;
    }
  };

  const install = async (): Promise<boolean> => {
    const promptToUse = deferredPrompt || (typeof window !== 'undefined' ? window.__pwa_prompt : null);

    if (!promptToUse) {
      return false;
    }

    try {
      await promptToUse.prompt();
      const { outcome } = await promptToUse.userChoice;
      if (outcome === 'accepted') {
        markAsInstalled();
        return true;
      }
    } catch (err) {
      console.warn('PWA prompt execution:', err);
    }
    return false;
  };

  return {
    isInstallable: !isInstalled && !!(deferredPrompt || (typeof window !== 'undefined' && window.__pwa_prompt)),
    isInstalled,
    isIOS,
    isAndroid,
    install,
    markAsInstalled,
  };
}
