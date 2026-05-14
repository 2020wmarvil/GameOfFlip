import { useMemo } from 'react';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import { colors } from '../theme/tokens';

// RN has no SVG filter primitives (feTurbulence) or CSS mix-blend-mode,
// so the prototype's procedural grain doesn't port directly. Instead, we
// build a tileable pattern of sparse white speckles at random opacities —
// the same gritty-photocopy feel without filters or blend modes.

const TILE = 24;
const DENSITY = 0.35;

export function GrainLayer({ opacity = 0.09 }: { opacity?: number }) {
  const cells = useMemo(() => {
    const c: Array<{ x: number; y: number; a: number }> = [];
    for (let y = 0; y < TILE; y++) {
      for (let x = 0; x < TILE; x++) {
        const r = Math.random();
        if (r < DENSITY) {
          c.push({ x, y, a: 0.3 + r * 0.7 });
        }
      }
    }
    return c;
  }, []);

  return (
    <Svg
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
      width="100%"
      height="100%"
    >
      <Defs>
        <Pattern
          id="grain"
          x={0}
          y={0}
          width={TILE}
          height={TILE}
          patternUnits="userSpaceOnUse"
        >
          {cells.map((cell, i) => (
            <Rect
              key={i}
              x={cell.x}
              y={cell.y}
              width={1}
              height={1}
              fill={colors.ink}
              opacity={cell.a}
            />
          ))}
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#grain)" opacity={opacity} />
    </Svg>
  );
}
