import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ScratchCardProps {
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

export const ScratchCard: React.FC<ScratchCardProps> = ({ onRewardWon }) => {
  const [currentPrize, setCurrentPrize] = useState(PRIZES[6]);
  const [sparkle, setSparkle] = useState('✦★✦');
  const [serial, setSerial] = useState('TC-784920');
  const [scratchedPct, setScratchedPct] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDownRef = useRef(false);
  const isRevealedRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio Context helper
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

    ctx.fillStyle = 'rgba(60,60,70,0.6)';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦  SCRATCH HERE  ✦', W / 2, H / 2 - 12);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(50,50,60,0.45)';
    ctx.fillText('Yahan scratch karo aur jeeto', W / 2, H / 2 + 12);
  }, []);

  const setupNewCard = useCallback(() => {
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
    }, 20);
  }, [initScratchSurface]);

  useEffect(() => {
    setupNewCard();
  }, [setupNewCard]);

  // Touch and mouse scratch handlers
  const handleStart = (clientX: number, clientY: number) => {
    if (isRevealedRef.current) return;
    isDownRef.current = true;
    const cv = canvasRef.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    lastPosRef.current = { x: clientX - r.left, y: clientY - r.top };
    handleMove(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDownRef.current || isRevealedRef.current) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const r = cv.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;

    ctx.globalCompositeOperation = 'destination-out';
    const PI2 = Math.PI * 2;

    if (lastPosRef.current) {
      const dist = Math.hypot(x - lastPosRef.current.x, y - lastPosRef.current.y);
      const steps = Math.max(1, Math.floor(dist / 3));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const ix = lastPosRef.current.x + (x - lastPosRef.current.x) * t;
        const iy = lastPosRef.current.y + (y - lastPosRef.current.y) * t;
        ctx.beginPath();
        ctx.ellipse(ix, iy, 22, 10, Math.atan2(y - lastPosRef.current.y, x - lastPosRef.current.x), 0, PI2);
        ctx.fill();

        for (let b = 0; b < 3; b++) {
          ctx.beginPath();
          ctx.arc(ix + (Math.random() - 0.5) * 28, iy + (Math.random() - 0.5) * 14, 2 + Math.random() * 3, 0, PI2);
          ctx.fill();
        }
      }
    } else {
      ctx.beginPath();
      ctx.ellipse(x, y, 22, 10, 0, 0, PI2);
      ctx.fill();
    }

    lastPosRef.current = { x, y };
    playScratchSound();

    // Check progress
    const W = cv.width;
    const H = cv.height;
    const d = ctx.getImageData(0, 0, W, H).data;
    let c = 0;
    for (let i = 3; i < d.length; i += 4) {
      if (d[i] < 64) c++;
    }
    const pct = Math.min(Math.round((c / (W * H)) * 100), 100);
    setScratchedPct(pct);

    if (pct >= 55 && !isRevealedRef.current) {
      isRevealedRef.current = true;
      setIsRevealed(true);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(0, 0, W, H);
      setScratchedPct(100);
      playWinJingle();

      if (!hasClaimed) {
        setHasClaimed(true);
        onRewardWon(currentPrize.value);
      }
    }
  };

  const handleEnd = () => {
    isDownRef.current = false;
    lastPosRef.current = null;
  };

  return (
    <div className="w-full flex justify-center py-2 animate-fade-in select-none">
      <style>{`
        @keyframes floatParticle {
          0% { transform: translateY(100%) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-130%) scale(1.1); opacity: 0; }
        }
        @keyframes glowAnim {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes headerShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes sparklePulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes prizeGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(255,215,0,0.6); }
          50% { text-shadow: 0 0 50px rgba(255,215,0,1), 0 0 90px rgba(255,140,0,0.7); }
        }
        @keyframes handMotion {
          0%, 100% { transform: translateX(-5px) rotate(-10deg); }
          50% { transform: translateX(5px) rotate(10deg); }
        }
        @keyframes winPop {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes borderRainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Main Page Wrap */}
      <div className="relative w-full max-w-[400px] rounded-3xl p-5 text-center overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#0d1a0d] to-[#0a0a1a] border border-amber-500/20 shadow-2xl">
        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${3 + (i % 4) * 2}px`,
                height: `${3 + (i % 4) * 2}px`,
                left: `${(i * 6.5) % 100}%`,
                bottom: '-10px',
                backgroundColor: i % 2 === 0 ? 'rgba(255,215,0,0.35)' : 'rgba(255,140,0,0.25)',
                animation: `floatParticle ${5 + (i % 5)}s linear infinite`,
                animationDelay: `${(i * 0.4) % 4}s`,
              }}
            />
          ))}
        </div>

        {/* Top Badge */}
        <div className="relative z-10 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-bold mb-4 tracking-wide shadow-xs">
          <span>⚡ Scratch &amp; Win Instant Cash</span>
        </div>

        {/* Card Wrap with Animated Glowing Border */}
        <div className="relative z-10 w-[290px] mx-auto">
          <div
            className="absolute -inset-2 rounded-[26px] opacity-40 blur-md pointer-events-none"
            style={{
              background: 'linear-gradient(135deg,#FFD700,#ff6b00,#FFD700)',
              backgroundSize: '300% 300%',
              animation: 'glowAnim 3s ease infinite',
            }}
          />

          {/* Actual Scratch Card Body */}
          <div className="relative z-10 rounded-2xl bg-gradient-to-br from-[#1a0a2e] via-[#0d0520] to-[#1a0a2e] border-2 border-amber-400/35 overflow-hidden shadow-2xl">
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg,#FFD700,#ff8c00,#FFD700)',
                backgroundSize: '200% 200%',
                animation: 'headerShift 3s ease infinite',
              }}
            >
              <div className="text-lg font-black text-[#1a0500] tracking-widest uppercase">
                TASKPAY
              </div>
              <div className="bg-black/25 rounded-full px-2.5 py-1 text-[10px] font-black text-white tracking-wider">
                FREE CARD
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3.5">
              {/* Scratch Canvas Zone */}
              <div className="relative w-full h-[175px] rounded-xl overflow-hidden cursor-crosshair border border-amber-400/20 shadow-inner">
                {/* Prize Hidden Below */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1a0a3e,#0a0515)] flex flex-col items-center justify-center gap-0.5">
                  <div
                    className="text-lg tracking-[6px]"
                    style={{ animation: 'sparklePulse 1.5s ease-in-out infinite' }}
                  >
                    {sparkle}
                  </div>
                  <div
                    className="text-amber-400 text-5xl font-black leading-none my-1"
                    style={{ animation: 'prizeGlow 2s ease-in-out infinite' }}
                  >
                    {currentPrize.label}
                  </div>
                  <div className="text-[11px] text-amber-300/70 tracking-[3px] font-bold mt-1">
                    AAPNE JEETA
                  </div>
                </div>

                {/* Canvas Overlay */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 rounded-xl touch-none"
                  onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                  onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                  onMouseUp={handleEnd}
                  onMouseLeave={handleEnd}
                  onTouchStart={(e) => {
                    const t = e.touches[0];
                    handleStart(t.clientX, t.clientY);
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    const t = e.touches[0];
                    handleMove(t.clientX, t.clientY);
                  }}
                  onTouchEnd={handleEnd}
                />
              </div>

              {/* Hint Row */}
              {!isRevealed && (
                <div className="mt-2.5 flex items-center justify-center gap-2 text-white/40 text-[11px] font-medium transition-opacity">
                  <span style={{ animation: 'handMotion 1s ease-in-out infinite' }} className="text-lg">
                    ✌️
                  </span>
                  <span>Yahan scratch karo</span>
                  <span style={{ animation: 'handMotion 1s ease-in-out infinite' }} className="text-lg">
                    ✌️
                  </span>
                </div>
              )}

              {/* Progress Bar Row */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FFD700] to-[#ff6b00] rounded-full transition-all duration-75"
                    style={{ width: `${scratchedPct}%` }}
                  />
                </div>
                <div className="text-[10px] text-amber-300/60 font-bold min-w-[28px] text-right">
                  {scratchedPct}%
                </div>
              </div>

              {/* Win Notification Box */}
              {isRevealed && (
                <div
                  className="mt-3 rounded-xl p-3 bg-gradient-to-r from-amber-400/15 to-orange-500/10 border border-amber-400/40 text-center"
                  style={{ animation: 'winPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                >
                  <div className="text-amber-400 font-black text-xl">
                    🎉 {currentPrize.label} jeeta!
                  </div>
                  <div className="text-white/50 text-[11px] mt-0.5">
                    Amount wallet mein add ho gaya hai
                  </div>
                </div>
              )}

              {/* Card Footer */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/10 text-[9px] text-white/20 font-mono tracking-wider">
                <span>{serial}</span>
                <span>VALID 24 HRS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Naya Card Lo Action Button */}
        <div
          className="relative z-10 w-[290px] mx-auto mt-4 rounded-2xl p-[3px] shadow-[0_0_20px_rgba(255,165,0,0.4)]"
          style={{
            background: 'linear-gradient(135deg,#FFD700,#ff6b00,#ff0080,#FFD700)',
            backgroundSize: '300% 300%',
            animation: 'borderRainbow 2.5s linear infinite',
          }}
        >
          <button
            type="button"
            onClick={setupNewCard}
            className="w-full py-3.5 rounded-[13px] bg-gradient-to-b from-[#e65c00] via-[#b83200] to-[#8a1f00] hover:from-[#ff6600] hover:to-[#992200] text-white font-black text-base tracking-wide transition-transform active:scale-[0.97] cursor-pointer shadow-lg"
          >
            🎁 Naya Card Lo
          </button>
        </div>

        {/* Tagline */}
        <p className="relative z-10 text-white/25 text-[11px] mt-3 leading-relaxed">
          Roz ek free scratch card milti hai
          <br />
          Turant cash jito apne wallet mein
        </p>
      </div>
    </div>
  );
};
