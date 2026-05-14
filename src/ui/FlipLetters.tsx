import { View } from 'react-native';
import Svg, { Text as SvgText } from 'react-native-svg';
import { colors, fonts } from '../theme/tokens';

type Props = {
  word?: string;
  taken?: number;
  size?: number;
  gap?: number;
  color?: string;
  dimColor?: string;
};

export function FlipLetters({
  word = 'FLIP',
  taken = 0,
  size = 22,
  gap = 4,
  color = colors.ink,
  dimColor = 'rgba(244,237,224,0.22)',
}: Props) {
  // Each letter is rendered into its own SVG so we can fill taken letters
  // and stroke-only outline the remaining ones.
  const letters = word.split('');
  // Approximate glyph width: condensed Anton ~ 0.55em
  const w = Math.ceil(size * 0.6);
  const h = Math.ceil(size * 1.05);
  return (
    <View style={{ flexDirection: 'row', gap, alignItems: 'center' }}>
      {letters.map((L, i) => {
        const on = i < taken;
        const rot = on ? (i % 2 === 0 ? -2 : 2) : 0;
        return (
          <View key={i} style={{ transform: [{ rotate: `${rot}deg` }] }}>
            <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
              <SvgText
                x={w / 2}
                y={h - 2}
                textAnchor="middle"
                fontFamily={fonts.display}
                fontSize={size}
                fill={on ? color : 'transparent'}
                stroke={on ? 'none' : dimColor}
                strokeWidth={on ? 0 : 1}
              >
                {L}
              </SvgText>
            </Svg>
          </View>
        );
      })}
    </View>
  );
}
