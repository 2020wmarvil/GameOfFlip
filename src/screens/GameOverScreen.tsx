import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Player } from '../store/match';
import { useMatch, useSport } from '../store/MatchContext';
import { colors, fonts } from '../theme/tokens';
import { ChunkyBtn } from '../ui/ChunkyBtn';
import { CrownIcon } from '../ui/Icon';
import { StampLabel } from '../ui/StampLabel';

// The spelled loss word scales down for longer words, same as the home hero.
const GO_LETTER_SIZE: Record<number, number> = { 4: 78, 5: 64, 6: 56, 7: 50 };
function goLetterSize(len: number): number {
  return GO_LETTER_SIZE[len] ?? 50;
}

export function GameOverScreen() {
  const { state, dispatch } = useMatch();
  const sport = useSport();
  const word = sport.word;
  const letterSize = goLetterSize(word.length);

  // Losers most-recently eliminated first, so #02 is the runner-up.
  const losers = [...state.players]
    .filter((p) => p.eliminated)
    .sort((a, b) => (b.elimRound ?? 0) - (a.elimRound ?? 0));

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <StampLabel rotate={-4} size={10}>
            FINAL · GAME OVER
          </StampLabel>
        </View>

        <View style={styles.spelledRow}>
          {word.split('').map((L, i) => (
            <Text
              key={i}
              style={[
                styles.spelledLetter,
                {
                  fontSize: letterSize,
                  lineHeight: letterSize * 0.85,
                  color: sport.accent,
                  transform: [{ rotate: `${i % 2 === 0 ? -3 : 3}deg` }],
                },
              ]}
            >
              {L}
            </Text>
          ))}
        </View>

        <WinnerCard
          winner={state.winner}
          rounds={state.history.length}
          mode={state.mode}
        />

        <View style={styles.standings}>
          <Text style={styles.standingsHead}>FINAL STANDINGS</Text>
          {state.winner && (
            <StandingRow
              place={1}
              name={state.winner.name}
              result="survived"
              crowned
            />
          )}
          {losers.map((p, i) => (
            <StandingRow
              key={p.id}
              place={i + 2}
              name={p.name}
              result={`out rd ${p.elimRound ?? '?'}`}
            />
          ))}
        </View>

        <View style={styles.ctaCol}>
          <ChunkyBtn
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => dispatch({ type: 'REMATCH' })}
          >
            Run It Back
          </ChunkyBtn>
          <ChunkyBtn
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => dispatch({ type: 'HOME' })}
          >
            Back to Home
          </ChunkyBtn>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Winner card ────────────────────────────────────────────────────────

function WinnerCard({
  winner,
  rounds,
  mode,
}: {
  winner: Player | null;
  rounds: number;
  mode: 'classic' | 'addon';
}) {
  return (
    <View style={styles.wcWrap}>
      <View pointerEvents="none" style={styles.wcShadow} />
      <View style={styles.wcInner}>
        <View style={styles.wcStamp}>
          <StampLabel rotate={-6} size={9} dashed={false} color={colors.lime}>
            WINNER
          </StampLabel>
        </View>
        <View style={styles.wcCrown}>
          <CrownIcon size={28} color={colors.yellow} />
        </View>
        <Text style={styles.wcName} numberOfLines={1}>
          {winner?.name ?? '—'}
        </Text>
        <Text style={styles.wcMeta}>
          LAST ONE BOUNCING · {rounds} ROUND{rounds === 1 ? '' : 'S'} ·{' '}
          {mode === 'addon' ? 'ADD-ON' : 'CLASSIC'}
        </Text>
      </View>
    </View>
  );
}

// ─── Standing row ───────────────────────────────────────────────────────

function StandingRow({
  place,
  name,
  result,
  crowned,
}: {
  place: number;
  name: string;
  result: string;
  crowned?: boolean;
}) {
  return (
    <View style={[styles.gosRow, crowned && { borderColor: colors.lime }]}>
      <Text style={[styles.gosPlace, crowned && { color: colors.lime }]}>
        {String(place).padStart(2, '0')}
      </Text>
      <Text style={styles.gosName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.gosResult}>{result.toUpperCase()}</Text>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
    gap: 18,
  },
  top: {
    alignItems: 'center',
  },
  spelledRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
  },
  spelledLetter: {
    fontFamily: fonts.display,
    fontSize: 78,
    lineHeight: 78 * 0.85,
    color: colors.red,
    letterSpacing: 1,
  },
  // Winner card
  wcWrap: {
    position: 'relative',
    marginRight: 5,
    marginBottom: 5,
  },
  wcShadow: {
    position: 'absolute',
    left: 5,
    top: 5,
    width: '100%',
    height: '100%',
    backgroundColor: colors.lime,
  },
  wcInner: {
    backgroundColor: colors.paper2,
    borderWidth: 2,
    borderColor: colors.ink,
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  wcStamp: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  wcCrown: {
    marginBottom: 2,
  },
  wcName: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.ink,
    letterSpacing: 0.6,
    lineHeight: 40,
  },
  wcMeta: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkMute,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  // Standings
  standings: {
    gap: 6,
  },
  standingsHead: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.inkMute,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    paddingLeft: 4,
  },
  gosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.paper2,
    borderWidth: 1.5,
    borderColor: colors.rule,
  },
  gosPlace: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.inkMute,
    minWidth: 26,
  },
  gosName: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.ink,
  },
  gosResult: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: colors.inkMute,
    letterSpacing: 1.6,
  },
  // CTAs
  ctaCol: {
    gap: 8,
    marginTop: 4,
  },
});
