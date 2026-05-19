import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type Tier } from '../data/tricks';
import { useSport } from '../store/MatchContext';
import { useSportTricks } from '../store/TrickLibraryContext';
import { colors, fonts, tierColors } from '../theme/tokens';

type Props = {
  tier: Tier;
  active: boolean;
  onPress: () => void;
};

export function TierToggle({ tier, active, onPress }: Props) {
  const c = tierColors[tier];
  const sport = useSport();
  const library = useSportTricks(sport.id);
  const count = library.filter((t) => t.tier === tier).length;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: colors.paper3, borderColor: c.bg },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: c.bg, opacity: active ? 1 : 0.45 },
        ]}
      />
      <Text style={[styles.label, { color: active ? colors.ink : colors.inkMute }]}>
        {tier}
      </Text>
      <Text style={styles.count}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.paper2,
    borderWidth: 1.5,
    borderColor: colors.rule,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: '48%',
  },
  dot: {
    width: 10,
    height: 10,
  },
  label: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  count: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.inkMute,
  },
});
