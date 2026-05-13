// Freestyle trampoline trick library.
// Tier order matters — used as numeric for "min difficulty" filtering.
const TIERS = ['beginner', 'intermediate', 'advanced', 'pro'];

const TRICKS = [
  // ── BEGINNER ─────────────────────────────────────────────
  { name: 'Seat Drop',          tier: 'beginner' },
  { name: 'Hands & Knees',      tier: 'beginner' },
  { name: 'Back Drop',          tier: 'beginner' },
  { name: 'Front Drop',         tier: 'beginner' },
  { name: 'Swivel Hips',        tier: 'beginner' },
  { name: 'Roller',             tier: 'beginner' },
  { name: 'Half Twist',         tier: 'beginner' },
  { name: 'Tuck Jump',          tier: 'beginner' },
  { name: 'Pike Jump',          tier: 'beginner' },
  { name: 'Straddle Jump',      tier: 'beginner' },
  { name: 'Front Tuck',         tier: 'beginner' },
  { name: 'Back Tuck',          tier: 'beginner' },

  // ── INTERMEDIATE ────────────────────────────────────────
  { name: 'Back Pike',          tier: 'intermediate' },
  { name: 'Front Pike',         tier: 'intermediate' },
  { name: 'Barani',             tier: 'intermediate' },
  { name: 'Back Full',          tier: 'intermediate' },
  { name: 'Back Layout',        tier: 'intermediate' },
  { name: 'Front Layout',       tier: 'intermediate' },
  { name: 'Crash Dive',         tier: 'intermediate' },
  { name: 'Cody',               tier: 'intermediate' },
  { name: 'Ball-Out',           tier: 'intermediate' },
  { name: 'Lazy Back',          tier: 'intermediate' },
  { name: 'Porpoise',           tier: 'intermediate' },
  { name: 'Back Pullover',      tier: 'intermediate' },

  // ── ADVANCED ────────────────────────────────────────────
  { name: 'Rudy',               tier: 'advanced' },
  { name: 'Randy',              tier: 'advanced' },
  { name: 'Adolph',             tier: 'advanced' },
  { name: 'Double Back Tuck',   tier: 'advanced' },
  { name: 'Double Back Pike',   tier: 'advanced' },
  { name: 'Double Front Tuck',  tier: 'advanced' },
  { name: 'Double Full',        tier: 'advanced' },
  { name: 'Triple Twist',       tier: 'advanced' },
  { name: 'Half-In Half-Out',   tier: 'advanced' },
  { name: 'Full-In Back-Out',   tier: 'advanced' },
  { name: 'Back-In Full-Out',   tier: 'advanced' },
  { name: 'Miller',             tier: 'advanced' },

  // ── PRO ─────────────────────────────────────────────────
  { name: 'Triffis',            tier: 'pro' },
  { name: 'Triple Back Tuck',   tier: 'pro' },
  { name: 'Killer',             tier: 'pro' },
  { name: 'Miller Plus',        tier: 'pro' },
  { name: 'Full-In Full-Out',   tier: 'pro' },
  { name: 'Full-In Rudy-Out',   tier: 'pro' },
  { name: 'Rudy-Out',           tier: 'pro' },
  { name: 'Half-In Triff-Out',  tier: 'pro' },
  { name: 'Quad Twist',         tier: 'pro' },
  { name: 'Double-Full Full-Out', tier: 'pro' },
  { name: 'Randolph',           tier: 'pro' },
  { name: 'Triple-Twisting Double', tier: 'pro' },
];

// Filter by allowed tiers (array of tier strings). Returns shallow array.
function filterTricks(tiers) {
  if (!tiers || !tiers.length) return TRICKS.slice();
  return TRICKS.filter((t) => tiers.includes(t.tier));
}

// Random trick from pool, optionally excluding by name (for re-roll uniqueness).
function randomTrick(pool, excludeName) {
  let p = pool;
  if (excludeName && pool.length > 1) p = pool.filter((t) => t.name !== excludeName);
  return p[Math.floor(Math.random() * p.length)];
}

Object.assign(window, { TRICKS, TIERS, filterTricks, randomTrick });
