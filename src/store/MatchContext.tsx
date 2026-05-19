import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react';
import { getSport, SPORT_IDS, type Sport, type SportId } from '../data/sports';
import { initialState, reducer, type Action, type State } from './match';

type Ctx = { state: State; dispatch: Dispatch<Action> };

const MatchCtx = createContext<Ctx | null>(null);

// In-progress match snapshot (match / gameover screens only).
const MATCH_KEY = '@gameOfFlip/match-v1';
// Chosen sport — persists across launches regardless of screen.
const SPORT_KEY = '@gameOfFlip/sportId-v1';

function shouldPersistMatch(state: State): boolean {
  return state.screen === 'match' || state.screen === 'gameover';
}

function isSportId(v: unknown): v is SportId {
  return typeof v === 'string' && (SPORT_IDS as string[]).includes(v);
}

export function MatchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  // ─── Load on mount ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const matchRaw = await AsyncStorage.getItem(MATCH_KEY);
        if (matchRaw) {
          const saved = JSON.parse(matchRaw) as State;
          if (saved && (saved.screen === 'match' || saved.screen === 'gameover')) {
            // A match snapshot restores everything, including sportId.
            if (!cancelled) dispatch({ type: 'HYDRATE', state: saved });
            if (!cancelled) setHydrated(true);
            return;
          }
          await AsyncStorage.removeItem(MATCH_KEY);
        }
        // No in-progress match — just restore the chosen sport.
        const savedSport = await AsyncStorage.getItem(SPORT_KEY);
        if (!cancelled && isSportId(savedSport)) {
          dispatch({ type: 'SET_SPORT', sportId: savedSport });
        }
      } catch {
        await AsyncStorage.removeItem(MATCH_KEY).catch(() => {});
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Persist the in-progress match ──────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    if (shouldPersistMatch(state)) {
      AsyncStorage.setItem(MATCH_KEY, JSON.stringify(state)).catch(() => {});
    } else {
      AsyncStorage.removeItem(MATCH_KEY).catch(() => {});
    }
  }, [state, hydrated]);

  // ─── Persist the chosen sport (survives across launches) ────────────
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(SPORT_KEY, state.sportId).catch(() => {});
  }, [state.sportId, hydrated]);

  if (!hydrated) return null;

  return <MatchCtx.Provider value={{ state, dispatch }}>{children}</MatchCtx.Provider>;
}

export function useMatch(): Ctx {
  const ctx = useContext(MatchCtx);
  if (!ctx) throw new Error('useMatch must be used inside MatchProvider');
  return ctx;
}

// The current sport profile — accent, word, label, tag, etc.
export function useSport(): Sport {
  const { state } = useMatch();
  return getSport(state.sportId);
}
