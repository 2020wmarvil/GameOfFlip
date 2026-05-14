import { StyleSheet, Text, View } from 'react-native';
import type { Tier } from '../data/tricks';
import { fonts, tierColors } from '../theme/tokens';

const TIER_LABEL: Record<Tier, string> = {
  beginner: 'BEG',
  intermediate: 'INT',
  advanced: 'ADV',
  pro: 'PRO',
};

type Props = {
  tier: Tier;
  full?: boolean;
};

export function TierBadge({ tier, full = false }: Props) {
  const c = tierColors[tier];
  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.text }]} />
      <Text style={[styles.text, { color: c.text }]}>
        {full ? tier.toUpperCase() : TIER_LABEL[tier]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    width: 4,
    height: 4,
  },
  text: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.8,
  },
});
