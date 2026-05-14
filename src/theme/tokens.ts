import type { Tier } from '../data/tricks';

export const colors = {
  paper: '#0c0b09',
  paper2: '#16140f',
  paper3: '#1f1c17',
  ink: '#f4ede0',
  inkMute: '#8a8378',
  rule: 'rgba(244,237,224,0.18)',
  rule2: 'rgba(244,237,224,0.10)',
  red: '#ff2a1f',
  lime: '#d4ff3a',
  yellow: '#f6d738',
} as const;

export const tierColors: Record<Tier, { bg: string; text: string }> = {
  beginner: { bg: '#7dd3fc', text: '#0c0b09' },
  intermediate: { bg: '#d4ff3a', text: '#0c0b09' },
  advanced: { bg: '#fb923c', text: '#0c0b09' },
  pro: { bg: '#ff2a1f', text: '#f4ede0' },
};

export const fonts = {
  display: 'Anton_400Regular',
  body: 'SpaceMono_400Regular',
  bodyBold: 'SpaceMono_700Bold',
} as const;

export const typeScale = {
  hero: 120,
  bigTrick: 44,
  gameOverLetter: 78,
  winnerName: 40,
  sectionBig: 22,
  body: 13,
  button: 14,
  caps: 10,
} as const;

export const spacing = {
  screenX: 16,
  topSafe: 56,
  cardPadding: 14,
  rowGap: 8,
  sectionGap: 20,
} as const;
