import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { QuickAction } from '../../types';

function QuickActions() {
  const actions: QuickAction[] = [
    { icon: '🔄', title: 'Yeniden Ölçüm', color: '#10B981' },
    { icon: '📊', title: 'Geçmiş', color: '#3B82F6' },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
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
            elevation: 6
          }}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 24, marginBottom: 4 }}>{action.icon}</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>{action.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default QuickActions;