import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMatch } from '../store/MatchContext';
import { colors, fonts, spacing } from '../theme/tokens';

export function SetupScreen() {
  const { state, dispatch } = useMatch();
  return (
    <View style={styles.root}>
      <Text style={styles.heading}>NEW MATCH · SETUP</Text>
      <Text style={styles.body}>Players: {state.players.length}</Text>
      <Text style={styles.body}>Mode: {state.mode}</Text>
      <Text style={styles.body}>Tiers: {state.tiers.join(', ')}</Text>
      <Pressable style={styles.back} onPress={() => dispatch({ type: 'GOTO', screen: 'home' })}>
        <Text style={styles.ctaText}>← Back</Text>
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
    fontSize: 24,
    letterSpacing: 2,
    marginBottom: spacing.sectionGap,
  },
  body: {
    color: colors.inkMute,
    fontFamily: fonts.body,
    fontSize: 13,
    marginBottom: 8,
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
