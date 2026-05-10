import React from 'react';
import { View, Text } from 'react-native';
import { Level } from '../../types';
import { formatMeasuredAt, getLevelConfig } from '../../utils/helpers';
import { useTheme } from '../../theme/ThemeContext';

interface ModernGlucoseCardProps {
  value: number;
  level: Level;
  measuredAt?: string;
}

function ModernGlucoseCard({ value, level, measuredAt }: ModernGlucoseCardProps) {
  const { theme } = useTheme();
  const config = getLevelConfig(level, theme);
  const timeLabel = measuredAt ? formatMeasuredAt(measuredAt) : 'Henüz ölçüm yok';

  return (
    <View style={{ marginTop: 24 }}>
      <View style={{
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 32,
        alignItems: 'center',
        backgroundColor: config.color,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
      }}>
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginBottom: 16,
        }}>
          <Text style={{ color: theme.textOnDark, fontSize: 14, fontWeight: 'bold' }}>{config.message}</Text>
        </View>

        <Text style={{ color: theme.textOnDark, fontSize: 72, fontWeight: '900', marginBottom: 8 }}>{value}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: '500' }}>mg/dL</Text>

        <View style={{
          marginTop: 16,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 20,
          paddingHorizontal: 24,
          paddingVertical: 8,
        }}>
          <Text style={{ color: theme.textOnDark, fontSize: 12, fontWeight: '500' }}>
            Son ölçüm: {timeLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default ModernGlucoseCard;
