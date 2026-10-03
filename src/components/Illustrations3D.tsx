import React, { useId } from 'react';

/**
 * Master 3D Real Money Vector Logo Icon
 * (100% exact match across Splash Screen, Header, Login, PWA and Favicon)
 * Features luxury emerald squircle, ambient wealth rings, dynamic rising growth path,
 * 3D golden Indian Rupee coin with sculpted symbol, and prosperity diamond stars.
 */
export const RealMoneyLogo3D: React.FC<{ size?: number | string; className?: string }> = ({ size = 40, className = '' }) => {
  const numSize = typeof size === 'number' ? size : size === 'lg' ? 64 : 40;
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg
      width={numSize}
      height={numSize}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none filter drop-shadow-[0_12px_28px_rgba(5,150,105,0.3)] shrink-0 ${className}`}
    >
      <defs>
        {/* Background Emerald Gradient */}
        <linearGradient id={`bgGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#064E3B" />
          <stop offset="40%" stopColor="#047857" />
          <stop offset="85%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Gloss Top Sheen */}
        <linearGradient id={`glossGrad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.38" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Gold Coin 3D Gradient */}
        <linearGradient id={`goldCoinGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="25%" stopColor="#FACC15" />
          <stop offset="70%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        {/* Gold Coin Bevel */}
        <linearGradient id={`goldBevel-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#A16207" />
        </linearGradient>

        {/* Rising Growth Arrow Gradient */}
        <linearGradient id={`arrowGrad-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="40%" stopColor="#34D399" />
          <stop offset="75%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#FEF08A" />
        </linearGradient>

        {/* Coin Shadow */}
        <filter id={`coinShadow-${id}`} x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#022c22" floodOpacity="0.65" />
        </filter>

        {/* Arrow Shadow & Glow */}
        <filter id={`glowShadow-${id}`} x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#047857" floodOpacity="0.5" />
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#FACC15" floodOpacity="0.4" />
        </filter>

        {/* Inner Border Glow */}
        <linearGradient id={`borderGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#34D399" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* 1. Squircle App Icon Base */}
      <rect x="16" y="16" width="480" height="480" rx="116" fill={`url(#bgGrad-${id})`} />
      <rect x="22" y="22" width="468" height="468" rx="110" stroke={`url(#borderGrad-${id})`} strokeWidth="6" fill="none" />

      {/* 2. Glassmorphism Top Highlight Sheen */}
      <path d="M 22 132 C 22 72, 72 22, 132 22 L 380 22 C 440 22, 490 72, 490 132 C 490 220, 360 270, 256 270 C 120 270, 22 210, 22 132 Z" fill={`url(#glossGrad-${id})`} />

      {/* 3. Ambient Wealth Rings */}
      <circle cx="256" cy="256" r="190" stroke="#34D399" strokeOpacity="0.12" strokeWidth="2" strokeDasharray="8 8" />
      <circle cx="256" cy="256" r="150" stroke="#6EE7B7" strokeOpacity="0.16" strokeWidth="2" />

      {/* 4. Dynamic Rising Growth Path (Behind Coin) */}
      <path d="M 96 376 Q 180 376 220 310 T 384 148" fill="none" stroke={`url(#arrowGrad-${id})`} strokeWidth="26" strokeLinecap="round" filter={`url(#glowShadow-${id})`} />
      
      {/* Arrow Head */}
      <path d="M 324 138 L 400 136 L 402 212" fill="none" stroke="#FEF08A" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" filter={`url(#glowShadow-${id})`} />

      {/* 5. 3D Golden Indian Rupee Coin (Centerpiece) */}
      <g filter={`url(#coinShadow-${id})`}>
        {/* Outer Gold Rim */}
        <circle cx="256" cy="266" r="114" fill="#854D0E" />
        <circle cx="256" cy="260" r="114" fill={`url(#goldBevel-${id})`} />
        
        {/* Coin Face Inner Dish */}
        <circle cx="256" cy="260" r="98" fill={`url(#goldCoinGrad-${id})`} />
        <circle cx="256" cy="260" r="90" stroke="#FDE047" strokeWidth="3" strokeDasharray="6 4" fill="none" strokeOpacity="0.8" />

        {/* Rupee '₹' 3D Shadow */}
        <g transform="translate(2, 4)" stroke="#78350F" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 226 218 L 286 218" />
          <path d="M 226 242 L 280 242" />
          <path d="M 248 218 C 274 218, 286 230, 286 246 C 286 264, 268 274, 246 274 L 230 274" fill="none" />
          <path d="M 242 274 L 286 314" />
        </g>

        {/* Rupee '₹' Main Golden White Sculpted Symbol */}
        <g stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 226 216 L 286 216" />
          <path d="M 226 240 L 280 240" />
          <path d="M 248 216 C 274 216, 286 228, 286 244 C 286 262, 268 272, 246 272 L 230 272" fill="none" />
          <path d="M 242 272 L 286 312" />
        </g>

        {/* Subtle Bevel Inner Line */}
        <g stroke="#FEF08A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
          <path d="M 230 216 L 278 216" />
          <path d="M 230 240 L 274 240" />
        </g>
      </g>

      {/* 6. Floating Sparkles / Diamond Stars of Prosperity */}
      {/* Top Left Sparkle */}
      <path d="M 128 110 Q 128 130 108 130 Q 128 130 128 150 Q 128 130 148 130 Q 128 130 128 110 Z" fill="#FDE047" opacity="0.9" />
      <circle cx="128" cy="130" r="3" fill="#FFFFFF" />

      {/* Bottom Right Mini Sparkle */}
      <path d="M 404 360 Q 404 374 390 374 Q 404 374 404 388 Q 404 374 418 374 Q 404 374 404 360 Z" fill="#FEF08A" opacity="0.85" />

      {/* Center Top Tiny Glint */}
      <circle cx="224" cy="180" r="4" fill="#FFFFFF" opacity="0.8" />
      <circle cx="340" cy="270" r="5" fill="#34D399" opacity="0.7" />
    </svg>
  );
};

// Backward-compatible alias
export const KamaoNowLogo3D = RealMoneyLogo3D;

/**
 * Large 3D Squircle App Icon for Splash Hero & Showcases
 * (Identical 1:1 match with the master app icon)
 */
export const RealMoneyHeroSquircleIcon: React.FC<{ size?: number; className?: string }> = ({ size = 160, className = '' }) => (
  <RealMoneyLogo3D size={size} className={className} />
);

/**
 * Modern 3D Wallet with popping Gold Rupee Coin & Radiating Shine Rays
 * (Exact match for the top logo in the user's splash screen mockup)
 */
export const WalletCoinLogo: React.FC<{ size?: number; className?: string }> = ({ size = 96, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 140 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)] ${className}`}
  >
    <defs>
      <linearGradient id="walletBodyGrad3D" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="45%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#022C22" />
      </linearGradient>
      <linearGradient id="walletFlapGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      <linearGradient id="coinGoldWallet3D" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="25%" stopColor="#FDE047" />
        <stop offset="60%" stopColor="#EAB308" />
        <stop offset="90%" stopColor="#CA8A04" />
        <stop offset="100%" stopColor="#854D0E" />
      </linearGradient>
      <filter id="walletCoinGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Radiating Green Shine Rays Above Coin */}
    <g stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" filter="url(#walletCoinGlow)">
      <line x1="70" y1="12" x2="70" y2="24" />
      <line x1="52" y1="18" x2="58" y2="28" />
      <line x1="88" y1="18" x2="82" y2="28" />
    </g>

    {/* 3D Popping Gold Rupee Coin Emerging from Wallet */}
    <g transform="translate(42, 26)">
      {/* 3D Base Edge */}
      <circle cx="28" cy="30" r="26" fill="#713F12" />
      <circle cx="28" cy="27" r="25.5" fill="#A16207" />
      {/* Front Face */}
      <circle cx="28" cy="25" r="25" fill="url(#coinGoldWallet3D)" />
      {/* Embossed Inner Rim */}
      <circle cx="28" cy="25" r="21" fill="none" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="3.5 2" />
      {/* Specular Gleam */}
      <path d="M 16 18 C 22 10 38 10 44 18" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.65" fill="none" />
      {/* Indian Rupee Symbol ₹ */}
      <text x="28" y="33" textAnchor="middle" fill="#78350F" fontSize="23" fontWeight="900" fontFamily="sans-serif">
        ₹
      </text>
      <text x="27.5" y="32.5" textAnchor="middle" fill="#FEF08A" fontSize="23" fontWeight="900" fontFamily="sans-serif">
        ₹
      </text>
    </g>

    {/* Wallet Back Rim */}
    <rect x="22" y="48" width="96" height="66" rx="22" fill="#09101D" />

    {/* Wallet Main Body with Soft Rounded Corners */}
    <rect x="24" y="52" width="92" height="62" rx="20" fill="url(#walletBodyGrad3D)" stroke="#38BDF8" strokeOpacity="0.25" strokeWidth="1.5" />

    {/* Front Flap with Depth */}
    <path
      d="M 24 64 C 40 76, 70 82, 116 66 L 116 94 C 116 104, 106 114, 94 114 L 46 114 C 34 114, 24 104, 24 94 Z"
      fill="url(#walletFlapGrad)"
      stroke="#475569"
      strokeWidth="1.2"
    />

    {/* Wallet Subtle Stitching */}
    <rect x="28" y="56" width="84" height="54" rx="16" fill="none" stroke="#64748B" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

    {/* White Metallic Clasp Dot / Button */}
    <g transform="translate(100, 80)">
      <circle cx="0" cy="0" r="7.5" fill="#000000" opacity="0.35" />
      <circle cx="0" cy="-1" r="7" fill="#E2E8F0" />
      <circle cx="0" cy="-1" r="5.5" fill="#FFFFFF" />
      <circle cx="0" cy="-1" r="2.5" fill="#CBD5E1" />
    </g>
  </svg>
);

/**
 * High-Fidelity 3D Isometric Splash Hero:
 * Angled phone showing "Earn Real Money", Indian cash banknotes, 3D gold coin stacks with front ₹ coin, and potted plant
 * (Exact match for center graphic in the user's splash screen mockup)
 */
export const SplashCenterHero3D: React.FC<{ className?: string }> = ({ className = 'w-80 h-72' }) => (
  <svg
    viewBox="0 0 340 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none filter drop-shadow-[0_16px_36px_rgba(0,0,0,0.1)] ${className}`}
  >
    <defs>
      {/* Pedestal Soft Glowing Shadow */}
      <radialGradient id="pedestalGlow3D" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.85" />
        <stop offset="50%" stopColor="#D1FAE5" stopOpacity="0.55" />
        <stop offset="85%" stopColor="#ECFDF5" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>

      {/* Gold Coin Metallic Gradients */}
      <linearGradient id="coinGoldFace" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="20%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#FACC15" />
        <stop offset="80%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
      <linearGradient id="coinRimGold" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#EAB308" />
        <stop offset="50%" stopColor="#A16207" />
        <stop offset="100%" stopColor="#713F12" />
      </linearGradient>

      {/* Cash Notes Gradient */}
      <linearGradient id="banknote1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6EE7B7" />
        <stop offset="40%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="banknote2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="50%" stopColor="#059669" />
        <stop offset="100%" stopColor="#064E3B" />
      </linearGradient>

      {/* Phone Body Gradients */}
      <linearGradient id="phoneChassis" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="60%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#022C22" />
      </linearGradient>
      <linearGradient id="phoneGlass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="70%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#F1F5F9" />
      </linearGradient>

      {/* Plant Pot Gradients */}
      <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="60%" stopColor="#F1F5F9" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </linearGradient>
    </defs>

    {/* ================= 1. PEDESTAL CIRCULAR STAGE ================= */}
    <ellipse cx="170" cy="225" rx="145" ry="46" fill="url(#pedestalGlow3D)" />
    <ellipse cx="170" cy="230" rx="120" ry="28" fill="#047857" opacity="0.08" filter="blur(8px)" />

    {/* ================= 2. LEFT: FANNED GREEN BANKNOTES ================= */}
    <g transform="translate(65, 145) rotate(-16)">
      {/* Shadow */}
      <rect x="0" y="6" width="88" height="48" rx="6" fill="#000000" opacity="0.12" filter="blur(4px)" />
      {/* Back Note */}
      <rect x="0" y="4" width="88" height="48" rx="6" fill="url(#banknote1)" stroke="#047857" strokeWidth="1.5" />
      <rect x="5" y="9" width="78" height="38" rx="3" fill="none" stroke="#D1FAE5" strokeWidth="1.5" strokeDasharray="4 2" />
      <circle cx="44" cy="28" r="10" fill="#ECFDF5" opacity="0.4" />
      <text x="44" y="32" textAnchor="middle" fill="#064E3B" fontSize="11" fontWeight="bold">₹</text>

      {/* Front Note (Angled) */}
      <g transform="translate(8, -8) rotate(8)">
        <rect x="0" y="4" width="88" height="48" rx="6" fill="url(#banknote2)" stroke="#065F46" strokeWidth="1.5" />
        <rect x="5" y="9" width="78" height="38" rx="3" fill="none" stroke="#A7F3D0" strokeWidth="1.5" strokeDasharray="4 2" />
        <circle cx="44" cy="28" r="11" fill="#FFFFFF" opacity="0.3" />
        <text x="44" y="32" textAnchor="middle" fill="#022C22" fontSize="12" fontWeight="900">₹</text>
        {/* Micro currency details */}
        <text x="12" y="19" fill="#D1FAE5" fontSize="7" fontWeight="bold">₹500</text>
        <text x="76" y="43" fill="#D1FAE5" fontSize="7" fontWeight="bold">₹500</text>
      </g>
    </g>

    {/* ================= 3. RIGHT: CUTE WHITE POTTED PLANT ================= */}
    <g transform="translate(225, 130)">
      {/* Pot Shadow */}
      <ellipse cx="32" cy="82" rx="20" ry="6" fill="#000000" opacity="0.1" filter="blur(3px)" />

      {/* Ceramic Pot Body */}
      <path
        d="M 12 40 L 17 76 C 18 84, 46 84, 47 76 L 52 40 Z"
        fill="url(#potGrad)"
        stroke="#E2E8F0"
        strokeWidth="1.5"
      />
      {/* Pot Rim */}
      <ellipse cx="32" cy="40" rx="20" ry="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
      {/* Pot Soil */}
      <ellipse cx="32" cy="40" rx="17" ry="4.5" fill="#713F12" />

      {/* 5 Fresh Glossy Green Leaves */}
      {/* Leaf 1 (Left Lower) */}
      <path d="M 28 39 C 10 26 4 10 20 8 C 26 18 28 30 28 39 Z" fill="#34D399" />
      <path d="M 26 38 Q 18 22 20 8" stroke="#059669" strokeWidth="1.5" fill="none" />

      {/* Leaf 2 (Left Upper) */}
      <path d="M 30 38 C 16 18 18 2 28 0 C 34 10 34 24 31 38 Z" fill="#10B981" />
      <path d="M 30 37 Q 24 16 28 0" stroke="#047857" strokeWidth="1.5" fill="none" />

      {/* Leaf 3 (Center Top Lush) */}
      <path d="M 32 38 C 26 12 34 -8 40 -8 C 46 4 42 22 34 38 Z" fill="#059669" />
      <path d="M 33 37 Q 36 12 40 -8" stroke="#022C22" strokeWidth="1.5" fill="none" />

      {/* Leaf 4 (Right Upper) */}
      <path d="M 34 39 C 48 24 54 8 44 4 C 38 14 36 26 34 39 Z" fill="#10B981" />
      <path d="M 34 38 Q 44 18 44 4" stroke="#047857" strokeWidth="1.5" fill="none" />

      {/* Leaf 5 (Right Lower) */}
      <path d="M 35 40 C 52 32 58 18 48 16 C 42 24 38 34 35 40 Z" fill="#34D399" />
      <path d="M 35 39 Q 48 26 48 16" stroke="#059669" strokeWidth="1.5" fill="none" />
    </g>

    {/* ================= 4. CENTER: 3D SMARTPHONE ================= */}
    <g transform="translate(108, 92) rotate(-5)">
      {/* 3D Phone Cast Shadow */}
      <rect x="0" y="8" width="124" height="172" rx="24" fill="#000000" opacity="0.14" filter="blur(8px)" />

      {/* Phone Outer Chassis Titanium Rim */}
      <rect x="0" y="0" width="124" height="172" rx="24" fill="url(#phoneChassis)" stroke="#10B981" strokeWidth="2.5" />
      {/* Subtle Inner Bezel */}
      <rect x="2" y="2" width="120" height="168" rx="22" fill="#0F172A" />

      {/* Phone Screen Display */}
      <rect x="7" y="7" width="110" height="158" rx="18" fill="url(#phoneGlass)" />

      {/* Glossy Diagonal Reflection Streak */}
      <path d="M 7 24 L 80 7 L 117 7 L 7 140 Z" fill="#FFFFFF" opacity="0.45" />

      {/* Top Camera Punch Hole & Speaker */}
      <circle cx="62" cy="15" r="3" fill="#0F172A" />
      <rect x="52" y="10" width="20" height="2" rx="1" fill="#334155" />

      {/* Green Circular Badge with White Checkmark */}
      <g transform="translate(46, 32)">
        <circle cx="16" cy="16" r="16" fill="#059669" />
        <circle cx="16" cy="16" r="13" fill="#10B981" />
        <path
          d="M 10 16 L 15 21 L 23 11"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Screen Text: Earn Real Money */}
      <text x="62" y="76" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="700" fontFamily="sans-serif">
        Earn
      </text>
      <text x="62" y="92" textAnchor="middle" fill="#047857" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="-0.5">
        Real Money
      </text>

      {/* Green Rounded CTA Button Pill */}
      <g transform="translate(30, 106)">
        <rect x="0" y="0" width="64" height="18" rx="9" fill="#059669" />
        <rect x="22" y="7" width="20" height="4" rx="2" fill="#FFFFFF" />
      </g>

      {/* Bottom Home Indicator Line */}
      <rect x="44" y="154" width="36" height="3" rx="1.5" fill="#94A3B8" />
    </g>

    {/* ================= 5. LEFT: 3D CYLINDER GOLD COIN STACKS ================= */}
    {/* Coin Stack 1 (Back Left) */}
    <g transform="translate(80, 158)">
      {/* Coin 1 */}
      <ellipse cx="20" cy="44" rx="18" ry="6.5" fill="url(#coinRimGold)" />
      <ellipse cx="20" cy="40" rx="18" ry="6" fill="url(#coinGoldFace)" />
      {/* Coin 2 */}
      <ellipse cx="20" cy="33" rx="18" ry="6.5" fill="url(#coinRimGold)" />
      <ellipse cx="20" cy="29" rx="18" ry="6" fill="url(#coinGoldFace)" />
      {/* Coin 3 */}
      <ellipse cx="20" cy="22" rx="18" ry="6.5" fill="url(#coinRimGold)" />
      <ellipse cx="20" cy="18" rx="18" ry="6" fill="url(#coinGoldFace)" />
      {/* Coin 4 (Top) */}
      <ellipse cx="20" cy="11" rx="18" ry="6.5" fill="url(#coinRimGold)" />
      <ellipse cx="20" cy="7" rx="18" ry="6" fill="url(#coinGoldFace)" />
      <ellipse cx="20" cy="7" rx="15" ry="4.5" fill="none" stroke="#FEF08A" strokeWidth="1" strokeDasharray="3 2" />
    </g>

    {/* Coin Stack 2 (Right of Stack 1) */}
    <g transform="translate(98, 148)">
      {/* Coin 1 */}
      <ellipse cx="20" cy="48" rx="19" ry="7" fill="url(#coinRimGold)" />
      <ellipse cx="20" cy="44" rx="19" ry="6.5" fill="url(#coinGoldFace)" />
      {/* Coin 2 */}
      <ellipse cx="20" cy="37" rx="19" ry="7" fill="url(#coinRimGold)" />
      <ellipse cx="20" cy="33" rx="19" ry="6.5" fill="url(#coinGoldFace)" />
      {/* Coin 3 */}
      <ellipse cx="20" cy="26" rx="19" ry="7" fill="url(#coinRimGold)" />
      <ellipse cx="20" cy="22" rx="19" ry="6.5" fill="url(#coinGoldFace)" />
      {/* Coin 4 */}
      <ellipse cx="20" cy="15" rx="19" ry="7" fill="url(#coinRimGold)" />
      <ellipse cx="20" cy="11" rx="19" ry="6.5" fill="url(#coinGoldFace)" />
      {/* Coin 5 (Top) */}
      <ellipse cx="20" cy="4" rx="19" ry="7" fill="url(#coinRimGold)" />
      <ellipse cx="20" cy="0" rx="19" ry="6.5" fill="url(#coinGoldFace)" />
      <text x="20" y="3" textAnchor="middle" fill="#78350F" fontSize="9" fontWeight="900">₹</text>
    </g>

    {/* ================= 6. GIANT FOREGROUND TILTED 3D RUPEE COIN ================= */}
    <g transform="translate(102, 160) rotate(-6)">
      {/* Deep Shadow */}
      <circle cx="34" cy="36" r="32" fill="#000000" opacity="0.22" filter="blur(5px)" />
      {/* 3D Thickness Ring */}
      <circle cx="34" cy="34" r="32" fill="#713F12" />
      <circle cx="33" cy="32" r="31" fill="#A16207" />
      {/* Front Face */}
      <circle cx="31" cy="28" r="30" fill="url(#coinGoldFace)" />
      {/* Beaded / Dotted Inner Circle */}
      <circle cx="31" cy="28" r="25" fill="none" stroke="#FEF08A" strokeWidth="2" strokeDasharray="4 2.5" />
      {/* Specular High-Gloss Arc */}
      <path d="M 16 18 C 22 8 42 8 48 18" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.75" fill="none" />
      {/* Sculpted Indian Rupee Symbol ₹ */}
      <text x="31" y="38" textAnchor="middle" fill="#78350F" fontSize="28" fontWeight="900" fontFamily="sans-serif">
        ₹
      </text>
      <text x="30" y="37" textAnchor="middle" fill="#FEF08A" fontSize="28" fontWeight="900" fontFamily="sans-serif">
        ₹
      </text>
    </g>

    {/* ================= 7. PLAYFUL COMIC SPARKLE RAYS ================= */}
    {/* Left sparkles */}
    <g stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round">
      <line x1="48" y1="160" x2="62" y2="165" />
      <line x1="56" y1="178" x2="68" y2="175" />
      <line x1="50" y1="195" x2="64" y2="188" />
    </g>

    {/* Top Right sparkles near phone */}
    <g stroke="#FBBF24" strokeWidth="3" strokeLinecap="round">
      <line x1="202" y1="124" x2="208" y2="134" />
      <line x1="210" y1="110" x2="214" y2="120" />
    </g>
  </svg>
);


