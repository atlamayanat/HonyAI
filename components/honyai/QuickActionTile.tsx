import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { mulish } from './typography';

interface Props {
  icon: string;
  label: string;
  color: string;
  onPress?: () => void;
}

function QuickActionTile({ icon, label, color, onPress }: Props) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        backgroundColor: theme.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 12,
        height: 92,
        justifyContent: 'space-between',
        flex: 1,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text
        style={{
          fontFamily: mulish[700],
          fontSize: 14,
          color: theme.textPrimary,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default QuickActionTile;
