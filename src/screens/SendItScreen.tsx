import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatch, useSport } from '../store/MatchContext';
import { colors, fonts } from '../theme/tokens';
import { ChunkyBtn } from '../ui/ChunkyBtn';
import { Halftone } from '../ui/Halftone';
import { BackIcon } from '../ui/Icon';
import { TierBadge } from '../ui/TierBadge';

// Send-It — a solo random trick generator. One trick at a time; "Next"
// rolls a fresh one. No timer, no scoring, no rounds.
export function SendItScreen() {
  const { state, dispatch } = useMatch();
  const sport = useSport();
  const trick = state.currentTrick;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* ─── HEADER ─── */}
      <View style={styles.header}>
        <Pressable
          style={styles.back}
          onPress={() => dispatch({ type: 'HOME' })}
          hitSlop={8}
        >
          <BackIcon size={18} color={colors.ink} />
        </Pressable>
        <View style={styles.headCenter}>
          <Text style={styles.hcTitle}>SEND IT</Text>
          <Text style={styles.hcSport}>{sport.label}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* ─── TRICK + NEXT ─── */}
      <View style={styles.body}>
        {trick && (
          <View style={styles.tzWrap}>
            <View
              pointerEvents="none"
              style={[styles.tzShadow, { backgroundColor: sport.accent }]}
            />
            <View style={styles.tzInner}>
              <Halftone size={5} opacity={0.18} />
              <View style={styles.tzCorner}>
                <Text style={styles.tzCornerText}>SEND IT</Text>
              </View>
              <View style={styles.tzMain}>
                <TierBadge tier={trick.tier} full />
                <Text style={styles.tzTrickName} numberOfLines={3}>
                  {trick.name}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.cta}>
          <ChunkyBtn
            variant="primary"
            size="xl"
            fullWidth
            onPress={() => dispatch({ type: 'NEXT_TRICK' })}
          >
            Next →
          </ChunkyBtn>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
  headCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  hcTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: 1.3,
  },
  hcSport: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: colors.inkMute,
    letterSpacing: 2,
  },
  // Body — trick zone + Next centered in the available space.
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 24,
  },
  // Trick zone (accent offset shadow + ink border, matches Classic)
  tzWrap: {
    position: 'relative',
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
  tzTrickName: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 44 * 0.95,
    color: colors.ink,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginVertical: 6,
  },
  cta: {
    // sits just below the trick zone
  },
});
