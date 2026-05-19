import { TRAMPOLINE_TRICKS } from './bundled/trampolineTricks';
import { TRICKING_TRICKS } from './bundled/trickingTricks';
import type { Tier, Trick } from './tricks';

export type SportId = 'trampoline' | 'tricking';

// A sport profile: brand identity + loss word + trick library source.
// The game loop is identical across sports; only the vocabulary, the
// spelled word, and the accent color change.
export type Sport = {
  id: SportId;
  label: string; // 'TRAMPOLINE' — full name
  short: string; // 'TRAMP' — compact label for tight contexts
  word: string; // 'FLIP' / 'TRICK' — the loss word (also the hero's 2nd line)
  accent: string; // brand-chrome accent (per-sport)
  accentSoft: string; // rgba tint of the accent
  accentSoftStrong: string;
  tag: string; // 'two-string · backyard' — shown in the home sub-tagline
  gid: string; // Google Sheet tab gid for this sport's library
  bundledTricks: Trick[]; // offline / first-launch fallback library
};

export const SPORTS: Sport[] = [
  {
    id: 'trampoline',
    label: 'TRAMPOLINE',
    short: 'TRAMP',
    word: 'FLIP',
    accent: '#ff2a1f',
    accentSoft: 'rgba(255,42,31,0.06)',
    accentSoftStrong: 'rgba(255,42,31,0.12)',
    tag: 'two-string · backyard',
    gid: '0',
    bundledTricks: TRAMPOLINE_TRICKS,
  },
  {
    id: 'tricking',
    label: 'TRICKING',
    short: 'TRICK',
    word: 'TRICK',
    accent: '#1f7aff',
    accentSoft: 'rgba(31,122,255,0.07)',
    accentSoftStrong: 'rgba(31,122,255,0.14)',
    tag: 'spring floor · grass',
    gid: '1064258021',
    bundledTricks: TRICKING_TRICKS,
  },
];

export const SPORT_IDS: SportId[] = SPORTS.map((s) => s.id);

export function getSport(id: SportId): Sport {
  return SPORTS.find((s) => s.id === id) ?? SPORTS[0];
}

// ─── Active per-sport libraries ─────────────────────────────────────────
// Each sport's effective trick library, mutated by TrickLibraryProvider as
// cached / remote data loads. The reducer's pure helpers read from here so
// they don't need React context. Initialized to the bundled fallbacks.
const _active: Record<SportId, Trick[]> = {
  trampoline: SPORTS[0].bundledTricks.slice(),
  tricking: SPORTS[1].bundledTricks.slice(),
};

export function getActiveTricks(id: SportId): Trick[] {
  return _active[id];
}

export function setActiveTricks(id: SportId, tricks: Trick[]): void {
  _active[id] = tricks.slice();
}

export function filterTricksFor(
  id: SportId,
  tiers: Tier[] | undefined | null,
): Trick[] {
  const all = _active[id];
  if (!tiers || !tiers.length) return all.slice();
  return all.filter((t) => tiers.includes(t.tier));
}
