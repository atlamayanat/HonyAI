import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface QuickActionsProps {
  onAddFood?: () => void;
  onAddExercise?: () => void;
}

function QuickActions({ onAddFood, onAddExercise }: QuickActionsProps) {
  const actions = [
    { icon: '🍽️', title: 'Besin Ekle',         color: '#10B981', onPress: onAddFood },
    { icon: '🏃‍♂️', title: 'Hareket Verisi Ekle', color: '#3B82F6', onPress: onAddExercise },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          onPress={action.onPress}
          style={{
            flex: 1,
            backgroundColor: action.color,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            shadowColor: action.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 24, marginBottom: 4 }}>{action.icon}</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
            {action.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default QuickActions;
