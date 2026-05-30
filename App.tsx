import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, Platform, View, Text, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Mulish_400Regular,
  Mulish_500Medium,
  Mulish_600SemiBold,
  Mulish_700Bold,
  Mulish_800ExtraBold,
} from '@expo-google-fonts/mulish';
import {
  Newsreader_500Medium,
  Newsreader_700Bold,
} from '@expo-google-fonts/newsreader';

import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import ModernTabBar from './components/ModernTabBar';
import HomePage from './components/screens/HomePage';
import HealthPage from './components/screens/HealthPage';
import NutritionPage from './components/screens/NutritionPage';
import ProfilePage from './components/screens/ProfilePage';
import SettingsPage from './components/screens/SettingsPage';
import { TabName, User } from './types';
import { API_BASE, getUser, getSettings } from './api/client';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

export default function App() {
  const [initialMode, setInitialMode] = useState<'light' | 'dark'>('light');
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [fontsLoaded] = useFonts({
    Mulish_400Regular,
    Mulish_500Medium,
    Mulish_600SemiBold,
    Mulish_700Bold,
    Mulish_800ExtraBold,
    Newsreader_500Medium,
    Newsreader_700Bold,
  });

  useEffect(() => {
    getSettings()
      .then((s) => setInitialMode(s.darkMode ? 'dark' : 'light'))
      .catch(() => {})
      .finally(() => setSettingsLoaded(true));
  }, []);

  if (!settingsLoaded || !fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <ThemeProvider initialMode={initialMode}>
        <AppInner />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function AppInner() {
  const { theme } = useTheme();
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: theme.bg }}>
          <Text style={{ fontSize: 32, marginBottom: 12 }}>⏳</Text>
          <Text style={{ color: theme.textSecondary }}>Bağlanıyor...</Text>
          <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 12 }}>{API_BASE}</Text>
        </View>
      );
    }
    if (userError && !user) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.bg }}>
          <View style={{
            backgroundColor: theme.dangerSoft,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.danger,
          }}>
            <Text style={{ color: theme.danger, fontWeight: '700', fontSize: 16, marginBottom: 6 }}>
              Backend'e bağlanılamadı
            </Text>
            <Text style={{ color: theme.textPrimary, fontSize: 13, marginBottom: 8 }}>{userError}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>API adresi:</Text>
            <Text style={{ color: theme.textPrimary, fontSize: 12, fontWeight: '600', marginBottom: 12 }} selectable>
              {API_BASE}
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 11, lineHeight: 16 }}>
              • Bilgisayarda backend çalışıyor mu? (`node backend/server.js`){'\n'}
              • Telefonun bu adrese erişimi var mı? (Tarayıcıdan {API_BASE}/api/health açıp test et){'\n'}
              • Aynı Wi-Fi'da mısınız? Windows Firewall 3001 portuna izin verdi mi?
            </Text>
            <TouchableOpacity
              onPress={loadUser}
              style={{
                marginTop: 12,
                backgroundColor: theme.danger,
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: theme.textOnDark, fontWeight: '600' }}>Tekrar dene</Text>
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
      case 'Beslenme':
        return <NutritionPage user={user} refreshKey={refreshKey} />;
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
        backgroundColor: theme.bg,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
      />
      <Header currentTab={currentTab} />
      {renderContent()}
      <ModernTabBar currentTab={currentTab} onTabPress={setCurrentTab} />
    </SafeAreaView>
  );
}
