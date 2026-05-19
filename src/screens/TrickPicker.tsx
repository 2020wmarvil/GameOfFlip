import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Trick } from '../data/tricks';
import { useMatch, useSport } from '../store/MatchContext';
import { useSportTricks } from '../store/TrickLibraryContext';
import { colors, fonts } from '../theme/tokens';
import { XIcon } from '../ui/Icon';
import { StampLabel } from '../ui/StampLabel';
import { TierBadge } from '../ui/TierBadge';

export function TrickPicker() {
  const { state, dispatch } = useMatch();
  const sport = useSport();
  const [search, setSearch] = useState('');

  const library = useSportTricks(sport.id);
  const pool = useMemo(
    () => library.filter((t) => state.tiers.includes(t.tier)),
    [library, state.tiers],
  );
  const q = search.trim().toLowerCase();
  const filtered = q
    ? pool.filter((tr) => tr.name.toLowerCase().includes(q))
    : pool;

  const setter = state.players[state.setterIdx];
  const close = () => {
    setSearch('');
    dispatch({ type: 'CLOSE_PICKER' });
  };
  const pick = (trick: Trick) => {
    setSearch('');
    dispatch({ type: 'PICK_TRICK', trick });
  };

  return (
    <Modal
      visible={state.trickPickerOpen}
      transparent
      animationType="slide"
      onRequestClose={close}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={close}>
        {/* The sheet itself swallows touches so backdrop press doesn't fire */}
        <Pressable style={styles.sheetWrap} onPress={() => {}}>
          {/* Red "shadow" strip above the sheet — RN can't do box-shadow above */}
          <View style={[styles.topShadow, { backgroundColor: sport.accent }]} />
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <View style={styles.head}>
              <StampLabel rotate={-2} size={10}>
                {(setter?.name ?? 'SETTER').toUpperCase()} · PICK A TRICK
              </StampLabel>
              <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
                <XIcon size={14} color={colors.ink} />
              </Pressable>
            </View>

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search the book…"
              placeholderTextColor={colors.inkMute}
              autoCorrect={false}
              autoCapitalize="none"
              style={styles.search}
            />

            <ScrollView
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ gap: 4, paddingBottom: 4 }}
              keyboardShouldPersistTaps="handled"
            >
              {filtered.map((tr, i) => (
                <Pressable
                  key={`${tr.name}-${i}`}
                  onPress={() => pick(tr)}
                  style={styles.item}
                >
                  <Text style={styles.itemName} numberOfLines={1}>
                    {tr.name}
                  </Text>
                  <TierBadge tier={tr.tier} />
                </Pressable>
              ))}
              {filtered.length === 0 && (
                <Text style={styles.empty}>
                  No tricks match {search ? `"${search}"` : 'the current pool'}.
                </Text>
              )}
            </ScrollView>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const SHEET_MAX_HEIGHT_PERCENT = 80;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    maxHeight: `${SHEET_MAX_HEIGHT_PERCENT}%`,
  },
  topShadow: {
    height: 6,
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopWidth: 2,
    borderTopColor: colors.ink,
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 10,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderWidth: 1.5,
    borderColor: colors.rule,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    backgroundColor: colors.paper2,
    borderWidth: 1.5,
    borderColor: colors.rule,
    paddingVertical: 9,
    paddingHorizontal: 10,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.paper2,
    borderWidth: 1.5,
    borderColor: colors.rule,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  itemName: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.ink,
    letterSpacing: 0.3,
  },
  empty: {
    color: colors.inkMute,
    fontFamily: fonts.body,
    fontSize: 12,
    padding: 12,
    textAlign: 'center',
  },
});
