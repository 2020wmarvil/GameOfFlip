import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts } from '../theme/tokens';

type Props = {
  text: string;
  color?: string;
  rotate?: number;
  size?: number;
  borderWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function BigStamp({
  text,
  color = colors.red,
  rotate = -12,
  size = 16,
  borderWidth = 2,
  style,
}: Props) {
  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: color,
          borderWidth,
          transform: [{ rotate: `${rotate}deg` }],
        },
        style,
      ]}
    >
      <Text
        style={{
          color,
          fontFamily: fonts.display,
          fontSize: size,
          letterSpacing: size * 0.04,
          textTransform: 'uppercase',
          lineHeight: size * 1.05,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
