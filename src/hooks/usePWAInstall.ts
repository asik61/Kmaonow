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

// Capture early beforeinstallprompt event immediately
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__pwa_prompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('pwa_prompt_available'));
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__pwa_prompt) {
      return window.__pwa_prompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));
    setIsAndroid(/android/.test(ua));

    if (window.__pwa_prompt) {
      setDeferredPrompt(window.__pwa_prompt);
    }

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwa_prompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handlePromptReady = () => {
      if (window.__pwa_prompt) {
        setDeferredPrompt(window.__pwa_prompt);
      }
    };

    const handleInstalled = () => {
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

  const install = async (): Promise<boolean> => {
    let promptToUse = deferredPrompt || (typeof window !== 'undefined' ? window.__pwa_prompt : null);

    // If prompt is not ready yet, wait briefly (up to 1.2s) in case it's initializing
    if (!promptToUse && typeof window !== 'undefined') {
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 240));
        if (window.__pwa_prompt || deferredPrompt) {
          promptToUse = deferredPrompt || window.__pwa_prompt;
          break;
        }
      }
    }

    if (!promptToUse) {
      return false;
    }

    try {
      await promptToUse.prompt();
      const { outcome } = await promptToUse.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') {
          window.__pwa_prompt = null;
        }
        return true;
      }
    } catch (err) {
      console.warn('PWA prompt execution:', err);
    }
    return false;
  };

  return {
    isInstallable: !!(deferredPrompt || (typeof window !== 'undefined' && window.__pwa_prompt)),
    isInstalled,
    isIOS,
    isAndroid,
    install,
  };
}
