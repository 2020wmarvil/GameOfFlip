import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

type Props = {
  size?: number;
  opacity?: number;
  color?: string;
};

export function Halftone({ size = 6, opacity = 0.18, color = '#f4ede0' }: Props) {
  return (
    <Svg
      style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
      width="100%"
      height="100%"
      pointerEvents="none"
    >
      <Defs>
        <Pattern id="halftone" x={0} y={0} width={size} height={size} patternUnits="userSpaceOnUse">
          <Circle cx={size / 2} cy={size / 2} r={1.2} fill={color} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#halftone)" opacity={opacity} />
    </Svg>
  );
}
