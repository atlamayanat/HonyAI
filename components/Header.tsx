import React from 'react';
import { View, Text } from 'react-native';
import { TabName, User } from '../types';

interface HeaderProps {
  currentTab: TabName;
  user?: User | null;
}

function Header({ currentTab, user }: HeaderProps) {
  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'Ana Sayfa': return 'honyAI Health';
      case 'Sağlık': return 'Sağlık Takibi';
      case 'Arama': return 'Arama';
      case 'Profil': return 'Profilim';
      case 'Ayarlar': return 'Ayarlar';
      default: return 'honyAI Health';
    }
  };

  const name = user?.name ?? 'Ahmet BÜYÜK';
  const initial = (name.trim()[0] || 'A').toUpperCase();
  const idText = user ? `ID: ${user.id} • ${user.diabetesType}` : 'ID: 66357 • Tip 2 Diyabet';

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 24,
      paddingVertical: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: '#10B981',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
          shadowColor: '#10B981',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>{initial}</Text>
        </View>
        <View style={{ flexShrink: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }} numberOfLines={1}>{name}</Text>
          <Text style={{ fontSize: 14, color: '#6B7280' }} numberOfLines={1}>{idText}</Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 16, fontWeight: '900', color: '#10B981' }}>{getHeaderTitle()}</Text>
      </View>
    </View>
  );
}

export default Header;
