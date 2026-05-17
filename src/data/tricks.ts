// Low-level trick primitives. Sport-specific libraries and the active /
// remote-loaded data live in sports.ts.

export type Tier = 'beginner' | 'intermediate' | 'advanced' | 'pro';

export type Trick = { name: string; tier: Tier };

export const TIERS: Tier[] = ['beginner', 'intermediate', 'advanced', 'pro'];

export function randomTrick(pool: Trick[], excludeName?: string): Trick {
  let p = pool;
  if (excludeName && pool.length > 1) p = pool.filter((t) => t.name !== excludeName);
  return p[Math.floor(Math.random() * p.length)];
}
