import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface ScratchCardProps {
  dailyClaimed: boolean;
  onRewardWon: (amount: number) => void;
}

const PRIZES = [
  { label: '₹0.10', value: 0.10 },
  { label: '₹0.15', value: 0.15 },
  { label: '₹0.25', value: 0.25 },
  { label: '₹0.25', value: 0.25 },
  { label: '₹0.35', value: 0.35 },
  { label: '₹0.35', value: 0.35 },
  { label: '₹0.50', value: 0.50 },
  { label: '₹1.00', value: 1.00 },
];

const SPARKLES = ['✦★✦', '⭐✨⭐', '💫⭐💫', '✨💰✨', '🌟✦🌟'];

export const ScratchCard: React.FC<ScratchCardProps> = ({ dailyClaimed, onRewardWon }) => {
  const [currentPrize, setCurrentPrize] = useState(PRIZES[6]);
  const [sparkle, setSparkle] = useState('✦★✦');
  const [serial, setSerial] = useState('TC-784920');
  const [scratchedPct, setScratchedPct] = useState(dailyClaimed ? 100 : 0);
  const [isRevealed, setIsRevealed] = useState(dailyClaimed);
  const [hasClaimed, setHasClaimed] = useState(dailyClaimed);
  const [midnightTimer, setMidnightTimer] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDownRef = useRef(false);
  const isRevealedRef = useRef(dailyClaimed);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

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

  // Web Audio Context helper
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
      const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.06), ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.35;
      }
      const src = ac.createBufferSource();
      const g = ac.createGain();
      const f = ac.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 2800;
      f.Q.value = 0.6;
      src.buffer = buf;
      src.connect(f);
      f.connect(g);
      g.connect(ac.destination);
      g.gain.setValueAtTime(0.4, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      src.start(t);
      src.stop(t + 0.06);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [getAudioContext]);

  const playWinJingle = useCallback(() => {
    try {
      const ac = getAudioContext();
      if (!ac) return;
      const notes: [number, number][] = [
        [523.25, 0],
        [659.25, 0.13],
        [783.99, 0.26],
        [1046.5, 0.39],
        [1318.5, 0.52],
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
      // Ignore
    }
  }, [getAudioContext]);

  const initScratchSurface = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const W = cv.offsetWidth || 262;
    const H = 175;
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    // Metallic Textured Pattern
    for (let y = 0; y < H; y++) {
      const n = Math.sin(y * 0.3) * 18 + Math.cos(y * 0.7) * 10;
      const l = Math.floor(140 + n + Math.random() * 8);
      ctx.fillStyle = `rgb(${l},${l},${Math.min(255, l + 12)})`;
      ctx.fillRect(0, y, W, 1);
    }

    const sh = ctx.createLinearGradient(0, 0, W * 0.6, H * 0.5);
    sh.addColorStop(0, 'rgba(255,255,255,0.55)');
    sh.addColorStop(0.5, 'rgba(255,255,255,0.1)');
    sh.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sh;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(60,60,70,0.65)';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦  SCRATCH HERE  ✦', W / 2, H / 2 - 12);
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(50,50,60,0.5)';
    ctx.fillText('Ungli se scratch karein aur jeetein', W / 2, H / 2 + 12);
  }, []);

  useEffect(() => {
    if (dailyClaimed) {
      isRevealedRef.current = true;
      setIsRevealed(true);
      setHasClaimed(true);
      setScratchedPct(100);
      const cv = canvasRef.current;
      if (cv) {
        const ctx = cv.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, cv.width, cv.height);
        }
      }
    } else {
      isRevealedRef.current = false;
      setIsRevealed(false);
      setHasClaimed(false);
      setScratchedPct(0);
      lastPosRef.current = null;
      isDownRef.current = false;

      const chosenPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
      setCurrentPrize(chosenPrize);
      setSparkle(SPARKLES[Math.floor(Math.random() * SPARKLES.length)]);
      setSerial('TC-' + Math.floor(100000 + Math.random() * 900000));

      setTimeout(() => {
        initScratchSurface();
      }, 50);
    }
  }, [dailyClaimed, initScratchSurface]);

  // Touch and mouse scratch handlers
  const handleStart = (clientX: number, clientY: number) => {
    if (isRevealedRef.current || dailyClaimed) return;
    isDownRef.current = true;
    const cv = canvasRef.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    lastPosRef.current = { x: clientX - r.left, y: clientY - r.top };
    handleMove(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDownRef.current || isRevealedRef.current || dailyClaimed) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const r = cv.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    if (lastPosRef.current) {
      ctx.beginPath();
      ctx.lineWidth = 44;
      ctx.lineCap = 'round';
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    lastPosRef.current = { x, y };

    playScratchSound();

    // Check scratch progress
    try {
      const W = cv.width;
      const H = cv.height;
      const step = 8;
      const imgData = ctx.getImageData(0, 0, W, H);
      const data = imgData.data;
      let clearCount = 0;
      let totalCount = 0;

      for (let py = 0; py < H; py += step) {
        for (let px = 0; px < W; px += step) {
          totalCount++;
          const idx = (py * W + px) * 4 + 3;
          if (data[idx] < 128) {
            clearCount++;
          }
        }
      }

      const pct = Math.min(100, Math.round((clearCount / totalCount) * 100));
      setScratchedPct(pct);

      if (pct >= 45 && !isRevealedRef.current) {
        revealCard(ctx, W, H);
      }
    } catch {
      // Fallback
    }
  };

  const handleEnd = () => {
    isDownRef.current = false;
    lastPosRef.current = null;
  };

  const revealCard = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    isRevealedRef.current = true;
    setIsRevealed(true);
    setScratchedPct(100);

    ctx.clearRect(0, 0, W, H);
    playWinJingle();

    if (!hasClaimed && !dailyClaimed) {
      setHasClaimed(true);
      onRewardWon(currentPrize.value);
    }
  };

  return (
    <div className="w-full flex justify-center py-2 animate-fade-in select-none">
      <style>{`
        @keyframes borderRainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes handMotion {
          0%, 100% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
        }
        @keyframes winPop {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Main Container */}
      <div className="relative w-full max-w-[400px] rounded-3xl p-5 text-center overflow-hidden bg-gradient-to-b from-[#0a3d2b] to-[#051f17] border border-amber-400/25 shadow-2xl">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold mb-3 tracking-wide shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Daily 1 Free Scratch Card Only • Instant Cash</span>
        </div>

        {/* Header Title */}
        <div className="mb-4">
          <h2 className="text-xl font-black text-white tracking-wide">
            Lucky Scratch &amp; Win!
          </h2>
          <p className="text-white/60 text-xs mt-0.5 font-medium">
            Rozana 1 free golden scratch card milta hai
          </p>
        </div>

        {/* Scratch Card Outer Envelope */}
        <div
          className="relative w-full max-w-[320px] mx-auto rounded-3xl p-[3px] shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
          style={{
            background: 'linear-gradient(135deg,#FFE066,#FFB800,#FF8C00,#FFE066)',
            backgroundSize: '300% 300%',
            animation: 'borderRainbow 4s linear infinite',
          }}
        >
          <div className="rounded-[22px] bg-gradient-to-b from-[#113829] to-[#0a2319] p-4 text-center border border-amber-300/30">
            {/* Card Frame */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#072518] to-[#03150e] border-2 border-amber-400/40 p-3 overflow-hidden shadow-inner">
              {/* Corner Ornaments */}
              <div className="absolute top-1 left-1.5 text-amber-400/40 text-[10px] font-mono">✦</div>
              <div className="absolute top-1 right-1.5 text-amber-400/40 text-[10px] font-mono">✦</div>
              <div className="absolute bottom-1 left-1.5 text-amber-400/40 text-[10px] font-mono">✦</div>
              <div className="absolute bottom-1 right-1.5 text-amber-400/40 text-[10px] font-mono">✦</div>

              {/* Card Title Header */}
              <div className="flex items-center justify-between text-[11px] font-black text-amber-300 tracking-wider mb-2 uppercase px-1">
                <span>Real Money Card</span>
                <span className="text-[10px] text-emerald-400 font-mono">100% Free</span>
              </div>

              {/* Scratch Area Wrapper */}
              <div className="relative w-full h-[175px] rounded-xl overflow-hidden shadow-inner bg-gradient-to-b from-[#04160d] to-[#010905] border border-amber-400/30">
                {/* Prize Underneath Layer */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 select-none">
                  <div className="text-amber-300 text-xs font-bold tracking-widest uppercase mb-1 opacity-80">
                    {sparkle} You Won {sparkle}
                  </div>
                  <div className="font-black text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-[#FFF59D] via-[#FFD700] to-[#FF8F00] drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]">
                    {currentPrize.label}
                  </div>
                  <div className="text-[11px] text-emerald-300 font-bold mt-1.5 bg-emerald-950/70 px-3 py-0.5 rounded-full border border-emerald-400/30">
                    ✓ Wallet Mein Add Ho Gaya
                  </div>
                </div>

                {/* HTML5 Scratch Surface Canvas */}
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full cursor-pointer z-10 touch-none ${
                    dailyClaimed ? 'hidden pointer-events-none' : ''
                  }`}
                  onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                  onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                  onMouseUp={handleEnd}
                  onMouseLeave={handleEnd}
                  onTouchStart={(e) => {
                    const t = e.touches[0];
                    handleStart(t.clientX, t.clientY);
                  }}
                  onTouchMove={(e) => {
                    const t = e.touches[0];
                    handleMove(t.clientX, t.clientY);
                  }}
                  onTouchEnd={handleEnd}
                />
              </div>

              {/* Scratch Hint */}
              {!dailyClaimed && !isRevealed && (
                <div className="mt-2.5 flex items-center justify-center gap-2 text-white/50 text-[11px] font-medium">
                  <span style={{ animation: 'handMotion 1s ease-in-out infinite' }} className="text-lg">
                    ✌️
                  </span>
                  <span>Ungli se pura scratch karo</span>
                  <span style={{ animation: 'handMotion 1s ease-in-out infinite' }} className="text-lg">
                    ✌️
                  </span>
                </div>
              )}

              {/* Progress Bar Row */}
              {!dailyClaimed && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FFD700] to-[#ff6b00] rounded-full transition-all duration-75"
                      style={{ width: `${scratchedPct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-amber-300/70 font-bold min-w-[28px] text-right">
                    {scratchedPct}%
                  </div>
                </div>
              )}

              {/* Card Footer */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 text-[9px] text-white/30 font-mono tracking-wider">
                <span>{serial}</span>
                <span>DAILY RESET: MIDNIGHT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Status / Daily Claimed Status */}
        {dailyClaimed || hasClaimed ? (
          <div className="relative z-10 w-[290px] mx-auto mt-4 p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-center shadow-lg space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 font-black text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>✓ Aaj Ka Free Scratch Card Claimed (1/1)</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-white/70 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>
                Agla Scratch Card:{' '}
                <span className="font-mono font-bold text-amber-300">
                  {midnightTimer || 'Midnight'}
                </span>{' '}
                mein unlock hoga
              </span>
            </div>
          </div>
        ) : (
          <div
            className="relative z-10 w-[290px] mx-auto mt-4 rounded-2xl p-[3px] shadow-[0_0_20px_rgba(255,165,0,0.4)]"
            style={{
              background: 'linear-gradient(135deg,#FFD700,#ff6b00,#ff0080,#FFD700)',
              backgroundSize: '300% 300%',
              animation: 'borderRainbow 2.5s linear infinite',
            }}
          >
            <div className="w-full py-3 rounded-[13px] bg-gradient-to-b from-[#e65c00] via-[#b83200] to-[#8a1f00] text-white font-black text-sm tracking-wide text-center shadow-lg">
              ✨ Scratch The Card Above
            </div>
          </div>
        )}

        {/* Tagline */}
        <p className="relative z-10 text-white/40 text-[11px] mt-3 leading-relaxed">
          Daily Strictly 1 Free Scratch Card Only • Instant UPI Cash
        </p>
      </div>
    </div>
  );
};
