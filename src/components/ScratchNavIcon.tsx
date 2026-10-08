import React, { useId } from 'react';

interface ScratchNavIconProps {
  active?: boolean;
  className?: string;
  size?: number | string;
}

/**
 * Modern 3D / Dual-tone Scratch Card Icon for Bottom Navigation Bar
 * Features:
 * - Genuine scratch lottery card silhouette with smooth curved corners
 * - Silver/holographic scratch foil surface with textured diagonal scratch marks
 * - Realistic organic peeled/scratched opening
 * - Gleaming golden Indian Rupee (₹) prize coin revealed underneath
 * - 3D scratcher coin peeling the foil
 * - Radiating prosperity sparkle stars (✦)
 * - Dynamic active state with emerald-gold luxury illumination
 */
export const ScratchNavIcon: React.FC<ScratchNavIconProps> = ({
  active = false,
  className = 'w-5 h-5',
  size,
}) => {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9]/g, '');

  const dimensionProps = size ? { width: size, height: size } : {};

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 select-none ${className}`}
      {...dimensionProps}
    >
      <defs>
        {/* Active Card Body Gradient */}
        <linearGradient id={`cardGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#047857" />
          <stop offset="100%" stopColor="#065F46" />
        </linearGradient>

        {/* Revealed Gold Window Gradient */}
        <radialGradient id={`goldPrizeGrad-${id}`} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="40%" stopColor="#FDE047" />
          <stop offset="80%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>

        {/* Scratch Foil Metallic Gradient */}
        <linearGradient id={`foilGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="50%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Scratcher Edge Coin Gradient */}
        <linearGradient id={`coinGrad-${id}`} x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        {/* Glow Filter for Active State */}
        <filter id={`scratchGlow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#059669" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* ================= 1. CARD BASE CONTAINER ================= */}
      <g filter={active ? `url(#scratchGlow-${id})` : undefined}>
        {/* Card Shadow / 3D Base Layer */}
        <rect
          x="2.5"
          y="4.5"
          width="19"
          height="15.5"
          rx="3.5"
          fill={active ? '#022C22' : '#94A3B8'}
          opacity={active ? 0.35 : 0.2}
          transform="translate(0, 0.7)"
        />

        {/* Main Card Body */}
        <rect
          x="2.5"
          y="4"
          width="19"
          height="15.5"
          rx="3.5"
          fill={active ? `url(#cardGrad-${id})` : '#FFFFFF'}
          stroke={active ? '#10B981' : 'currentColor'}
          strokeWidth="1.6"
        />

        {/* Card Corner Notches / Security Pattern */}
        <line
          x1="4.5"
          y1="6"
          x2="4.5"
          y2="7.5"
          stroke={active ? '#34D399' : '#94A3B8'}
          strokeWidth="1"
          strokeLinecap="round"
          opacity={0.7}
        />
        <line
          x1="19.5"
          y1="16.5"
          x2="19.5"
          y2="18"
          stroke={active ? '#34D399' : '#94A3B8'}
          strokeWidth="1"
          strokeLinecap="round"
          opacity={0.7}
        />

        {/* ================= 2. REVEALED PRIZE WINDOW (Top Right) ================= */}
        {/* Sunburst / Prize Radiance Area */}
        <path
          d="M 8.5 4.8 C 9.5 7.5 12 7.8 13.5 6 C 14.8 4.8 17 5 19.5 5.5 C 20.2 5.7 20.7 6.3 20.7 7.1 L 20.7 12 C 18.2 12.5 16 11 14.5 12.8 C 13 14.5 10.5 13.5 9 14.8 C 7.8 15.8 7 17.5 7 18.7 L 3.5 18.7 C 3.2 18.7 3 18.5 3 18.2 L 3 10.5 C 4.5 9 6.5 8.5 7.5 7 Z"
          fill={active ? '#064E3B' : '#F1F5F9'}
          opacity={active ? 0.6 : 0.7}
        />

        {/* Revealed Golden Rupee Coin */}
        <g transform="translate(13.5, 9.2)">
          {/* Coin Outer Glow / Depth */}
          <circle
            cx="0"
            cy="0"
            r="3.4"
            fill={active ? `url(#goldPrizeGrad-${id})` : '#FBBF24'}
            stroke={active ? '#FEF08A' : '#D97706'}
            strokeWidth="0.7"
          />
          {/* Dotted / Beaded Inner Ring */}
          <circle
            cx="0"
            cy="0"
            r="2.6"
            fill="none"
            stroke={active ? '#B45309' : '#92400E'}
            strokeWidth="0.4"
            strokeDasharray="1.2 0.8"
            opacity={0.7}
          />
          {/* Rupee Symbol ₹ */}
          <text
            x="0"
            y="1.3"
            textAnchor="middle"
            fontSize="3.8"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill={active ? '#78350F' : '#78350F'}
          >
            ₹
          </text>
        </g>

        {/* ================= 3. SCRATCH FOIL COATING (Bottom Left) ================= */}
        {/* Silver Scratch Foil with Realistic Scratched Curved Edge */}
        <path
          d="M 3.3 11 C 5 9.5 7 9.8 8.5 11.5 C 10 13.2 12.5 12.8 14 14.5 C 15.2 15.8 17 15.2 18.8 16.2 L 18.8 18.2 C 18.8 18.8 18.3 19.3 17.7 19.3 L 4.3 19.3 C 3.7 19.3 3.3 18.8 3.3 18.2 Z"
          fill={active ? `url(#foilGrad-${id})` : '#E2E8F0'}
          stroke={active ? '#94A3B8' : '#CBD5E1'}
          strokeWidth="0.6"
        />

        {/* Textured Scratch Wave Strokes (Showing scratch action) */}
        <path
          d="M 4.5 14.5 Q 6 13 8 14.8 T 12 14.5"
          stroke={active ? '#64748B' : '#94A3B8'}
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="1.5 1"
          fill="none"
          opacity={0.8}
        />
        <path
          d="M 6.5 17 Q 8.5 15.5 11 17.2 T 15 16.8"
          stroke={active ? '#64748B' : '#94A3B8'}
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="1.5 1"
          fill="none"
          opacity={0.8}
        />

        {/* ================= 4. SCRATCHER COIN (Scratching Edge) ================= */}
        <g transform="translate(8.8, 12.2) rotate(15)">
          {/* Scratcher Shadow */}
          <circle cx="0.2" cy="0.4" r="2.2" fill="#000000" opacity="0.25" />
          {/* Scratcher Body */}
          <circle
            cx="0"
            cy="0"
            r="2.2"
            fill={active ? `url(#coinGrad-${id})` : '#FBBF24'}
            stroke={active ? '#FFFBEB' : '#F59E0B'}
            strokeWidth="0.6"
          />
          {/* Specular Highlight Streak */}
          <path
            d="M -1.2 -1.2 A 1.8 1.8 0 0 1 1.2 -1.2"
            stroke="#FFFFFF"
            strokeWidth="0.6"
            strokeLinecap="round"
            fill="none"
            opacity={0.85}
          />
        </g>

        {/* ================= 5. SPARKLE STARS ================= */}
        {/* Primary 4-Point Magic Sparkle (Top-Right of Prize) */}
        <path
          d="M 19 1.8 Q 19 3.8 17 3.8 Q 19 3.8 19 5.8 Q 19 3.8 21 3.8 Q 19 3.8 19 1.8 Z"
          fill={active ? '#FDE047' : '#F59E0B'}
          filter={active ? `url(#scratchGlow-${id})` : undefined}
        />
        {/* Center Sparkle Core */}
        <circle cx="19" cy="3.8" r="0.6" fill="#FFFFFF" />

        {/* Micro Sparkle (Bottom Left Corner) */}
        <path
          d="M 2 12 Q 2 13 1 13 Q 2 13 2 14 Q 2 13 3 13 Q 2 13 2 12 Z"
          fill={active ? '#34D399' : '#94A3B8'}
          opacity={active ? 0.9 : 0.5}
        />

        {/* Tiny Accent Sparkle near coin */}
        <circle
          cx="17.2"
          cy="8"
          r="0.5"
          fill={active ? '#FEF08A' : '#F59E0B'}
          className={active ? 'animate-ping' : ''}
          style={{ animationDuration: '2s' }}
        />
      </g>
    </svg>
  );
};

export default ScratchNavIcon;
