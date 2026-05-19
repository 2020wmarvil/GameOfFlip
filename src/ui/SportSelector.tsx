import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SPORTS, type SportId } from '../data/sports';
import { colors, fonts } from '../theme/tokens';

type Props = {
  sportId: SportId;
  sportLocked: boolean;
  onChange: (id: SportId) => void;
};

// Segmented pill row on the Home screen. The active sport gets an
// accent-colored offset shadow + accent border; inactives stay outlined.
// Wraps so 4-6 sports lay out across one or two rows.
export function SportSelector({ sportId, sportLocked, onChange }: Props) {
  return (
    <View style={styles.row}>
      {SPORTS.map((sp) => {
        const active = sp.id === sportId;
        const dim = sportLocked && !active;
        return (
          <View key={sp.id} style={[styles.pillWrap, dim && { opacity: 0.3 }]}>
            {active && (
              <View
                pointerEvents="none"
                style={[styles.shadow, { backgroundColor: sp.accent }]}
              />
            )}
            <Pressable
              onPress={() => !sportLocked && onChange(sp.id)}
              disabled={sportLocked && !active}
              style={[
                styles.pill,
                active && {
                  backgroundColor: colors.paper3,
                  borderColor: sp.accent,
                  transform: [{ translateX: -1 }, { translateY: -1 }],
                },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: sp.accent, opacity: active ? 1 : 0.5 },
                ]}
              />
              <Text
                style={[
                  styles.label,
                  { color: active ? colors.ink : colors.inkMute },
                ]}
              >
                {sp.label}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  pillWrap: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    left: 3,
    top: 3,
    width: '100%',
    height: '100%',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.paper2,
    borderWidth: 1.5,
    borderColor: colors.rule,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  dot: {
    width: 7,
    height: 7,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
});
