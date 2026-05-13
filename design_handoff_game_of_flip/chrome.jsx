// chrome.jsx — gritty zine visual primitives for Game of Flip
// Exports: GritCard, ChunkyBtn, StampLabel, FlipLetters, GaffeTape,
//          Halftone, GrainLayer, TierBadge, IconSpark

// ─── Stickered/stamped label, slightly rotated, monospace ──────────────────
function StampLabel({ children, color = 'var(--ink)', rotate = -3, size = 11, dashed = true, style = {} }) {
  return (
    <span style={{
      display: 'inline-block',
      fontFamily: 'Space Mono, ui-monospace, monospace',
      fontSize: size,
      fontWeight: 700,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color,
      padding: '3px 8px 2px',
      border: `${dashed ? '1.5px dashed' : '1.5px solid'} ${color}`,
      transform: `rotate(${rotate}deg)`,
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</span>
  );
}

// ─── Chunky offset-shadow button — the workhorse CTA ───────────────────────
function ChunkyBtn({ children, onClick, variant = 'primary', size = 'lg', disabled, style = {}, ...rest }) {
  const variants = {
    primary:   { bg: 'var(--red)',    fg: '#0c0b09', shadow: 'var(--ink)' },
    secondary: { bg: 'var(--paper-2)',fg: 'var(--ink)', shadow: 'var(--ink-mute)' },
    success:   { bg: 'var(--lime)',   fg: '#0c0b09', shadow: 'var(--ink)' },
    danger:    { bg: 'var(--red)',    fg: '#0c0b09', shadow: 'var(--ink)' },
    ghost:     { bg: 'transparent',   fg: 'var(--ink)', shadow: 'var(--ink-mute)' },
  };
  const sizes = {
    sm: { pad: '8px 12px', font: 13, gap: 4, offset: 3 },
    md: { pad: '12px 18px', font: 15, gap: 6, offset: 4 },
    lg: { pad: '18px 22px', font: 22, gap: 8, offset: 5 },
    xl: { pad: '22px 26px', font: 28, gap: 8, offset: 6 },
  };
  const v = variants[variant] ?? variants.primary;
  const s = sizes[size] ?? sizes.md;
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        position: 'relative',
        background: v.bg,
        color: v.fg,
        border: `2px solid ${v.shadow}`,
        boxShadow: `${s.offset}px ${s.offset}px 0 ${v.shadow}`,
        padding: s.pad,
        fontFamily: 'Anton, "Anton SC", Impact, sans-serif',
        fontSize: s.font,
        fontWeight: 400,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'transform 80ms ease, box-shadow 80ms ease',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      onPointerDown={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = `translate(${s.offset}px, ${s.offset}px)`;
        e.currentTarget.style.boxShadow = `0 0 0 ${v.shadow}`;
      }}
      onPointerUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = 'translate(0,0)';
        e.currentTarget.style.boxShadow = `${s.offset}px ${s.offset}px 0 ${v.shadow}`;
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.transform = 'translate(0,0)';
        e.currentTarget.style.boxShadow = `${s.offset}px ${s.offset}px 0 ${v.shadow}`;
      }}
      {...rest}
    >{children}</button>
  );
}

// ─── FlipLetters — F·L·I·P progress, taken letters filled, remaining outline ─
function FlipLetters({ word = 'FLIP', taken = 0, size = 22, gap = 4, color = 'var(--ink)', dimColor = 'rgba(244,237,224,0.22)' }) {
  const letters = word.split('');
  return (
    <div style={{ display: 'flex', gap, alignItems: 'center' }}>
      {letters.map((L, i) => {
        const on = i < taken;
        return (
          <span key={i} style={{
            fontFamily: 'Anton, Impact, sans-serif',
            fontSize: size,
            lineHeight: 1,
            color: on ? color : 'transparent',
            WebkitTextStroke: on ? '0' : `1px ${dimColor}`,
            letterSpacing: '0.02em',
            transform: on ? `rotate(${(i % 2 === 0 ? -2 : 2)}deg)` : 'none',
            display: 'inline-block',
            fontWeight: 400,
          }}>{L}</span>
        );
      })}
    </div>
  );
}

