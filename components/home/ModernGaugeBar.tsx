import React from 'react';
import { View, Text } from 'react-native';
import { Level } from '../../types';
import { getLevelConfig } from '../../utils/helpers';

interface ModernGaugeBarProps {
  level: Level;
  targetMax?: number;
}

function ModernGaugeBar({ level, targetMax = 140 }: ModernGaugeBarProps) {
  const config = getLevelConfig(level);
  const warnMax = targetMax + 40;

  return (
    <View style={{
      marginTop: 16,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: '#F3F4F6'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>Değer Aralığı</Text>
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
          backgroundColor: '#F3F4F6'
        }}>
          <View style={{ flex: 1, height: 12, backgroundColor: '#10B981' }} />
          <View style={{ flex: 1, height: 12, backgroundColor: '#F59E0B' }} />
          <View style={{ flex: 1, height: 12, backgroundColor: '#EF4444' }} />
        </View>

        <View style={{
          position: 'absolute',
          top: 0,
          width: 4,
          height: 12,
          borderRadius: 2,
          backgroundColor: config.color,
          shadowColor: config.color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 4,
          elevation: 4,
          left: level === 'Normal' ? '16%' : level === 'Dikkat Edilmeli' ? '50%' : '83%'
        }} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
        <Text style={{ fontSize: 12, fontWeight: '500', color: '#10B981' }}>{`0-${targetMax}`}</Text>
        <Text style={{ fontSize: 12, fontWeight: '500', color: '#F59E0B' }}>{`${targetMax}-${warnMax}`}</Text>
        <Text style={{ fontSize: 12, fontWeight: '500', color: '#EF4444' }}>{`${warnMax}+`}</Text>
      </View>
    </View>
  );
}

export default ModernGaugeBar;
