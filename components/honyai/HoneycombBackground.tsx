import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  width: number;
  height: number;
  opacity?: number;
  cellSize?: number;
}

function HoneycombBackground({
  width,
  height,
  opacity = 0.06,
  cellSize = 28,
}: Props) {
  const { theme } = useTheme();

  const cells = useMemo(() => {
    const s = cellSize;
    const rowH = s * 0.86;
    const cols = Math.ceil(width / (s * 1.5)) + 1;
    const rows = Math.ceil(height / rowH) + 1;
    const paths: string[] = [];
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const x = col * s * 1.5 + (r % 2 === 1 ? s * 0.75 : 0);
        const y = r * rowH;
        const d =
          `M ${x} ${y + s / 2} ` +
          `L ${x + s / 4} ${y} ` +
          `L ${x + s * 0.75} ${y} ` +
          `L ${x + s} ${y + s / 2} ` +
          `L ${x + s * 0.75} ${y + s} ` +
          `L ${x + s / 4} ${y + s} Z`;
        paths.push(d);
      }
    }
    return paths;
  }, [width, height, cellSize]);

  return (
    <View pointerEvents="none" style={{ width, height }}>
      <Svg width={width} height={height}>
        {cells.map((d, i) => (
          <Path
            key={i}
            d={d}
            stroke={theme.accent}
            strokeWidth={0.9}
            strokeOpacity={opacity}
            fill="none"
          />
        ))}
      </Svg>
    </View>
  );
}

export default HoneycombBackground;
