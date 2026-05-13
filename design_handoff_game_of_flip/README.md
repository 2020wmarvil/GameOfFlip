# Handoff: Game of Flip

> A digital scorekeeper for **freestyle trampoline** Game of Flip matches.
> One phone, multiple players, pass-and-play.

---

## Overview

**Game of Flip** is a mobile-first scorekeeper for freestyle trampoline G.O.F. matches — the trampoline cousin of S.K.A.T.E. or H.O.R.S.E. Each round the app calls a trick from a curated library; players take turns attempting it on the trampoline and tap their result. Miss enough tricks and you spell the loss word (default: **FLIP**) — last one bouncing wins.

Two modes:
- **Classic** — one trick per round, single attempt
- **Add-On** — combo grows each round; players must run the entire established line plus a new trick

The target platform is **React Native** (per the original brief — "I like React Native so I can be agnostic"). Designs are framework-agnostic and translate cleanly to any mobile framework.

---

## About the Design Files

The files in this bundle (`index.html`, `*.jsx`, `*.js`) are **design references created as an HTML/React prototype**. They are NOT production code to ship.

**Your task:** Recreate these designs in the target codebase's environment. For this project that's expected to be **React Native** — translate the HTML/CSS into RN's `View`/`Text`/`Pressable` primitives with `StyleSheet`, use a navigation library (React Navigation), and pull in real type/iconography. Keep the visual language, layout, copy, and interaction logic; replace the web idioms (CSS classes, `<button>`, `onClick`) with the corresponding RN equivalents.

If you are starting fresh with no codebase, React Native + Expo is the recommended setup.

The state-management logic in `app.jsx` (the reducer) is portable as-is — copy it directly into the RN app and the entire game flow works.

---

## Fidelity

**High-fidelity.** Exact colors, type scale, spacing, and interaction states are specified. Recreate pixel-perfectly within the target framework's idioms.

---

## Visual System

### Aesthetic direction
**Gritty backyard zine / skate fanzine.** Photocopied feel, bold condensed display type, monospace UI, hot accent colors against a warm near-black background. Slight rotations on chips and stamps to break the grid. Chunky offset shadows on primary buttons (1980s zine cut-and-paste).

### Color tokens

| Token | Hex | Usage |
|---|---|---|
| `--paper`    | `#0c0b09` | Base background (warm near-black) |
| `--paper-2`  | `#16140f` | Card surface |
| `--paper-3`  | `#1f1c17` | Hovered / active card surface |
| `--ink`      | `#f4ede0` | Primary foreground (warm bone) |
| `--ink-mute` | `#8a8378` | Secondary foreground, labels |
| `--rule`     | `rgba(244,237,224,0.18)` | Border / divider |
| `--rule-2`   | `rgba(244,237,224,0.10)` | Subtler divider |
| `--red`      | `#ff2a1f` | Penalty / miss / classic-mode accent |
| `--lime`     | `#d4ff3a` | Landed / setter / add-on-mode accent |
| `--yellow`   | `#f6d738` | Gaffer-tape highlight, winner crown |

**Tier badge colors:**
- Beginner: `#7dd3fc` (sky)
- Intermediate: `#d4ff3a` (lime)
- Advanced: `#fb923c` (orange)
- Pro: `#ff2a1f` (red, with `#f4ede0` text)

### Typography

- **Display / headers** — `Anton` (Google Fonts, weight 400). Condensed brutal sans for trick names, screen titles, big numbers. Use 0.02–0.06em letter-spacing.
- **UI / body / labels** — `Space Mono` (Google Fonts, weights 400 + 700). Used for everything else, including buttons, chips, and small labels. Letter-spacing 0.14–0.22em for caps-locked micro-labels.

**Type scale (CSS px → recommended RN sp):**
- Hero (home title): 120
- Big trick name: 44
- Game-over letters: 78
- Player name (winner): 40
- Mode/section big: 18–30
- Body / button: 13–14
- Caps labels: 9–11

### Spacing

