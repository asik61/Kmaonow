import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface SpinWheelProps {
  freeSpinsLeft?: number;
  dailyClaimed: boolean;
  onRewardWon: (amount: number) => void;
}

interface Segment {
  label: string;
  value: number;
  c1: string;
  c2: string;
  c3: string;
}

const SEGS: Segment[] = [
  { label: '₹1.00', value: 1.0, c1: '#F5C518', c2: '#C89000', c3: '#8a6000' },
  { label: '₹0.50', value: 0.50, c1: '#CE93D8', c2: '#8E24AA', c3: '#4A0072' },
  { label: '₹0.35', value: 0.35, c1: '#F97316', c2: '#C2410C', c3: '#7c2d00' },
  { label: '₹0.25', value: 0.25, c1: '#2DD4BF', c2: '#0F766E', c3: '#134e4a' },
  { label: '₹0.10', value: 0.10, c1: '#F472B6', c2: '#BE185D', c3: '#831843' },
  { label: '₹0.25', value: 0.25, c1: '#60A5FA', c2: '#1D4ED8', c3: '#1e3a8a' },
  { label: '₹0.15', value: 0.15, c1: '#4ADE80', c2: '#15803D', c3: '#14532d' },
  { label: '₹0.35', value: 0.35, c1: '#F5C518', c2: '#C89000', c3: '#8a6000' },
];

