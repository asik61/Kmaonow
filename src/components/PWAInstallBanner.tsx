import React, { useState } from 'react';
import { Download, CheckCircle2, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">Install Real Money App</div>
            <div className="text-[10px] text-emerald-100">Roz fast access aur 1-tap rewards pao</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-950 font-extrabold text-xs hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            Install App
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 text-emerald-200 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-100 p-6 text-slate-900 shadow-2xl space-y-3">
            <h3 className="text-base font-black text-slate-900">Install Real Money App on Home Screen</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              1. Tap the <strong>Share</strong> button in Safari / browser.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong> (📱).<br />
              3. Open anytime like a real native app!
            </p>
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="mt-3 w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
