import { filterTricksFor, getSport, type SportId } from '../data/sports';
import { randomTrick, type Tier, type Trick } from '../data/tricks';

export type Mode = 'classic' | 'addon' | 'sendit';
export type Screen = 'home' | 'setup' | 'match' | 'gameover' | 'sendit';
export type Result = 'landed' | 'missed';

export type Player = {
  id: string;
  name: string;
  letters: number;
  eliminated: boolean;
  elimRound: number | null;
};

export type HistoryEntry = {
  round: number;
  mode: Mode;
  trick: Trick[];
  setFailed: boolean;
  setterId: string | undefined;
  results: Array<{ id: string; name: string; result: Result | 'skip' }>;
};

export type State = {
  screen: Screen;
  sportId: SportId; // current sport — drives word, accent, trick library
  sportLocked: boolean; // true while a match is in progress
  mode: Mode;
  tiers: Tier[];
  senditTimer: number; // Send-It per-trick countdown in seconds; 0 = off
  players: Player[];
  currentTrick: Trick | null;
  combo: Trick[];
  roundIdx: number;
  setterIdx: number;
  responses: Record<string, Result>;
  rerollsThisRound: number;
  winner: Player | null;
  history: HistoryEntry[];
  trickPickerOpen: boolean;
};

export type Action =
  | { type: 'GOTO'; screen: Screen }
  | { type: 'SET_SPORT'; sportId: SportId }
  | { type: 'ADD_PLAYER'; name: string }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'RENAME_PLAYER'; id: string; name: string }
  | { type: 'SET_MODE'; mode: Mode }
  | { type: 'TOGGLE_TIER'; tier: Tier }
  | { type: 'SET_SENDIT_TIMER'; secs: number }
  | { type: 'START_MATCH' }
  | { type: 'REROLL' }
  | { type: 'NEXT_TRICK' }
  | { type: 'PICK_TRICK'; trick: Trick }
  | { type: 'OPEN_PICKER' }
  | { type: 'CLOSE_PICKER' }
  | { type: 'SET_RESULT'; id: string; result: Result }
  | { type: 'CLEAR_RESULT'; id: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'REMATCH' }
  | { type: 'HOME' }
  | { type: 'EXIT_TO_SETUP' }
  | { type: 'HYDRATE'; state: State };

const uid = () => Math.random().toString(36).slice(2, 9);

export const initialState: State = {
  screen: 'home',
  sportId: 'trampoline',
  sportLocked: false,
  mode: 'classic',
  tiers: ['beginner', 'intermediate'],
  senditTimer: 15,
  players: [],
  currentTrick: null,
  combo: [],
  roundIdx: 1,
  setterIdx: 0,
  responses: {},
  rerollsThisRound: 0,
  winner: null,
  history: [],
  trickPickerOpen: false,
};

