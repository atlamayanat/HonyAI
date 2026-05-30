import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { mulish } from './typography';

export type HonyaiLogoVariant = 'mark' | 'wordmark' | 'lockup';

interface Props {
  size?: number;
  variant?: HonyaiLogoVariant;
  color?: string;
  accent?: string;
}

function Mark({
  size,
  ink,
  amber,
}: {
  size: number;
  ink: string;
  amber: string;
}) {
  const s = size / 32;
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path
        d="M 16 2.5 L 28 9.5 L 28 22.5 L 16 29.5 L 4 22.5 L 4 9.5 Z"
        stroke={ink}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill="none"
      />
      <Line
        x1={12.5}
        y1={10}
        x2={12.5}
        y2={22}
        stroke={ink}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <Line
        x1={12.5}
        y1={16}
        x2={19}
        y2={16}
        stroke={ink}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <Line
        x1={19}
        y1={10.5}
        x2={19}
        y2={22}
        stroke={ink}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <Circle cx={22.5} cy={11.5} r={1.6} fill={amber} />
    </Svg>
  );
}

function HonyaiLogo({
  size = 28,
  variant = 'lockup',
  color,
  accent,
}: Props) {
  const { theme } = useTheme();
  const ink = color ?? theme.textPrimary;
  const amber = accent ?? theme.accent;

  const wordStyle = {
    fontFamily: mulish[800],
    fontSize: size * 0.78,
    letterSpacing: -size * 0.02,
    lineHeight: size,
  } as const;

  if (variant === 'mark') {
    return <Mark size={size} ink={ink} amber={amber} />;
  }
  if (variant === 'wordmark') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ ...wordStyle, color: ink }}>hony</Text>
        <Text style={{ ...wordStyle, color: amber }}>ai</Text>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Mark size={size} ink={ink} amber={amber} />
      <View style={{ width: size * 0.28 }} />
      <Text style={{ ...wordStyle, color: ink }}>hony</Text>
      <Text style={{ ...wordStyle, color: amber }}>ai</Text>
    </View>
  );
}

export default HonyaiLogo;
