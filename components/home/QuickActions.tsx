import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ThemeTokens } from '../../theme/tokens';

interface QuickActionsProps {
  onAddFood?: () => void;
  onAddExercise?: () => void;
  onAddMedication?: () => void;
}

type SwatchKey = 'swatchTerracotta' | 'swatchSage' | 'swatchDustyRose';

function QuickActions({ onAddFood, onAddExercise, onAddMedication }: QuickActionsProps) {
  const { theme } = useTheme();

  const actions: { icon: string; title: string; colorKey: SwatchKey; onPress?: () => void }[] = [
    { icon: '🍽️', title: 'Besin',  colorKey: 'swatchTerracotta', onPress: onAddFood },
    { icon: '🏃‍♂️', title: 'Hareket', colorKey: 'swatchSage',       onPress: onAddExercise },
    { icon: '💊',  title: 'İlaç',   colorKey: 'swatchDustyRose',  onPress: onAddMedication },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
      {actions.map((action, index) => {
        const bg = (theme as ThemeTokens)[action.colorKey];
        return (
          <TouchableOpacity
            key={index}
            onPress={action.onPress}
            style={{
              flex: 1,
              backgroundColor: bg,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>{action.icon}</Text>
            <Text style={{ color: theme.textOnDark, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
              {action.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default QuickActions;
