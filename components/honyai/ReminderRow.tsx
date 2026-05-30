import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { mulish } from './typography';

interface Props {
  title: string;
  time: string;
  done?: boolean;
  onToggle?: () => void;
}

function ReminderRow({ title, time, done = false, onToggle }: Props) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={onToggle ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 13,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          backgroundColor: done ? theme.accent : 'transparent',
          borderWidth: done ? 0 : 1.5,
          borderColor: theme.textSecondary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {done ? (
          <Text
            style={{
              fontSize: 13,
              color: theme.accentText,
              fontFamily: mulish[800],
              lineHeight: 14,
            }}
          >
            ✓
          </Text>
        ) : null}
      </View>
      <Text
        style={{
          flex: 1,
          marginLeft: 12,
          fontFamily: mulish[700],
          fontSize: 14,
          color: done ? theme.textMuted : theme.textPrimary,
          textDecorationLine: done ? 'line-through' : 'none',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: mulish[700],
          fontSize: 13,
          color: theme.textSecondary,
        }}
      >
        {time}
      </Text>
    </TouchableOpacity>
  );
}

export default ReminderRow;
