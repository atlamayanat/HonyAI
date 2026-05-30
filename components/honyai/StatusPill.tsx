import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { mulish } from './typography';

export type GlucoseLevel = 'low' | 'ok' | 'warn' | 'high';

interface Props {
  level: GlucoseLevel;
}

function StatusPill({ level }: Props) {
  const { theme } = useTheme();
  let fg: string;
  let bg: string;
  let text: string;
  switch (level) {
    case 'low':
      fg = theme.danger;
      bg = theme.dangerSoft;
      text = 'Düşük';
      break;
    case 'ok':
      fg = theme.success;
      bg = theme.successSoft;
      text = 'Normal aralık';
      break;
    case 'warn':
      fg = theme.warning;
      bg = theme.warningSoft;
      text = 'Yüksek';
      break;
    case 'high':
      fg = theme.danger;
      bg = theme.dangerSoft;
      text = 'Çok yüksek';
      break;
  }
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 999,
        paddingHorizontal: 11,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
      }}
    >
      <View
        style={{
          width: 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: fg,
          marginRight: 6,
        }}
      />
      <Text
        style={{
          fontFamily: mulish[800],
          fontSize: 12,
          color: fg,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

export default StatusPill;