- Screen padding (sides): **16px**
- Top padding under iOS status bar: **56–70px**
- Card padding: **10–18px**
- Gaps between rows: **5–10px**
- Gaps between sections: **18–22px**

### Borders, shadows, radii

- Borders: **1.5px solid** for cards, **2px solid** for primary surfaces (trick zone, winner card)
- Dashed borders: **1.5px dashed** for pending/inactive surfaces (player input, eliminated row)
- **No border radii** — everything is square-cornered. Part of the zine aesthetic.
- **Offset shadows** (chunky buttons + emphasis cards): solid color shifted X & Y, no blur:
  - Buttons: `5px 5px 0 <shadow>` at rest, snaps to `0 0 0 <shadow>` + `transform: translate(5px,5px)` on press
  - Setter row: `3px 3px 0 var(--lime)`
  - Trick zone: `5px 5px 0 var(--red)` (classic) or `5px 5px 0 var(--lime)` (add-on)

### Texture overlays
- **Halftone dots** on the trick zone: radial-gradient dot pattern, ~6px tile, opacity 0.18
- **Film grain**: SVG turbulence filter, mix-blend-mode overlay, opacity ~0.09. Optional via tweak.

---

## Screens / Views

### 1. Home
**Purpose:** Entry screen. Surfaces the brand, explains the game, jumps into setup.

**Layout (top to bottom):**
- Header stamps row: two `StampLabel`s (dashed, rotated). Left: "ISSUE №01"; right: "FREESTYLE TRAMP / EST. 2026".
- Hero title block:
  - Line 1: "GAME" — Anton 120px, rotated -1°, solid bone.
  - "OF" rule: 2px-tall bone lines flanking the word "OF" in red (Anton 22px).
  - Line 2: "FLIP" — Anton 120px, rotated +1°, **outlined** (transparent fill, 2px bone stroke via `-webkit-text-stroke`).
- Sub-tagline: 12px Space Mono, muted. "A backyard scorekeeper for tramp jams. One phone. Pass it around. Spell F·L·I·P — take the L."
- Primary CTA: `ChunkyBtn` variant=primary, size=xl, label "New Match →"
- Dashed-rule divider
- "HOW IT WORKS" gaffer tape label
- Numbered how-to list (01, 02, 03) — Anton number in lime, Space Mono explainer.
- Footer credits line: "v 1.0 · 2-string · last one bouncing wins"

### 2. Setup
**Purpose:** Configure a new match (roster, mode, difficulty pool) and start.

**Layout:**
- Top bar: back button (square chip, paper-2 bg) + centered StampLabel "NEW MATCH · SETUP"
- **Section 01 — ROSTER** (`{n}/12`)
  - Vertical list of `.player-chip` rows: two-digit Anton number, name (Space Mono bold), small ✕ to remove.
  - Alternate rows tilted by ±0.15° rotation for that photocopied feel.
  - Final row is `.player-input` — dashed border, inline text field, lime "+" button.
- **Section 02 — MODE**
  - 2-up grid of `.mode-card`s. CLASSIC and ADD-ON.
  - Each card has: small caps tag ("g.o.f." or "combo"), Anton 30px title, 10.5px description.
  - Selected card gets: lime offset shadow, paper-3 bg, ink border, "SELECTED" stamp top-right.
- **Section 03 — DIFFICULTY POOL** (`{count} tricks`)
  - 2-up grid of `.tier-chip`s. Multi-select toggle. Beg, Int, Adv, Pro.
  - Each chip: 10px square colored dot + tier name + tier count (right).
  - Off state: muted; On state: ink color + tier-colored border + paper-3 bg.
- **CTA**: full-width ChunkyBtn variant=success. Label "Drop In ↓" if ≥2 players, else "Add 2+ Players" (disabled).
- Footer note: "Word to spell: F·L·I·P · 4 misses eliminates"

### 3. Match
**Purpose:** Score in-progress match. Setter goes first; gates other players.

**Layout:**
- **Match header**
  - Left: back button (confirms before exiting)
  - Center: mode pill ("CLASSIC" or "ADD-ON") in Anton 22px + "RD · {nn}" round counter in caps
  - Right: vertical divider + "SETTER" label + setter name in Anton 16px lime
