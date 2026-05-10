import React from 'react';
import { View, Text } from 'react-native';
import { TabName } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface HeaderProps {
  currentTab: TabName;
}

function Header({ currentTab }: HeaderProps) {
  const { theme } = useTheme();

  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'Ana Sayfa': return 'honyAI Health';
      case 'Sağlık': return 'Sağlık Takibi';
      case 'Beslenme': return 'Beslenme';
      case 'Profil': return 'Profilim';
      case 'Ayarlar': return 'Ayarlar';
      default: return 'honyAI Health';
    }
  };

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface,
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    }}>
      <Text style={{ fontSize: 18, fontWeight: '900', color: theme.accent }}>
        {getHeaderTitle()}
      </Text>
    </View>
  );
}

export default Header;
