import React from 'react';

export const KamaoNowLogo3D: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] select-none shrink-0"
  >
    <defs>
      <linearGradient id="kLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="50%" stopColor="#059669" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <filter id="kShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
      </filter>
    </defs>

    {/* Green Rounded Squircle matching image */}
    <rect width="100" height="100" rx="26" fill="url(#kLogoBg)" />
    {/* Inner subtle bevel border */}
    <rect x="2" y="2" width="96" height="96" rx="24" stroke="#6EE7B7" strokeWidth="2.5" opacity="0.5" />

    {/* White Stylized 'K' with Upward Diagonal Arrow matching image */}
    {/* Vertical Stem */}
    <path
      d="M24 22 C24 20 25.5 18 28 18 L38 18 C40.5 18 42 20 42 22 L42 78 C42 80 40.5 82 38 82 L28 82 C25.5 82 24 80 24 78 Z"
      fill="#FFFFFF"
      filter="url(#kShadow)"
    />

    {/* Lower Diagonal Leg of K */}
    <path
      d="M38 52 L62 80 C64 82 67 83 70 81 L77 75 C79 73 79 70 77 67 L52 42 Z"
      fill="#FFFFFF"
      filter="url(#kShadow)"
    />

    {/* Upper Diagonal Arrow of K pointing to top-right */}
    <path
      d="M44 48 L62 28 L56 28 C53 28 51 26 51 24 C51 22 53 20 56 20 L76 20 C78.5 20 80 21.5 80 24 L80 44 C80 47 78 49 76 49 C74 49 72 47 72 44 L72 38 L54 58 Z"
      fill="#FFFFFF"
      filter="url(#kShadow)"
    />
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
      <circle cx="28" cy="38" r="14" fill="#EAB308" stroke="#FEF08A" strokeWidth="2" />
      <circle cx="28" cy="38" r="10" fill="#FACC15" />
      <text x="28" y="43" textAnchor="middle" fill="#713F12" fontSize="13" fontWeight="900" fontFamily="sans-serif">₹</text>
    </g>

    {/* Floating Coin 2 */}
    <circle cx="135" cy="48" r="11" fill="#EAB308" stroke="#FEF08A" strokeWidth="2" />
    <circle cx="135" cy="48" r="8" fill="#FACC15" />
    <text x="135" y="52" textAnchor="middle" fill="#713F12" fontSize="10" fontWeight="900" fontFamily="sans-serif">₹</text>

    {/* Character Head & Hair */}
    <circle cx="80" cy="65" r="32" fill="#FBCFE8" /> {/* Face skin */}
    {/* Hair (Black 3D stylish hair) */}
    <path
      d="M52 56 C52 36 70 30 84 30 C100 30 114 38 114 56 C114 45 106 38 92 38 C76 38 60 48 52 56 Z"
      fill="#1E293B"
    />
    <path
      d="M54 50 C58 38 72 32 88 32 C104 32 110 40 112 50 C108 42 98 38 86 38 C72 38 60 44 54 50 Z"
      fill="#0F172A"
    />

    {/* Big Happy Eyes with sparkle */}
    <circle cx="70" cy="62" r="5" fill="#0F172A" />
    <circle cx="72" cy="60" r="1.5" fill="#FFFFFF" />
    <circle cx="90" cy="62" r="5" fill="#0F172A" />
    <circle cx="92" cy="60" r="1.5" fill="#FFFFFF" />

    {/* Cheerful Smile */}
    <path
      d="M72 74 Q80 84 88 74"
      stroke="#BE185D"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="#FFFFFF"
    />
    {/* Rosy Cheeks */}
    <ellipse cx="64" cy="71" rx="4" ry="2.5" fill="#F472B6" opacity="0.6" />
    <ellipse cx="96" cy="71" rx="4" ry="2.5" fill="#F472B6" opacity="0.6" />

    {/* Green Hoodie Body */}
    <path
      d="M48 110 C48 92 62 88 80 88 C98 88 112 92 112 110 L118 150 L42 150 Z"
      fill="#059669"
      stroke="#047857"
      strokeWidth="2"
    />
    {/* Hoodie Collar / Zipper */}
    <path d="M80 88 L80 130" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
    <path d="M72 90 L80 102 L88 90" stroke="#34D399" strokeWidth="2.5" fill="none" />

    {/* Smartphone in hands */}
    <rect x="68" y="105" width="24" height="42" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
    <rect x="71" y="109" width="18" height="30" rx="2" fill="#10B981" />
    <text x="80" y="128" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">₹</text>

    {/* Hands holding phone */}
    <ellipse cx="66" cy="120" rx="5" ry="6" fill="#FBCFE8" />
    <ellipse cx="94" cy="120" rx="5" ry="6" fill="#FBCFE8" />

    {/* Sparkles */}
    <path d="M120 22 L122 14 L124 22 L132 24 L124 26 L122 34 L120 26 L112 24 Z" fill="#FDE047" />
  </svg>
);

