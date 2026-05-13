export type Tier = 'beginner' | 'intermediate' | 'advanced' | 'pro';

export type Trick = { name: string; tier: Tier };

export const TIERS: Tier[] = ['beginner', 'intermediate', 'advanced', 'pro'];

export const TRICKS: Trick[] = [
  { name: 'Seat Drop', tier: 'beginner' },
  { name: 'Hands & Knees', tier: 'beginner' },
  { name: 'Back Drop', tier: 'beginner' },
  { name: 'Front Drop', tier: 'beginner' },
  { name: 'Swivel Hips', tier: 'beginner' },
  { name: 'Roller', tier: 'beginner' },
  { name: 'Half Twist', tier: 'beginner' },
  { name: 'Tuck Jump', tier: 'beginner' },
  { name: 'Pike Jump', tier: 'beginner' },
  { name: 'Straddle Jump', tier: 'beginner' },
  { name: 'Front Tuck', tier: 'beginner' },
  { name: 'Back Tuck', tier: 'beginner' },

  { name: 'Back Pike', tier: 'intermediate' },
  { name: 'Front Pike', tier: 'intermediate' },
  { name: 'Barani', tier: 'intermediate' },
  { name: 'Back Full', tier: 'intermediate' },
  { name: 'Back Layout', tier: 'intermediate' },
  { name: 'Front Layout', tier: 'intermediate' },
  { name: 'Crash Dive', tier: 'intermediate' },
  { name: 'Cody', tier: 'intermediate' },
  { name: 'Ball-Out', tier: 'intermediate' },
  { name: 'Lazy Back', tier: 'intermediate' },
  { name: 'Porpoise', tier: 'intermediate' },
  { name: 'Back Pullover', tier: 'intermediate' },

  { name: 'Rudy', tier: 'advanced' },
  { name: 'Randy', tier: 'advanced' },
  { name: 'Adolph', tier: 'advanced' },
  { name: 'Double Back Tuck', tier: 'advanced' },
  { name: 'Double Back Pike', tier: 'advanced' },
  { name: 'Double Front Tuck', tier: 'advanced' },
  { name: 'Double Full', tier: 'advanced' },
  { name: 'Triple Twist', tier: 'advanced' },
  { name: 'Half-In Half-Out', tier: 'advanced' },
  { name: 'Full-In Back-Out', tier: 'advanced' },
  { name: 'Back-In Full-Out', tier: 'advanced' },
  { name: 'Miller', tier: 'advanced' },

  { name: 'Triffis', tier: 'pro' },
  { name: 'Triple Back Tuck', tier: 'pro' },
  { name: 'Killer', tier: 'pro' },
  { name: 'Miller Plus', tier: 'pro' },
  { name: 'Full-In Full-Out', tier: 'pro' },
  { name: 'Full-In Rudy-Out', tier: 'pro' },
  { name: 'Rudy-Out', tier: 'pro' },
  { name: 'Half-In Triff-Out', tier: 'pro' },
  { name: 'Quad Twist', tier: 'pro' },
  { name: 'Double-Full Full-Out', tier: 'pro' },
  { name: 'Randolph', tier: 'pro' },
  { name: 'Triple-Twisting Double', tier: 'pro' },
];

export function filterTricks(tiers: Tier[] | undefined | null): Trick[] {
  if (!tiers || !tiers.length) return TRICKS.slice();
  return TRICKS.filter((t) => tiers.includes(t.tier));
}

export function randomTrick(pool: Trick[], excludeName?: string): Trick {
  let p = pool;
  if (excludeName && pool.length > 1) p = pool.filter((t) => t.name !== excludeName);
  return p[Math.floor(Math.random() * p.length)];
}
