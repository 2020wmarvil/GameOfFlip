import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { filterTricks, TIERS } from '../data/tricks';
import { useMatch } from '../store/MatchContext';
import { colors, fonts } from '../theme/tokens';
import { XIcon } from '../ui/Icon';
import { StampLabel } from '../ui/StampLabel';
import { TierToggle } from '../ui/TierToggle';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function MatchSettings({ visible, onClose }: Props) {
  const { state, dispatch } = useMatch();
  const poolCount = filterTricks(state.tiers).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheetWrap} onPress={() => {}}>
          <View style={styles.topShadow} />
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <View style={styles.head}>
              <StampLabel rotate={-2} size={10}>
                MID-MATCH · SETTINGS
              </StampLabel>
              <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
                <XIcon size={14} color={colors.ink} />
              </Pressable>
            </View>

            <ScrollView
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ gap: 16, paddingBottom: 4 }}
            >
              <View>
                <View style={styles.sectionLabel}>
                  <Text style={styles.slText}>DIFFICULTY POOL</Text>
                  <Text style={styles.slMeta}>{poolCount} tricks</Text>
                </View>
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
                <Text style={styles.hint}>
                  The current trick stays as-is. Re-roll if you want one from
                  the new pool.
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    maxHeight: '80%',
  },
  topShadow: {
    height: 6,
    backgroundColor: colors.red,
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopWidth: 2,
    borderTopColor: colors.ink,
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 14,
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
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 10,
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
  tierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hint: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkMute,
    lineHeight: 16,
  },
});
