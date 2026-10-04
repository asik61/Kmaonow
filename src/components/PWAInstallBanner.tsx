import React, { useState } from 'react';
import {
  Smartphone,
  X,
  MoreVertical,
  ArrowDownToLine,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (isInstalled || dismissed) return null;

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const installed = await install();
      if (installed) {
        setInstalledSuccess(true);
        setTimeout(() => {
          setDismissed(true);
        }, 3000);
      } else {
        setShowGuideModal(true);
      }
    } catch {
      setShowGuideModal(true);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg relative overflow-hidden">
        {/* Subtle glowing highlight */}
        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
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
            onClick={() => setDismissed(true)}
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
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              /* iOS Safari Instructions */
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                  <span>Safari browser me neeche <strong>Share (⎙ / Share)</strong> icon par tap karein.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                  <span>List me se <strong>'Add to Home Screen' (➕)</strong> par tap karein.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                  <span>'Add' par click karein aur Real Money App aapke phone me add ho jayegi!</span>
                </div>
              </div>
            ) : (
              /* Android Chrome Instructions */
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                  <div className="leading-snug">
                    Chrome browser ke sabse upar right corner me <strong>3 dots (<MoreVertical className="w-3.5 h-3.5 inline text-slate-700" />)</strong> menu par tap karein.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                  <div className="leading-snug">
                    Menu me <strong>'Install app' (📲)</strong> ya <strong>'Add to Home screen'</strong> par tap karein.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                  <div className="leading-snug">
                    <strong>'Install'</strong> par click karein. Real Money App aapke phone ki home screen par app ban kar save ho jayegi!
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={async () => {
                  setIsInstalling(true);
                  const ok = await install();
                  setIsInstalling(false);
                  if (ok) {
                    setShowGuideModal(false);
                    setInstalledSuccess(true);
                  }
                }}
                disabled={isInstalling}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all cursor-pointer shadow-md active:scale-98 flex items-center justify-center gap-1.5"
              >
                {isInstalling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                )}
                <span>1-Tap Install Try Karein</span>
              </button>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Band Karein
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
