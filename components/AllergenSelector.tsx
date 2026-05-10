import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ALLERGEN_OPTIONS, AllergenId } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface AllergenSelectorProps {
  selected: AllergenId[];
  onChange: (next: AllergenId[]) => void;
  disabled?: boolean;
}

function AllergenSelector({ selected, onChange, disabled }: AllergenSelectorProps) {
  const { theme } = useTheme();

  const toggle = (id: AllergenId) => {
    if (disabled) return;
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {ALLERGEN_OPTIONS.map((opt) => {
        const active = selected.includes(opt.id);
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => toggle(opt.id)}
            disabled={disabled}
            activeOpacity={0.75}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: active ? theme.danger : theme.border,
              backgroundColor: active ? theme.dangerSoft : theme.surfaceAlt,
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 6 }}>{opt.icon}</Text>
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: active ? theme.danger : theme.textPrimary,
            }}>
              {opt.label}
            </Text>
            {active && (
              <Text style={{ fontSize: 12, color: theme.danger, marginLeft: 6 }}>✕</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default AllergenSelector;
