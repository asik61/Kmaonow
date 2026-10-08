import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Clock,
  CheckCircle2,
  ArrowLeft,
  Bell,
  ChevronRight,
  ShieldCheck,
  Disc,
  Sparkles,
} from 'lucide-react';

interface SpinWheelProps {
  freeSpinsLeft?: number;
  totalDailySpins?: number;
  dailyClaimed: boolean;
  walletBalance?: number;
  onRewardWon: (amount: number) => void;
  onUnlockBonusSpin?: () => void;
  onBack?: () => void;
  onOpenRules?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

interface Segment {
  label: string;
  value: number;
  c1: string;
  c2: string;
  c3: string;
  coinCount: number;
}

// 8 Segments matching high quality 3D wheel design
const SEGS: Segment[] = [
  { label: '₹0.25', value: 0.25, c1: '#00D4FF', c2: '#0088FF', c3: '#0044BB', coinCount: 3 }, // Cyan / Blue
  { label: '₹0.15', value: 0.15, c1: '#34E885', c2: '#08B854', c3: '#03682C', coinCount: 3 }, // Lime Green
  { label: '₹0.35', value: 0.35, c1: '#FFC107', c2: '#FF9100', c3: '#E65100', coinCount: 3 }, // Amber / Gold
  { label: '₹1.00', value: 1.00, c1: '#FF5252', c2: '#E53935', c3: '#B71C1C', coinCount: 4 }, // Big Winner Red
  { label: '₹0.50', value: 0.50, c1: '#E040FB', c2: '#AA00FF', c3: '#6A0080', coinCount: 3 }, // Purple / Magenta
  { label: '₹0.35', value: 0.35, c1: '#FF6E40', c2: '#FF3D00', c3: '#BF360C', coinCount: 3 }, // Vibrant Orange
  { label: '₹0.25', value: 0.25, c1: '#40C4FF', c2: '#0091EA', c3: '#01579B', coinCount: 3 }, // Sky Blue
  { label: '₹0.10', value: 0.10, c1: '#FF4081', c2: '#F50057', c3: '#880E4F', coinCount: 2 }, // Vivid Pink
];

// Photorealistic 3D Cylindrical Podium Base with Multi-Layered Floor & Platform Shadows
const Realistic3DPodium = () => (
  <div className="relative w-[340px] flex flex-col items-center pointer-events-none -mt-4 z-0">
    <svg width="340" height="110" viewBox="0 0 340 110" fill="none" className="overflow-visible">
      <defs>
        {/* Top Disc Platinum Gradient */}
        <linearGradient id="podiumTop" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Upper Cylinder Wall with Chrome Lighting */}
        <linearGradient id="podiumWallUpper" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="25%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="75%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        {/* Lower Step Disc */}
        <linearGradient id="podiumLowerDisc" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Lower Base Wall */}
        <linearGradient id="podiumWallLower" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="30%" stopColor="#CBD5E1" />
          <stop offset="50%" stopColor="#F8FAFC" />
          <stop offset="70%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Deep Diffused Floor Shadow under podium */}
        <radialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(15,23,42,0.32)" />
          <stop offset="50%" stopColor="rgba(15,23,42,0.12)" />
          <stop offset="100%" stopColor="rgba(15,23,42,0)" />
        </radialGradient>

        {/* Top Platform Wheel Drop Shadow */}
        <radialGradient id="wheelOnPodiumShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
          <stop offset="45%" stopColor="rgba(0,0,0,0.22)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* 1. Deep Floor Shadow under the entire podium */}
      <ellipse cx="170" cy="94" rx="160" ry="16" fill="url(#floorShadow)" />

      {/* 2. Lower Step Cylinder Body */}
      <path d="M 14 58 C 14 58, 14 80, 14 80 C 14 94, 326 94, 326 80 L 326 58 Z" fill="url(#podiumWallLower)" />
      {/* Lower Step Top Rim */}
      <ellipse cx="170" cy="58" rx="156" ry="20" fill="url(#podiumLowerDisc)" stroke="#E2E8F0" strokeWidth="1" />

      {/* 3. Upper Main Cylinder Body */}
      <path d="M 32 24 C 32 24, 32 58, 32 58 C 32 72, 308 72, 308 58 L 308 24 Z" fill="url(#podiumWallUpper)" />
      {/* Upper Main Top Platform Surface */}
      <ellipse cx="170" cy="24" rx="138" ry="18" fill="url(#podiumTop)" stroke="#FFFFFF" strokeWidth="2.5" />
      {/* Inner Bevel Ring Highlight */}
      <ellipse cx="170" cy="24" rx="130" ry="15" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.5" />

      {/* 4. Realistic Wheel Shadow on Podium Platform */}
      <ellipse cx="170" cy="24" rx="100" ry="11" fill="url(#wheelOnPodiumShadow)" />
    </svg>
  </div>
);

