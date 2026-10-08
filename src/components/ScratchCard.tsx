import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Bell,
  ChevronRight,
  ShieldCheck,
  Crown,
} from 'lucide-react';

interface ScratchCardProps {
  freeScratchesLeft?: number;
  totalDailyScratches?: number;
  dailyClaimed: boolean;
  walletBalance?: number;
  onRewardWon: (amount: number) => void;
  onUnlockBonusScratch?: () => void;
  onBack?: () => void;
  onOpenRules?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

const PRIZES = [
  { label: '₹0.25', value: 0.25 },
  { label: '₹0.35', value: 0.35 },
  { label: '₹0.50', value: 0.50 },
  { label: '₹1.00', value: 1.00 },
  { label: '₹0.15', value: 0.15 },
  { label: '₹0.40', value: 0.40 },
];

export const ScratchCard: React.FC<ScratchCardProps> = ({
  freeScratchesLeft = 3,
  totalDailyScratches = 3,
  dailyClaimed,
  walletBalance = 0,
  onRewardWon,
  onUnlockBonusScratch,
  onBack,
  onOpenRules,
  onOpenNotifications,
  unreadNotificationsCount = 6,
}) => {
  const [currentPrize, setCurrentPrize] = useState(() => {
    return PRIZES[Math.floor(Math.random() * PRIZES.length)];
  });
  const [scratchedPct, setScratchedPct] = useState(dailyClaimed ? 100 : 0);
  const [isRevealed, setIsRevealed] = useState(dailyClaimed);
  const [hasClaimedCurrent, setHasClaimedCurrent] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [midnightTimer, setMidnightTimer] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDownRef = useRef(false);
  const isRevealedRef = useRef(dailyClaimed);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const isOutOfScratches = freeScratchesLeft <= 0 || dailyClaimed;
  const usedScratches = totalDailyScratches - freeScratchesLeft;

  // Live Countdown to Midnight
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

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playScratchSound = useCallback(() => {
    try {
      const ac = getAudioContext();
      if (!ac) return;
      const t = ac.currentTime;
      const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.05), ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      const src = ac.createBufferSource();
      const g = ac.createGain();
      const f = ac.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 2900;
      f.Q.value = 0.5;
      src.buffer = buf;
      src.connect(f);
      f.connect(g);
      g.connect(ac.destination);
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      src.start(t);
      src.stop(t + 0.05);
    } catch {
      // fallback
    }
  }, [getAudioContext]);

