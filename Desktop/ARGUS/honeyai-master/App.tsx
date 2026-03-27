import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';

import Header from './components/Header';
import ModernTabBar from './components/ModernTabBar';
import HomePage from './screens/HomePage';
import HealthPage from './screens/HealthPage';
import SearchPage from './screens/SearchPage';
import ProfilePage from './screens/ProfilePage';
import SettingsPage from './screens/SettingsPage';
import { TabName } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabName>('Ana Sayfa');

  const renderContent = () => {
    switch (currentTab) {
      case 'Ana Sayfa':
        return <HomePage />;
      case 'Sağlık':
        return <HealthPage />;
      case 'Arama':
        return <SearchPage />;
      case 'Profil':
        return <ProfilePage />;
      case 'Ayarlar':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header currentTab={currentTab} />
      
      {renderContent()}

      <ModernTabBar currentTab={currentTab} onTabPress={setCurrentTab} />
    </SafeAreaView>
  );
}