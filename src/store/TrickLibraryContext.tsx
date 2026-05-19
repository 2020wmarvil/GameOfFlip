import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { SPORTS, setActiveTricks, type SportId } from '../data/sports';
import type { Trick } from '../data/tricks';
import { fetchSportTricks } from '../data/tricksRemote';

type Libraries = Record<SportId, Trick[]>;

const TrickLibCtx = createContext<Libraries | null>(null);

// Per-sport cache key. Bump the suffix if Trick's shape changes.
const cacheKey = (id: SportId) => `@gameOfFlip/trickLibrary-${id}-v1`;

function bundledLibraries(): Libraries {
  const libs = {} as Libraries;
  for (const sport of SPORTS) libs[sport.id] = sport.bundledTricks;
  return libs;
}

// On mount, for every sport: adopt the AsyncStorage cache if present, then
// fetch the sport's Sheet tab in the background and replace + re-cache on
// success. Bundled libraries stay in place if both cache and remote miss.
export function TrickLibraryProvider({ children }: { children: ReactNode }) {
  const [libraries, setLibraries] = useState<Libraries>(bundledLibraries);
  const mounted = useRef(true);

  // Keep the module-level mirror in sync so the reducer's pure helpers
  // (filterTricksFor) read the right data.
  const adopt = (id: SportId, tricks: Trick[]) => {
    setActiveTricks(id, tricks);
    if (mounted.current) {
      setLibraries((prev) => ({ ...prev, [id]: tricks }));
    }
  };

  useEffect(() => {
    mounted.current = true;

    for (const sport of SPORTS) {
      (async () => {
        // 1) Hydrate from cache.
        try {
          const raw = await AsyncStorage.getItem(cacheKey(sport.id));
          if (raw) {
            const cached = JSON.parse(raw) as Trick[];
            if (Array.isArray(cached) && cached.length >= 4) {
              adopt(sport.id, cached);
            }
          }
        } catch {
          await AsyncStorage.removeItem(cacheKey(sport.id)).catch(() => {});
        }

        // 2) Try the remote tab.
        const result = await fetchSportTricks(sport.gid);
        if (result.ok) {
          adopt(sport.id, result.tricks);
          AsyncStorage.setItem(
            cacheKey(sport.id),
            JSON.stringify(result.tricks),
          ).catch(() => {});
        }
      })();
    }

    return () => {
      mounted.current = false;
    };
  }, []);

  return <TrickLibCtx.Provider value={libraries}>{children}</TrickLibCtx.Provider>;
}

// All sports' current libraries.
export function useTrickLibraries(): Libraries {
  const ctx = useContext(TrickLibCtx);
  if (!ctx) throw new Error('useTrickLibraries must be used inside TrickLibraryProvider');
  return ctx;
}

// One sport's current library.
export function useSportTricks(id: SportId): Trick[] {
  return useTrickLibraries()[id];
}
