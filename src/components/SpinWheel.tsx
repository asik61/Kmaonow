import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SpinWheelProps {
  freeSpinsLeft: number;
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
  { label: '₹1', value: 1.0, c1: '#F5C518', c2: '#C89000', c3: '#8a6000' },
  { label: '₹0.50', value: 0.50, c1: '#CE93D8', c2: '#8E24AA', c3: '#4A0072' },
  { label: '₹0.35', value: 0.35, c1: '#F97316', c2: '#C2410C', c3: '#7c2d00' },
  { label: '₹0.25', value: 0.25, c1: '#2DD4BF', c2: '#0F766E', c3: '#134e4a' },
  { label: '₹0.10', value: 0.10, c1: '#F472B6', c2: '#BE185D', c3: '#831843' },
  { label: '₹0.25', value: 0.25, c1: '#60A5FA', c2: '#1D4ED8', c3: '#1e3a8a' },
  { label: '₹0.15', value: 0.15, c1: '#4ADE80', c2: '#15803D', c3: '#14532d' },
  { label: '₹0.35', value: 0.35, c1: '#F5C518', c2: '#C89000', c3: '#8a6000' },
];

export const SpinWheel: React.FC<SpinWheelProps> = ({ freeSpinsLeft, onRewardWon }) => {
  const [spinsAvailable, setSpinsAvailable] = useState(freeSpinsLeft);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [wonSegment, setWonSegment] = useState<Segment | null>(null);
  const [resEmoji, setResEmoji] = useState('🎉');
  const [buttonText, setButtonText] = useState(freeSpinsLeft > 0 ? '🎉 Free Spin Karo!' : 'Kal wapas aao!');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wheelAngleRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isSpinningRef = useRef(false);

  const N = SEGS.length;
  const PI2 = Math.PI * 2;
  const WS = 290;
  const WC = WS / 2;
  const WR = 132;

  // Web Audio Context Helper
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

    // Outer Gold Rim
    const or = wx.createLinearGradient(WC - WR - 10, WC - WR - 10, WC + WR + 10, WC + WR + 10);
    or.addColorStop(0, '#FFF0A0');
    or.addColorStop(0.3, '#FFD700');
    or.addColorStop(0.6, '#C8960A');
    or.addColorStop(1, '#FFF0A0');
    wx.beginPath();
    wx.arc(WC, WC, WR + 10, 0, PI2);
    wx.fillStyle = or;
    wx.fill();

    wx.beginPath();
    wx.arc(WC, WC, WR + 3, 0, PI2);
    wx.fillStyle = 'rgba(0,0,0,0.12)';
    wx.fill();

    // Rotated Slices
    wx.save();
    wx.translate(WC, WC);
    wx.rotate(angle);

    for (let i = 0; i < N; i++) {
      const sa = i * sA - Math.PI / 2;
      const ea = sa + sA;
      const mid = sa + sA / 2;
      const s = SEGS[i];

      const gr = wx.createLinearGradient(
        Math.cos(mid) * WR * 0.15,
        Math.sin(mid) * WR * 0.15,
        Math.cos(mid) * WR,
        Math.sin(mid) * WR
      );
      gr.addColorStop(0, s.c1);
      gr.addColorStop(0.55, s.c2);
      gr.addColorStop(1, s.c3);

      wx.beginPath();
      wx.moveTo(0, 0);
      wx.arc(0, 0, WR, sa, ea);
      wx.closePath();
      wx.fillStyle = gr;
      wx.fill();

      // Divider Line
      wx.save();
      wx.rotate(sa);
      wx.beginPath();
      wx.moveTo(2, 0);
      wx.lineTo(WR - 1, 0);
      wx.strokeStyle = 'rgba(255,255,255,0.3)';
      wx.lineWidth = 1.5;
      wx.stroke();
      wx.restore();

      // Label
      wx.save();
      wx.rotate(mid);
      wx.translate(WR * 0.58, 0);
      wx.rotate(Math.PI / 2);
      wx.shadowColor = 'rgba(0,0,0,0.85)';
      wx.shadowBlur = 5;
      wx.shadowOffsetX = 1;
      wx.shadowOffsetY = 1;
      wx.fillStyle = '#fff';
      wx.font = 'bold 13px sans-serif';
      wx.textAlign = 'center';
      wx.textBaseline = 'middle';
      wx.fillText(s.label, 0, 0);
      wx.shadowColor = 'transparent';
      wx.restore();
    }

    // Top Shine Reflection
    const shine = wx.createRadialGradient(-WR * 0.2, -WR * 0.2, 0, 0, 0, WR);
    shine.addColorStop(0, 'rgba(255,255,255,0.28)');
    shine.addColorStop(0.35, 'rgba(255,255,255,0.06)');
    shine.addColorStop(1, 'rgba(0,0,0,0.2)');
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
    if (isSpinningRef.current || spinsAvailable <= 0) return;
    isSpinningRef.current = true;
    setIsSpinning(true);
    setSpinsAvailable(0);
    setButtonText('Ghoom raha hai...');

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
    setButtonText('Kal wapas aao!');
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
              <div className="text-white/50 text-xs">Wallet mein add ho jayega</div>
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
          <span>✨ Lucky Spin &amp; Win Real Cash</span>
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
            Fortune Spin Wheel!
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

        {/* Free Info */}
        <p className="text-white/90 text-sm mt-2 font-medium">
          Free Spin Available:{' '}
          <span className="text-amber-300 font-extrabold text-lg">{spinsAvailable}</span>
        </p>

        {/* Spin Button Outer with Animated Rainbow Border */}
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
            disabled={isSpinning || spinsAvailable <= 0}
            className={`w-full py-4 rounded-[13px] text-white font-black text-base tracking-wide transition-all shadow-lg active:scale-[0.97] cursor-pointer ${
              isSpinning || spinsAvailable <= 0
                ? 'bg-gradient-to-b from-[#333] to-[#222] text-white/35 cursor-not-allowed'
                : 'bg-gradient-to-b from-[#e65c00] via-[#b83200] to-[#8a1f00] hover:from-[#ff6600] hover:to-[#992200]'
            }`}
          >
            {buttonText}
          </button>
        </div>

        {/* Tagline */}
        <p className="text-white/30 text-[11px] mt-3 leading-relaxed">
          Spin karke turant cash jeetne ka mauka!
          <br />
          Roz 1 free spin milta hai.
        </p>
      </div>
    </div>
  );
};
