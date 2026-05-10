import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { TabName, TabItem } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface ModernTabBarProps {
  currentTab: TabName;
  onTabPress: (tab: TabName) => void;
}

function ModernTabBar({ currentTab, onTabPress }: ModernTabBarProps) {
  const { theme } = useTheme();
  const tabs: TabItem[] = [
    { icon: '🏠', label: 'Ana Sayfa' },
    { icon: '❤️', label: 'Sağlık' },
    { icon: '🍎', label: 'Beslenme' },
    { icon: '👤', label: 'Profil' },
    { icon: '⚙️', label: 'Ayarlar' },
  ];

  return (
    <View style={{
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 24 : 12
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {tabs.map((tab, index) => {
          const active = tab.label === currentTab;
          return (
            <TouchableOpacity
              key={index}
              style={{ alignItems: 'center', paddingVertical: 8 }}
              activeOpacity={0.7}
              onPress={() => onTabPress(tab.label)}
            >
              <View style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: active ? theme.accentSoft : 'transparent'
              }}>
                <Text style={{ fontSize: 20 }}>{tab.icon}</Text>
              </View>
              <Text style={{
                fontSize: 12,
                marginTop: 4,
                color: active ? theme.accent : theme.textSecondary,
                fontWeight: active ? 'bold' : '500'
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default ModernTabBar;
