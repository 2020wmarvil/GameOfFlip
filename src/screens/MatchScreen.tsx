import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Mode, Player, Result } from '../store/match';
import { useMatch, useSport } from '../store/MatchContext';
import { colors, fonts } from '../theme/tokens';
import { BigStamp } from '../ui/BigStamp';
import { ChunkyBtn, type ChunkyVariant } from '../ui/ChunkyBtn';
import { FlipLetters } from '../ui/FlipLetters';
import { Halftone } from '../ui/Halftone';
import { BackIcon, CheckIcon, GearIcon, ReRollIcon, XIcon } from '../ui/Icon';
import { TierBadge } from '../ui/TierBadge';
import { MatchSettings } from './MatchSettings';

export function MatchScreen() {
  const { state, dispatch } = useMatch();
  const sport = useSport();
  const word = sport.word;
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ─── Derived state ────────────────────────────────────────────────────
  const setter = state.players[state.setterIdx];
  const setterResp: Result | undefined = setter ? state.responses[setter.id] : undefined;
  const setterLanded = setterResp === 'landed';
  const setterMissed = setterResp === 'missed';
  const setterUnresolved = !setterResp;

  const alive = state.players.filter((p) => !p.eliminated);
  const others = alive.filter((p) => p.id !== setter?.id);
  const eliminated = state.players.filter((p) => p.eliminated);
  const othersResponded = others.filter((p) => state.responses[p.id]).length;
  const allOthersResponded = others.length > 0 && othersResponded === others.length;

  // Footer state machine
  const footer = useMemo<{ label: string; variant: ChunkyVariant; enabled: boolean }>(() => {
    if (setterUnresolved) {
      return { label: 'Setter must go first', variant: 'secondary', enabled: false };
    }
    if (setterMissed) {
      return {
        label: state.mode === 'addon' ? 'Set Failed · Roll Next' : 'Set Failed · Next',
        variant: 'danger',
        enabled: true,
      };
    }
    // setter landed
    if (allOthersResponded || others.length === 0) {
      return {
        label: state.mode === 'addon' ? 'Lock In · Combo Grows ↓' : 'Lock In · Next ↓',
        variant: 'success',
        enabled: true,
      };
    }
    if (othersResponded > 0) {
      return { label: 'Skip Rest · Next', variant: 'secondary', enabled: true };
    }
    return { label: 'Mark some scores', variant: 'secondary', enabled: false };
  }, [setterUnresolved, setterMissed, allOthersResponded, othersResponded, others.length, state.mode]);

  const confirmExit = () => {
    Alert.alert('End match?', 'Your progress will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End match',
        style: 'destructive',
        onPress: () => dispatch({ type: 'EXIT_TO_SETUP' }),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* ─── HEADER ─── */}
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={confirmExit} hitSlop={8}>
          <BackIcon size={18} color={colors.ink} />
        </Pressable>
        <Pressable
          style={styles.gear}
          onPress={() => setSettingsOpen(true)}
          hitSlop={8}
        >
          <GearIcon size={18} color={colors.ink} />
        </Pressable>
        <View style={styles.headCenter}>
          <Text style={styles.hcMode}>{state.mode === 'addon' ? 'ADD-ON' : 'CLASSIC'}</Text>
          <Text style={styles.hcRound}>RD · {String(state.roundIdx).padStart(2, '0')}</Text>
        </View>
        <View style={styles.headSetter}>
          <Text style={styles.hsTag}>SETTER</Text>
          <Text style={styles.hsName} numberOfLines={1}>
            {setter?.name ?? '—'}
          </Text>
        </View>
      </View>

      <MatchSettings visible={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── PLAYERS STRIP ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.playersStrip}
        >
          {state.players.map((p) => (
            <PlayerPill
              key={p.id}
              player={p}
              word={word}
              isSetter={setter?.id === p.id}
            />
          ))}
        </ScrollView>

        {/* ─── TRICK ZONE ─── */}
        {state.mode === 'classic' ? (
          <ClassicTrickZone />
        ) : (
          <AddOnTrickZone />
        )}

        {/* ─── RESULT ROWS ─── */}
        <View style={styles.rrSection}>
          <View style={styles.rrHead}>
            <Text style={styles.rrHeadText}>
              {setterUnresolved
                ? 'SETTER UP FIRST'
                : setterMissed
                ? 'SET FAILED'
                : 'TAP AS THEY GO'}
            </Text>
            {setterLanded && others.length > 0 && (
              <Text style={styles.rrProgress}>
                {othersResponded}/{others.length}
              </Text>
            )}
          </View>

          {/* Setter row */}
          {setter && !setter.eliminated && (
            <ResultRow
              player={setter}
              word={word}
              response={state.responses[setter.id]}
              isSetter
              disabled={false}
              onLand={() => dispatch({ type: 'SET_RESULT', id: setter.id, result: 'landed' })}
              onMiss={() => dispatch({ type: 'SET_RESULT', id: setter.id, result: 'missed' })}
              onClear={() => dispatch({ type: 'CLEAR_RESULT', id: setter.id })}
            />
          )}

          {/* Set-failed banner replaces other rows */}
          {setterMissed && <SetFailedBanner mode={state.mode} />}

          {/* Other-player rows (only when setter hasn't missed) */}
          {!setterMissed &&
            others.map((p) => (
              <ResultRow
                key={p.id}
                player={p}
                word={word}
                response={state.responses[p.id]}
                disabled={setterUnresolved}
                onLand={() => dispatch({ type: 'SET_RESULT', id: p.id, result: 'landed' })}
                onMiss={() => dispatch({ type: 'SET_RESULT', id: p.id, result: 'missed' })}
                onClear={() => dispatch({ type: 'CLEAR_RESULT', id: p.id })}
              />
            ))}

          {/* Eliminated */}
          {eliminated.map((p) => (
            <EliminatedRow key={p.id} player={p} />
          ))}
        </View>

        {/* ─── FOOTER CTA ─── */}
        <View style={styles.footCta}>
          <ChunkyBtn
            variant={footer.variant}
            size="lg"
            fullWidth
            disabled={!footer.enabled}
            onPress={() => dispatch({ type: 'NEXT_ROUND' })}
          >
            {footer.label}
          </ChunkyBtn>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PlayerPill — compact card in the horizontal strip
// ═══════════════════════════════════════════════════════════════════════

function PlayerPill({
  player,
  word,
  isSetter,
}: {
  player: Player;
  word: string;
  isSetter: boolean;
}) {
  return (
    <View
      style={[
        styles.pPill,
        isSetter && styles.pPillSetter,
        player.eliminated && styles.pPillOut,
      ]}
    >
      <Text style={styles.ppName} numberOfLines={1}>
        {player.name}
      </Text>
      <FlipLetters word={word} taken={player.letters} size={13} gap={2} />
      {isSetter && <View style={styles.ppSetterDot} />}
      {player.eliminated && (
        <View style={styles.ppOutStamp} pointerEvents="none">
          <Text style={styles.ppOutText}>OUT</Text>
        </View>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Classic trick zone
// ═══════════════════════════════════════════════════════════════════════

function ClassicTrickZone() {
  const { state, dispatch } = useMatch();
  const sport = useSport();
  const trick = state.currentTrick;
  if (!trick) return null;
  return (
    <View style={styles.tzWrap}>
      {/* offset accent shadow plate (Classic = brand chrome) */}
      <View pointerEvents="none" style={[styles.tzShadow, { backgroundColor: sport.accent }]} />
      <View style={styles.tzInner}>
        <Halftone size={5} opacity={0.18} />
        <View style={styles.tzCorner}>
          <Text style={styles.tzCornerText}>CALLED</Text>
        </View>
        <View style={styles.tzMain}>
          <View style={styles.tzTierRow}>
            <TierBadge tier={trick.tier} full />
            <Text style={styles.tzRerollCount}>
              RE-ROLLS: {state.rerollsThisRound}
            </Text>
          </View>
          <Text style={styles.tzTrickName} numberOfLines={2}>
            {trick.name}
          </Text>
          <View style={styles.tzActions}>
            <OutlineBtn
              icon={<ReRollIcon size={14} color={colors.ink} />}
              label="Re-roll"
              onPress={() => dispatch({ type: 'REROLL' })}
            />
            <OutlineBtn
              label="Pick from book"
              onPress={() => dispatch({ type: 'OPEN_PICKER' })}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Add-On trick zone — established combo + proposed (current) trick
// ═══════════════════════════════════════════════════════════════════════

function AddOnTrickZone() {
  const { state, dispatch } = useMatch();
  const combo = state.combo;
  const proposed = state.currentTrick;
  const nextIdx = combo.length + 1;
  const listRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll combo list to the latest entry when it grows or proposed changes
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, [combo.length, proposed?.name]);

  return (
    <View style={styles.tzWrap}>
      <View pointerEvents="none" style={[styles.tzShadow, { backgroundColor: colors.lime }]} />
      <View style={styles.tzInner}>
        <View style={styles.tzCorner}>
          <Text style={styles.tzCornerText}>THE LINE</Text>
        </View>

        <ScrollView
          ref={listRef}
          style={styles.comboList}
          contentContainerStyle={{ gap: 4 }}
          showsVerticalScrollIndicator={false}
        >
          {combo.map((tr, i) => (
            <View key={i} style={styles.comboItem}>
              <Text style={styles.ciNum}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={styles.ciName} numberOfLines={1}>
                {tr.name}
              </Text>
              <TierBadge tier={tr.tier} />
            </View>
          ))}
          {proposed && (
            <View style={[styles.comboItem, styles.comboItemProposed]}>
              <Text style={[styles.ciNum, { color: colors.lime }]}>
                {String(nextIdx).padStart(2, '0')}
              </Text>
              <Text style={styles.ciName} numberOfLines={1}>
                {proposed.name}
              </Text>
              <TierBadge tier={proposed.tier} />
              <View style={styles.ciProp}>
                <Text style={styles.ciPropText}>CALLED</Text>
              </View>
            </View>
          )}
          {combo.length === 0 && !proposed && (
            <View style={styles.comboEmpty}>
              <Text style={styles.comboEmptyText}>
                No line yet — first trick rolls in.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.addonActions}>
          <OutlineBtn
            small
            icon={<ReRollIcon size={12} color={colors.ink} />}
            label={`Re-roll #${nextIdx}`}
            onPress={() => dispatch({ type: 'REROLL' })}
          />
          <OutlineBtn
            small
            label={`Pick #${nextIdx}`}
            onPress={() => dispatch({ type: 'OPEN_PICKER' })}
          />
          <Text style={styles.addonRerollCount}>
            {state.rerollsThisRound} re-roll{state.rerollsThisRound === 1 ? '' : 's'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// OutlineBtn — outlined caps button used in trick zone actions
// ═══════════════════════════════════════════════════════════════════════

function OutlineBtn({
  icon,
  label,
  onPress,
  disabled,
  small,
}: {
  icon?: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[
        styles.outlineBtn,
        small && styles.outlineBtnSmall,
        disabled && { opacity: 0.4 },
      ]}
    >
      {icon}
      <Text style={[styles.outlineBtnText, small && { fontSize: 10 }]}>{label}</Text>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ResultRow — per-player scoring row
// ═══════════════════════════════════════════════════════════════════════

function ResultRow({
  player,
  word,
  response,
  isSetter = false,
  disabled = false,
  onLand,
  onMiss,
  onClear,
}: {
  player: Player;
  word: string;
  response: Result | undefined;
  isSetter?: boolean;
  disabled?: boolean;
  onLand: () => void;
  onMiss: () => void;
  onClear: () => void;
}) {
  const landed = response === 'landed';
  const missed = response === 'missed';

  // Opaque tints precomputed as (rgba tint) over paper2. Using opaque colors
  // matters for the setter row, which sits on top of a solid lime/red shadow
  // plate — a translucent bg would let the shadow color bleed through.
  let bg: string = colors.paper2;
  let borderColor: string = colors.rule;
  if (isSetter && missed) {
    bg = '#261610';
    borderColor = colors.red;
  } else if (isSetter && landed) {
    bg = '#2d3014';
    borderColor = colors.lime;
  } else if (isSetter) {
    bg = '#1e1d11';
    borderColor = colors.lime;
  } else if (landed) {
    bg = '#212212';
    borderColor = colors.lime;
  } else if (missed) {
    bg = '#241510';
    borderColor = colors.red;
  }

  const showSetterShadow = isSetter;
  const setterShadowColor = missed ? colors.red : colors.lime;

  return (
    <View style={{ position: 'relative', opacity: disabled ? 0.4 : 1 }}>
      {showSetterShadow && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 3,
            top: 3,
            width: '100%',
            height: '100%',
            backgroundColor: setterShadowColor,
          }}
        />
      )}
      <View
        style={[
          styles.resultRow,
          { backgroundColor: bg, borderColor },
        ]}
      >
        <View style={styles.rrPlayer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.rrName} numberOfLines={1}>
              {player.name}
            </Text>
            {isSetter && (
              <View
                style={[
                  styles.setterTag,
                  missed && { backgroundColor: colors.red },
                ]}
              >
                <Text
                  style={[
                    styles.setterTagText,
                    missed && { color: colors.ink },
                  ]}
                >
                  SETTER
                </Text>
              </View>
            )}
          </View>
          <FlipLetters word={word} taken={player.letters} size={11} gap={2} />
        </View>
        <View style={styles.rrActions}>
          <RrBtn
            kind="miss"
            active={missed}
            disabled={disabled}
            onPress={() => (missed ? onClear() : onMiss())}
          />
          <RrBtn
            kind="land"
            active={landed}
            disabled={disabled}
            onPress={() => (landed ? onClear() : onLand())}
          />
        </View>
      </View>
    </View>
  );
}

function RrBtn({
  kind,
  active,
  disabled,
  onPress,
}: {
  kind: 'miss' | 'land';
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const accent = kind === 'miss' ? colors.red : colors.lime;
  const label = kind === 'miss' ? 'MISS' : 'LAND';

  const bg = active ? accent : colors.paper;
  const fg = active ? colors.paper : colors.inkMute;
  const border = active ? accent : colors.rule;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[
        styles.rrBtn,
        { backgroundColor: bg, borderColor: border },
      ]}
    >
      {kind === 'miss' ? (
        <XIcon size={12} color={fg} />
      ) : (
        <CheckIcon size={12} color={fg} />
      )}
      <Text style={[styles.rrBtnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SetFailedBanner & EliminatedRow
// ═══════════════════════════════════════════════════════════════════════

function SetFailedBanner({ mode }: { mode: Mode }) {
  return (
    <View style={styles.setFailed}>
      <BigStamp text="SET FAIL" size={18} rotate={-6} borderWidth={2.5} />
      <View style={styles.sfCopy}>
        <Text style={styles.sfLine1}>No penalty.</Text>
        <Text style={styles.sfLine2}>
          {mode === 'addon'
            ? "COMBO DOESN'T GROW — FRESH TRICK COMING."
            : "OTHERS DON'T ATTEMPT — NEW TRICK COMING."}
        </Text>
      </View>
    </View>
  );
}

function EliminatedRow({ player }: { player: Player }) {
  return (
    <View style={styles.elimRow}>
      <Text style={styles.elimName}>{player.name}</Text>
      <BigStamp text="OUT" size={12} rotate={-8} borderWidth={2} />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper2,
    borderWidth: 1.5,
    borderColor: colors.rule,
  },
  gear: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper2,
    borderWidth: 1.5,
    borderColor: colors.rule,
  },
  headCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  hcMode: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: 1.3,
  },
  hcRound: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: colors.inkMute,
    letterSpacing: 2,
  },
  headSetter: {
    alignItems: 'flex-end',
    gap: 1,
    paddingLeft: 8,
    borderLeftWidth: 1.5,
    borderLeftColor: colors.rule,
  },
  hsTag: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: colors.inkMute,
    letterSpacing: 1.8,
  },
  hsName: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.lime,
    letterSpacing: 0.6,
    maxWidth: 120,
  },
  // Scroll body
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  // Players strip
  playersStrip: {
    gap: 6,
    paddingVertical: 4,
  },
  pPill: {
    backgroundColor: colors.paper2,
    borderWidth: 1.5,
    borderColor: colors.rule,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 3,
    minWidth: 70,
    maxWidth: 110,
    position: 'relative',
  },
  pPillSetter: {
    backgroundColor: colors.paper3,
    borderColor: colors.lime,
  },
  pPillOut: {
    opacity: 0.4,
  },
  ppName: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.ink,
    letterSpacing: 0.3,
    maxWidth: 86,
  },
  ppSetterDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    backgroundColor: colors.lime,
  },
  ppOutStamp: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ppOutText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.red,
    letterSpacing: 0.6,
    transform: [{ rotate: '-12deg' }],
  },
  // Trick zone (wrapper handles ink border + offset shadow)
  tzWrap: {
    position: 'relative',
    marginTop: 4,
    marginRight: 5,
    marginBottom: 5,
  },
  tzShadow: {
    position: 'absolute',
    left: 5,
    top: 5,
    width: '100%',
    height: '100%',
  },
  tzInner: {
    position: 'relative',
    backgroundColor: colors.paper2,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: 14,
    paddingTop: 22,
    overflow: 'hidden',
  },
  tzCorner: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tzCornerText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: colors.paper,
    letterSpacing: 2,
  },
  tzMain: {
    gap: 6,
  },
  tzTierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tzRerollCount: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: colors.inkMute,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  tzTrickName: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 44 * 0.95,
    color: colors.ink,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginVertical: 6,
  },
  tzActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.ink,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  outlineBtnSmall: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  outlineBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.ink,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  // Add-on combo list
  comboList: {
    maxHeight: 200,
    marginTop: 4,
    marginBottom: 8,
  },
  comboItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  comboItemProposed: {
    backgroundColor: colors.paper3,
    borderColor: colors.lime,
  },
  ciNum: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.inkMute,
    minWidth: 22,
  },
  ciName: {
    flex: 1,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  ciProp: {
    backgroundColor: colors.lime,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  ciPropText: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    color: colors.paper,
    letterSpacing: 1.4,
  },
  comboEmpty: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: colors.rule,
    borderStyle: 'dashed',
  },
  comboEmptyText: {
    color: colors.inkMute,
    fontFamily: fonts.body,
    fontSize: 11,
  },
  addonActions: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  addonRerollCount: {
    marginLeft: 'auto',
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: colors.inkMute,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  // Result rows section
  rrSection: {
    gap: 5,
    marginTop: 4,
  },
  rrHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 2,
    paddingBottom: 2,
  },
  rrHeadText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: colors.inkMute,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  rrProgress: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.ink,
    letterSpacing: 0.6,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1.5,
  },
  rrPlayer: {
    flex: 1,
    gap: 3,
  },
  rrName: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.ink,
    letterSpacing: 0.3,
  },
  setterTag: {
    backgroundColor: colors.lime,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 6,
  },
  setterTagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    color: colors.paper,
    letterSpacing: 1.6,
  },
  rrActions: {
    flexDirection: 'row',
    gap: 5,
  },
  rrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1.5,
  },
  rrBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  // Set-failed banner
  setFailed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,42,31,0.08)',
    borderWidth: 2,
    borderColor: colors.red,
    borderStyle: 'dashed',
  },
  sfCopy: {
    flex: 1,
    gap: 2,
  },
  sfLine1: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    letterSpacing: 0.4,
  },
  sfLine2: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkMute,
    letterSpacing: 0.6,
    lineHeight: 14,
  },
  // Eliminated row
  elimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: colors.rule,
    borderStyle: 'dashed',
    opacity: 0.55,
  },
  elimName: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.inkMute,
    textDecorationLine: 'line-through',
    letterSpacing: 0.3,
  },
  // Footer
  footCta: {
    marginTop: 4,
  },
});
