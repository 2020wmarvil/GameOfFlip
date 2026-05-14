import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useReducer, useRef, useState, type Dispatch, type ReactNode } from 'react';
import { initialState, reducer, type Action, type State } from './match';

type Ctx = { state: State; dispatch: Dispatch<Action> };

const MatchCtx = createContext<Ctx | null>(null);

// Versioned key — bump the suffix if the State shape changes incompatibly.
const STORAGE_KEY = '@gameOfFlip/match-v1';

// Only persist the state while a match is in progress or just ended.
// Home and setup are considered "idle" — wipe storage so a relaunch
// starts with a clean roster, per the product decision.
function shouldPersist(state: State): boolean {
  return state.screen === 'match' || state.screen === 'gameover';
}

export function MatchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  // Track whether we've finished initial load so the persist effect
  // doesn't fire during it.
  const isFirstWrite = useRef(true);

  // ─── Load on mount ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && raw) {
          const saved = JSON.parse(raw) as State;
          if (saved && (saved.screen === 'match' || saved.screen === 'gameover')) {
            dispatch({ type: 'HYDRATE', state: saved });
          } else {
            // Stored state is in an idle screen — discard.
            await AsyncStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch {
        // Corrupt JSON or storage failure — wipe and proceed.
        await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Persist on every change after hydration ────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    if (isFirstWrite.current) {
      isFirstWrite.current = false;
      // Still write on the first post-hydration tick in case HYDRATE
      // restored an in-progress match and we want to refresh the blob.
    }
    if (shouldPersist(state)) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    }
  }, [state, hydrated]);

  if (!hydrated) return null;

  return <MatchCtx.Provider value={{ state, dispatch }}>{children}</MatchCtx.Provider>;
}

export function useMatch(): Ctx {
  const ctx = useContext(MatchCtx);
  if (!ctx) throw new Error('useMatch must be used inside MatchProvider');
  return ctx;
}
