import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMatch } from '../store/MatchContext';
import { colors, fonts, spacing } from '../theme/tokens';

export function GameOverScreen() {
  const { state, dispatch } = useMatch();
  return (
    <View style={styles.root}>
      <Text style={styles.stamp}>FINAL · GAME OVER</Text>
      <Text style={styles.spelled}>{state.word.split('').join(' ')}</Text>
      {state.winner ? <Text style={styles.winner}>{state.winner.name}</Text> : null}
      <Pressable style={styles.cta} onPress={() => dispatch({ type: 'REMATCH' })}>
        <Text style={styles.ctaTextDark}>Run It Back</Text>
      </Pressable>
      <Pressable style={styles.ghost} onPress={() => dispatch({ type: 'HOME' })}>
        <Text style={styles.ctaTextLight}>Back to Home</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  stamp: {
    color: colors.inkMute,
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: spacing.sectionGap,
  },
  spelled: {
    color: colors.red,
    fontFamily: fonts.display,
    fontSize: 78,
    letterSpacing: 4,
    marginBottom: spacing.sectionGap,
  },
  winner: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 40,
    marginBottom: spacing.sectionGap,
  },
  cta: {
    backgroundColor: colors.lime,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  ghost: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderWidth: 1.5,
    borderColor: colors.rule,
  },
  ctaTextDark: {
    color: colors.paper,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 2,
  },
  ctaTextLight: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 2,
  },
});