export const EarningsCharacter3D: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] select-none ${className}`}
  >
    {/* Floating Coin 1 */}
    <g className="animate-pulse">
      <ellipse cx="40" cy="45" rx="16" ry="10" fill="#F59E0B" />
      <ellipse cx="40" cy="43" rx="14" ry="8" fill="#FDE68A" />
      <text x="40" y="47" textAnchor="middle" fill="#B45309" fontSize="10" fontWeight="bold">₹</text>
    </g>

    {/* Floating Coin 2 */}
    <g className="animate-pulse" style={{ animationDelay: '300ms' }}>
      <ellipse cx="120" cy="50" rx="14" ry="9" fill="#F59E0B" />
      <ellipse cx="120" cy="48" rx="12" ry="7" fill="#FDE68A" />
      <text x="120" y="52" textAnchor="middle" fill="#B45309" fontSize="9" fontWeight="bold">₹</text>
    </g>

    {/* Money Bag Main Body */}
    <path
      d="M80 40 C65 40 60 52 50 68 C40 85 45 125 60 135 C70 142 90 142 100 135 C115 125 120 85 110 68 C100 52 95 40 80 40 Z"
      fill="url(#moneyBagGrad)"
      filter="url(#charShadow)"
    />

    {/* Bag Tie Ribbon */}
    <path d="M68 62 C75 60 85 60 92 62" stroke="#B45309" strokeWidth="5" strokeLinecap="round" />
    <circle cx="80" cy="62" r="5" fill="#F59E0B" />

    {/* Large Rupee Emblem on Bag */}
    <circle cx="80" cy="100" r="20" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="3" />
    <text x="80" y="108" textAnchor="middle" fill="#92400E" fontSize="22" fontWeight="900" fontFamily="sans-serif">
      ₹
    </text>

    {/* Sparkles */}
    <path d="M125 85 L128 78 L135 75 L128 72 L125 65 L122 72 L115 75 L122 78 Z" fill="#FDE68A" />
    <path d="M35 95 L37 90 L42 88 L37 86 L35 81 L33 86 L28 88 L33 90 Z" fill="#FDE68A" />

    <defs>
      <linearGradient id="moneyBagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="40%" stopColor="#059669" />
        <stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      <filter id="charShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
      </filter>
    </defs>
  </svg>
);

export const ReferCharacter3D: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] select-none ${className}`}
  >
    {/* Left Friend Avatar */}
    <circle cx="55" cy="65" r="22" fill="#6EE7B7" stroke="#047857" strokeWidth="3" />
    <path d="M45 62 Q55 72 65 62" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <circle cx="48" cy="55" r="2.5" fill="#047857" />
    <circle cx="62" cy="55" r="2.5" fill="#047857" />
    <path d="M30 115 C30 95 42 90 55 90 C68 90 80 95 80 115" fill="#059669" />

    {/* Right Friend Avatar */}
    <circle cx="105" cy="65" r="22" fill="#FCD34D" stroke="#D97706" strokeWidth="3" />
    <path d="M95 62 Q105 72 115 62" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <circle cx="98" cy="55" r="2.5" fill="#D97706" />
    <circle cx="112" cy="55" r="2.5" fill="#D97706" />
    <path d="M80 115 C80 95 92 90 105 90 C118 90 130 95 130 115" fill="#D97706" />

    {/* Center Floating Gift/Coin */}
    <g className="animate-bounce">
      <circle cx="80" cy="40" r="14" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
      <text x="80" y="45" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">₹</text>
    </g>
  </svg>
);

