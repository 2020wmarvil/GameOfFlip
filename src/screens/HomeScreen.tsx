import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Text as SvgText } from 'react-native-svg';
import { ChunkyBtn } from '../ui/ChunkyBtn';
import { GaffeTape } from '../ui/GaffeTape';
import { StampLabel } from '../ui/StampLabel';
import { useMatch } from '../store/MatchContext';
import { colors, fonts } from '../theme/tokens';

const HERO_SIZE = 96;

function FilledHero({ children, rotate = 0 }: { children: string; rotate?: number }) {
  return (
    <Text
      style={[
        styles.hero,
        { transform: [{ rotate: `${rotate}deg` }] },
      ]}
    >
      {children}
    </Text>
  );
}

function OutlinedHero({ children, rotate = 0 }: { children: string; rotate?: number }) {
  // RN Text has no stroke; use SVG to draw outlined glyphs.
  const w = HERO_SIZE * 0.6 * children.length + 20;
  const h = HERO_SIZE * 1.05;
  return (
    <View style={{ transform: [{ rotate: `${rotate}deg` }], height: h, width: w }}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <SvgText
          x={w / 2}
          y={h - 8}
          textAnchor="middle"
          fontFamily={fonts.display}
          fontSize={HERO_SIZE}
          fill="transparent"
          stroke={colors.ink}
          strokeWidth={2}
        >
          {children}
        </SvgText>
      </Svg>
    </View>
  );
}

export function HomeScreen() {
  const { state, dispatch } = useMatch();
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stamps}>
        <StampLabel rotate={-4} size={9}>
          ISSUE №01
        </StampLabel>
        <StampLabel rotate={3} size={9} color={colors.inkMute}>
          FREESTYLE TRAMP / EST. 2026
        </StampLabel>
      </View>

      <View style={styles.heroBlock}>
        <FilledHero rotate={-1}>GAME</FilledHero>
        <View style={styles.ofRow}>
          <View style={styles.ofRule} />
          <Text style={styles.ofWord}>OF</Text>
          <View style={styles.ofRule} />
        </View>
        <OutlinedHero rotate={1}>FLIP</OutlinedHero>

        <Text style={styles.sub}>
          A backyard scorekeeper for{' '}
          <Text style={styles.subEm}>tramp jams</Text>.{'\n'}
          One phone. Pass it around. Spell{' '}
          {state.word.split('').join('·')} — take the L.
        </Text>
      </View>

      <View style={styles.cta}>
        <ChunkyBtn
          variant="primary"
          size="xl"
          fullWidth
          onPress={() => dispatch({ type: 'GOTO', screen: 'setup' })}
        >
          New Match →
        </ChunkyBtn>
      </View>

      <View style={styles.dashedRule} />

      <View style={{ marginTop: 18 }}>
        <GaffeTape rotate={-3}>How it works</GaffeTape>
        <View style={styles.howList}>
          <HowRow num="01" text="Roster up. Anyone with a tramp can play." />
          <HowRow num="02" text="Phone calls a trick. Pass it. Stomp it." />
          <HowRow num="03">
            <Text style={styles.howText}>
              Miss = a letter. Spell{' '}
              <Text style={styles.howEm}>{state.word}</Text> = you're out.
            </Text>
          </HowRow>
        </View>
      </View>

        <View style={styles.credits}>
          <Text style={styles.creditsText}>v 1.0 · 2-string · last one bouncing wins</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HowRow({
  num,
  text,
  children,
}: {
  num: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.howRow}>
      <Text style={styles.howNum}>{num}</Text>
      {children ?? <Text style={styles.howText}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  // flexGrow: 1 lets the credits' marginTop: 'auto' push them to the
  // bottom on tall screens; if content overflows, the ScrollView scrolls.
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  stamps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  heroBlock: {
    alignItems: 'center',
    marginTop: 36,
  },
  hero: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: HERO_SIZE,
    lineHeight: HERO_SIZE * 1.02,
    letterSpacing: 2,
  },
  ofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
    marginVertical: 2,
  },
  ofRule: {
    flex: 1,
    height: 2,
    backgroundColor: colors.ink,
  },
  ofWord: {
    color: colors.red,
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: 2,
    marginHorizontal: 10,
  },
  sub: {
    color: colors.inkMute,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 12,
  },
  subEm: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
  cta: {
    marginTop: 28,
  },
  dashedRule: {
    marginTop: 26,
    height: 0,
    borderTopWidth: 1.5,
    borderTopColor: colors.rule,
    borderStyle: 'dashed',
  },
  howList: {
    marginTop: 14,
    gap: 10,
  },
  howRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  howNum: {
    color: colors.lime,
    fontFamily: fonts.display,
    fontSize: 20,
    minWidth: 28,
  },
  howText: {
    flex: 1,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
  },
  howEm: {
    color: colors.red,
    fontFamily: fonts.bodyBold,
  },
  credits: {
    marginTop: 'auto',
    paddingVertical: 16,
    alignItems: 'center',
  },
  creditsText: {
    color: colors.inkMute,
    fontFamily: fonts.body,
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