export const SpinWheel: React.FC<SpinWheelProps> = ({ dailyClaimed, onRewardWon }) => {
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
  const WS = 290;
  const WC = WS / 2;
  const WR = 132;

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

  // Web Audio Context Helper
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

  const playWheelTick = useCallback(() => {
    try {
      const ac = getAudioContext();
      if (!ac) return;
      const t = ac.currentTime;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g);
      g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(320, t);
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      o.start(t);
      o.stop(t + 0.06);
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
        g.gain.linearRampToValueAtTime(0.22, b + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, b + 0.45);
        o.start(b);
        o.stop(b + 0.5);
      });
    } catch {
      // Ignore
    }
  }, [getAudioContext]);

  // Helper drawing functions
  const drawCoin = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, '#FFF5B0');
    g.addColorStop(0.4, '#FFD700');
    g.addColorStop(0.75, '#C8960A');
    g.addColorStop(1, '#7a5800');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, PI2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  };

  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, pts: number, or: number, ir: number) => {
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const r = i % 2 === 0 ? or : ir;
      const a = (i * Math.PI) / pts - Math.PI / 2;
      if (i === 0) ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      else ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,120,0,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  const drawWheel = useCallback((angle: number) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const wx = cv.getContext('2d');
    if (!wx) return;

    wx.clearRect(0, 0, WS, WS);
    const sA = PI2 / N;

    // Outer Shadow
    wx.save();
    wx.beginPath();
    wx.arc(WC, WC, WR + 14, 0, PI2);
    wx.fillStyle = 'rgba(0,0,0,0.3)';
    wx.fill();
    wx.restore();

    // Outer Gold Ring 1 (Dark Gold)
    const g1 = wx.createLinearGradient(0, 0, WS, WS);
    g1.addColorStop(0, '#A07000');
    g1.addColorStop(0.5, '#FFD700');
    g1.addColorStop(1, '#6B4500');
    wx.beginPath();
    wx.arc(WC, WC, WR + 13, 0, PI2);
    wx.fillStyle = g1;
    wx.fill();

    // Outer Ring 2 (Bevel Highlight)
    const g2 = wx.createLinearGradient(0, 0, WS, WS);
    g2.addColorStop(0, '#FFE875');
    g2.addColorStop(0.5, '#C89000');
    g2.addColorStop(1, '#FFD700');
    wx.beginPath();
    wx.arc(WC, WC, WR + 10, 0, PI2);
    wx.fillStyle = g2;
    wx.fill();

    // Outer Ring 3 (Inner Groove)
    wx.beginPath();
    wx.arc(WC, WC, WR + 3, 0, PI2);
    wx.fillStyle = '#1c0c00';
    wx.fill();

    // Wheel Disc Background
    wx.beginPath();
    wx.arc(WC, WC, WR, 0, PI2);
    wx.fillStyle = '#111';
    wx.fill();

    // Draw Segments
    for (let i = 0; i < N; i++) {
      const a1 = angle + i * sA;
      const a2 = a1 + sA;
      const seg = SEGS[i];

      wx.save();
      wx.beginPath();
      wx.moveTo(WC, WC);
      wx.arc(WC, WC, WR, a1, a2);
      wx.closePath();

      const sg = wx.createRadialGradient(WC, WC, 15, WC, WC, WR);
      sg.addColorStop(0, seg.c1);
      sg.addColorStop(0.7, seg.c2);
      sg.addColorStop(1, seg.c3);
      wx.fillStyle = sg;
      wx.fill();

      wx.strokeStyle = 'rgba(255,255,255,0.45)';
      wx.lineWidth = 1.5;
      wx.stroke();
      wx.restore();

      // Divider Line
      wx.save();
      wx.beginPath();
      wx.moveTo(WC, WC);
      wx.lineTo(WC + Math.cos(a1) * WR, WC + Math.sin(a1) * WR);
      wx.strokeStyle = 'rgba(0,0,0,0.35)';
      wx.lineWidth = 1.5;
      wx.stroke();
      wx.restore();

      // Label Text & Indian Rupee Coin
      const midA = a1 + sA / 2;
      wx.save();
      wx.translate(WC, WC);
      wx.rotate(midA);
      wx.textAlign = 'right';
      wx.textBaseline = 'middle';

      // Drop Shadow for text
      wx.shadowColor = 'rgba(0,0,0,0.7)';
      wx.shadowBlur = 4;
      wx.shadowOffsetX = 1;
      wx.shadowOffsetY = 1;

      wx.font = '900 13px system-ui, sans-serif';
      wx.fillStyle = '#FFFFFF';
      wx.fillText(seg.label, WR - 22, 0);

      wx.shadowColor = 'transparent';
      drawCoin(wx, WR - 10, 0, 5.5);
      wx.restore();
    }

    // Glass shine overlay
    wx.save();
    wx.translate(WC, WC);
    const shine = wx.createLinearGradient(-WR, -WR, WR, WR);
    shine.addColorStop(0, 'rgba(255,255,255,0.18)');
    shine.addColorStop(0.4, 'rgba(255,255,255,0.05)');
    shine.addColorStop(0.6, 'rgba(255,255,255,0)');
    shine.addColorStop(1, 'rgba(0,0,0,0.15)');
    wx.beginPath();
    wx.arc(0, 0, WR, 0, PI2);
    wx.fillStyle = shine;
    wx.fill();
    wx.restore();

    // Perimeter Gold Stud Coins
    for (let i = 0; i < N; i++) {
      const mA = angle + i * sA + sA / 2 - Math.PI / 2;
      drawCoin(wx, WC + Math.cos(mA) * (WR + 6), WC + Math.sin(mA) * (WR + 6), 8.5);
    }

    // Center Gold Hub with 5-point Star
    const hub = wx.createRadialGradient(WC - 10, WC - 12, 2, WC, WC, 34);
    hub.addColorStop(0, '#FFF5B0');
    hub.addColorStop(0.3, '#FFD700');
    hub.addColorStop(0.7, '#B8860B');
    hub.addColorStop(1, '#5a3e00');
    wx.beginPath();
    wx.arc(WC, WC, 34, 0, PI2);
    wx.fillStyle = hub;
    wx.fill();
    wx.beginPath();
    wx.arc(WC, WC, 34, 0, PI2);
    wx.strokeStyle = 'rgba(0,0,0,0.35)';
    wx.lineWidth = 2;
    wx.stroke();

    wx.save();
    wx.translate(WC, WC);
    drawStar(wx, 0, 0, 5, 20, 9);
    wx.restore();
  }, [N, PI2, WC, WR, WS]);

  useEffect(() => {
    drawWheel(0);
  }, [drawWheel]);

  const doSpin = () => {
    if (isSpinningRef.current || dailyClaimed) return;
    isSpinningRef.current = true;
    setIsSpinning(true);

    const ti = Math.floor(Math.random() * N);
    const sA = PI2 / N;
    const tA = (7 + Math.random() * 5) * PI2 + (PI2 - (ti * sA + sA / 2));
    const dur = 5200;
    const t0 = performance.now();
    const a0 = wheelAngleRef.current;
    let ls = -1;

    const ease = (t: number) => 1 - Math.pow(1 - t, 4);

    const frame = (now: number) => {
      const t = Math.min((now - t0) / dur, 1);
      wheelAngleRef.current = a0 + tA * ease(t);
      drawWheel(wheelAngleRef.current);

      const norm = ((-wheelAngleRef.current % PI2) + PI2) % PI2;
      const si = Math.floor(((norm + Math.PI / 2) % PI2) / sA) % N;

      if (si !== ls && t < 0.96) {
        playWheelTick();
        ls = si;
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        isSpinningRef.current = false;
        setIsSpinning(false);
        playWinJingle();

        const emos = ['🎉', '💰', '🤑', '✨', '🎊'];
        setResEmoji(emos[Math.floor(Math.random() * emos.length)]);
        setWonSegment(SEGS[ti]);
        setShowResultModal(true);
      }
    };

    requestAnimationFrame(frame);
  };

  const handleClaim = () => {
    setShowResultModal(false);
    if (wonSegment) {
      onRewardWon(wonSegment.value);
    }
  };

  return (
    <div className="w-full flex justify-center py-2 animate-fade-in select-none">
      <style>{`
        @keyframes borderRainbowSpin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Main Container matching Lucky Spin Wheel wrap */}
      <div className="relative w-full max-w-[400px] rounded-3xl p-5 text-center overflow-hidden bg-gradient-to-b from-[#0a3d2b] to-[#051f17] border border-amber-400/25 shadow-2xl">
        {/* Result Overlay Modal */}
        {showResultModal && wonSegment && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center z-50 gap-4 p-4 animate-fade-in">
            <div className="bg-gradient-to-br from-[#0e5438] to-[#083320] border-[2.5px] border-[#FFD700] rounded-3xl px-8 py-7 text-center shadow-[0_0_40px_rgba(255,215,0,0.3)] max-w-xs w-full">
              <div className="text-5xl mb-2">{resEmoji}</div>
              <div className="text-white/80 text-sm mb-1 font-semibold">Badhai ho! Aapne jeeta</div>
              <div className="text-[#FFD700] text-5xl font-black mb-1 drop-shadow-md">{wonSegment.label}</div>
              <div className="text-white/50 text-xs">Wallet mein instant add ho jayega</div>
            </div>
            <button
              type="button"
              onClick={handleClaim}
              className="bg-gradient-to-b from-[#FFE566] to-[#FFB800] hover:from-[#FFF090] hover:to-[#FFC820] text-[#2a1500] font-black text-base px-9 py-3.5 rounded-2xl cursor-pointer shadow-lg active:scale-95 transition-transform"
            >
              Claim Karo!
            </button>
          </div>
        )}

        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold mb-3 tracking-wide shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Daily 1 Free Spin Only • Real Cash</span>
        </div>

        {/* Ribbon */}
        <div className="mb-3">
          <span
            className="inline-block text-white text-sm font-extrabold px-9 py-1.5 shadow-md"
            style={{
              background: 'linear-gradient(135deg,#c42020,#ff3333,#c42020)',
              clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0% 50%)',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            Lucky Fortune Wheel!
          </span>
        </div>

        {/* Wheel Outer with Top Pointer */}
        <div className="relative w-[290px] h-[290px] mx-auto mb-1">
          {/* Top Gold Pointer Needle */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
            <div className="w-8 h-3.5 bg-gradient-to-b from-[#FFF0A0] to-[#FFD700] rounded-t-sm -mb-0.5 shadow-sm" />
            <div
              className="w-8 h-11 bg-gradient-to-b from-[#FFE566] via-[#D4A000] to-[#A07000]"
              style={{
                clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.55))',
              }}
            />
          </div>

          {/* HTML5 Canvas */}
          <canvas ref={canvasRef} width={290} height={290} className="w-[290px] h-[290px] block" />
        </div>

        {/* Daily 1 Free Spin Status & Midnight Reset Counter */}
        {dailyClaimed ? (
          <div className="mt-3 p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-center max-w-[300px] mx-auto space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 font-black text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Aaj Ka 1 Free Spin Claimed (1/1)</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-white/70 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>
                Agla Free Spin:{' '}
                <span className="font-mono font-bold text-amber-300">
                  {midnightTimer || 'Midnight'}
                </span>{' '}
                mein unlock hoga
              </span>
            </div>
          </div>
        ) : (
          <p className="text-white/90 text-sm mt-2 font-medium">
            Daily Free Spin:{' '}
            <span className="text-amber-300 font-extrabold text-base">
              1/1 Available Today
            </span>
          </p>
        )}

        {/* Spin Button */}
        <div
          className="relative w-full max-w-[280px] mx-auto mt-4 rounded-2xl p-[3px] shadow-[0_0_20px_rgba(255,165,0,0.5)]"
          style={{
            background: 'linear-gradient(135deg,#FFD700,#ff6b00,#ff0080,#FFD700)',
            backgroundSize: '300% 300%',
            animation: 'borderRainbowSpin 2.5s linear infinite',
          }}
        >
          <button
            type="button"
            onClick={doSpin}
            disabled={isSpinning || dailyClaimed}
            className={`w-full py-4 rounded-[13px] text-white font-black text-base tracking-wide transition-all shadow-lg cursor-pointer ${
              isSpinning || dailyClaimed
                ? 'bg-gradient-to-b from-[#2b2b2b] to-[#1c1c1c] text-white/40 cursor-not-allowed border border-white/10'
                : 'bg-gradient-to-b from-[#e65c00] via-[#b83200] to-[#8a1f00] hover:from-[#ff6600] hover:to-[#992200] active:scale-[0.97]'
            }`}
          >
            {isSpinning
              ? 'Ghoom Raha Hai...'
              : dailyClaimed
              ? 'Aaj Ka Spin Claimed ✓'
              : '🎉 Spin The Wheel (1 Free)'}
          </button>
        </div>

        {/* Tagline */}
        <p className="text-white/40 text-[11px] mt-3 leading-relaxed">
          Daily Strictly 1 Free Spin Only • Instant Real Cash Added to Wallet
          <br />
          Counter resets every midnight at 00:00 AM.
        </p>
      </div>
    </div>
  );
};
