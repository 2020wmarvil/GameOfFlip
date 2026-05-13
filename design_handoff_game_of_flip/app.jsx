// app.jsx — Game of Flip main app (state + screens)

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#ff2a1f",
  "good": "#d4ff3a",
  "word": "FLIP",
  "grain": true,
  "rerollLimit": 999,
  "showHowTo": true
}/*EDITMODE-END*/;

// ─── State ──────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const ALL_TIERS = ['beginner', 'intermediate', 'advanced', 'pro'];

const initialState = {
  screen: 'home',
  mode: 'classic',
  tiers: ['beginner', 'intermediate'],
  selection: 'random',
  word: 'FLIP',
  players: [
    { id: uid(), name: 'Jamie', letters: 0, eliminated: false, elimRound: null },
    { id: uid(), name: 'Riley', letters: 0, eliminated: false, elimRound: null },
    { id: uid(), name: 'Sasha', letters: 0, eliminated: false, elimRound: null },
  ],
  currentTrick: null,
  combo: [],          // ESTABLISHED combo (addon, successfully-set tricks only)
  roundIdx: 1,
  setterIdx: 0,       // rotates each round
  responses: {},      // playerId -> 'landed' | 'missed'
  rerollsThisRound: 0,
  winner: null,
  history: [],        // {round, trick, results: [{playerId, result}]}
  trickPickerOpen: false,
};

