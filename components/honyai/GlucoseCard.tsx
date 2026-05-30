import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { mulish } from './typography';
import StatusPill, { GlucoseLevel } from './StatusPill';
import RangeBar from './RangeBar';

interface Props {
  value: number;
  unit?: string;
  lastMeasured?: string;
  level?: GlucoseLevel;
}

function BigHex({ color }: { color: string }) {
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Path
        d="M 60 9.6 L 103.2 33.6 L 103.2 84 L 60 108 L 16.8 84 L 16.8 33.6 Z"
        stroke={color}
        strokeWidth={1.5}
        fill="none"
      />
    </Svg>
  );
}

function GlucoseCard({
  value,
  unit = 'mg/dL',
  lastMeasured = 'Bugün',
  level = 'ok',
}: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.border,
        paddingHorizontal: 22,
        paddingTop: 20,
        paddingBottom: 18,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          right: -10,
          top: -10,
          opacity: 0.08,
        }}
      >
        <BigHex color={theme.accent} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <StatusPill level={level} />
        <Text
          style={{
            fontFamily: mulish[600],
            fontSize: 12,
            color: theme.textSecondary,
          }}
        >
          {lastMeasured}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          marginTop: 18,
        }}
      >
        <Text
          style={{
            fontFamily: mulish[800],
            fontSize: 84,
            color: theme.textPrimary,
            letterSpacing: -3.5,
            lineHeight: 80,
          }}
        >
          {value}
        </Text>
        <Text
          style={{
            fontFamily: mulish[600],
            fontSize: 16,
            color: theme.textSecondary,
            marginLeft: 8,
            marginBottom: 12,
          }}
        >
          {unit}
        </Text>
      </View>

      <View style={{ marginTop: 14 }}>
        <RangeBar value={value} />
      </View>
    </View>
  );
}

export default GlucoseCard;
