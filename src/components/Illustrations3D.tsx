import React from 'react';

export const RealMoneyLogo3D: React.FC<{ size?: number | string }> = ({ size = 40 }) => {
  const numSize = typeof size === 'number' ? size : size === 'lg' ? 64 : 40;
  return (
    <svg
      width={numSize}
      height={numSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_6px_16px_rgba(0,0,0,0.35)] select-none shrink-0"
    >
      <defs>
        <linearGradient id="rmLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <filter id="rmShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Emerald Rounded Squircle */}
      <rect width="100" height="100" rx="26" fill="url(#rmLogoBg)" />
      {/* Inner subtle bevel border */}
      <rect x="2" y="2" width="96" height="96" rx="24" stroke="#6EE7B7" strokeWidth="2.5" opacity="0.6" />

      {/* Golden Rupee Symbol & Growth Arrow */}
      {/* Upper Horizontal Bar */}
      <path
        d="M26 25 L74 25 C76 25 78 27 78 29 C78 31 76 33 74 33 L26 33 C24 33 22 31 22 29 C22 27 24 25 26 25 Z"
        fill="url(#goldGradient)"
        filter="url(#rmShadow)"
      />
      {/* Middle Horizontal Bar */}
      <path
        d="M26 39 L60 39 C62 39 64 41 64 43 C64 45 62 47 60 47 L26 47 C24 47 22 45 22 43 C22 41 24 39 26 39 Z"
        fill="url(#goldGradient)"
        filter="url(#rmShadow)"
      />
      {/* Vertical Spine */}
      <path
        d="M38 25 L38 52 C45 52 56 50 56 42 C56 35 48 34 40 34"
        stroke="url(#goldGradient)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        filter="url(#rmShadow)"
      />
      {/* Diagonal Slanted Leg */}
      <path
        d="M37 50 L64 77 C66 79 69 79 71 77 C73 75 73 72 71 70 L48 47"
        stroke="url(#goldGradient)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        filter="url(#rmShadow)"
      />

      {/* Upward Growth Arrow Indicator */}
      <circle cx="76" cy="30" r="14" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
      <path d="M72 34 L80 26 M80 26 L74 26 M80 26 L80 32" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Backward-compatible alias
export const KamaoNowLogo3D = RealMoneyLogo3D;

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
