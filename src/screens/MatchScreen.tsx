import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMatch } from '../store/MatchContext';
import { colors, fonts, spacing } from '../theme/tokens';

export function MatchScreen() {
  const { state, dispatch } = useMatch();
  return (
    <View style={styles.root}>
      <Text style={styles.heading}>MATCH · RD {String(state.roundIdx).padStart(2, '0')}</Text>
      <Text style={styles.trick}>{state.currentTrick?.name ?? '—'}</Text>
      <Pressable style={styles.back} onPress={() => dispatch({ type: 'HOME' })}>
        <Text style={styles.ctaText}>← Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.topSafe,
  },
  heading: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: 2,
    marginBottom: spacing.sectionGap,
  },
  trick: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 44,
    marginBottom: spacing.sectionGap,
  },
  back: {
    marginTop: 'auto',
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.rule,
  },
  ctaText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 2,
  },
});
