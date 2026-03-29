import React from 'react';
import { View, Text } from 'react-native';
import { Level } from '../../types';
import { getLevelConfig } from '../../utils/helpers';

interface ModernGlucoseCardProps {
  value: number;
  level: Level;
}

function ModernGlucoseCard({ value, level }: ModernGlucoseCardProps) {
  const config = getLevelConfig(level);
  
  return (
    <View style={{ marginTop: 24 }}>
      <View style={{
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 32,
        alignItems: 'center',
        backgroundColor: config.color,
        shadowColor: config.color,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
      }}>
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginBottom: 16
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>{config.message}</Text>
        </View>
        
        <Text style={{ color: '#FFFFFF', fontSize: 72, fontWeight: '900', marginBottom: 8 }}>{value}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: '500' }}>mg/dL</Text>
        
        <View style={{
          marginTop: 16,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 20,
          paddingHorizontal: 24,
          paddingVertical: 8
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '500' }}>
            Son ölçüm: Bugün 14:30
          </Text>
        </View>
      </View>
    </View>
  );
}

export default ModernGlucoseCard;