// ─── Gaffer tape label — yellow tape, dark text, slight rotation ───────────
function GaffeTape({ children, rotate = -2, style = {} }) {
  return (
    <div style={{
      display: 'inline-block',
      background: '#f6d738',
      color: '#0c0b09',
      fontFamily: 'Space Mono, monospace',
      fontWeight: 700,
      fontSize: 10,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      padding: '3px 10px 2px',
      transform: `rotate(${rotate}deg)`,
      boxShadow: '1px 1px 0 rgba(0,0,0,0.25)',
      // ragged edges
      clipPath: 'polygon(2% 0, 98% 4%, 100% 95%, 1% 100%)',
      ...style,
    }}>{children}</div>
  );
}

// ─── Halftone dots pattern — used as bg accents ────────────────────────────
function Halftone({ size = 6, opacity = 0.5, color = '#f4ede0', style = {} }) {
  const bg = `radial-gradient(${color} 1.2px, transparent 1.4px)`;
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: bg,
      backgroundSize: `${size}px ${size}px`,
      opacity,
      pointerEvents: 'none',
      ...style,
    }} />
  );
}

// ─── Film grain layer using SVG noise filter ───────────────────────────────
function GrainLayer({ opacity = 0.08 }) {
  return (
    <svg
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', mixBlendMode: 'overlay', opacity,
      }}
      aria-hidden="true"
    >
      <filter id="gritgrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#gritgrain)" />
    </svg>
  );
}

// ─── Tier badge — color-coded mini chip ────────────────────────────────────
const TIER_COLORS = {
  beginner:     { bg: '#7dd3fc', fg: '#0c0b09', label: 'BEG' },
  intermediate: { bg: '#d4ff3a', fg: '#0c0b09', label: 'INT' },
  advanced:     { bg: '#fb923c', fg: '#0c0b09', label: 'ADV' },
  pro:          { bg: '#ff2a1f', fg: '#f4ede0', label: 'PRO' },
};

function TierBadge({ tier, full = false, style = {} }) {
  const c = TIER_COLORS[tier] ?? TIER_COLORS.beginner;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: c.bg,
      color: c.fg,
      fontFamily: 'Space Mono, monospace',
      fontWeight: 700,
      fontSize: 10,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      padding: '4px 8px 3px',
      ...style,
    }}>
      <span style={{ width: 4, height: 4, background: c.fg, borderRadius: 0 }} />
      {full ? tier : c.label}
    </span>
  );
}

// ─── Small icon glyphs (no complex svg) ────────────────────────────────────
const Icon = {
  reroll: (size = 16, color = 'currentColor') => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  ),
  check: (size = 16, color = 'currentColor') => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
  x: (size = 16, color = 'currentColor') => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  plus: (size = 16, color = 'currentColor') => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  trash: (size = 16, color = 'currentColor') => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14" />
    </svg>
  ),
  back: (size = 16, color = 'currentColor') => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  crown: (size = 22, color = 'currentColor') => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round">
      <path d="M3 8l4 4 5-7 5 7 4-4-2 12H5L3 8z" />
    </svg>
  ),
};

// ─── Big rotated diagonal stamp (e.g. "OUT", "F-L-I-P") ────────────────────
function BigStamp({ text, color = 'var(--red)', rotate = -12, size = 56, style = {} }) {
  return (
    <div style={{
      fontFamily: 'Anton, Impact, sans-serif',
      fontSize: size,
      lineHeight: 1,
      color,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      transform: `rotate(${rotate}deg)`,
      border: `3px solid ${color}`,
      padding: '4px 14px 2px',
      whiteSpace: 'nowrap',
      ...style,
    }}>{text}</div>
  );
}

Object.assign(window, {
  StampLabel, ChunkyBtn, FlipLetters, GaffeTape,
  Halftone, GrainLayer, TierBadge, TIER_COLORS, Icon, BigStamp,
});