export const ReferCharacter3D: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <svg
    viewBox="0 0 160 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] select-none ${className}`}
  >
    {/* Friend 1 (Green Hoodie) */}
    <circle cx="55" cy="50" r="22" fill="#FBCFE8" />
    <path d="M35 44 C35 30 48 24 60 24 C72 24 78 32 78 44 Z" fill="#1E293B" />
    <circle cx="49" cy="48" r="3.5" fill="#0F172A" />
    <circle cx="63" cy="48" r="3.5" fill="#0F172A" />
    <path d="M51 57 Q56 64 61 57" stroke="#BE185D" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M30 84 C30 70 42 66 56 66 C70 66 80 70 80 84 L84 130 L26 130 Z" fill="#059669" />

    {/* Friend 2 (Yellow Hoodie) */}
    <circle cx="105" cy="50" r="22" fill="#FED7AA" />
    <path d="M85 44 C85 30 98 24 110 24 C122 24 128 32 128 44 Z" fill="#78350F" />
    <circle cx="99" cy="48" r="3.5" fill="#0F172A" />
    <circle cx="113" cy="48" r="3.5" fill="#0F172A" />
    <path d="M101 57 Q106 64 111 57" stroke="#BE185D" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M80 84 C80 70 92 66 106 66 C120 66 130 70 130 84 L134 130 L76 130 Z" fill="#D97706" />

    {/* WhatsApp / Chat Bubble between them */}
    <ellipse cx="80" cy="24" rx="18" ry="14" fill="#22C55E" />
    <path d="M72 34 L70 42 L78 37 Z" fill="#22C55E" />
    <text x="80" y="28" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">₹3</text>

    {/* Floating Coin */}
    <circle cx="20" cy="30" r="10" fill="#EAB308" stroke="#FEF08A" strokeWidth="2" />
    <text x="20" y="34" textAnchor="middle" fill="#713F12" fontSize="9" fontWeight="bold">₹</text>
  </svg>
);

export const GiftBox3D: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_10px_20px_rgba(234,179,8,0.4)] select-none ${className}`}
  >
    {/* Base box */}
    <rect x="25" y="45" width="70" height="60" rx="8" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
    {/* Gold Ribbon Vertical */}
    <rect x="52" y="45" width="16" height="60" fill="#FACC15" />
    {/* Gold Ribbon Horizontal */}
    <rect x="25" y="68" width="70" height="14" fill="#FACC15" />

    {/* Box Lid (Angle tilted open with coins spilling out) */}
    <path d="M18 42 L102 36 L100 48 L16 54 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
    <rect x="52" y="36" width="16" height="16" fill="#FDE047" transform="rotate(-4 60 44)" />

    {/* 3D Bow Ribbon */}
    <path d="M46 36 C34 22 52 14 58 32 C62 14 80 22 70 36 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />

    {/* Gold Coins popping out */}
    <circle cx="40" cy="25" r="9" fill="#EAB308" stroke="#FEF08A" strokeWidth="1.5" />
    <text x="40" y="28" textAnchor="middle" fill="#713F12" fontSize="9" fontWeight="bold">₹</text>

    <circle cx="78" cy="20" r="11" fill="#EAB308" stroke="#FEF08A" strokeWidth="2" />
    <text x="78" y="24" textAnchor="middle" fill="#713F12" fontSize="11" fontWeight="bold">₹</text>

    {/* Sparkles */}
    <path d="M96 15 L98 8 L100 15 L107 17 L100 19 L98 26 L96 19 L89 17 Z" fill="#FDE047" />
    <path d="M22 65 L23 60 L24 65 L29 66 L24 67 L23 72 L22 67 L17 66 Z" fill="#FDE047" />
  </svg>
);
