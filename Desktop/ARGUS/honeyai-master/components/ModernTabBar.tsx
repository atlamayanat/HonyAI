import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { TabName, TabItem } from '../types';

interface ModernTabBarProps {
  currentTab: TabName;
  onTabPress: (tab: TabName) => void;
}

function ModernTabBar({ currentTab, onTabPress }: ModernTabBarProps) {
  const tabs: TabItem[] = [
    { icon: '🏠', label: 'Ana Sayfa' },
    { icon: '❤️', label: 'Sağlık' },
    { icon: '🔍', label: 'Arama' },
    { icon: '👤', label: 'Profil' },
    { icon: '⚙️', label: 'Ayarlar' },
  ];

  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 24 : 12
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {tabs.map((tab, index) => (
          <TouchableOpacity 
            key={index} 
            style={{ alignItems: 'center', paddingVertical: 8 }} 
            activeOpacity={0.7}
            onPress={() => onTabPress(tab.label)}
          >
            <View style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: tab.label === currentTab ? '#F0FDF4' : 'transparent'
            }}>
              <Text style={{ fontSize: 20 }}>{tab.icon}</Text>
            </View>
            <Text style={{
              fontSize: 12,
              marginTop: 4,
              color: tab.label === currentTab ? '#10B981' : '#6B7280',
              fontWeight: tab.label === currentTab ? 'bold' : '500'
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default ModernTabBar;