- **Players strip** — horizontally scrollable row of `.p-pill`s
  - Each pill: player name (11px bold) + FlipLetters progress
  - Setter pill: lime border, paper-3 bg, lime dot top-right corner
  - Eliminated: 0.4 opacity, rotated "OUT" stamp overlay
- **Trick zone** (mode-specific):
  - **Classic** (`.trick-zone.classic`):
    - 2px ink border + red offset shadow
    - Black "CALLED" corner tag (top-left)
    - Halftone dot overlay (opacity 0.18)
    - Tier badge + "RE-ROLLS: {n}" line
    - Trick name in Anton 44px (text-wrap: balance)
    - Actions row: `[Re-roll]` outlined button + `[Pick from book]` outlined button
  - **Add-On** (`.trick-zone.addon`):
    - 2px ink border + **lime** offset shadow
    - "THE LINE" corner tag
    - Scrollable `.combo-list`:
      - Established items: paper bg, ink border, two-digit num + name + tier badge
      - **Proposed** (current candidate) item: paper-3 bg, lime border, lime offset shadow, "CALLED" chip on the right
    - Actions row: `Re-roll #{idx}` + `Pick #{idx}` + reroll count
- **Result rows section**
  - Header label changes by state: "SETTER UP FIRST" / "TAP AS THEY GO" / "SET FAILED"
  - **Setter row** — always interactive, has lime "SETTER" tag inline next to name, lime offset shadow
    - On miss: shadow flips to red, bg tints red
    - On land: bg tints lime
  - **Set-failed banner** (replaces other rows when setter missed):
    - 2px red dashed border, red 8% bg tint
    - Big rotated "SET FAIL" stamp on the left
    - Copy: "No penalty." / "Combo doesn't grow — fresh trick coming." (or "Others don't attempt — new trick coming." for classic)
  - **Other player rows** — gated. Opacity 0.4 + disabled buttons until setter lands. Each row has name + FlipLetters + MISS/LAND buttons.
  - **Eliminated rows** — dashed border, 0.55 opacity, strikethrough name + "OUT" stamp
- **Footer**: full-width ChunkyBtn whose label/variant depends on state machine (see Interactions below)

### 4. Game Over
**Purpose:** Declare winner, show standings, offer rematch.

**Layout:**
- Top stamp: "FINAL · GAME OVER" (rotated)
- **Spelled loss word** (centered): each letter in Anton 78px red, alternating ±3° rotation. (Just the letters — no loser name underneath.)
- **Winner card**:
  - paper-2 bg, 2px ink border, 5px 5px 0 lime offset shadow
  - Top-left lime "WINNER" stamp
  - Yellow crown icon
  - Winner name in Anton 40px
  - Meta: "last one bouncing · N rounds · classic|add-on"
- **Final Standings** list — numbered rows, lime border on winner row.
- CTAs: "Run It Back" primary + "Back to Home" ghost.

### 5. Trick Picker Sheet (modal)
**Purpose:** Setter manually picks a trick from the library. Triggered by "Pick from book" in either mode.

**Layout:**
- Bottom sheet (slide-up), full-width, 80% height max, anchored to bottom.
- 2px ink top border + red offset shadow above.
- Header: rotated stamp showing setter name + "PICK A TRICK", close (✕) button.
- Search input (filters by name substring).
- Scrollable list of `.ps-item`s — name + tier badge.

---

## Interactions & Behavior

### Match round flow (state machine)

Setter is the highlighted player for the round. Setter rotates each round among alive (not-eliminated) players.

1. **Round opens** → trick is rolled (random from filtered tier pool). Setter row is enabled. Other rows are gated (disabled, 0.4 opacity).
2. **Setter taps MISS** →
   - Set-failed banner appears (replaces other rows)
   - Footer becomes red `Set Failed · Roll Next` (or `Set Failed · Next` in classic)
   - On tap: **no letters applied**, new trick rolls, setter rotates, combo unchanged (add-on)