function reducer(s, a) {
  switch (a.type) {
    case 'GOTO': return { ...s, screen: a.screen };
    case 'ADD_PLAYER': {
      if (s.players.length >= 12) return s;
      const name = (a.name || '').trim();
      if (!name) return s;
      return { ...s, players: [...s.players, { id: uid(), name, letters: 0, eliminated: false, elimRound: null }] };
    }
    case 'REMOVE_PLAYER':
      return { ...s, players: s.players.filter((p) => p.id !== a.id) };
    case 'RENAME_PLAYER':
      return { ...s, players: s.players.map((p) => p.id === a.id ? { ...p, name: a.name } : p) };
    case 'SET_MODE': return { ...s, mode: a.mode };
    case 'TOGGLE_TIER': {
      const has = s.tiers.includes(a.tier);
      let tiers = has ? s.tiers.filter((t) => t !== a.tier) : [...s.tiers, a.tier];
      if (!tiers.length) tiers = [a.tier]; // never empty
      return { ...s, tiers };
    }
    case 'SET_SELECTION': return { ...s, selection: a.selection };
    case 'SET_WORD': return { ...s, word: a.word };
    case 'START_MATCH': {
      const pool = filterTricks(s.tiers);
      const first = randomTrick(pool);
      return {
        ...s,
        screen: 'match',
        currentTrick: first,
        combo: [], // established starts empty for both modes
        roundIdx: 1,
        setterIdx: 0,
        responses: {},
        rerollsThisRound: 0,
        winner: null,
        history: [],
        players: s.players.map((p) => ({ ...p, letters: 0, eliminated: false, elimRound: null })),
      };
    }
    case 'REROLL': {
      const pool = filterTricks(s.tiers);
      const next = randomTrick(pool, s.currentTrick?.name);
      // rerolling clears any responses already given this round; combo untouched
      return { ...s, currentTrick: next, responses: {}, rerollsThisRound: s.rerollsThisRound + 1 };
    }
    case 'PICK_TRICK': {
      return { ...s, currentTrick: a.trick, responses: {}, trickPickerOpen: false };
    }
    case 'OPEN_PICKER': return { ...s, trickPickerOpen: true };
    case 'CLOSE_PICKER': return { ...s, trickPickerOpen: false };
    case 'SET_RESULT': {
      return { ...s, responses: { ...s.responses, [a.id]: a.result } };
    }
    case 'CLEAR_RESULT': {
      const r = { ...s.responses }; delete r[a.id];
      return { ...s, responses: r };
    }
    case 'NEXT_ROUND': {
      const wordLen = s.word.length;
      const setter = s.players[s.setterIdx];
      const setterResult = setter ? s.responses[setter.id] : null;
      const setterLanded = setterResult === 'landed';

      // Apply letter changes:
      //  - If setter missed: nobody takes a letter — the trick was never set.
      //    Round is a no-op, new trick rolls in.
      //  - If setter landed: any other player who missed takes a letter.
      //    (The setter already landed it, so they're safe.)
      const players = s.players.map((p) => {
        if (p.eliminated) return p;
        if (!setterLanded) return p; // failed set = no penalties
        if (p.id === setter?.id) return p; // setter is safe — they set it
        if (s.responses[p.id] === 'missed') {
          const letters = p.letters + 1;
          const eliminated = letters >= wordLen;
          return { ...p, letters, eliminated, elimRound: eliminated ? s.roundIdx : p.elimRound };
        }
        return p;
      });

      // Combo only grows in addon when the set succeeds.
      const nextCombo = (s.mode === 'addon' && setterLanded)
        ? [...s.combo, s.currentTrick]
        : s.combo;

      // History
      const histTrick = s.mode === 'addon' ? [...nextCombo] : [s.currentTrick];
      const history = [...s.history, {
        round: s.roundIdx,
        mode: s.mode,
        trick: histTrick,
        setFailed: !setterLanded,
        setterId: setter?.id,
        results: s.players.filter((p) => !p.eliminated).map((p) => ({
          id: p.id, name: p.name,
          result: (p.id === setter?.id || setterLanded) ? (s.responses[p.id] ?? 'skip') : 'skip',
        })),
      }];

      // Game over?
      const alive = players.filter((p) => !p.eliminated);
      if (alive.length <= 1) {
        return { ...s, players, history, combo: nextCombo, winner: alive[0] ?? null, screen: 'gameover' };
      }

      // Setter rotates only among alive players
      const aliveIds = alive.map((p) => p.id);
      const currentSetterId = setter?.id;
      const curPos = aliveIds.indexOf(currentSetterId);
      const nextSetterId = aliveIds[(curPos + 1) % aliveIds.length];
      const nextSetterIdx = players.findIndex((p) => p.id === nextSetterId);

      // Pick next trick
      const pool = filterTricks(s.tiers);
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
      const pool = filterTricks(s.tiers);
      const first = randomTrick(pool);
      return {
        ...s,
        screen: 'match',
        currentTrick: first,
        combo: [],
        roundIdx: 1,
        setterIdx: 0,
        responses: {},
        rerollsThisRound: 0,
        winner: null,
        history: [],
        players: s.players.map((p) => ({ ...p, letters: 0, eliminated: false, elimRound: null })),
      };
    }
    case 'HOME': return { ...initialState, players: s.players };
    default: return s;
  }
}

