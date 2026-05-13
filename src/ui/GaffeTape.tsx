import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts } from '../theme/tokens';

type Props = {
  children: ReactNode;
  rotate?: number;
  style?: StyleProp<ViewStyle>;
};

export function GaffeTape({ children, rotate = -2, style }: Props) {
  return (
    <View
      style={[
        styles.tape,
        { transform: [{ rotate: `${rotate}deg` }] },
        style,
      ]}
    >
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tape: {
    alignSelf: 'flex-start',
    backgroundColor: colors.yellow,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  text: {
    color: colors.paper,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
