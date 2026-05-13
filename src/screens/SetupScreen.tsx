import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TIERS, filterTricks } from '../data/tricks';
import { useMatch } from '../store/MatchContext';
import { colors, fonts } from '../theme/tokens';
import { ChunkyBtn } from '../ui/ChunkyBtn';
import { BackIcon, PlusIcon, XIcon } from '../ui/Icon';
import { StampLabel } from '../ui/StampLabel';
import { TierToggle } from '../ui/TierToggle';

const MAX_PLAYERS = 12;

export function SetupScreen() {
  const { state, dispatch } = useMatch();
  const canStart = state.players.length >= 2;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          style={styles.back}
          onPress={() => dispatch({ type: 'GOTO', screen: 'home' })}
          hitSlop={8}
        >
          <BackIcon size={18} color={colors.ink} />
        </Pressable>
        <View style={styles.headerStamp}>
          <StampLabel rotate={-2} size={10}>
            NEW MATCH · SETUP
          </StampLabel>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Section num="01" label="ROSTER" meta={`${state.players.length}/${MAX_PLAYERS}`}>
          <View style={{ gap: 6 }}>
            {state.players.map((p, i) => (
              <PlayerChip
                key={p.id}
                index={i}
                name={p.name}
                onRemove={() => dispatch({ type: 'REMOVE_PLAYER', id: p.id })}
              />
            ))}
            {state.players.length < MAX_PLAYERS && (
              <AddPlayerRow
                index={state.players.length}
                onAdd={(name) => dispatch({ type: 'ADD_PLAYER', name })}
              />
            )}
          </View>
        </Section>

        <Section num="02" label="MODE">
          <View style={styles.modeGrid}>
            <ModeCard
              tag="g.o.f."
              title="CLASSIC"
              desc="One trick a round. Land it or take a letter."
              active={state.mode === 'classic'}
              onPress={() => dispatch({ type: 'SET_MODE', mode: 'classic' })}
            />
            <ModeCard
              tag="combo"
              title="ADD-ON"
              desc="The line grows. Every round you run it back, plus one."
              active={state.mode === 'addon'}
              onPress={() => dispatch({ type: 'SET_MODE', mode: 'addon' })}
            />
          </View>
        </Section>

        <Section
          num="03"
          label="DIFFICULTY POOL"
          meta={`${filterTricks(state.tiers).length} tricks`}
        >
          <View style={styles.tierGrid}>
            {TIERS.map((tier) => (
              <TierToggle
                key={tier}
                tier={tier}
                active={state.tiers.includes(tier)}
                onPress={() => dispatch({ type: 'TOGGLE_TIER', tier })}
              />
            ))}
          </View>
        </Section>

        <View style={styles.cta}>
          <ChunkyBtn
            variant={canStart ? 'success' : 'secondary'}
            size="xl"
            fullWidth
            disabled={!canStart}
            onPress={() => canStart && dispatch({ type: 'START_MATCH' })}
          >
            {canStart ? 'Drop In ↓' : 'Add 2+ Players'}
          </ChunkyBtn>
        </View>

        <Text style={styles.footerNote}>
          WORD TO SPELL:{' '}
          <Text style={styles.footerWord}>{state.word.split('').join('·')}</Text>
          {'   '}· {state.word.length} MISSES ELIMINATES
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────

function Section({
  num,
  label,
  meta,
  children,
}: {
  num: string;
  label: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionLabel}>
        <Text style={styles.slNum}>{num}</Text>
        <Text style={styles.slText}>{label}</Text>
        {meta != null && <Text style={styles.slMeta}>{meta}</Text>}
      </View>
      {children}
    </View>
  );
}

