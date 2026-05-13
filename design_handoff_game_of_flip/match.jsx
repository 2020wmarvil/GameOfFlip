// match.jsx — Match screen (Classic + Add-On) + GameOver + TrickPickerSheet
// FLOW: setter goes first. Setter MISS → round ends, only setter takes a letter,
// new trick rolled (add-on: combo does NOT grow). Setter LAND → others attempt.

// ─── Match Screen ───────────────────────────────────────────────────────
function MatchScreen({ state, dispatch, t }) {
  const setter = state.players[state.setterIdx];
  const setterResp = setter ? state.responses[setter.id] : null;
  const setterLanded = setterResp === 'landed';
  const setterMissed = setterResp === 'missed';
  const setterUnresolved = !setterResp;

  const alivePlayers = state.players.filter((p) => !p.eliminated);
  const others = alivePlayers.filter((p) => p.id !== setter?.id);
  const othersResponded = others.filter((p) => state.responses[p.id]).length;
  const allOthersResponded = othersResponded === others.length;

  const canReroll = state.rerollsThisRound < t.rerollLimit;

  // Footer state machine
  let footerLabel, footerVariant, footerEnabled;
  if (setterUnresolved) {
    footerLabel = 'Setter must go first';
    footerVariant = 'secondary';
    footerEnabled = false;
  } else if (setterMissed) {
    footerLabel = state.mode === 'addon' ? 'Set Failed · Roll Next' : 'Set Failed · Next';
    footerVariant = 'danger';
    footerEnabled = true;
  } else {
    // setter landed
    footerLabel = allOthersResponded
      ? (state.mode === 'addon' ? 'Lock In · Combo Grows ↓' : 'Lock In · Next ↓')
      : (othersResponded > 0 ? 'Skip Rest · Next' : 'Mark some scores');
    footerVariant = allOthersResponded ? 'success' : 'secondary';
    footerEnabled = othersResponded > 0 || others.length === 0 || allOthersResponded;
  }

  return (
    <div className="screen match">
      {/* HEADER */}
      <div className="match-head">
        <button className="back-btn" onClick={() => {
          if (confirm('End match and head home?')) dispatch({ type: 'HOME' });
        }} aria-label="Back">
          {Icon.back(18, 'var(--ink)')}
        </button>
        <div className="match-head-center">
          <div className="mh-mode">{state.mode === 'addon' ? 'ADD-ON' : 'CLASSIC'}</div>
          <div className="mh-round">RD · {String(state.roundIdx).padStart(2, '0')}</div>
        </div>
        <div className="mh-setter">
          <div className="mhs-tag">SETTER</div>
          <div className="mhs-name">{setter?.name ?? '—'}</div>
        </div>
      </div>

      {/* PLAYERS STRIP */}
      <div className="players-strip">
        {state.players.map((p) => (
          <PlayerPill key={p.id} player={p} word={state.word}
            isSetter={setter?.id === p.id} />
        ))}
      </div>

      {/* TRICK ZONE */}
      {state.mode === 'classic'
        ? <ClassicTrickZone state={state} dispatch={dispatch} t={t} canReroll={canReroll} />
        : <AddOnTrickZone  state={state} dispatch={dispatch} t={t} canReroll={canReroll} />}

      {/* RESULT ROWS — setter first, then others */}
      <div className="result-rows">
        <div className="rr-head">
          <span>
            {setterUnresolved ? 'SETTER UP FIRST' : setterMissed ? 'SET FAILED' : 'TAP AS THEY GO'}
          </span>
          {setterLanded && (
            <span className="rr-progress">{othersResponded}/{others.length}</span>
          )}
        </div>

        {/* Setter row — always interactive */}
        {setter && !setter.eliminated && (
          <ResultRow
            player={setter}
            word={state.word}
            response={state.responses[setter.id]}
            isSetter
            disabled={false}
            onLand={() => dispatch({ type: 'SET_RESULT', id: setter.id, result: 'landed' })}
            onMiss={() => dispatch({ type: 'SET_RESULT', id: setter.id, result: 'missed' })}
            onClear={() => dispatch({ type: 'CLEAR_RESULT', id: setter.id })}
          />
        )}

        {/* Set-failed banner (replaces other rows) */}
        {setterMissed && (
          <div className="set-failed">
            <BigStamp text="SET FAIL" size={20} rotate={-6} color="var(--red)"
              style={{ padding: '3px 10px', border: '2.5px solid var(--red)' }} />
            <div className="sf-copy">
              <div className="sf-line1">No penalty.</div>
              <div className="sf-line2">
                {state.mode === 'addon'
                  ? 'Combo doesn’t grow — fresh trick coming.'
                  : 'Others don’t attempt — new trick coming.'}
              </div>
            </div>
          </div>
        )}

        {/* Other-player rows — gated until setter lands */}
        {!setterMissed && others.map((p) => (
          <ResultRow key={p.id}
            player={p}
            word={state.word}
            response={state.responses[p.id]}
            disabled={setterUnresolved}
            onLand={() => dispatch({ type: 'SET_RESULT', id: p.id, result: 'landed' })}
            onMiss={() => dispatch({ type: 'SET_RESULT', id: p.id, result: 'missed' })}
            onClear={() => dispatch({ type: 'CLEAR_RESULT', id: p.id })}
          />
        ))}

        {/* Eliminated */}
        {state.players.filter((p) => p.eliminated).map((p) => (
          <div key={p.id} className="rr-out">
            <span className="rr-out-name">{p.name}</span>
            <BigStamp text="OUT" size={12} rotate={-8} color="var(--red)"
              style={{ padding: '2px 7px', border: '2px solid var(--red)' }} />
          </div>
        ))}
      </div>

      {/* NEXT BUTTON */}
      <div className="match-foot">
        <ChunkyBtn
          variant={footerVariant}
          size="lg"
          disabled={!footerEnabled}
          onClick={() => dispatch({ type: 'NEXT_ROUND' })}
          style={{ width: '100%' }}
        >
          {footerLabel}
        </ChunkyBtn>
      </div>
    </div>
  );
}

