import React from 'react';
import { ChevronRight } from 'lucide-react';

interface EarningsCardImageProps {
  totalBalance: number;
  onViewHistory: () => void;
}

export const EarningsCardImage: React.FC<EarningsCardImageProps> = ({
  totalBalance,
  onViewHistory,
}) => {
  return (
    <div className="w-full">
      {/* 
        PREMIUM CLEAN FINTECH BALANCE CARD
        No character, no duplicate Withdrawable/Pending chips (clean & uncluttered)
      */}
      <div
        onClick={onViewHistory}
        className="relative w-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#022C22] via-[#064E3B] to-[#047857] border border-emerald-400/35 shadow-[0_8px_24px_rgba(4,120,87,0.2)] text-white overflow-hidden select-none cursor-pointer group transition-all active:scale-[0.99]"
      >
        {/* Subtle Ambient Mesh Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-teal-300/10 blur-xl pointer-events-none" />

        {/* Large Decorative Translucent Rupee Glyph */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/[0.07] text-8xl sm:text-9xl font-black font-sans select-none pointer-events-none leading-none">
          ₹
        </div>

        {/* TOP ROW: Live Status & View History Button */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-200">
              Total Balance
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewHistory();
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/12 hover:bg-white/20 border border-white/20 text-white text-[11px] font-bold backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <span>View History</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-300 stroke-[2.5]" />
          </button>
        </div>

        {/* MAIN ROW: Clean High-Resolution Balance Display */}
        <div className="mt-2.5 flex items-baseline gap-1 relative z-10">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#FACC15] drop-shadow-sm font-sans">
            ₹
          </span>
          <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            {totalBalance.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
