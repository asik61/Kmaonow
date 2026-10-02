import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { KamaoNowLogo3D } from './Illustrations3D';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing Real Money App...');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(50);
      setStatusText('Connecting to Secure Servers...');
    }, 500);

    const t2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Checking Wallet & Daily Bonuses...');
    }, 1100);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Ready!');
    }, 1600);

    const t4 = setTimeout(() => {
      onFinish();
    }, 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-[#032219] via-[#043d2c] to-[#021812] text-white p-6 select-none overflow-hidden animate-fade-in">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

      {/* Top Safe Badge */}
      <div className="w-full flex items-center justify-between pt-4 opacity-90">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Verified &amp; Safe</span>
        </div>
        <button
          onClick={onFinish}
          className="text-xs text-emerald-300/80 hover:text-white font-medium px-2 py-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          Skip &rarr;
        </button>
      </div>

      {/* Center Branding & 3D Logo */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-emerald-500/30 to-amber-400/20 blur-xl animate-pulse" />
          <div className="relative transform hover:scale-105 transition-transform duration-300">
            <KamaoNowLogo3D size={84} />
          </div>
        </div>

        <div className="flex items-center text-3xl sm:text-4xl font-black tracking-tight leading-none mb-2">
          <span className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">Real</span>
          <span className="text-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.4)] ml-2">Money</span>
          <span className="text-emerald-300 text-xs sm:text-sm font-black ml-2 px-2 py-0.5 bg-emerald-950/60 rounded-lg border border-emerald-400/40">
            APP
          </span>
        </div>

        <p className="text-emerald-200/90 text-xs sm:text-sm font-medium tracking-wide max-w-xs mt-1">
          Bharat Ka #1 Real Cash &amp; Daily Task Earning Platform
        </p>

        {/* Feature Pills */}
        <div className="flex items-center gap-2 mt-5">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-100 bg-emerald-900/50 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            <Zap className="w-3 h-3 text-amber-400" /> Instant UPI
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-100 bg-emerald-900/50 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-yellow-300" /> ₹50 Free Bonus
          </span>
        </div>
      </div>

      {/* Bottom Progress Bar & Loading Indicator */}
      <div className="w-full max-w-xs flex flex-col items-center gap-2.5 pb-6">
        <div className="w-full bg-emerald-950/80 rounded-full h-1.5 overflow-hidden border border-emerald-500/20">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[11px] text-emerald-300/80 font-mono tracking-tight text-center">
          {statusText}
        </div>
      </div>
    </div>
  );
};