// ─── Player pill (compact, in the top strip) ───────────────────────────
function PlayerPill({ player, word, isSetter }) {
  return (
    <div className={'p-pill' + (player.eliminated ? ' out' : '') + (isSetter ? ' setter' : '')}>
      <div className="pp-name">{player.name}</div>
      <FlipLetters word={word} taken={player.letters} size={13} gap={2} />
      {isSetter && <span className="pp-setter-dot" title="Setter" />}
      {player.eliminated && <div className="pp-out-stamp">OUT</div>}
    </div>
  );
}

// ─── Classic trick zone ─────────────────────────────────────────────────
function ClassicTrickZone({ state, dispatch, t, canReroll }) {
  const trick = state.currentTrick;
  if (!trick) return null;
  return (
    <div className="trick-zone classic">
      <div className="tz-corner-tag">CALLED</div>

      <div className="tz-main">
        <div className="tz-tier-row">
          <TierBadge tier={trick.tier} full />
          <div className="tz-reroll-count">RE-ROLLS: {state.rerollsThisRound}</div>
        </div>
        <div className="tz-trick-name">{trick.name}</div>
        <div className="tz-actions">
          <button className="tz-reroll"
            onClick={() => canReroll && dispatch({ type: 'REROLL' })}
            disabled={!canReroll}>
            {Icon.reroll(16, 'currentColor')}<span>Re-roll</span>
          </button>
          <button className="tz-pick" onClick={() => dispatch({ type: 'OPEN_PICKER' })}>
            <span>Pick from book</span>
          </button>
        </div>
      </div>

      <div className="tz-halftone"><Halftone size={5} opacity={0.18} /></div>
    </div>
  );
}

