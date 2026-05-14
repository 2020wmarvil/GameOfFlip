import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  DEFAULT_TRICKS,
  setActiveLibrary,
  type Trick,
} from '../data/tricks';
import { fetchRemoteTricks } from '../data/tricksRemote';

type Ctx = { library: Trick[] };

const TrickLibCtx = createContext<Ctx | null>(null);

// Bump the suffix if Trick's shape changes incompatibly.
const CACHE_KEY = '@gameOfFlip/trickLibrary-v1';

// Load order on mount:
//   1. Read AsyncStorage cache → adopt instantly if present.
//   2. Fire off remote fetch in the background → if it succeeds, replace
//      the library and persist as the new cache.
//   3. If there's no cache and the remote fails, the bundled DEFAULT_TRICKS
//      that the active library was initialized with stays in place.
export function TrickLibraryProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState<Trick[]>(DEFAULT_TRICKS);
  const mounted = useRef(true);

  // Keep the module-level mutable mirror in sync so the reducer's pure
  // helpers (filterTricks, randomTrick via filterTricks) read the right data.
  const adopt = (next: Trick[]) => {
    setActiveLibrary(next);
    if (mounted.current) setLibrary(next);
  };

  useEffect(() => {
    mounted.current = true;

    (async () => {
      // 1) Hydrate from cache.
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as Trick[];
          if (Array.isArray(cached) && cached.length >= 4) {
            adopt(cached);
          }
        }
      } catch {
        // Bad cache — drop it.
        await AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
      }

      // 2) Try remote.
      const result = await fetchRemoteTricks();
      if (result.ok) {
        adopt(result.tricks);
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(result.tricks)).catch(() => {});
      }
    })();

    return () => {
      mounted.current = false;
    };
  }, []);

  return <TrickLibCtx.Provider value={{ library }}>{children}</TrickLibCtx.Provider>;
}

export function useTrickLibrary(): Trick[] {
  const ctx = useContext(TrickLibCtx);
  if (!ctx) throw new Error('useTrickLibrary must be used inside TrickLibraryProvider');
  return ctx.library;
}
