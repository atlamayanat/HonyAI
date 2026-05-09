import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, Platform, View, Text, TouchableOpacity } from 'react-native';

import Header from './components/Header';
import ModernTabBar from './components/ModernTabBar';
import HomePage from './components/screens/HomePage';
import HealthPage from './components/screens/HealthPage';
import SearchPage from './components/screens/SearchPage';
import ProfilePage from './components/screens/ProfilePage';
import SettingsPage from './components/screens/SettingsPage';
import { TabName, User } from './types';
import { API_BASE, getUser } from './api/client';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabName>('Ana Sayfa');
  const [user, setUser] = useState<User | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadUser = useCallback(async () => {
    setLoadingUser(true);
    setUserError(null);
    try {
      const u = await getUser();
      setUser(u);
    } catch (e: any) {
      setUserError(e?.message || 'Bağlantı kurulamadı');
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser, refreshKey]);

  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const renderContent = () => {
    if (loadingUser && !user) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 32, marginBottom: 12 }}>⏳</Text>
          <Text style={{ color: '#6B7280' }}>Bağlanıyor...</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 12 }}>{API_BASE}</Text>
        </View>
      );
    }
    if (userError && !user) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
          <View style={{
            backgroundColor: '#FEF2F2',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: '#FECACA',
          }}>
            <Text style={{ color: '#991B1B', fontWeight: '700', fontSize: 16, marginBottom: 6 }}>
              Backend'e bağlanılamadı
            </Text>
            <Text style={{ color: '#991B1B', fontSize: 13, marginBottom: 8 }}>{userError}</Text>
            <Text style={{ color: '#7F1D1D', fontSize: 12 }}>API adresi:</Text>
            <Text style={{ color: '#111827', fontSize: 12, fontWeight: '600', marginBottom: 12 }} selectable>
              {API_BASE}
            </Text>
            <Text style={{ color: '#7F1D1D', fontSize: 11, lineHeight: 16 }}>
              • Bilgisayarda backend çalışıyor mu? (`node backend/server.js`){'\n'}
              • Telefonun bu adrese erişimi var mı? (Tarayıcıdan {API_BASE}/api/health açıp test et){'\n'}
              • Aynı Wi-Fi'da mısınız? Windows Firewall 3001 portuna izin verdi mi?
            </Text>
            <TouchableOpacity
              onPress={loadUser}
              style={{
                marginTop: 12,
                backgroundColor: '#EF4444',
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '600' }}>Tekrar dene</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    switch (currentTab) {
      case 'Ana Sayfa':
        return (
          <HomePage
            user={user}
            onNavigate={setCurrentTab}
            refreshKey={refreshKey}
            onDataChanged={triggerRefresh}
          />
        );
      case 'Sağlık':
        return (
          <HealthPage
            user={user}
            refreshKey={refreshKey}
            onDataChanged={triggerRefresh}
          />
        );
      case 'Arama':
        return <SearchPage />;
      case 'Profil':
        return (
          <ProfilePage
            user={user}
            refreshKey={refreshKey}
            onUserChanged={(u) => {
              setUser(u);
              triggerRefresh();
            }}
          />
        );
      case 'Ayarlar':
        return <SettingsPage />;
      default:
        return (
          <HomePage
            user={user}
            onNavigate={setCurrentTab}
            refreshKey={refreshKey}
            onDataChanged={triggerRefresh}
          />
        );
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header currentTab={currentTab} user={user} />
      {renderContent()}
      <ModernTabBar currentTab={currentTab} onTabPress={setCurrentTab} />
    </SafeAreaView>
  );
}