export const GiftBox3D: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] select-none ${className}`}
  >
    {/* Box Body */}
    <rect x="20" y="42" width="60" height="46" rx="8" fill="#EF4444" />
    <rect x="44" y="42" width="12" height="46" fill="#FCD34D" />

    {/* Box Lid */}
    <rect x="15" y="32" width="70" height="14" rx="4" fill="#DC2626" />
    <rect x="44" y="32" width="12" height="14" fill="#FBBF24" />

    {/* Ribbon Bow */}
    <path d="M38 24 C34 16 46 16 48 24 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
    <path d="M62 24 C66 16 54 16 52 24 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
    <circle cx="50" cy="25" r="3.5" fill="#F59E0B" />
  </svg>
);

/**
 * 3D Smartphone with neon orbit, rising green chart, and floating gold Rupee coins
 * matching the user's uploaded hero graphic exactly.
 */
export const HeroPhone3DIllustration: React.FC<{ className?: string }> = ({ className = 'w-44 h-44' }) => (
  <svg
    viewBox="0 0 240 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.4)] ${className}`}
  >
    <defs>
      {/* Phone Body Gradients */}
      <linearGradient id="phoneBorderGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="50%" stopColor="#059669" />
        <stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      <linearGradient id="phoneScreenGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#042F24" />
        <stop offset="60%" stopColor="#021C16" />
        <stop offset="100%" stopColor="#01140E" />
      </linearGradient>
      <linearGradient id="chartBar1" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
      <linearGradient id="chartBar2" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <linearGradient id="chartBar3" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#FACC15" />
      </linearGradient>

      {/* Gold Coin Gradients */}
      <linearGradient id="coinGoldHero" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="30%" stopColor="#FACC15" />
        <stop offset="70%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
      <linearGradient id="coinRimHero" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#A16207" />
        <stop offset="100%" stopColor="#713F12" />
      </linearGradient>

      {/* Neon Orbit Glow */}
      <filter id="neonOrbitGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Ambient Glow behind phone */}
    <circle cx="150" cy="110" r="65" fill="#10B981" opacity="0.22" filter="blur(20px)" />
    <circle cx="190" cy="80" r="35" fill="#FACC15" opacity="0.25" filter="blur(14px)" />

    {/* Neon Orbit Ring (Back Arc) */}
    <ellipse
      cx="145"
      cy="115"
      rx="75"
      ry="52"
      transform="rotate(-28 145 115)"
      stroke="#10B981"
      strokeWidth="2.5"
      strokeDasharray="18 10"
      opacity="0.6"
      filter="url(#neonOrbitGlow)"
    />

    {/* ================= 3D SMARTPHONE ================= */}
    <g transform="rotate(-7 140 115)">
      {/* Phone Outer Shadow / Rim */}
      <rect x="86" y="24" width="96" height="172" rx="20" fill="#011B13" stroke="url(#phoneBorderGrad)" strokeWidth="3" />
      {/* Phone Bezel */}
      <rect x="91" y="29" width="86" height="162" rx="16" fill="url(#phoneScreenGrad)" />
      {/* Speaker / Camera Notch */}
      <rect x="122" y="34" width="24" height="4" rx="2" fill="#044E3B" />
      <circle cx="116" cy="36" r="2" fill="#065F46" />

      {/* Screen Chart Grid Lines */}
      <line x1="98" y1="130" x2="170" y2="130" stroke="#065F46" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <line x1="98" y1="100" x2="170" y2="100" stroke="#065F46" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <line x1="98" y1="70" x2="170" y2="70" stroke="#065F46" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

      {/* Rising Chart Bars */}
      <rect x="104" y="120" width="12" height="40" rx="3" fill="url(#chartBar1)" />
      <rect x="122" y="95" width="12" height="65" rx="3" fill="url(#chartBar2)" />
      <rect x="140" y="70" width="12" height="90" rx="3" fill="url(#chartBar3)" />

      {/* Rising Trend Line + Arrow */}
      <path d="M 108 116 Q 128 88 152 64" fill="none" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
      <path d="M 144 62 L 154 62 L 154 72" fill="none" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Small Rupee on Screen */}
      <circle cx="146" cy="50" r="9" fill="#FEF08A" opacity="0.9" />
      <text x="146" y="54" textAnchor="middle" fill="#854D0E" fontSize="9" fontWeight="bold">₹</text>
    </g>

    {/* Neon Orbit Ring (Front Glowing Arc) */}
    <path
      d="M 65 145 C 80 185 180 195 215 135"
      fill="none"
      stroke="#34D399"
      strokeWidth="3.5"
      strokeLinecap="round"
      filter="url(#neonOrbitGlow)"
    />

    {/* ================= 3D GOLD COIN STACKS (Bottom Right) ================= */}
    <g transform="translate(162, 142)">
      {/* Coin 1 (Base) */}
      <ellipse cx="25" cy="42" rx="20" ry="8" fill="url(#coinRimHero)" />
      <ellipse cx="25" cy="38" rx="20" ry="7.5" fill="url(#coinGoldHero)" />
      {/* Coin 2 */}
      <ellipse cx="25" cy="33" rx="20" ry="8" fill="url(#coinRimHero)" />
      <ellipse cx="25" cy="29" rx="20" ry="7.5" fill="url(#coinGoldHero)" />
      {/* Coin 3 (Top) */}
      <ellipse cx="25" cy="24" rx="20" ry="8" fill="url(#coinRimHero)" />
      <ellipse cx="25" cy="20" rx="20" ry="7.5" fill="url(#coinGoldHero)" />
      <ellipse cx="25" cy="20" rx="16" ry="5.5" fill="none" stroke="#FEF08A" strokeWidth="1" strokeDasharray="3 2" />
      <text x="25" y="23" textAnchor="middle" fill="#78350F" fontSize="10" fontWeight="900">₹</text>
    </g>

    <g transform="translate(142, 154)">
      {/* Left Smaller Coin Stack */}
      <ellipse cx="18" cy="28" rx="16" ry="6.5" fill="url(#coinRimHero)" />
      <ellipse cx="18" cy="24" rx="16" ry="6" fill="url(#coinGoldHero)" />
      <ellipse cx="18" cy="19" rx="16" ry="6.5" fill="url(#coinRimHero)" />
      <ellipse cx="18" cy="15" rx="16" ry="6" fill="url(#coinGoldHero)" />
      <text x="18" y="18" textAnchor="middle" fill="#78350F" fontSize="9" fontWeight="900">₹</text>
    </g>

    {/* ================= FLOATING 3D GOLD COINS ================= */}
    {/* Giant Foreground Coin */}
    <g transform="translate(160, 68)" className="animate-pulse">
      {/* 3D Drop Shadow */}
      <ellipse cx="26" cy="30" rx="24" ry="24" fill="#000000" opacity="0.35" filter="blur(4px)" />
      {/* Outer Coin Thickness */}
      <ellipse cx="26" cy="28" rx="23" ry="23" fill="url(#coinRimHero)" />
      {/* Front Face */}
      <ellipse cx="24" cy="24" rx="22" ry="22" fill="url(#coinGoldHero)" />
      {/* Inner Rim Dotted */}
      <ellipse cx="24" cy="24" rx="18" ry="18" fill="none" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Gloss Specular Arc */}
      <path d="M 12 18 C 16 10 32 10 36 18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" fill="none" />
      {/* Large Rupee Symbol */}
      <text x="24" y="32" textAnchor="middle" fill="#78350F" fontSize="22" fontWeight="900" fontFamily="sans-serif">
        ₹
      </text>
      <text x="23.5" y="31.5" textAnchor="middle" fill="#FEF08A" fontSize="22" fontWeight="900" fontFamily="sans-serif">
        ₹
      </text>
    </g>

    {/* Mid-air Smaller Left Coin */}
    <g transform="translate(132, 74)">
      <ellipse cx="16" cy="18" rx="14" ry="14" fill="url(#coinRimHero)" />
      <ellipse cx="15" cy="15" rx="13.5" ry="13.5" fill="url(#coinGoldHero)" />
      <text x="15" y="20" textAnchor="middle" fill="#78350F" fontSize="13" fontWeight="900">₹</text>
    </g>

    {/* Top Right Little Floating Coin */}
    <g transform="translate(202, 102)">
      <ellipse cx="10" cy="11" rx="9" ry="9" fill="url(#coinRimHero)" />
      <ellipse cx="9" cy="9" rx="8.5" ry="8.5" fill="url(#coinGoldHero)" />
      <text x="9" y="12" textAnchor="middle" fill="#78350F" fontSize="8" fontWeight="bold">₹</text>
    </g>

    {/* ================= SPARKLES ================= */}
    <path d="M 140 56 Q 140 62 134 62 Q 140 62 140 68 Q 140 62 146 62 Q 140 62 140 56 Z" fill="#FDE047" />
    <path d="M 218 84 Q 218 88 214 88 Q 218 88 218 92 Q 218 88 222 88 Q 218 88 218 84 Z" fill="#FEF08A" />
    <path d="M 132 140 Q 132 144 128 144 Q 132 144 132 148 Q 132 144 136 144 Q 132 144 132 140 Z" fill="#FDE047" />
  </svg>
);

