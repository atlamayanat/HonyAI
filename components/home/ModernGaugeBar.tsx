import React from 'react';
import { View, Text } from 'react-native';
import { Level } from '../../types';
import { getLevelConfig } from '../../utils/helpers';
import { useTheme } from '../../theme/ThemeContext';

interface ModernGaugeBarProps {
  level: Level;
  targetMax?: number;
}

function ModernGaugeBar({ level, targetMax = 140 }: ModernGaugeBarProps) {
  const { theme } = useTheme();
  const config = getLevelConfig(level, theme);
  const warnMax = targetMax + 40;

  return (
    <View style={{
      marginTop: 16,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textPrimary }}>Değer Aralığı</Text>
        <View style={{ marginLeft: 'auto' }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: config.color }}>
            {config.icon} {level}
          </Text>
        </View>
      </View>

      <View style={{ position: 'relative' }}>
        <View style={{
          flexDirection: 'row',
          height: 12,
          borderRadius: 6,
          overflow: 'hidden',
          backgroundColor: theme.surfaceAlt,
        }}>
          <View style={{ flex: 1, height: 12, backgroundColor: theme.levelNormal }} />
          <View style={{ flex: 1, height: 12, backgroundColor: theme.levelWarning }} />
          <View style={{ flex: 1, height: 12, backgroundColor: theme.levelDanger }} />
        </View>

        <View style={{
          position: 'absolute',
          top: 0,
          width: 4,
          height: 12,
          borderRadius: 2,
          backgroundColor: theme.textPrimary,
          left: level === 'Normal' ? '16%' : level === 'Dikkat Edilmeli' ? '50%' : '83%',
        }} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
        <Text style={{ fontSize: 12, fontWeight: '500', color: theme.levelNormal }}>{`0-${targetMax}`}</Text>
        <Text style={{ fontSize: 12, fontWeight: '500', color: theme.levelWarning }}>{`${targetMax}-${warnMax}`}</Text>
        <Text style={{ fontSize: 12, fontWeight: '500', color: theme.levelDanger }}>{`${warnMax}+`}</Text>
      </View>
    </View>
  );
}

export default ModernGaugeBar;