// ─── Add-On trick zone ──────────────────────────────────────────────────
// Shows the established combo (already-set tricks) + the proposed trick this round.
function AddOnTrickZone({ state, dispatch, t, canReroll }) {
  const combo = state.combo;            // established (set) tricks
  const proposed = state.currentTrick;  // the candidate this round
  const listRef = React.useRef(null);
  React.useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [combo.length, proposed?.name]);

  const nextIdx = combo.length + 1;

  return (
    <div className="trick-zone addon">
      <div className="tz-corner-tag">THE LINE</div>

      <div className="combo-list" ref={listRef}>
        {combo.map((tr, i) => (
          <div key={i} className="combo-item">
            <span className="ci-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="ci-name">{tr.name}</span>
            <TierBadge tier={tr.tier} />
          </div>
        ))}
        {proposed && (
          <div className="combo-item proposed">
            <span className="ci-num">{String(nextIdx).padStart(2, '0')}</span>
            <span className="ci-name">{proposed.name}</span>
            <TierBadge tier={proposed.tier} />
            <span className="ci-prop">CALLED</span>
          </div>
        )}
        {combo.length === 0 && !proposed && (
          <div className="combo-empty">No line yet — first trick rolls in.</div>
        )}
      </div>

      <div className="addon-actions">
        <button className="tz-reroll small"
          onClick={() => canReroll && dispatch({ type: 'REROLL' })}
          disabled={!canReroll}>
          {Icon.reroll(14)}<span>Re-roll #{nextIdx}</span>
        </button>
        <button className="tz-pick small" onClick={() => dispatch({ type: 'OPEN_PICKER' })}>
          <span>Pick #{nextIdx}</span>
        </button>
        <span className="addon-reroll-count">
          {state.rerollsThisRound} re-roll{state.rerollsThisRound === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}

// ─── Result row — tap landed/missed for a player ────────────────────────
function ResultRow({ player, word = 'FLIP', response, onLand, onMiss, onClear, isSetter = false, disabled = false }) {
  return (
    <div className={
      'result-row r-' + (response ?? 'none')
      + (isSetter ? ' is-setter' : '')
      + (disabled ? ' is-disabled' : '')
    }>
      <div className="rr-player">
        <span className="rr-name">
          {player.name}
          {isSetter && <span className="rr-setter-tag">SETTER</span>}
        </span>
        <span className="rr-letters"><FlipLetters word={word} taken={player.letters} size={11} gap={2} /></span>
      </div>
      <div className="rr-actions">
        <button
          className={'rr-btn miss' + (response === 'missed' ? ' on' : '')}
          disabled={disabled}
          onClick={() => disabled ? null : (response === 'missed' ? onClear() : onMiss())}
        >
          {Icon.x(14, 'currentColor')}<span>MISS</span>
        </button>
        <button
          className={'rr-btn land' + (response === 'landed' ? ' on' : '')}
          disabled={disabled}
          onClick={() => disabled ? null : (response === 'landed' ? onClear() : onLand())}
        >
          {Icon.check(14, 'currentColor')}<span>LAND</span>
        </button>
      </div>
    </div>
  );
}

// ─── Game Over ──────────────────────────────────────────────────────────
function GameOverScreen({ state, dispatch, t }) {
  const losers = state.players
    .filter((p) => p.eliminated)
    .sort((a, b) => (b.elimRound ?? 0) - (a.elimRound ?? 0));
  const lastOut = losers[0];

  return (
    <div className="screen gameover">
      <div className="go-top">
        <StampLabel rotate={-4} size={10}>FINAL · GAME OVER</StampLabel>
      </div>

      <div className="go-headline">
        <div className="go-spelled">
          {state.word.split('').map((L, i) => (
            <span key={i} className="go-letter">{L}</span>
          ))}
        </div>
      </div>

      <div className="winner-card">
        <div className="wc-stamp">
          <StampLabel rotate={-6} size={9} color="var(--lime)" dashed={false}>WINNER</StampLabel>
        </div>
        <div className="wc-crown">{Icon.crown(28, '#f6d738')}</div>
        <div className="wc-name">{state.winner?.name ?? '—'}</div>
        <div className="wc-meta">
          last one bouncing · {state.history.length} round{state.history.length === 1 ? '' : 's'} · {state.mode === 'addon' ? 'add-on' : 'classic'}
        </div>
      </div>

      <div className="go-standings">
        <div className="gos-head">FINAL STANDINGS</div>
        <div className="gos-list">
          {state.winner && (
            <div className="gos-row crowned">
              <span className="gos-place">01</span>
              <span className="gos-name">{state.winner.name}</span>
              <span className="gos-result">survived</span>
            </div>
          )}
          {losers.map((p, i) => (
            <div key={p.id} className="gos-row">
              <span className="gos-place">{String(i + 2).padStart(2, '0')}</span>
              <span className="gos-name">{p.name}</span>
              <span className="gos-result">out rd {p.elimRound}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="go-cta">
        <ChunkyBtn variant="primary" size="lg" onClick={() => dispatch({ type: 'REMATCH' })} style={{ width: '100%' }}>
          Run It Back
        </ChunkyBtn>
        <ChunkyBtn variant="ghost" size="md" onClick={() => dispatch({ type: 'HOME' })} style={{ width: '100%' }}>
          Back to Home
        </ChunkyBtn>
      </div>
    </div>
  );
}

// ─── Trick Picker Sheet ─────────────────────────────────────────────────
function TrickPickerSheet({ state, dispatch }) {
  const pool = filterTricks(state.tiers);
  const [search, setSearch] = React.useState('');
  const filtered = pool.filter((tr) => tr.name.toLowerCase().includes(search.toLowerCase()));
  const setter = state.players[state.setterIdx];

  return (
    <div className="picker-backdrop" onClick={() => dispatch({ type: 'CLOSE_PICKER' })}>
      <div className="picker-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ps-head">
          <StampLabel rotate={-2} size={10}>{setter?.name?.toUpperCase() ?? 'SETTER'} · PICK A TRICK</StampLabel>
          <button className="ps-x" onClick={() => dispatch({ type: 'CLOSE_PICKER' })} aria-label="Close">
            {Icon.x(14, 'var(--ink)')}
          </button>
        </div>
        <input className="ps-search" placeholder="Search the book…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="ps-list">
          {filtered.map((tr, i) => (
            <button key={i} className="ps-item" onClick={() => dispatch({ type: 'PICK_TRICK', trick: tr })}>
              <span className="psi-name">{tr.name}</span>
              <TierBadge tier={tr.tier} />
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="ps-empty">No tricks match “{search}”.</div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  MatchScreen, ClassicTrickZone, AddOnTrickZone, ResultRow,
  PlayerPill, GameOverScreen, TrickPickerSheet,
});
