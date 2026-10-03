import React, { useEffect, useState } from 'react';
import { ShieldCheck, Zap, Gift } from 'lucide-react';
import { RealMoneyHeroSquircleIcon } from './Illustrations3D';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    const t1 = setTimeout(() => setProgress(55), 400);
    const t2 = setTimeout(() => setProgress(85), 900);
    const t3 = setTimeout(() => setProgress(100), 1400);
    const t4 = setTimeout(() => onFinish(), 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[9999] w-screen h-screen min-h-[100dvh] max-h-[100dvh] flex flex-col items-center justify-between bg-[#FAFDFB] text-slate-900 select-none overflow-hidden animate-fade-in">
      {/* ========================================================= */}
      {/* TOP BACKGROUND ACCENTS                                    */}
      {/* ========================================================= */}
      {/* Top Left Organic Dark Emerald Corner Wave + Yellow Accent */}
      <div className="absolute top-0 left-0 w-44 h-44 pointer-events-none z-0">
        <svg viewBox="0 0 180 180" fill="none" className="w-full h-full">
          {/* Main Dark Emerald Wave */}
          <path d="M 0 0 L 160 0 C 145 60, 90 90, 60 120 C 30 150, 20 170, 0 180 Z" fill="#045D44" />
          {/* Yellow Border Accent Wave */}
          <path d="M 0 180 Q 25 155 60 120 Q 90 90 160 0" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      {/* Top Left Slanted Slogan: Kaam Bhi Paisa Bhi */}
      <div className="absolute top-6 left-7 z-10 -rotate-8 select-none">
        <div className="font-serif italic font-bold text-base sm:text-lg text-slate-900 leading-tight">
          Kaam Bhi
        </div>
        <div className="font-serif italic font-black text-lg sm:text-xl text-[#059669] leading-tight relative inline-block">
          Paisa Bhi
          {/* Curved green underline stroke */}
          <svg viewBox="0 0 100 12" fill="none" className="w-24 h-2.5 mt-0.5">
            <path d="M 2 8 Q 50 1 96 6" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Top Right Pastel Circle Aura */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#ECFDF5]/80 pointer-events-none" />

      {/* Top Right: 100% Verified & Safe + Skip Button */}
      <div className="w-full flex items-start justify-end px-6 pt-5 z-20 gap-3">
        {/* Skip button for quick testing */}
        <button
          type="button"
          onClick={onFinish}
          className="text-xs text-slate-400 hover:text-emerald-700 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer mt-1"
        >
          Skip &rarr;
        </button>

        {/* 100% Verified & Safe Stacked Badge */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 fill-emerald-600 text-white" />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">100%</span>
            <span className="text-[10px] text-slate-500 font-semibold leading-tight">Verified &amp; Safe</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CENTER HERO SECTION: 3D SQUIRCLE ICON + BRANDING          */}
      {/* ========================================================= */}
      <div className="flex flex-col items-center text-center my-auto z-10 px-4 w-full max-w-md">
        {/* Large 3D Squircle Icon (Exact match to app master icon) */}
        <div className="relative mb-6 group">
          <div className="absolute inset-0 rounded-[44px] bg-emerald-500/20 blur-xl transform scale-95 pointer-events-none" />
          <RealMoneyHeroSquircleIcon size={168} className="mx-auto relative z-10 transition-transform duration-300 group-hover:scale-105" />
        </div>

        {/* Brand Name Title */}
        <div className="flex items-center justify-center text-4xl sm:text-5xl font-black tracking-tight leading-none mb-1">
          <span className="text-[#0F172A]">Real</span>
          <span className="text-[#059669] ml-2">Money</span>
          <span className="border-2 border-[#059669] bg-white text-[#059669] text-xs sm:text-sm font-black ml-2.5 px-2.5 py-0.5 rounded-full tracking-wider shadow-2xs">
            APP
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-slate-600 text-xs sm:text-sm font-semibold tracking-wide mt-2 max-w-xs sm:max-w-sm">
          Bharat Ka #1 Real Cash &amp; Daily Task Earning Platform
        </p>

        {/* 2 Feature Pills Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {/* Pill 1: Instant UPI */}
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#E6F4EA] border border-emerald-100 shadow-2xs">
            <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-black text-slate-800">Instant UPI</span>
          </div>

          {/* Pill 2: ₹5 Bonus on 1st Task */}
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FEF3C7] border border-amber-200/60 shadow-2xs">
            <Gift className="w-4 h-4 text-amber-600 fill-amber-600 shrink-0" />
            <span className="text-xs sm:text-sm font-black text-slate-800">₹5 Bonus on 1st Task</span>
          </div>
        </div>

        {/* Signature Handwritten Callout: Small Tasks... Big Rewards! */}
        <div className="text-center z-10 -rotate-6 mt-8 sm:mt-10 select-none">
          <div className="font-serif italic font-bold text-slate-800 text-base sm:text-lg leading-tight">
            Small Tasks...
          </div>
          <div className="font-serif italic font-black text-[#059669] text-2xl sm:text-3xl leading-tight relative inline-block">
            Big Rewards!
            {/* Playful curved green underline stroke */}
            <svg viewBox="0 0 120 14" fill="none" className="w-36 h-3 mt-0.5 mx-auto">
              <path d="M 4 9 Q 60 1 116 7" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM PROGRESS BAR & LOADING STATUS                      */}
      {/* ========================================================= */}
      <div className="w-full max-w-xs flex flex-col items-center gap-2 pb-8 sm:pb-10 z-10 px-4">
        <div className="w-full bg-emerald-100/90 rounded-full h-2 overflow-hidden border border-emerald-200/60 shadow-inner">
          <div
            className="h-full bg-[#059669] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold tracking-wide">
          Loading...
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM BACKGROUND CORNER GRAPHICS                         */}
      {/* ========================================================= */}
      {/* Bottom Left Subtle Circle Aura */}
      <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full bg-emerald-50/80 pointer-events-none z-0" />

      {/* Bottom Right Organic Corner Wave with Yellow Accent */}
      <div className="absolute -bottom-6 -right-6 w-52 h-52 pointer-events-none z-0">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          {/* Main Dark Emerald Corner Wave */}
          <path d="M 200 200 L 40 200 C 60 150, 110 120, 140 80 C 170 40, 180 20, 200 0 Z" fill="#045D44" />
          {/* Yellow Border Accent Wave */}
          <path d="M 40 200 Q 110 120 140 80 Q 170 40 200 0" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    </div>
  );
};
