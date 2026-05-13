import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { initialState, reducer, type Action, type State } from './match';

type Ctx = { state: State; dispatch: Dispatch<Action> };

const MatchCtx = createContext<Ctx | null>(null);

export function MatchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <MatchCtx.Provider value={{ state, dispatch }}>{children}</MatchCtx.Provider>;
}

export function useMatch(): Ctx {
  const ctx = useContext(MatchCtx);
  if (!ctx) throw new Error('useMatch must be used inside MatchProvider');
  return ctx;
}
