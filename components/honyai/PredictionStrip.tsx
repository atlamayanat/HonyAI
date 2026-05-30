import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { mulish } from './typography';

interface Props {
  predictedValue: number;
  unit?: string;
  message?: string;
  horizonLabel?: string;
  onPress?: () => void;
}

function PredictionStrip({
  predictedValue,
  unit = 'mg/dL',
  message = 'hafif yükseliş bekleniyor',
  horizonLabel = '2 saat',
  onPress,
}: Props) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        backgroundColor: theme.accentSoft,
        borderRadius: 14,
        paddingVertical: 12,
        paddingLeft: 12,
        paddingRight: 14,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: theme.accent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 18 }}>✦</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{
            fontFamily: mulish[800],
            fontSize: 11,
            color: theme.accent,
            letterSpacing: 0.6,
          }}
        >
          AI TAHMİNİ · {horizonLabel.toUpperCase()}
        </Text>
        <Text
          style={{
            fontFamily: mulish[700],
            fontSize: 14,
            color: theme.textPrimary,
            marginTop: 2,
          }}
        >
          {predictedValue} {unit} ·{' '}
          <Text style={{ fontFamily: mulish[600] }}>{message}</Text>
        </Text>
      </View>
      <Text style={{ color: theme.accent, fontSize: 22, marginLeft: 4 }}>›</Text>
    </TouchableOpacity>
  );
}

export default PredictionStrip;