function PlayerChip({
  index,
  name,
  onRemove,
}: {
  index: number;
  name: string;
  onRemove: () => void;
}) {
  // Alternating ±0.15° rotation per the prototype, for the photocopied feel.
  const tilt = index % 2 === 0 ? -0.15 : 0.15;
  return (
    <View
      style={[
        styles.chip,
        { transform: [{ rotate: `${tilt}deg` }] },
      ]}
    >
      <Text style={styles.pcNum}>{String(index + 1).padStart(2, '0')}</Text>
      <Text style={styles.pcName}>{name}</Text>
      <Pressable onPress={onRemove} hitSlop={8} style={styles.pcX}>
        <XIcon size={12} color={colors.inkMute} />
      </Pressable>
    </View>
  );
}

function AddPlayerRow({
  index,
  onAdd,
}: {
  index: number;
  onAdd: (name: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<TextInput>(null);
  const trimmed = draft.trim();
  const canAdd = trimmed.length > 0;

  const submit = () => {
    if (!canAdd) return;
    onAdd(trimmed);
    setDraft('');
    // Refocus so the user can keep adding.
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <View style={[styles.chip, styles.chipDashed]}>
      <Text style={styles.pcNum}>{String(index + 1).padStart(2, '0')}</Text>
      <TextInput
        ref={inputRef}
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={submit}
        placeholder="Add a name…"
        placeholderTextColor={colors.inkMute}
        maxLength={18}
        returnKeyType="done"
        blurOnSubmit={false}
        style={styles.pcInput}
      />
      <Pressable
        onPress={submit}
        disabled={!canAdd}
        hitSlop={8}
        style={[
          styles.pcAdd,
          { backgroundColor: canAdd ? colors.lime : colors.paper3 },
        ]}
      >
        <PlusIcon size={14} color={canAdd ? colors.paper : colors.inkMute} />
      </Pressable>
    </View>
  );
}

function ModeCard({
  tag,
  title,
  desc,
  active,
  onPress,
}: {
  tag: string;
  title: string;
  desc: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.modeCardWrap}>
      {/* lime offset shadow shows only when active */}
      {active && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 4,
            top: 4,
            width: '100%',
            height: '100%',
            backgroundColor: colors.lime,
          }}
        />
      )}
      <Pressable
        onPress={onPress}
        style={[
          styles.modeCard,
          active && { backgroundColor: colors.paper3, borderColor: colors.ink },
        ]}
      >
        <Text style={styles.mcTag}>{tag}</Text>
        <Text style={styles.mcTitle}>{title}</Text>
        <Text style={styles.mcDesc}>{desc}</Text>
        {active && (
          <View style={styles.mcStamp}>
            <StampLabel rotate={-6} size={8} dashed={false} color={colors.lime}>
              SELECTED
            </StampLabel>
          </View>
        )}
      </Pressable>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
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
  headerStamp: {
    flex: 1,
    alignItems: 'center',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 10,
  },
  slNum: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    letterSpacing: 0.7,
  },
  slText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.ink,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  slMeta: {
    marginLeft: 'auto',
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.inkMute,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  // Player chip
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.paper2,
    borderWidth: 1.5,
    borderColor: colors.rule,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  chipDashed: {
    borderStyle: 'dashed',
  },
  pcNum: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.inkMute,
    minWidth: 22,
  },
  pcName: {
    flex: 1,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  pcX: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pcInput: {
    flex: 1,
    padding: 0,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  pcAdd: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Mode
  modeGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  modeCardWrap: {
    flex: 1,
    position: 'relative',
  },
  modeCard: {
    backgroundColor: colors.paper2,
    borderWidth: 1.5,
    borderColor: colors.rule,
    padding: 14,
    paddingTop: 14,
    minHeight: 120,
    gap: 4,
  },
  mcTag: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: colors.inkMute,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  mcTitle: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.ink,
    letterSpacing: 0.6,
    marginTop: 2,
    marginBottom: 6,
  },
  mcDesc: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: colors.inkMute,
    lineHeight: 16,
  },
  mcStamp: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  // Tier chip grid
  tierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  // Footer
  cta: {
    marginTop: 8,
  },
  footerNote: {
    marginTop: 12,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkMute,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  footerWord: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
});
