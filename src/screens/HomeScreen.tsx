import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMatch } from '../store/MatchContext';
import { colors, fonts, spacing } from '../theme/tokens';

export function HomeScreen() {
  const { dispatch } = useMatch();
  return (
    <View style={styles.root}>
      <Text style={styles.title}>GAME{'\n'}OF{'\n'}FLIP</Text>
      <Pressable style={styles.cta} onPress={() => dispatch({ type: 'GOTO', screen: 'setup' })}>
        <Text style={styles.ctaText}>New Match →</Text>
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
    justifyContent: 'center',
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 72,
    lineHeight: 80,
    textAlign: 'center',
  },
  cta: {
    marginTop: 40,
    backgroundColor: colors.red,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 2,
  },
});