// ─── Top-level ──────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [state, dispatch] = React.useReducer(reducer, { ...initialState, word: TWEAK_DEFAULTS.word });

  // sync tweak.word into state when user changes it from setup or tweaks
  React.useEffect(() => {
    if (state.word !== t.word) dispatch({ type: 'SET_WORD', word: t.word });
    // eslint-disable-next-line
  }, [t.word]);

  // Apply CSS color vars from tweaks
  React.useEffect(() => {
    document.documentElement.style.setProperty('--red', t.accent);
    document.documentElement.style.setProperty('--lime', t.good);
  }, [t.accent, t.good]);

  return (
    <div className="stage">
      <div className="stage-bg" />
      {t.grain && <GrainLayer opacity={0.09} />}

      <div className="device-wrap">
        <IOSDevice width={402} height={874} dark={true}>
          {/* Status bar already provided */}
          <div className="app-root">
            {state.screen === 'home'     && <HomeScreen state={state} dispatch={dispatch} t={t} />}
            {state.screen === 'setup'    && <SetupScreen state={state} dispatch={dispatch} t={t} setTweak={setTweak} />}
            {state.screen === 'match'    && <MatchScreen state={state} dispatch={dispatch} t={t} />}
            {state.screen === 'gameover' && <GameOverScreen state={state} dispatch={dispatch} t={t} />}
            {state.trickPickerOpen && <TrickPickerSheet state={state} dispatch={dispatch} />}
          </div>
        </IOSDevice>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Game">
          <TweakSelect label="Loss word" value={t.word}
            options={['FLIP','TRAMP','HORSE','SKATE','BOUNCE']}
            onChange={(v) => setTweak('word', v)} />
          <TweakSlider label="Re-roll cap" value={t.rerollLimit}
            min={1} max={999} step={1}
            onChange={(v) => setTweak('rerollLimit', v)} />
        </TweakSection>
        <TweakSection label="Look">
          <TweakColor label="Penalty" value={t.accent}
            options={['#ff2a1f','#ff7a1f','#ec4899','#f43f5e','#a855f7']}
            onChange={(v) => setTweak('accent', v)} />
          <TweakColor label="Landed"  value={t.good}
            options={['#d4ff3a','#10b981','#22d3ee','#f6d738','#a3e635']}
            onChange={(v) => setTweak('good', v)} />
          <TweakToggle label="Grain texture" value={t.grain}
            onChange={(v) => setTweak('grain', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// ─── Home ───────────────────────────────────────────────────────────────
function HomeScreen({ state, dispatch, t }) {
  return (
    <div className="screen home" style={{ paddingTop: 56 }}>
      <div className="home-marks">
        <StampLabel rotate={-4} size={9}>ISSUE №{String(state.roundIdx).padStart(2,'0')}</StampLabel>
        <StampLabel rotate={3} size={9} color="var(--ink-mute)">FREESTYLE TRAMP / EST. 2026</StampLabel>
      </div>

      <div className="home-title">
        <div className="hero-line one">GAME</div>
        <div className="hero-of">
          <span className="of-rule" />
          <span className="of-word">OF</span>
          <span className="of-rule" />
        </div>
        <div className="hero-line two">FLIP</div>
        <div className="home-sub">
          A backyard scorekeeper for{' '}<span className="sub-em">tramp jams</span>.<br/>
          One phone. Pass it around. Spell {state.word.split('').join('·')} — take the L.
        </div>
      </div>

      <div className="home-cta">
        <ChunkyBtn variant="primary" size="xl" onClick={() => dispatch({ type: 'GOTO', screen: 'setup' })}>
          New Match →
        </ChunkyBtn>
      </div>

      <div className="home-foot">
        <div className="how-row">
          <GaffeTape rotate={-3}>HOW IT WORKS</GaffeTape>
        </div>
        <ol className="how-list">
          <li><span className="how-num">01</span><span>Roster up. Anyone with a tramp can play.</span></li>
          <li><span className="how-num">02</span><span>Phone calls a trick. Pass it. Stomp it.</span></li>
          <li><span className="how-num">03</span><span>Miss = a letter. Spell <em>{state.word}</em> = you’re out.</span></li>
        </ol>
        <div className="home-credits">
          <span>v 1.0 · 2-string</span>
          <span>·</span>
          <span>last one bouncing wins</span>
        </div>
      </div>
    </div>
  );
}

// ─── Setup ──────────────────────────────────────────────────────────────
function SetupScreen({ state, dispatch, t, setTweak }) {
  const [draft, setDraft] = React.useState('');
  const inputRef = React.useRef(null);
  const addPlayer = () => {
    if (!draft.trim()) return;
    dispatch({ type: 'ADD_PLAYER', name: draft });
    setDraft('');
    setTimeout(() => inputRef.current?.focus(), 10);
  };
  const canStart = state.players.length >= 2;

  return (
    <div className="screen setup">
      <div className="screen-header">
        <button className="back-btn" onClick={() => dispatch({ type: 'GOTO', screen: 'home' })} aria-label="Back">
          {Icon.back(18, 'var(--ink)')}
        </button>
        <div className="screen-head-stamp">
          <StampLabel rotate={-2} size={10}>NEW MATCH · SETUP</StampLabel>
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div className="setup-section">
        <div className="section-label">
          <span className="sl-num">01</span>
          <span className="sl-text">ROSTER</span>
          <span className="sl-meta">{state.players.length}/12</span>
        </div>

        <div className="player-grid">
          {state.players.map((p, i) => (
            <div key={p.id} className="player-chip">
              <span className="pc-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="pc-name">{p.name}</span>
              <button className="pc-x" onClick={() => dispatch({ type: 'REMOVE_PLAYER', id: p.id })} aria-label={`Remove ${p.name}`}>
                {Icon.x(12, 'var(--ink-mute)')}
              </button>
            </div>
          ))}
          {state.players.length < 12 && (
            <form className="player-input" onSubmit={(e) => { e.preventDefault(); addPlayer(); }}>
              <span className="pc-num">{String(state.players.length + 1).padStart(2, '0')}</span>
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a name…"
                maxLength={18}
              />
              <button type="submit" className="pc-add" disabled={!draft.trim()} aria-label="Add player">
                {Icon.plus(14, draft.trim() ? '#0c0b09' : 'var(--ink-mute)')}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="setup-section">
        <div className="section-label">
          <span className="sl-num">02</span>
          <span className="sl-text">MODE</span>
        </div>
        <div className="mode-grid">
          <ModeCard
            active={state.mode === 'classic'}
            onClick={() => dispatch({ type: 'SET_MODE', mode: 'classic' })}
            title="CLASSIC"
            tag="g.o.f."
            desc="One trick a round. Land it or take a letter."
          />
          <ModeCard
            active={state.mode === 'addon'}
            onClick={() => dispatch({ type: 'SET_MODE', mode: 'addon' })}
            title="ADD-ON"
            tag="combo"
            desc="The line grows. Every round you run it back, plus one."
          />
        </div>
      </div>

      <div className="setup-section">
        <div className="section-label">
          <span className="sl-num">03</span>
          <span className="sl-text">DIFFICULTY POOL</span>
          <span className="sl-meta">{filterTricks(state.tiers).length} tricks</span>
        </div>
        <div className="tier-grid">
          {ALL_TIERS.map((tier) => {
            const on = state.tiers.includes(tier);
            const c = TIER_COLORS[tier];
            return (
              <button key={tier}
                className={'tier-chip' + (on ? ' on' : '')}
                onClick={() => dispatch({ type: 'TOGGLE_TIER', tier })}
                style={{ '--tc': c.bg }}
              >
                <span className="tc-dot" />
                <span className="tc-label">{tier}</span>
                <span className="tc-count">{TRICKS.filter((x) => x.tier === tier).length}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="setup-cta">
        <ChunkyBtn
          variant={canStart ? 'success' : 'secondary'}
          size="xl"
          onClick={() => canStart && dispatch({ type: 'START_MATCH' })}
          disabled={!canStart}
          style={{ width: '100%' }}
        >
          {canStart ? 'Drop In ↓' : 'Add 2+ Players'}
        </ChunkyBtn>
        <div className="setup-foot-note">
          Word to spell: <strong>{state.word.split('').join('·')}</strong> · {state.word.length} miss{state.word.length > 1 ? 'es' : ''} eliminates
        </div>
      </div>
    </div>
  );
}

function ModeCard({ active, onClick, title, tag, desc }) {
  return (
    <button className={'mode-card' + (active ? ' on' : '')} onClick={onClick}>
      <div className="mc-tag">{tag}</div>
      <div className="mc-title">{title}</div>
      <div className="mc-desc">{desc}</div>
      {active && (
        <div className="mc-active-stamp">
          <StampLabel rotate={-6} size={8} color="var(--lime)" dashed={false}>SELECTED</StampLabel>
        </div>
      )}
    </button>
  );
}

Object.assign(window, { App, HomeScreen, SetupScreen, ModeCard, initialState, reducer, TWEAK_DEFAULTS, ALL_TIERS });
