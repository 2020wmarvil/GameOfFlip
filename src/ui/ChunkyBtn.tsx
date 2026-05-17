import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSport } from '../store/MatchContext';
import { colors, fonts } from '../theme/tokens';

export type ChunkyVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ChunkySize = 'sm' | 'md' | 'lg' | 'xl';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  variant?: ChunkyVariant;
  size?: ChunkySize;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

// `primary` bg is the per-sport accent — resolved at render. The rest are
// fixed: success = locked lime, danger = locked red.
const VARIANTS: Record<ChunkyVariant, { bg: string; fg: string; shadow: string }> = {
  primary: { bg: colors.red, fg: colors.paper, shadow: colors.ink },
  secondary: { bg: colors.paper2, fg: colors.ink, shadow: colors.inkMute },
  success: { bg: colors.lime, fg: colors.paper, shadow: colors.ink },
  danger: { bg: colors.red, fg: colors.paper, shadow: colors.ink },
  ghost: { bg: 'transparent', fg: colors.ink, shadow: colors.inkMute },
};

const SIZES: Record<ChunkySize, { padV: number; padH: number; font: number; offset: number }> = {
  sm: { padV: 8, padH: 12, font: 13, offset: 3 },
  md: { padV: 12, padH: 18, font: 15, offset: 4 },
  lg: { padV: 18, padH: 22, font: 22, offset: 5 },
  xl: { padV: 22, padH: 26, font: 28, offset: 6 },
};

export function ChunkyBtn({
  children,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled,
  fullWidth,
  style,
}: Props) {
  const [pressed, setPressed] = useState(false);
  const sport = useSport();
  const base = VARIANTS[variant];
  const v = variant === 'primary' ? { ...base, bg: sport.accent } : base;
  const s = SIZES[size];

  return (
    <View style={[{ position: 'relative' }, fullWidth && { alignSelf: 'stretch' }, style]}>
      {/* offset shadow plate — sits behind the button, shifted +offset */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: s.offset,
          top: s.offset,
          width: '100%',
          height: '100%',
          backgroundColor: v.shadow,
          opacity: pressed || disabled ? 0 : 1,
        }}
      />
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={() => !disabled && setPressed(true)}
        onPressOut={() => setPressed(false)}
        disabled={disabled}
        style={{
          backgroundColor: v.bg,
          borderWidth: 2,
          borderColor: v.shadow,
          paddingVertical: s.padV,
          paddingHorizontal: s.padH,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
          // Always supply a transform array — going from a defined array
          // to undefined causes RN's prop differ to call _validateTransforms(null).
          transform: [
            { translateX: pressed ? s.offset : 0 },
            { translateY: pressed ? s.offset : 0 },
          ],
        }}
      >
        {typeof children === 'string' ? (
          <Text
            style={{
              color: v.fg,
              fontFamily: fonts.display,
              fontSize: s.font,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    </View>
  );
}

// Re-exported for screens that don't need the wrapper text styling
export const chunkyTextStyle = StyleSheet.create({
  base: {
    fontFamily: fonts.display,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
