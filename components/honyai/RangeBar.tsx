import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { mulish } from './typography';

interface Props {
  value: number;
  height?: number;
  showLabels?: boolean;
}

// 0-70 düşük · 70-140 normal · 140-180 yüksek · 180+ çok yüksek (total: 250)
const TOTAL = 250;
const SEGMENTS = [
  { width: 70, kind: 'bad' as const },
  { width: 70, kind: 'ok' as const },
  { width: 40, kind: 'warn' as const },
  { width: 70, kind: 'bad' as const },
];

function RangeBar({ value, height = 8, showLabels = true }: Props) {
  const { theme } = useTheme();
  const clamped = Math.max(0, Math.min(TOTAL, value));
  const pctLeft = (clamped / TOTAL) * 100;

  const colorFor = (kind: 'bad' | 'ok' | 'warn') =>
    kind === 'bad' ? theme.danger : kind === 'ok' ? theme.success : theme.warning;

  return (
    <View>
      <View style={{ height: height + 6, justifyContent: 'center' }}>
        <View
          style={{
            height,
            flexDirection: 'row',
            borderRadius: height / 2,
            overflow: 'hidden',
          }}
        >
          {SEGMENTS.map((s, i) => (
            <View
              key={i}
              style={{
                flex: s.width,
                backgroundColor: colorFor(s.kind),
              }}
            />
          ))}
        </View>
        <View
          style={{
            position: 'absolute',
            left: `${pctLeft}%`,
            marginLeft: -6,
            top: 0,
            width: 12,
            height: height + 6,
            backgroundColor: theme.textPrimary,
            borderColor: theme.surface,
            borderWidth: 2,
            borderRadius: 6,
          }}
        />
      </View>
      {showLabels ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 6,
          }}
        >
          {['düşük', 'normal', 'yüksek', 'çok yüksek'].map((s) => (
            <Text
              key={s}
              style={{
                fontFamily: mulish[700],
                fontSize: 11,
                color: theme.textSecondary,
              }}
            >
              {s}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default RangeBar;