// The loss word for a state — derived from the current sport.
export function wordFor(s: State): string {
  return getSport(s.sportId).word;
}

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'GOTO':
      return { ...s, screen: a.screen };

    case 'SET_SPORT': {
      if (s.sportLocked) return s; // sport is locked mid-match
      if (a.sportId === s.sportId) return s;
      return { ...s, sportId: a.sportId };
    }

    case 'ADD_PLAYER': {
      if (s.players.length >= 12) return s;
      const name = (a.name || '').trim();
      if (!name) return s;
      return {
        ...s,
        players: [
          ...s.players,
          { id: uid(), name, letters: 0, eliminated: false, elimRound: null },
        ],
      };
    }

    case 'REMOVE_PLAYER':
      return { ...s, players: s.players.filter((p) => p.id !== a.id) };

    case 'RENAME_PLAYER':
      return {
        ...s,
        players: s.players.map((p) => (p.id === a.id ? { ...p, name: a.name } : p)),
      };

    case 'SET_MODE':
      return { ...s, mode: a.mode };

    case 'SET_SENDIT_TIMER':
      return { ...s, senditTimer: a.secs };

    case 'TOGGLE_TIER': {
      const has = s.tiers.includes(a.tier);
      let tiers = has ? s.tiers.filter((t) => t !== a.tier) : [...s.tiers, a.tier];
      if (!tiers.length) tiers = [a.tier];
      return { ...s, tiers };
    }

    case 'START_MATCH': {
      const pool = filterTricksFor(s.sportId, s.tiers);
      const first = randomTrick(pool);
      return {
        ...s,
        // Send-It is a solo trick generator on its own screen.
        screen: s.mode === 'sendit' ? 'sendit' : 'match',
        sportLocked: true,
        currentTrick: first,
        combo: [],
        roundIdx: 1,
        setterIdx: 0,
        responses: {},
        rerollsThisRound: 0,
        winner: null,
        history: [],
        players: s.players.map((p) => ({
          ...p,
          letters: 0,
          eliminated: false,
          elimRound: null,
        })),
      };
    }

    case 'REROLL': {
      const pool = filterTricksFor(s.sportId, s.tiers);
      const next = randomTrick(pool, s.currentTrick?.name);
      return {
        ...s,
        currentTrick: next,
        responses: {},
        rerollsThisRound: s.rerollsThisRound + 1,
      };
    }

    case 'NEXT_TRICK': {
      // Send-It mode — roll a fresh random trick, never repeating the current.
      const pool = filterTricksFor(s.sportId, s.tiers);
      return { ...s, currentTrick: randomTrick(pool, s.currentTrick?.name) };
    }

    case 'PICK_TRICK':
      return { ...s, currentTrick: a.trick, responses: {}, trickPickerOpen: false };

    case 'OPEN_PICKER':
      return { ...s, trickPickerOpen: true };

    case 'CLOSE_PICKER':
      return { ...s, trickPickerOpen: false };

    case 'SET_RESULT':
      return { ...s, responses: { ...s.responses, [a.id]: a.result } };

    case 'CLEAR_RESULT': {
      const r = { ...s.responses };
      delete r[a.id];
      return { ...s, responses: r };
    }

    case 'NEXT_ROUND': {
      const wordLen = wordFor(s).length;
      const setter = s.players[s.setterIdx];
      const setterResult = setter ? s.responses[setter.id] : null;
      const setterLanded = setterResult === 'landed';

      const players = s.players.map((p) => {
        if (p.eliminated) return p;
        if (!setterLanded) return p;
        if (p.id === setter?.id) return p;
        if (s.responses[p.id] === 'missed') {
          const letters = p.letters + 1;
          const eliminated = letters >= wordLen;
          return {
            ...p,
            letters,
            eliminated,
            elimRound: eliminated ? s.roundIdx : p.elimRound,
          };
        }
        return p;
      });

      const nextCombo =
        s.mode === 'addon' && setterLanded && s.currentTrick
          ? [...s.combo, s.currentTrick]
          : s.combo;

      const histTrick: Trick[] =
        s.mode === 'addon' ? [...nextCombo] : s.currentTrick ? [s.currentTrick] : [];
      const history: HistoryEntry[] = [
        ...s.history,
        {
          round: s.roundIdx,
          mode: s.mode,
          trick: histTrick,
          setFailed: !setterLanded,
          setterId: setter?.id,
          results: s.players
            .filter((p) => !p.eliminated)
            .map((p) => ({
              id: p.id,
              name: p.name,
              result:
                p.id === setter?.id || setterLanded
                  ? (s.responses[p.id] ?? 'skip')
                  : 'skip',
            })),
        },
      ];

      const alive = players.filter((p) => !p.eliminated);
      if (alive.length <= 1) {
        return {
          ...s,
          players,
          history,
          combo: nextCombo,
          winner: alive[0] ?? null,
          screen: 'gameover',
        };
      }

      const aliveIds = alive.map((p) => p.id);
      const currentSetterId = setter?.id;
      const curPos = currentSetterId ? aliveIds.indexOf(currentSetterId) : -1;
      const nextSetterId = aliveIds[(curPos + 1) % aliveIds.length];
      const nextSetterIdx = players.findIndex((p) => p.id === nextSetterId);

      const pool = filterTricksFor(s.sportId, s.tiers);
      const next = randomTrick(pool, s.currentTrick?.name);

      return {
        ...s,
        players,
        history,
        roundIdx: s.roundIdx + 1,
        setterIdx: nextSetterIdx,
        responses: {},
        rerollsThisRound: 0,
        currentTrick: next,
        combo: nextCombo,
      };
    }

    case 'REMATCH': {
      const pool = filterTricksFor(s.sportId, s.tiers);
      const first = randomTrick(pool);
      return {
        ...s,
        screen: 'match',
        sportLocked: true,
        currentTrick: first,
        combo: [],
        roundIdx: 1,
        setterIdx: 0,
        responses: {},
        rerollsThisRound: 0,
        winner: null,
        history: [],
        players: s.players.map((p) => ({
          ...p,
          letters: 0,
          eliminated: false,
          elimRound: null,
        })),
      };
    }

    case 'HOME':
      // Reset to idle, but keep the roster, the chosen sport, and the
      // Send-It timer preference.
      return {
        ...initialState,
        players: s.players,
        sportId: s.sportId,
        senditTimer: s.senditTimer,
      };

    case 'EXIT_TO_SETUP':
      // Bail out of a match (or Send-It session, or Game Over) back to
      // Setup. Clears in-progress match state and unlocks the sport, but
      // keeps the roster, sport, mode, tiers, and timer preference — so
      // the user can tweak Setup and run another match without redoing it.
      return {
        ...initialState,
        screen: 'setup',
        players: s.players,
        sportId: s.sportId,
        senditTimer: s.senditTimer,
        mode: s.mode,
        tiers: s.tiers,
      };

    case 'HYDRATE':
      // Replace state from a persisted snapshot. Spreading initialState
      // first backfills any field the snapshot predates. The picker is
      // force-closed so users don't restore into a half-open modal.
      return { ...initialState, ...a.state, trickPickerOpen: false };

    default:
      return s;
  }
}