3. **Setter taps LAND** →
   - Other rows become enabled
   - Footer reads "Mark some scores" (secondary, disabled) until at least one other has been marked
   - As others respond: "Skip Rest · Next" (secondary, enabled) appears
   - When all others responded: "Lock In · Next ↓" (success/lime) in classic, or "Lock In · Combo Grows ↓" in add-on
4. **Footer tapped after setter land** →
   - Each "missed" non-setter player gains a letter
   - If their letter count ≥ word length → eliminated, `elimRound` recorded
   - Add-on: current trick is **appended to the established combo**
   - New trick rolled, setter rotates to next alive player
   - If only one (or zero) players remain alive → transition to Game Over

### Re-roll
- Always available up to `rerollLimit` (default ∞ per tweak)
- Replaces only the candidate trick — established combo (add-on) is untouched
- Clears any responses given this round
- Increments `rerollsThisRound`

### Pick from book
- Opens the modal sheet (now in both modes)
- Filters by current tier pool
- Tapping an item sets it as the current trick (same effect as a re-roll but deterministic)

### Press states
- ChunkyBtn: `translate(offset, offset)` + shadow snapped to `0 0 0 <shadow>` on `pointerdown`, restored on `pointerup` / `pointerleave`
- Tier chips, mode cards: opacity/bg shift on toggle
- Player input: lime "+" button is disabled when input is empty

### Animations
- No prescribed motion. Keep snappy.
- Add-on combo list auto-scrolls to bottom when a new item is appended or the proposed trick changes.

---

## State Management

The reducer in `app.jsx` is the source of truth. Port it directly to RN.

### State shape

```ts
type Tier = 'beginner' | 'intermediate' | 'advanced' | 'pro';
type Trick = { name: string; tier: Tier };

type Player = {
  id: string;
  name: string;
  letters: number;        // 0..word.length
  eliminated: boolean;
  elimRound: number | null;
};

type State = {
  screen: 'home' | 'setup' | 'match' | 'gameover';
  mode: 'classic' | 'addon';
  tiers: Tier[];             // selected pool
  word: string;              // default 'FLIP'
  players: Player[];
  currentTrick: Trick | null;
  combo: Trick[];            // ESTABLISHED tricks only (add-on)
  roundIdx: number;          // 1-indexed
  setterIdx: number;         // index into players[]
  responses: Record<string, 'landed' | 'missed'>; // playerId → result
  rerollsThisRound: number;
  winner: Player | null;
  history: Array<{
    round: number;
    mode: 'classic' | 'addon';
    trick: Trick[];          // [currentTrick] for classic, full combo for add-on
    setFailed: boolean;
    setterId: string;
    results: Array<{ id: string; name: string; result: 'landed' | 'missed' | 'skip' }>;
  }>;
  trickPickerOpen: boolean;
};
```

### Action types (all in the reducer)
`GOTO`, `ADD_PLAYER`, `REMOVE_PLAYER`, `RENAME_PLAYER`, `SET_MODE`, `TOGGLE_TIER`, `SET_WORD`, `START_MATCH`, `REROLL`, `PICK_TRICK`, `OPEN_PICKER`, `CLOSE_PICKER`, `SET_RESULT`, `CLEAR_RESULT`, `NEXT_ROUND`, `REMATCH`, `HOME`

### Key invariants
- `tiers` is never empty (toggling off the last one is a no-op)
- `combo` only grows on a successful set (setter landed) in add-on mode
- A failed set applies NO penalties — it is a pure no-op except for rolling a new trick + rotating setter
- Re-roll preserves `combo`; only `currentTrick` is replaced
- `setterIdx` rotates only through alive players

### Persistence
The prototype is in-memory only. For the real app:
- Persist match-in-progress to local storage / AsyncStorage so the app survives a backgrounding/refresh.
- Optional: persist per-player stats (matches played, wins, etc.) across matches.

---

## Tweakable Settings (production: settings screen)

These are exposed as tweaks in the prototype but should become real settings in the app:

- **Loss word** — default `FLIP`. Options shown: `FLIP`, `TRAMP`, `HORSE`, `SKATE`, `BOUNCE`. Any string of 3–8 caps letters should work.
- **Re-roll cap per round** — int, default ∞ (use a high number or boolean toggle in real UI).
- **Penalty color** — swatch picker. Default `#ff2a1f`.
- **Landed color** — swatch picker. Default `#d4ff3a`.
- **Grain texture** — boolean toggle. Default on.

---

## Trick Library

See `trick-library.js` for the canonical 48-trick list. Distribution:
- **Beginner** (12): Seat Drop, Hands & Knees, Back Drop, Front Drop, Swivel Hips, Roller, Half Twist, Tuck Jump, Pike Jump, Straddle Jump, Front Tuck, Back Tuck
- **Intermediate** (12): Back Pike, Front Pike, Barani, Back Full, Back Layout, Front Layout, Crash Dive, Cody, Ball-Out, Lazy Back, Porpoise, Back Pullover
- **Advanced** (12): Rudy, Randy, Adolph, Double Back Tuck, Double Back Pike, Double Front Tuck, Double Full, Triple Twist, Half-In Half-Out, Full-In Back-Out, Back-In Full-Out, Miller
- **Pro** (12): Triffis, Triple Back Tuck, Killer, Miller Plus, Full-In Full-Out, Full-In Rudy-Out, Rudy-Out, Half-In Triff-Out, Quad Twist, Double-Full Full-Out, Randolph, Triple-Twisting Double

**Future:** the user requested "Default library + let players add custom tricks." Add a custom-trick management surface (and persistence).

---

## Assets

- **Fonts**: Anton, Space Mono — both Google Fonts, free for commercial use.
  ```
  https://fonts.googleapis.com/css2?family=Anton&family=Space+Mono:wght@400;700&display=swap
  ```
  For React Native: install via `expo-font` / `@expo-google-fonts/anton` and `@expo-google-fonts/space-mono`.
- **Icons**: All UI icons are hand-rolled inline SVGs in `chrome.jsx` (object `Icon`): `reroll`, `check`, `x`, `plus`, `trash`, `back`, `crown`. Stroke-width 2.2–3.2, no fills, rounded caps/joins. In RN, port to `react-native-svg` components or use a Lucide / Phosphor equivalent.
- **No imagery** — the design is purely typographic + geometric. No photos, no illustrations.

---

## Files in this Handoff

| File | What it is |
|---|---|
| `index.html` | The shell — loads fonts, defines all CSS, mounts the React app |
| `app.jsx` | Top-level App component + reducer (state machine) + Home screen + Setup screen |
| `match.jsx` | Match screen, Game Over screen, Trick Picker sheet, helper sub-components |
| `chrome.jsx` | Visual primitives — `ChunkyBtn`, `StampLabel`, `FlipLetters`, `GaffeTape`, `Halftone`, `GrainLayer`, `TierBadge`, `BigStamp`, `Icon.*` |
| `trick-library.js` | The trick data + `filterTricks` / `randomTrick` helpers |
| `ios-frame.jsx` | iOS device-frame chrome used only for the prototype preview — discard in production |
| `tweaks-panel.jsx` | Prototype-only tweaks panel infra — discard in production |

To inspect, open `index.html` in a browser. The state machine logic in `app.jsx`'s reducer and the screen structure in the JSX are what should drive the RN implementation.

---

## Recommended Implementation Order (RN)

1. Scaffold Expo project + install fonts (Anton, Space Mono) + React Navigation (Stack).
2. Port `trick-library.js` as-is to `src/data/tricks.ts`.
3. Port the reducer + state types to `src/store/match.ts` (use `useReducer` or Zustand).
4. Build shared primitives in `src/ui/` — `ChunkyBtn`, `StampLabel`, `FlipLetters`, `TierBadge`, the SVG icon set.
5. Build screens in the order Home → Setup → Match → GameOver → TrickPickerModal.
6. Wire up persistence (AsyncStorage) for in-progress matches.
7. (Optional) Add haptics on MISS/LAND/Lock-In via `expo-haptics`.
8. (Optional) Add custom-trick management.

Good bouncing. 🤸