  const playWinJingle = useCallback(() => {
    try {
      const ac = getAudioContext();
      if (!ac) return;
      const notes: [number, number][] = [
        [523.25, 0],
        [659.25, 0.12],
        [783.99, 0.24],
        [1046.5, 0.36],
        [1318.5, 0.48],
      ];
      notes.forEach(([f, d]) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        const b = ac.currentTime + d;
        o.connect(g);
        g.connect(ac.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, b);
        g.gain.setValueAtTime(0, b);
        g.gain.linearRampToValueAtTime(0.25, b + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, b + 0.45);
        o.start(b);
        o.stop(b + 0.5);
      });
    } catch {
      // fallback
    }
  }, [getAudioContext]);

  const initScratchSurface = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const W = cv.offsetWidth || 280;
    const H = 190;

    const dpr = window.devicePixelRatio || 2;
    cv.width = W * dpr;
    cv.height = H * dpr;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // High-Quality Brushed Silver Metallic Texture
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#F1F5F9');
    grad.addColorStop(0.25, '#E2E8F0');
    grad.addColorStop(0.5, '#CBD5E1');
    grad.addColorStop(0.75, '#94A3B8');
    grad.addColorStop(1, '#64748B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Brushed metal streaks
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    for (let i = 0; i < H; i += 3) {
      ctx.fillRect(0, i, W, 1);
    }

    // Outer subtle border
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, W, H);

    // Centered Guide
    const cx = W / 2;
    const cy = H / 2;

    // Radiating soundwave tactile brackets
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.arc(cx - 24, cy - 35, 14, 0.75 * Math.PI, 1.25 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx + 24, cy - 35, 14, -0.25 * Math.PI, 0.25 * Math.PI);
    ctx.stroke();

    // Hand Touch Icon Emoji
    ctx.font = '26px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👆', cx, cy - 35);

    // Text Label: "SCRATCH HERE"
    ctx.font = '900 13px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#0F172A';
    ctx.fillText('SCRATCH HERE', cx, cy + 2);

    // Subtext: "Yahan ungli se ghishein"
    ctx.font = '700 10px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Yahan ungli se ghishein', cx, cy + 20);

    ctx.restore();
  }, []);

  useEffect(() => {
    if (!isOutOfScratches) {
      initScratchSurface();
      setIsRevealed(false);
      isRevealedRef.current = false;
      setHasClaimedCurrent(false);
      setScratchedPct(0);
    }
  }, [freeScratchesLeft, isOutOfScratches, initScratchSurface]);

  const scratchAt = (x: number, y: number) => {
    if (isRevealed || isOutOfScratches) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 2;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 36;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lastPosRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    lastPosRef.current = { x, y };
    playScratchSound();

    // Compute progress
    checkScratchProgress();
  };

  const checkScratchProgress = () => {
    if (isRevealedRef.current) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    try {
      const step = 16;
      const w = cv.width;
      const h = cv.height;
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      let clearCount = 0;
      let totalCount = 0;

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          totalCount++;
          const idx = (y * w + x) * 4 + 3;
          if (data[idx] < 128) {
            clearCount++;
          }
        }
      }

      const pct = Math.round((clearCount / totalCount) * 100);
      setScratchedPct(pct);

      if (pct >= 45 && !isRevealedRef.current) {
        isRevealedRef.current = true;
        setIsRevealed(true);
        setScratchedPct(100);
        ctx.clearRect(0, 0, cv.width, cv.height);
        playWinJingle();
        setShowResultModal(true);
        if (!hasClaimedCurrent) {
          setHasClaimedCurrent(true);
          onRewardWon(currentPrize.value);
        }
      }
    } catch {
      // fallback
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isRevealed || isOutOfScratches) return;
    isDownRef.current = true;
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    lastPosRef.current = { x, y };
    scratchAt(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDownRef.current || isRevealed || isOutOfScratches) return;
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return;
    scratchAt(e.clientX - r.left, e.clientY - r.top);
  };

  const handlePointerUp = () => {
    isDownRef.current = false;
    lastPosRef.current = null;
  };

  const handleAutoScratch = () => {
    if (isRevealed || isOutOfScratches) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, cv.width, cv.height);
    }
    isRevealedRef.current = true;
    setIsRevealed(true);
    setScratchedPct(100);
    playWinJingle();
    setShowResultModal(true);
    if (!hasClaimedCurrent) {
      setHasClaimedCurrent(true);
      onRewardWon(currentPrize.value);
    }
  };

  const handleClaim = () => {
    setShowResultModal(false);
    // Pick next random prize for the next scratch card
    setCurrentPrize(PRIZES[Math.floor(Math.random() * PRIZES.length)]);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pt-1 pb-4">
      {/* ========================================================= */}
      {/* 1. TOP HEADER APP BAR                                     */}
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

        <div className="flex items-center gap-2.5">
          {/* Niyam (Rules) Button */}
          <button
            type="button"
            onClick={onOpenRules}
            className="px-3.5 py-1.5 rounded-full bg-amber-100/90 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
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
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Scratch</h1>
          <span className="text-amber-400 text-2xl drop-shadow-[0_2px_4px_rgba(251,191,36,0.5)]">✨</span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Daily 3 free scratch cards ghumayein aur cash jeetein
        </p>
      </div>

      {/* ========================================================= */}
      {/* 3. LUXURY 3D EMERALD SCRATCH CARD                         */}
      {/* ========================================================= */}
      <div className="relative w-[92%] max-w-[325px] mx-auto rounded-[32px] p-4 bg-gradient-to-b from-[#022A1E] via-[#044D37] to-[#011C14] border-2 border-emerald-400/50 shadow-[0_16px_36px_rgba(4,77,55,0.35)] flex flex-col items-center mt-2 mb-2">
        {/* Floating Confetti Accents */}
        <div className="absolute top-2 left-3 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
        <div className="absolute top-4 right-3 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping delay-200" />

        {/* Card Header Bar: 👑 REAL MONEY + 100% FREE */}
        <div className="w-full flex items-center justify-between pb-3 px-1">
          <div className="flex items-center gap-1.5 text-amber-300 font-black text-xs tracking-wider drop-shadow-xs">
            <Crown className="w-4 h-4 fill-amber-300 text-amber-400" />
            <span>REAL MONEY</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase tracking-wider shadow-inner">
            Card #{usedScratches + 1}/3
          </span>
        </div>

        {/* Card Scratch Canvas Container with Bevel Inner Border */}
        <div className="relative w-full h-[190px] rounded-2xl overflow-hidden bg-white shadow-2xl flex items-center justify-center border-2 border-emerald-700/60">
          {/* Revealed Reward Layer underneath scratch */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-amber-50 via-yellow-50 to-emerald-50 p-4 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Aapne Jeeta
            </span>
            <div className="text-4xl font-black text-emerald-600 font-mono py-1 drop-shadow-sm">
              {currentPrize.label}
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-bold bg-amber-100/90 px-3 py-1 rounded-full shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Wallet Cash</span>
            </div>
          </div>

          {/* Canvas Scratch Layer */}
          {!isOutOfScratches && (
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '100%' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={`absolute inset-0 w-full h-full touch-none cursor-pointer ${
                isRevealed ? 'pointer-events-none' : ''
              }`}
            />
          )}

          {/* Already Claimed Watermark */}
          {isOutOfScratches && (
            <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center text-center p-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-1" />
              <div className="text-sm font-black text-slate-800">
                Aaj Ke Sabhi 3 Scratch Cards Claimed!
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Naye 3 cards midnight (12 AM) ko unlock honge.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subtitle Callout: ✌️ Ungli se pura scratch karo ✌️ */}
      <div className="text-center mt-2 mb-2">
        <p className="text-xs font-black text-slate-800 flex items-center justify-center gap-1.5">
          <span className="text-amber-500 text-sm">✌️</span>
          <span>Ungli se pura scratch karo</span>
          <span className="text-amber-500 text-sm">✌️</span>
        </p>
      </div>

      {/* ========================================================= */}
      {/* 4. DAILY 3 SCRATCH PROGRESS STATUS CARD                   */}
      {/* ========================================================= */}
      <div className="w-[92%] max-w-sm mx-auto mt-1 mb-3">
        {isOutOfScratches ? (
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-slate-900 font-black text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Aaj Ke Sabhi 3 Free Scratch Cards Claimed (3/3)</span>
            </div>
            {/* 3 Completed Card Badges */}
            <div className="flex items-center justify-center gap-2 pt-0.5">
              {[1, 2, 3].map((cardNum) => (
                <span
                  key={cardNum}
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"
                >
                  <span>✓</span> Card {cardNum}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium pt-0.5">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
              <span>
                Naye 3 Cards:{' '}
                <strong className="font-mono font-black text-slate-800">
                  {midnightTimer || '00:00:00'}
                </strong>{' '}
                mein unlock honge
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-sm text-center space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-black text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Aaj Ke Free Scratch Cards ({freeScratchesLeft}/{totalDailyScratches} Baaki)</span>
              </div>
              <span className="text-[11px] font-black font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {freeScratchesLeft} Left
              </span>
            </div>

            {/* 3 Step Progress Indicators */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((cardNum) => {
                const isClaimed = cardNum <= usedScratches;
                const isCurrent = cardNum === usedScratches + 1;
                return (
                  <div
                    key={cardNum}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold text-center border transition-all ${
                      isClaimed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : isCurrent
                        ? 'bg-gradient-to-r from-amber-50 to-emerald-50 border-emerald-500 text-emerald-900 shadow-xs ring-2 ring-emerald-400/30'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isClaimed ? `✓ Card ${cardNum}` : isCurrent ? `🎯 Card ${cardNum}` : `Card ${cardNum}`}
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              Ungli se Card #{usedScratches + 1} pura scratch karein
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. GLOWING VIBRANT SPRING GREEN ACTION BUTTON             */}
      {/* ========================================================= */}
      <div className="w-[92%] max-w-sm mx-auto mb-3">
        <button
          type="button"
          onClick={handleAutoScratch}
          disabled={isRevealed || isOutOfScratches}
          className={`w-full py-4 px-6 rounded-full font-black text-base transition-all flex items-center justify-between shadow-xl cursor-pointer active:scale-98 ${
            isRevealed || isOutOfScratches
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300'
              : 'bg-gradient-to-r from-[#00E676] via-[#00C853] to-[#009624] text-white shadow-[0_10px_28px_rgba(0,200,83,0.45)] hover:shadow-[0_12px_32px_rgba(0,200,83,0.55)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-lg">///</span>
          </div>
          <span className="tracking-wide font-black">
            {isRevealed
              ? 'Card Scratched ✓'
              : isOutOfScratches
              ? 'All 3 Cards Claimed Today ✓'
              : `Scratch The Card (${freeScratchesLeft}/3 Left)`}
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
            <span>100% Secure</span>
          </span>
          <span className="text-slate-300">•</span>
          <span>Daily 3 Free Scratch Cards</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RESULT CELEBRATION MODAL                                  */}
      {/* ========================================================= */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border-2 border-emerald-400 rounded-3xl p-7 text-center shadow-2xl max-w-xs w-full space-y-3 animate-zoom-in">
            <div className="text-5xl">🎁</div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Badhai Ho!
              </span>
              <h3 className="text-base font-black text-slate-900 pt-1">
                Scratch Card Me Jeeta
              </h3>
              <div className="text-5xl font-black text-emerald-600 py-1 font-mono">
                {currentPrize.label}
              </div>
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold space-y-0.5">
                <div>✓ Seedha Aapke Wallet Me Credit Ho Gaya!</div>
                <div className="text-sm font-black font-mono text-emerald-700">
                  Total Wallet: ₹{walletBalance.toFixed(2)}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {freeScratchesLeft - 1 > 0
                  ? `Wallet me credit ho gaya! (${freeScratchesLeft - 1} cards abhi baaki hain)`
                  : 'Wallet me instant credit ho gaya! Aaj ke 3 scratch cards pure ho gaye.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClaim}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm shadow-md cursor-pointer active:scale-95 transition-all"
            >
              {freeScratchesLeft - 1 > 0
                ? `Claim & Next Card (${freeScratchesLeft - 1} Left) ›`
                : 'Claim & Collect Cash ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
