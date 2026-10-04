import React, { useState } from 'react';
import {
  Smartphone,
  X,
  ArrowDownToLine,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install, markAsInstalled } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('pwa_banner_dismissed') === 'true';
  });
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  // If already installed or dismissed, do NOT show on home page
  if (isInstalled || dismissed) return null;

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const installed = await install();
      if (installed) {
        setInstalledSuccess(true);
        markAsInstalled();
        setTimeout(() => {
          setDismissed(true);
        }, 2000);
      } else {
        setShowGuideModal(true);
      }
    } catch {
      setShowGuideModal(true);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa_banner_dismissed', 'true');
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg relative overflow-hidden animate-fade-in">
        {/* Subtle glowing highlight */}
        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-xs">
            {installedSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-amber-300 animate-bounce" />
            ) : (
              <Smartphone className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>{installedSuccess ? 'App Installed!' : 'Install Real Money App'}</span>
              {!installedSuccess && (
                <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full uppercase">
                  Fast
                </span>
              )}
            </div>
            <div className="text-[10px] text-emerald-100">
              {installedSuccess
                ? 'App aapke home screen par add ho gayi hai!'
                : '1-click me home screen par install karein'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!installedSuccess ? (
            <button
              type="button"
              disabled={isInstalling}
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-950 font-black text-xs hover:bg-emerald-50 transition-all shadow-sm cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 disabled:opacity-75"
            >
              {isInstalling ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                  <span>Opening...</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Install App</span>
                </>
              )}
            </button>
          ) : (
            <div className="px-3 py-1 rounded-xl bg-emerald-500/40 text-white font-black text-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Installed ✓</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-emerald-200 hover:text-white cursor-pointer transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dynamic Platform-Aware Install Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-100 p-6 text-slate-900 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  {isIOS ? 'iPhone / iPad Me Install Karein' : 'Phone Me App Kaise Install Karein?'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <ol className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    1
                  </span>
                  <span>Safari browser me neeche <strong>Share icon (Square with arrow)</strong> par tap karein.</span>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    2
                  </span>
                  <span>Scroll karke <strong>'Add to Home Screen' (होम स्क्रीन पर जोड़ें)</strong> par tap karein.</span>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    3
                  </span>
                  <span>Top-right me <strong>'Add'</strong> dabayein. Real Money App aapke home screen par icon banke aa jayegi!</span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    1
                  </span>
                  <span>Chrome browser me top-right ke <strong>3 dots (⋮)</strong> par tap karein.</span>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    2
                  </span>
                  <span>Menu me <strong>'Install app'</strong> ya <strong>'Add to Home screen'</strong> chunein.</span>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    3
                  </span>
                  <span><strong>'Install'</strong> par tap karein. App direct aapke phone ke app drawer me save ho jayegi!</span>
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => {
                setShowGuideModal(false);
                markAsInstalled();
              }}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors cursor-pointer"
            >
              Samajh Gaya (Done)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