export const SpinWheel: React.FC<SpinWheelProps> = ({
  freeSpinsLeft = 3,
  totalDailySpins = 3,
  dailyClaimed,
  walletBalance = 0,
  onRewardWon,
  onUnlockBonusSpin,
  onBack,
  onOpenRules,
  onOpenNotifications,
  unreadNotificationsCount = 6,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [wonSegment, setWonSegment] = useState<Segment | null>(null);
  const [resEmoji, setResEmoji] = useState('🎉');
  const [midnightTimer, setMidnightTimer] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wheelAngleRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isSpinningRef = useRef(false);

  const N = SEGS.length;
  const PI2 = Math.PI * 2;
  const WS = 320;
  const WC = WS / 2;
  const WR = 144;

  const isOutOfSpins = freeSpinsLeft <= 0 || dailyClaimed;

  // Live Countdown to Midnight (00:00:00)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      if (diff <= 0) {
        setMidnightTimer('00:00:00');
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setMidnightTimer(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio Synthesis for Tick and Win sounds
  const playWheelTick = () => {
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignore audio failure
    }
  };

  const playWinJingle = () => {
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
      });
    } catch {
      // Ignore audio failure
    }
  };

  // Canvas Drawing with High DPI / Retina Support
  const drawWheel = useCallback(
    (angle: number) => {
      const cvs = canvasRef.current;
      if (!cvs) return;
      const dpr = window.devicePixelRatio || 1;
      if (cvs.width !== WS * dpr || cvs.height !== WS * dpr) {
        cvs.width = WS * dpr;
        cvs.height = WS * dpr;
      }
      const wx = cvs.getContext('2d');
      if (!wx) return;

      wx.save();
      // Explicitly set transform so it never accumulates across animation frames
      wx.setTransform(dpr, 0, 0, dpr, 0, 0);
      wx.clearRect(0, 0, WS, WS);

      const sA = PI2 / N;

      // 1. Outer Deep Drop Shadow
      wx.save();
      wx.beginPath();
      wx.arc(WC, WC, WR + 12, 0, PI2);
      wx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      wx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      wx.shadowBlur = 20;
      wx.shadowOffsetY = 12;
      wx.fill();
      wx.restore();

      // 2. Outer 3D Gold Beveled Bezel Ring
      const outerGold = wx.createLinearGradient(0, 0, WS, WS);
      outerGold.addColorStop(0, '#FFE873');
      outerGold.addColorStop(0.2, '#FFD700');
      outerGold.addColorStop(0.5, '#C47A00');
      outerGold.addColorStop(0.8, '#FFD700');
      outerGold.addColorStop(1, '#5C3400');

      wx.save();
      wx.beginPath();
      wx.arc(WC, WC, WR + 10, 0, PI2);
      wx.fillStyle = outerGold;
      wx.fill();

      // Gold inner lip
      wx.beginPath();
      wx.arc(WC, WC, WR + 2, 0, PI2);
      wx.fillStyle = '#4A2A00';
      wx.fill();
      wx.restore();

      // 3. Wheel Rotating Segments
      wx.save();
      wx.translate(WC, WC);
      wx.rotate(angle);

      SEGS.forEach((seg, i) => {
        const start = i * sA;
        const end = start + sA;
        const mid = start + sA / 2;

        // Slice Body with Gradient
        wx.save();
        wx.beginPath();
        wx.moveTo(0, 0);
        wx.arc(0, 0, WR, start, end);
        wx.closePath();

        const grad = wx.createRadialGradient(0, 0, 10, 0, 0, WR);
        grad.addColorStop(0, seg.c1);
        grad.addColorStop(0.65, seg.c2);
        grad.addColorStop(1, seg.c3);
        wx.fillStyle = grad;
        wx.fill();

        // Slice Divider Line (Gold)
        wx.strokeStyle = '#FFEAA7';
        wx.lineWidth = 2;
        wx.stroke();
        wx.restore();

        // Slice Content (Rupee Value & Coin Stack)
        wx.save();
        wx.rotate(mid);

        // Value Label (Large, Bold, Crisp White with Dark Shadow)
        wx.save();
        wx.fillStyle = '#FFFFFF';
        wx.font = '900 18px system-ui, -apple-system, sans-serif';
        wx.textAlign = 'center';
        wx.textBaseline = 'middle';
        wx.shadowColor = 'rgba(0, 0, 0, 0.65)';
        wx.shadowBlur = 4;
        wx.shadowOffsetY = 2;
        wx.fillText(seg.label, WR * 0.72, 0);
        wx.restore();

        // 3D Gold Coin Badge in slice
        wx.save();
        const coinDist = WR * 0.42;
        wx.translate(coinDist, 0);

        // Gold coin body
        const coinGrad = wx.createRadialGradient(-2, -2, 1, 0, 0, 11);
        coinGrad.addColorStop(0, '#FFF59D');
        coinGrad.addColorStop(0.4, '#FFD700');
        coinGrad.addColorStop(0.8, '#E67E22');
        coinGrad.addColorStop(1, '#964B00');

        wx.beginPath();
        wx.arc(0, 0, 10.5, 0, PI2);
        wx.fillStyle = coinGrad;
        wx.shadowColor = 'rgba(0,0,0,0.45)';
        wx.shadowBlur = 4;
        wx.shadowOffsetY = 2;
        wx.fill();
        wx.strokeStyle = '#FFFFFF';
        wx.lineWidth = 1;
        wx.stroke();

        // Rupee Symbol on coin
        wx.fillStyle = '#5C2D00';
        wx.font = '900 11px system-ui, sans-serif';
        wx.textAlign = 'center';
        wx.textBaseline = 'middle';
        wx.shadowBlur = 0;
        wx.fillText('₹', 0, 0.5);

        wx.restore();

        wx.restore();
      });

      // Chrome Rim Screws / Studs around perimeter
      for (let i = 0; i < N * 2; i++) {
        const studA = (i * PI2) / (N * 2);
        const sx = Math.cos(studA) * (WR + 6);
        const sy = Math.sin(studA) * (WR + 6);

        wx.beginPath();
        wx.arc(sx, sy, 2.4, 0, PI2);
        wx.fillStyle = '#FFFFFF';
        wx.shadowColor = 'rgba(0,0,0,0.5)';
        wx.shadowBlur = 2;
        wx.fill();
      }

      wx.restore(); // Restore from rotation

      // 4. Center 3D Golden Hub Cap with Star
      const centerGold = wx.createRadialGradient(WC - 5, WC - 5, 2, WC, WC, 32);
      centerGold.addColorStop(0, '#FFF9A6');
      centerGold.addColorStop(0.3, '#FFD700');
      centerGold.addColorStop(0.7, '#C47A00');
      centerGold.addColorStop(1, '#5C3400');

      wx.save();
      wx.beginPath();
      wx.arc(WC, WC, 30, 0, PI2);
      wx.fillStyle = centerGold;
      wx.shadowColor = 'rgba(0,0,0,0.45)';
      wx.shadowBlur = 10;
      wx.shadowOffsetY = 4;
      wx.fill();
      wx.strokeStyle = '#FFFFFF';
      wx.lineWidth = 3;
      wx.stroke();
      wx.restore();

      // Embossed 3D White Star in Center
      wx.save();
      wx.translate(WC, WC);
      wx.beginPath();
      for (let i = 0; i < 5 * 2; i++) {
        const r = i % 2 === 0 ? 15 : 7;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        if (i === 0) wx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else wx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      wx.closePath();
      wx.fillStyle = '#FFFFFF';
      wx.shadowColor = 'rgba(0,0,0,0.3)';
      wx.shadowBlur = 4;
      wx.fill();

      wx.strokeStyle = '#EAB308';
      wx.lineWidth = 1.2;
      wx.stroke();
      wx.restore();

      // RESTORE OUTERMOST CANVAS CONTEXT
      wx.restore();
    },
    [N, PI2, WC, WR, WS]
  );

  useEffect(() => {
    drawWheel(wheelAngleRef.current);
  }, [drawWheel]);

  const doSpin = () => {
    if (isSpinning || isOutOfSpins || isSpinningRef.current) return;
    setIsSpinning(true);
    isSpinningRef.current = true;

    // Pick winning segment
    const winIdx = Math.floor(Math.random() * N);
    const targetSeg = SEGS[winIdx];

    const sA = PI2 / N;
    const targetA = (3 * Math.PI) / 2 - winIdx * sA - sA / 2;
    const extraTurns = 5 + Math.floor(Math.random() * 3);
    const totalA = extraTurns * PI2 + targetA;

    const startA = wheelAngleRef.current % PI2;
    const diff = totalA - startA;
    const dur = 4200;
    const startTime = performance.now();
    let lastTickIdx = -1;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3.5);

    const animate = (now: number) => {
      const el = now - startTime;
      const p = Math.min(el / dur, 1);
      const curA = startA + diff * easeOutCubic(p);
      wheelAngleRef.current = curA;
      drawWheel(curA);

      const tickIdx = Math.floor((curA / sA) % N);
      if (tickIdx !== lastTickIdx && p < 0.95) {
        lastTickIdx = tickIdx;
        playWheelTick();
      }

      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        isSpinningRef.current = false;
        setWonSegment(targetSeg);
        setResEmoji(targetSeg.value >= 0.5 ? '🎉' : '⭐');
        setShowResultModal(true);
        playWinJingle();
        // Credit reward to wallet immediately so it is never missed
        onRewardWon(targetSeg.value);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleClaim = () => {
    setShowResultModal(false);
  };

  const usedSpins = totalDailySpins - freeSpinsLeft;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pt-1 pb-4">
      {/* ========================================================= */}
      {/* 1. TOP HEADER APP BAR (Back, Niyam Capsule & Bell)         */}
      {/* ========================================================= */}
      <div className="w-full flex items-center justify-between px-4 pt-1 pb-1">
        {/* Back Arrow Button */}
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="flex items-center gap-2">
          {/* Live Wallet Balance Chip */}
          <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black flex items-center gap-1.5 shadow-xs">
            <span className="text-sm">💰</span>
            <span className="font-mono">₹{walletBalance.toFixed(2)}</span>
          </div>

          {/* Niyam (Rules) Button */}
          <button
            type="button"
            onClick={onOpenRules}
            className="px-3 py-1.5 rounded-full bg-amber-100/90 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <span className="text-sm">📒</span>
            <span>Niyam</span>
          </button>

          {/* Notification Bell with Red Badge */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95"
          >
            <Bell className="w-5 h-5 stroke-[2.2]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[11px] font-black flex items-center justify-center shadow-sm border-2 border-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. STRICTLY CENTERED MAIN HEADING & SUBTITLE              */}
      {/* ========================================================= */}
      <div className="w-full text-center my-2 space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className="text-amber-400 text-2xl drop-shadow-[0_2px_4px_rgba(251,191,36,0.5)]">✨</span>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Spin</h1>
          <span className="text-amber-400 text-2xl drop-shadow-[0_2px_4px_rgba(251,191,36,0.5)]">✨</span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Daily 3 free spins ghumayein aur cash jeetein
        </p>
      </div>

      {/* ========================================================= */}
      {/* 3. 3D PODIUM & ELEVATED WHEEL (CLEAN & NO CORNER COINS)    */}
      {/* ========================================================= */}
      <div className="relative w-full max-w-[360px] flex flex-col items-center mt-3 mb-2">
        {/* ======================================================= */}
        {/* MULTI-COLORED CELEBRATORY CONFETTI DOTS AROUND WHEEL    */}
        {/* ======================================================= */}
        {/* Cyan Dots & Diamonds */}
        <div className="absolute top-4 left-18 w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] opacity-90 animate-pulse" />
        <div className="absolute top-24 left-8 w-2 h-2 bg-[#00D2FF] rotate-45 shadow-[0_0_6px_#00D2FF] opacity-85" />
        <div className="absolute bottom-22 right-12 w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] opacity-90" />

        {/* Neon Pink Dots & Diamonds */}
        <div className="absolute top-6 right-18 w-2.5 h-2.5 rounded-full bg-[#FF2A6D] shadow-[0_0_8px_#FF2A6D] opacity-90 animate-pulse delay-100" />
        <div className="absolute top-26 right-8 w-2 h-2 bg-[#FF1744] rotate-45 opacity-85 shadow-[0_0_6px_#FF1744]" />
        <div className="absolute bottom-18 left-14 w-2.5 h-2.5 bg-[#FF0055] rotate-12 opacity-85" />

        {/* Lime Green Dots */}
        <div className="absolute top-16 left-9 w-2 h-2 rounded-full bg-[#00E676] shadow-[0_0_6px_#00E676] opacity-90" />
        <div className="absolute top-18 right-10 w-2 h-2 rounded-full bg-[#00E676] shadow-[0_0_6px_#00E676] opacity-90" />
        <div className="absolute bottom-26 right-8 w-2 h-2 bg-[#00FF66] rotate-45 opacity-85" />

        {/* Radiant Amber & Gold Dots */}
        <div className="absolute top-2 left-26 w-2 h-2 rounded-full bg-[#FFD700] shadow-[0_0_8px_#FFD700] opacity-95" />
        <div className="absolute top-2 right-26 w-2.5 h-2.5 bg-[#FFD700] rotate-45 opacity-90 shadow-[0_0_6px_#FFD700]" />
        <div className="absolute bottom-28 left-12 w-2 h-2 rounded-full bg-[#FFB300] opacity-90" />

        {/* Sparkle Stars (✦) */}
        <div className="absolute top-10 left-24 text-amber-400 text-xs font-black drop-shadow-[0_0_6px_rgba(255,215,0,0.8)] animate-spin-slow">
          ✦
        </div>
        <div className="absolute top-12 right-24 text-cyan-400 text-xs font-black drop-shadow-[0_0_6px_rgba(0,229,255,0.8)]">
          ✦
        </div>
        <div className="absolute bottom-30 right-16 text-pink-400 text-xs font-black drop-shadow-[0_0_6px_rgba(255,42,109,0.8)]">
          ✦
        </div>

        {/* ======================================================= */}
        {/* ELEVATED WHEEL CONTAINER WITH TOP 3D NEEDLE POINTER     */}
        {/* ======================================================= */}
        <div className="relative w-[320px] h-[320px] z-10 filter drop-shadow-[0_16px_24px_rgba(0,0,0,0.32)]">
          {/* Top 3D Golden Pointer Needle at 12 o'clock */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)]">
            <div className="w-8 h-8 bg-gradient-to-br from-[#FFE566] via-[#FFD700] to-[#B45309] rounded-full border-2 border-white flex items-center justify-center shadow-md">
              <div className="w-3.5 h-3.5 rounded-full bg-white shadow-inner" />
            </div>
            <div
              className="w-4.5 h-5.5 -mt-2 bg-gradient-to-b from-[#FFD700] via-[#D97706] to-[#78350F]"
              style={{
                clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
              }}
            />
          </div>

          {/* HTML5 Retina Canvas */}
          <canvas
            ref={canvasRef}
            style={{ width: '320px', height: '320px' }}
            className="block cursor-pointer transition-transform active:scale-[0.99]"
            onClick={doSpin}
          />
        </div>

        {/* Photorealistic 3D Cylindrical Presentation Podium Platform with Shadows */}
        <Realistic3DPodium />
      </div>

      {/* ========================================================= */}
      {/* 4. DAILY 3 SPINS STATUS CARD                              */}
      {/* ========================================================= */}
      <div className="w-[92%] max-w-sm mx-auto mt-2 mb-3">
        {isOutOfSpins ? (
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-slate-900 font-black text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Aaj Ke Sabhi 3 Free Spins Claimed (3/3)</span>
            </div>
            {/* 3 Completed Spin Badges */}
            <div className="flex items-center justify-center gap-2 pt-0.5">
              {[1, 2, 3].map((spinNum) => (
                <span
                  key={spinNum}
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"
                >
                  <span>✓</span> Spin {spinNum}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium pt-0.5">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
              <span>
                Naye 3 Daily Spins:{' '}
                <strong className="font-mono font-black text-slate-800">
                  {midnightTimer || '00:00:00'}
                </strong>{' '}
                mein reset honge
              </span>
            </div>

            {onUnlockBonusSpin && (
              <button
                type="button"
                onClick={onUnlockBonusSpin}
                className="w-full mt-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-black text-xs shadow-md hover:from-emerald-500 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>🎁 Unlock +1 Free Bonus Spin (Instant)</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-sm text-center space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-black text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Aaj Ke Free Spins ({freeSpinsLeft}/{totalDailySpins} Baaki)</span>
              </div>
              <span className="text-[11px] font-black font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {freeSpinsLeft} Left
              </span>
            </div>

            {/* 3 Step Spin Progress Indicators */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((spinNum) => {
                const isClaimed = spinNum <= usedSpins;
                const isCurrent = spinNum === usedSpins + 1;
                return (
                  <div
                    key={spinNum}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold text-center border transition-all ${
                      isClaimed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : isCurrent
                        ? 'bg-gradient-to-r from-amber-50 to-emerald-50 border-emerald-500 text-emerald-900 shadow-xs ring-2 ring-emerald-400/30'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isClaimed ? `✓ Spin ${spinNum}` : isCurrent ? `🎯 Spin ${spinNum}` : `Spin ${spinNum}`}
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              Neeche button dabakar Spin #{usedSpins + 1} ghumayein
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. GLOWING VIBRANT AZURE BLUE ACTION BUTTON               */}
      {/* ========================================================= */}
      <div className="w-[92%] max-w-sm mx-auto mb-3">
        <button
          type="button"
          onClick={isOutOfSpins ? onUnlockBonusSpin : doSpin}
          disabled={isSpinning}
          className={`w-full py-4 px-6 rounded-full font-black text-base transition-all flex items-center justify-between shadow-xl cursor-pointer active:scale-98 ${
            isSpinning
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300'
              : isOutOfSpins
              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-[0_10px_28px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.45)]'
              : 'bg-gradient-to-r from-[#00A8FF] via-[#0070F3] to-[#0051FF] text-white shadow-[0_10px_28px_rgba(0,112,243,0.45)] hover:shadow-[0_12px_32px_rgba(0,112,243,0.55)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Disc className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
          </div>
          <span className="tracking-wide font-black">
            {isSpinning
              ? 'Ghoom Raha Hai...'
              : isOutOfSpins
              ? '🎁 Unlock Bonus Spin Now'
              : `Spin Now (${freeSpinsLeft}/3 Left)`}
          </span>
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* 6. FOOTER TRUST BADGE CAPSULE                             */}
      {/* ========================================================= */}
      <div className="w-[92%] max-w-sm mx-auto">
        <div className="py-2.5 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center gap-3">
          <span className="flex items-center gap-1 text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Instant Credit</span>
          </span>
          <span className="text-slate-300">•</span>
          <span>Daily 3 Free Spins + Bonus</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RESULT CELEBRATION MODAL                                  */}
      {/* ========================================================= */}
      {showResultModal && wonSegment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border-2 border-amber-400 rounded-3xl p-7 text-center shadow-2xl max-w-xs w-full space-y-3 animate-zoom-in">
            <div className="text-5xl">{resEmoji}</div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Badhai Ho!
              </span>
              <h3 className="text-base font-black text-slate-900 pt-1">
                Aapne Spin Me Jeeta
              </h3>
              <div className="text-5xl font-black text-emerald-600 py-1 font-mono">
                {wonSegment.label}
              </div>
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold space-y-0.5">
                <div>✓ Seedha Aapke Wallet Me Credit Ho Gaya!</div>
                <div className="text-sm font-black font-mono text-emerald-700">
                  Total Wallet: ₹{walletBalance.toFixed(2)}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1">
                {freeSpinsLeft - 1 > 0
                  ? `Abhi ${freeSpinsLeft - 1} spins baaki hain!`
                  : 'Aaj ke 3 spins pure ho gaye! Naya bonus spin unlock karein.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClaim}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm shadow-md cursor-pointer active:scale-95 transition-all"
            >
              Collect ₹{wonSegment.label} &amp; Done ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
