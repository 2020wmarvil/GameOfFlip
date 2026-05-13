import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts } from '../theme/tokens';

type Props = {
  children: ReactNode;
  color?: string;
  rotate?: number;
  size?: number;
  dashed?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function StampLabel({
  children,
  color = colors.ink,
  rotate = -3,
  size = 11,
  dashed = true,
  style,
}: Props) {
  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: color,
          borderStyle: dashed ? 'dashed' : 'solid',
          transform: [{ rotate: `${rotate}deg` }],
        },
        style,
      ]}
    >
      <Text
        style={{
          color,
          fontFamily: fonts.bodyBold,
          fontSize: size,
          letterSpacing: size * 0.18,
          textTransform: 'uppercase',
        }}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.5,
  },
});
