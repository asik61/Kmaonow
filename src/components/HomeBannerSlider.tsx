import React, { useState, useEffect, useRef } from 'react';

interface HomeBannerSliderProps {
  onNavigate: (tab: 'spin' | 'scratch' | 'refer') => void;
}

export const HomeBannerSlider: React.FC<HomeBannerSliderProps> = ({ onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const slidesCount = 3;

  // Auto advance every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesCount);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesCount);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesCount) % slidesCount);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.12)] select-none border border-slate-200/80 bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider Container */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {/* ========================================================= */}
        {/* SLIDE 1: BRAND NEW SLEEK INVITE & EARN BANNER             */}
        {/* ========================================================= */}
        <div
          onClick={() => onNavigate('refer')}
          className="w-full shrink-0 cursor-pointer relative overflow-hidden"
          style={{ aspectRatio: '2.5 / 1', minHeight: '125px' }}
        >
          <svg viewBox="0 0 900 360" className="w-full h-full block" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="refBgCyber" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#022C22" />
                <stop offset="45%" stopColor="#065F46" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>

              <linearGradient id="goldCoinGloss" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="30%" stopColor="#FACC15" />
                <stop offset="70%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>

              <filter id="cardGlowCyber" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Background */}
            <rect width="900" height="360" fill="url(#refBgCyber)" />

            {/* Ambient Lighting & Geometric Accents */}
            <circle cx="720" cy="180" r="180" fill="#10B981" opacity="0.12" />
            <circle cx="720" cy="180" r="120" fill="#34D399" opacity="0.08" />
            <path d="M-50 360 L350 0 L420 0 L20 360 Z" fill="#FFFFFF" opacity="0.03" />

            {/* LEFT CONTENT */}
            <g transform="translate(60, 75)">
              {/* Golden Badge */}
              <g transform="translate(0, 0)">
                <rect width="195" height="32" rx="16" fill="#FACC15" opacity="0.18" stroke="#FDE047" strokeWidth="1.5" />
                <text x="97" y="21" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="0.5">
                  ⚡ 100% INSTANT CASHOUT
                </text>
              </g>

              {/* Headline */}
              <g transform="translate(0, 70)">
                <text x="0" y="0" fill="#FFFFFF" fontSize="48" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="-0.5">
                  Invite Friends
                </text>
                <text x="0" y="48" fill="#FACC15" fontSize="46" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="-0.5">
                  Earn ₹3 Every Friend!
                </text>
                <text x="0" y="85" fill="#D1FAE5" fontSize="19" fontWeight="600" fontFamily="system-ui, sans-serif">
                  Unlimited cash added directly to your wallet.
                </text>
              </g>

              {/* Action Pill Button */}
              <g transform="translate(0, 195)">
                <rect width="210" height="50" rx="25" fill="#FFFFFF" filter="url(#cardGlowCyber)" />
                <text x="105" y="32" textAnchor="middle" fill="#065F46" fontSize="20" fontWeight="900" fontFamily="system-ui, sans-serif">
                  Invite Now →
                </text>
              </g>
            </g>

            {/* RIGHT GRAPHIC: Modern 3D Smartphone with "+₹3.00 Added!" Notification & Coins */}
            <g transform="translate(710, 185)">
              {/* Background Glow */}
              <circle cx="0" cy="0" r="110" fill="#34D399" opacity="0.15" />

              {/* 3D Angled Smartphone Body */}
              <g transform="rotate(-8)">
                <rect x="-80" y="-130" width="160" height="250" rx="28" fill="#0F172A" stroke="#334155" strokeWidth="5" filter="url(#cardGlowCyber)" />
                <rect x="-70" y="-118" width="140" height="226" rx="20" fill="#022C22" />

                {/* Smartphone Screen Elements */}
                {/* App Header Bar */}
                <rect x="-70" y="-118" width="140" height="42" fill="#047857" />
                <circle cx="-45" cy="-97" r="10" fill="#34D399" />
                <text x="-45" y="-93" textAnchor="middle" fill="#064E3B" fontSize="12" fontWeight="900">K</text>
                <text x="5" y="-93" fill="#FFFFFF" fontSize="14" fontWeight="800">KamaoNow</text>

                {/* Screen Center Balance */}
                <text x="0" y="-30" textAnchor="middle" fill="#A7F3D0" fontSize="12" fontWeight="700">Wallet Balance</text>
                <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontSize="28" fontWeight="900">₹ 24.75</text>

                {/* Floating In-App Green Notification Pill: "+₹3.00 Added!" */}
                <g transform="translate(0, 48)">
                  <rect x="-62" y="-18" width="124" height="36" rx="18" fill="#10B981" stroke="#34D399" strokeWidth="2" filter="url(#cardGlowCyber)" />
                  <circle cx="-42" cy="0" r="10" fill="#FFFFFF" />
                  <text x="-42" y="4" textAnchor="middle" fill="#047857" fontSize="12" fontWeight="900">✓</text>
                  <text x="14" y="5" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="900">+₹3.00 Added</text>
                </g>
              </g>

              {/* 3D Gold Rupee Coins Radiating Around Phone */}
              <g transform="translate(-95, -75) rotate(-15)">
                <circle cx="0" cy="0" r="28" fill="url(#goldCoinGloss)" stroke="#CA8A04" strokeWidth="3" filter="url(#cardGlowCyber)" />
                <circle cx="0" cy="0" r="22" fill="#FDE047" />
                <text x="0" y="8" textAnchor="middle" fill="#713F12" fontSize="24" fontWeight="900">₹</text>
              </g>

              <g transform="translate(100, -60) rotate(15)">
                <circle cx="0" cy="0" r="24" fill="url(#goldCoinGloss)" stroke="#CA8A04" strokeWidth="3" filter="url(#cardGlowCyber)" />
                <circle cx="0" cy="0" r="19" fill="#FDE047" />
                <text x="0" y="7" textAnchor="middle" fill="#713F12" fontSize="20" fontWeight="900">₹</text>
              </g>

              <g transform="translate(85, 80) rotate(-10)">
                <circle cx="0" cy="0" r="32" fill="url(#goldCoinGloss)" stroke="#CA8A04" strokeWidth="3.5" filter="url(#cardGlowCyber)" />
                <circle cx="0" cy="0" r="25" fill="#FDE047" />
                <text x="0" y="10" textAnchor="middle" fill="#713F12" fontSize="28" fontWeight="900">₹</text>
              </g>

              {/* Sparkles */}
              <path d="M-115 40 Q-115 52 -103 52 Q-115 52 -115 64 Q-115 52 -127 52 Q-115 52 -115 40 Z" fill="#FDE047" />
              <path d="M110 5 Q110 17 122 17 Q110 17 110 29 Q110 17 98 17 Q110 17 110 5 Z" fill="#FFFFFF" />
            </g>
          </svg>
        </div>

        {/* ========================================================= */}
        {/* SLIDE 2: SPIN & WIN WITH REAL AMOUNTS ON WHEEL SLICES     */}
        {/* ========================================================= */}
        <div
          onClick={() => onNavigate('spin')}
          className="w-full shrink-0 cursor-pointer relative overflow-hidden"
          style={{ aspectRatio: '2.5 / 1', minHeight: '125px' }}
        >
          <svg viewBox="0 0 900 360" className="w-full h-full block" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="spinBgNew2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B0764" />
                <stop offset="50%" stopColor="#581C87" />
                <stop offset="100%" stopColor="#7E22CE" />
              </linearGradient>

              <linearGradient id="goldRimWheel2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>

              <filter id="spinGlow2" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Background */}
            <rect width="900" height="360" fill="url(#spinBgNew2)" />

            {/* Decorative background aura */}
            <circle cx="700" cy="180" r="170" fill="#FFFFFF" opacity="0.06" />
            <circle cx="700" cy="180" r="130" fill="#FFFFFF" opacity="0.06" />

            {/* LEFT CONTENT */}
            <g transform="translate(60, 80)">
              {/* Category Pill */}
              <g transform="translate(0, 0)">
                <rect width="180" height="32" rx="16" fill="#2E1065" opacity="0.85" />
                <text x="90" y="21" textAnchor="middle" fill="#E9D5FF" fontSize="13" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="0.5">
                  🎡 DAILY LUCKY WHEEL
                </text>
              </g>

              {/* Headline */}
              <g transform="translate(0, 70)">
                <text x="0" y="0" fill="#FFFFFF" fontSize="48" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="-0.5">
                  Spin &amp; <tspan fill="#FDE047">Win Cash</tspan>
                </text>
                <text x="0" y="38" fill="#E9D5FF" fontSize="20" fontWeight="600" fontFamily="system-ui, sans-serif">
                  Spin the wheel daily &amp; win up to ₹50!
                </text>
              </g>

              {/* Call to Action Button */}
              <g transform="translate(0, 155)">
                <rect width="180" height="48" rx="24" fill="#FACC15" filter="url(#spinGlow2)" />
                <text x="90" y="31" textAnchor="middle" fill="#3B0764" fontSize="19" fontWeight="900" fontFamily="system-ui, sans-serif">
                  Spin Now →
                </text>
              </g>
            </g>

            {/* RIGHT GRAPHIC: 3D Lucky Spin Wheel with REAL AMOUNTS ON EACH SLICE! */}
            <g transform="translate(700, 180)">
              {/* Outer Golden Wheel Rim */}
              <circle cx="0" cy="0" r="132" fill="url(#goldRimWheel2)" stroke="#92400E" strokeWidth="5" filter="url(#spinGlow2)" />
              <circle cx="0" cy="0" r="118" fill="#1E1B4B" stroke="#FDE047" strokeWidth="3" />

              {/* 8 Colored Slices */}
              <path d="M0 0 L0 -116 A116 116 0 0 1 82 -82 Z" fill="#EF4444" />
              <path d="M0 0 L82 -82 A116 116 0 0 1 116 0 Z" fill="#F59E0B" />
              <path d="M0 0 L116 0 A116 116 0 0 1 82 82 Z" fill="#10B981" />
              <path d="M0 0 L82 82 A116 116 0 0 1 0 116 Z" fill="#0EA5E9" />
              <path d="M0 0 L0 116 A116 116 0 0 1 -82 82 Z" fill="#8B5CF6" />
              <path d="M0 0 L-82 82 A116 116 0 0 1 -116 0 Z" fill="#EAB308" />
              <path d="M0 0 L-116 0 A116 116 0 0 1 -82 -82 Z" fill="#6366F1" />
              <path d="M0 0 L-82 -82 A116 116 0 0 1 0 -116 Z" fill="#EC4899" />

              {/* AMOUNTS PRINTED ON EACH SLICE (ROTATED RADIAL) */}
              <g transform="rotate(-67.5)">
                <text x="68" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900" fontFamily="system-ui, sans-serif" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.5))">₹10</text>
              </g>
              <g transform="rotate(-22.5)">
                <text x="68" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900" fontFamily="system-ui, sans-serif" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.5))">₹25</text>
              </g>
              <g transform="rotate(22.5)">
                <text x="68" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900" fontFamily="system-ui, sans-serif" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.5))">₹5</text>
              </g>
              <g transform="rotate(67.5)">
                <text x="68" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900" fontFamily="system-ui, sans-serif" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.5))">₹50</text>
              </g>
              <g transform="rotate(112.5)">
                <text x="68" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900" fontFamily="system-ui, sans-serif" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.5))">₹2</text>
              </g>
              <g transform="rotate(157.5)">
                <text x="68" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900" fontFamily="system-ui, sans-serif" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.5))">₹15</text>
              </g>
              <g transform="rotate(202.5)">
                <text x="68" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900" fontFamily="system-ui, sans-serif" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.5))">₹1</text>
              </g>
              <g transform="rotate(247.5)">
                <text x="68" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900" fontFamily="system-ui, sans-serif" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.5))">₹20</text>
              </g>

              {/* Golden Studs along Rim */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <g key={i} transform={`rotate(${angle}) translate(125, 0)`}>
                  <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" stroke="#CA8A04" strokeWidth="1" />
                </g>
              ))}

              {/* Center Hub */}
              <circle cx="0" cy="0" r="30" fill="url(#goldRimWheel2)" stroke="#78350F" strokeWidth="3" />
              <circle cx="0" cy="0" r="22" fill="#1E1B4B" />
              <text x="0" y="6" textAnchor="middle" fill="#FACC15" fontSize="18" fontWeight="900" fontFamily="sans-serif">★</text>

              {/* Red Pointer Arrow Top */}
              <path d="M-14 -132 L0 -102 L14 -132 Z" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle cx="0" cy="-132" r="9" fill="#DC2626" />

              {/* Floating Gold Coins */}
              <g transform="translate(-125, 70) rotate(-15)">
                <circle cx="0" cy="0" r="20" fill="url(#goldRimWheel2)" stroke="#CA8A04" strokeWidth="2" filter="url(#spinGlow2)" />
                <text x="0" y="6" textAnchor="middle" fill="#713F12" fontSize="15" fontWeight="900">₹</text>
              </g>
              <g transform="translate(130, -50) rotate(15)">
                <circle cx="0" cy="0" r="22" fill="url(#goldRimWheel2)" stroke="#CA8A04" strokeWidth="2" filter="url(#spinGlow2)" />
                <text x="0" y="7" textAnchor="middle" fill="#713F12" fontSize="17" fontWeight="900">₹</text>
              </g>
            </g>
          </svg>
        </div>

        {/* ========================================================= */}
        {/* SLIDE 3: BRAND NEW SCRATCH & WIN BANNER (Crimson & Gold)  */}
        {/* ========================================================= */}
        <div
          onClick={() => onNavigate('scratch')}
          className="w-full shrink-0 cursor-pointer relative overflow-hidden"
          style={{ aspectRatio: '2.5 / 1', minHeight: '125px' }}
        >
          <svg viewBox="0 0 900 360" className="w-full h-full block" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="scBgRuby" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4C0519" />
                <stop offset="45%" stopColor="#881337" />
                <stop offset="100%" stopColor="#BE123C" />
              </linearGradient>

              <linearGradient id="scFoilGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="35%" stopColor="#FACC15" />
                <stop offset="70%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>

              <linearGradient id="scRevealedBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E1B4B" />
                <stop offset="100%" stopColor="#312E81" />
              </linearGradient>

              <filter id="scRubyGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Background */}
            <rect width="900" height="360" fill="url(#scBgRuby)" />

            {/* Ambient Lighting Circles */}
            <circle cx="700" cy="180" r="180" fill="#F43F5E" opacity="0.15" />
            <circle cx="700" cy="180" r="120" fill="#FB7185" opacity="0.1" />
            <circle cx="100" cy="40" r="90" fill="#FFFFFF" opacity="0.04" />

            {/* LEFT CONTENT */}
            <g transform="translate(60, 75)">
              {/* Category Pill */}
              <g transform="translate(0, 0)">
                <rect width="210" height="32" rx="16" fill="#FACC15" opacity="0.18" stroke="#FDE047" strokeWidth="1.5" />
                <text x="105" y="21" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="0.5">
                  💎 100% DAILY BONUS
                </text>
              </g>

              {/* Headline */}
              <g transform="translate(0, 70)">
                <text x="0" y="0" fill="#FFFFFF" fontSize="48" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="-0.5">
                  Scratch &amp; Win
                </text>
                <text x="0" y="48" fill="#FDE047" fontSize="46" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="-0.5">
                  Up To ₹100 Daily!
                </text>
                <text x="0" y="85" fill="#FFE4E6" fontSize="19" fontWeight="600" fontFamily="system-ui, sans-serif">
                  Scratch the lucky card to reveal your instant reward.
                </text>
              </g>

              {/* Call to Action Button */}
              <g transform="translate(0, 195)">
                <rect width="210" height="50" rx="25" fill="#FACC15" filter="url(#scRubyGlow)" />
                <text x="105" y="32" textAnchor="middle" fill="#881337" fontSize="20" fontWeight="900" fontFamily="system-ui, sans-serif">
                  Scratch Now →
                </text>
              </g>
            </g>

            {/* RIGHT GRAPHIC: 3D Golden Scratch Card with Peeling Foil & Flying Coins */}
            <g transform="translate(710, 185)">
              {/* Card Shadow & Ambient Aura */}
              <circle cx="0" cy="0" r="110" fill="#FACC15" opacity="0.12" />

              {/* Tilted 3D Holographic Card Container */}
              <g transform="rotate(-6)">
                {/* Outer Golden Border */}
                <rect x="-110" y="-85" width="220" height="165" rx="20" fill="url(#scFoilGold)" stroke="#78350F" strokeWidth="4" filter="url(#scRubyGlow)" />
                {/* Inner Card Screen */}
                <rect x="-98" y="-73" width="196" height="141" rx="14" fill="url(#scRevealedBg)" />

                {/* Scratched Revealed Zone (Center) */}
                <g transform="translate(0, 0)">
                  <ellipse cx="0" cy="0" rx="75" ry="48" fill="#4338CA" />
                  <text x="0" y="-8" textAnchor="middle" fill="#A5B4FC" fontSize="13" fontWeight="900" letterSpacing="1">YOU WON</text>
                  <text x="0" y="26" textAnchor="middle" fill="#FACC15" fontSize="38" fontWeight="900" fontFamily="system-ui, sans-serif" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.5))">
                    ₹ 100
                  </text>
                </g>

                {/* Metallic Peeling Scratch Foil (Top Right) */}
                <path
                  d="M10 -73 C40 -50 60 -20 98 0 L98 -73 Z"
                  fill="url(#scFoilGold)"
                  stroke="#FDE047"
                  strokeWidth="2"
                  filter="url(#scRubyGlow)"
                />
                <path d="M10 -73 Q55 -40 98 0" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.9" />

                {/* Sparkles on Card Rim */}
                <circle cx="-85" cy="-60" r="3" fill="#FFFFFF" />
                <circle cx="-85" cy="55" r="3" fill="#FFFFFF" />
                <circle cx="85" cy="55" r="3" fill="#FFFFFF" />
              </g>

              {/* Floating 3D Gold Coins Exploding Out */}
              <g transform="translate(-105, -55) rotate(-15)">
                <circle cx="0" cy="0" r="26" fill="url(#scFoilGold)" stroke="#CA8A04" strokeWidth="3" filter="url(#scRubyGlow)" />
                <circle cx="0" cy="0" r="20" fill="#FDE047" />
                <text x="0" y="7" textAnchor="middle" fill="#713F12" fontSize="22" fontWeight="900">₹</text>
              </g>

              <g transform="translate(100, 50) rotate(15)">
                <circle cx="0" cy="0" r="28" fill="url(#scFoilGold)" stroke="#CA8A04" strokeWidth="3" filter="url(#scRubyGlow)" />
                <circle cx="0" cy="0" r="22" fill="#FDE047" />
                <text x="0" y="8" textAnchor="middle" fill="#713F12" fontSize="24" fontWeight="900">₹</text>
              </g>

              <g transform="translate(-90, 60) rotate(10)">
                <circle cx="0" cy="0" r="22" fill="url(#scFoilGold)" stroke="#CA8A04" strokeWidth="2.5" filter="url(#scRubyGlow)" />
                <circle cx="0" cy="0" r="17" fill="#FDE047" />
                <text x="0" y="6" textAnchor="middle" fill="#713F12" fontSize="18" fontWeight="900">₹</text>
              </g>

              {/* Radiant Diamond Star Sparkles */}
              <path d="M-120 15 Q-120 28 -108 28 Q-120 28 -120 41 Q-120 28 -132 28 Q-120 28 -120 15 Z" fill="#FDE047" />
              <path d="M105 -65 Q105 -52 118 -52 Q105 -52 105 -39 Q105 -52 92 -52 Q105 -52 105 -65 Z" fill="#FFFFFF" />
            </g>
          </svg>
        </div>
      </div>

      {/* Clean Pagination Indicator Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/25 px-2.5 py-1 rounded-full backdrop-blur-xs">
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(idx);
            }}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentSlide === idx
                ? 'w-6 h-1.5 bg-[#FACC15] shadow-xs'
                : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
