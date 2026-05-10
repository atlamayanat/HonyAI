import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Settings } from '../../types';
import { getSettings, updateSettings } from '../../api/client';
import { useTheme } from '../../theme/ThemeContext';
import { ThemeTokens, radius, spacing } from '../../theme/tokens';

function SettingsPage() {
  const { theme, setMode } = useTheme();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reminderInputs, setReminderInputs] = useState<string[]>(['', '', '']);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getSettings();
      setSettings(s);
      setMode(s.darkMode ? 'dark' : 'light');
      const padded = [...s.reminderTimes];
      while (padded.length < 3) padded.push('');
      setReminderInputs(padded.slice(0, 3));
    } catch (e: any) {
      setError(e?.message || 'Ayarlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [setMode]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = async (patch: Partial<Settings>) => {
    if (!settings) return;
    const optimistic = { ...settings, ...patch };
    setSettings(optimistic);
    if (patch.darkMode !== undefined) {
      setMode(patch.darkMode ? 'dark' : 'light');
    }
    setSaving(true);
    try {
      const saved = await updateSettings(patch);
      setSettings(saved);
    } catch (e: any) {
      setSettings(settings);
      if (patch.darkMode !== undefined) {
        setMode(settings.darkMode ? 'dark' : 'light');
      }
      Alert.alert('Kaydedilemedi', e?.message || 'Sunucu hatası');
    } finally {
      setSaving(false);
    }
  };

  const saveReminderTimes = () => {
    const cleaned = reminderInputs
      .map((s) => s.trim())
      .filter((s) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(s));
    if (cleaned.length === 0) {
      Alert.alert('Geçersiz saat', 'En az bir geçerli saat girin (HH:MM).');
      return;
    }
    persist({ reminderTimes: cleaned });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (error || !settings) {
    return (
      <View style={{ flex: 1, padding: spacing.lg, backgroundColor: theme.bg }}>
        <View style={{
          backgroundColor: theme.dangerSoft,
          borderRadius: radius.md,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: theme.danger,
        }}>
          <Text style={{ color: theme.danger, fontWeight: '700', fontSize: 15 }}>Ayarlar yüklenemedi</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>{error}</Text>
          <TouchableOpacity
            onPress={load}
            style={{
              marginTop: spacing.md,
              backgroundColor: theme.danger,
              borderRadius: radius.sm,
              paddingVertical: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: theme.textOnDark, fontWeight: '600' }}>Tekrar dene</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
    >
      <SectionTitle theme={theme}>Genel</SectionTitle>

      <Card theme={theme}>
        <Row
          theme={theme}
          title="Bildirimler"
          subtitle="Ölçüm hatırlatıcıları"
          right={
            <Switch
              value={settings.remindersEnabled}
              onValueChange={(v) => persist({ remindersEnabled: v })}
              trackColor={{ true: theme.accent, false: theme.trackOff }}
              thumbColor={theme.surface}
            />
          }
        />
        <Row
          theme={theme}
          title="Koyu Mod"
          subtitle="Arayüzü koyu temaya geçir"
          right={
            <Switch
              value={settings.darkMode}
              onValueChange={(v) => persist({ darkMode: v })}
              trackColor={{ true: theme.accent, false: theme.trackOff }}
              thumbColor={theme.surface}
            />
          }
          last
        />
      </Card>

      <SectionTitle theme={theme}>Dil</SectionTitle>
      <Card theme={theme}>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(['tr', 'en'] as const).map((lang) => {
            const active = settings.language === lang;
            return (
              <TouchableOpacity
                key={lang}
                onPress={() => persist({ language: lang })}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  borderRadius: radius.sm,
                  backgroundColor: active ? theme.accent : theme.surfaceAlt,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: active ? theme.accent : theme.border,
                }}
              >
                <Text style={{
                  color: active ? theme.accentText : theme.textPrimary,
                  fontWeight: '600',
                }}>
                  {lang === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <SectionTitle theme={theme}>Ölçüm Hatırlatıcıları</SectionTitle>
      <Card theme={theme}>
        <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: spacing.md }}>
          Saat formatı: HH:MM (örn. 08:00, 13:30)
        </Text>
        {reminderInputs.map((val, idx) => (
          <View key={idx} style={{ marginBottom: spacing.sm }}>
            <TextInput
              value={val}
              onChangeText={(text) => {
                const next = [...reminderInputs];
                next[idx] = text;
                setReminderInputs(next);
              }}
              placeholder={`Hatırlatıcı ${idx + 1} — örn. ${['08:00', '13:00', '20:00'][idx]}`}
              placeholderTextColor={theme.textMuted}
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.surfaceAlt,
                borderRadius: radius.sm,
                paddingHorizontal: spacing.md,
                paddingVertical: 10,
                fontSize: 15,
                color: theme.textPrimary,
              }}
            />
          </View>
        ))}
        <TouchableOpacity
          onPress={saveReminderTimes}
          disabled={saving}
          style={{
            marginTop: spacing.sm,
            paddingVertical: spacing.md,
            borderRadius: radius.sm,
            backgroundColor: theme.accent,
            alignItems: 'center',
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Text style={{ color: theme.accentText, fontWeight: '600' }}>
            {saving ? 'Kaydediliyor...' : 'Hatırlatıcıları Kaydet'}
          </Text>
        </TouchableOpacity>
      </Card>

      <SectionTitle theme={theme}>Hakkında</SectionTitle>
      <Card theme={theme}>
        <Row theme={theme} title="Uygulama" subtitle="HoneyAI Health" right={null} />
        <Row theme={theme} title="Sürüm" subtitle="1.0.0 (Demo)" right={null} last />
      </Card>
    </ScrollView>
  );
}

function SectionTitle({ theme, children }: { theme: ThemeTokens; children: React.ReactNode }) {
  return (
    <Text style={{
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    }}>
      {children}
    </Text>
  );
}

function Card({ theme, children }: { theme: ThemeTokens; children: React.ReactNode }) {
  return (
    <View style={{
      backgroundColor: theme.surface,
      borderRadius: radius.md,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: theme.border,
    }}>
      {children}
    </View>
  );
}

function Row({ theme, title, subtitle, right, last }: {
  theme: ThemeTokens;
  title: string;
  subtitle?: string;
  right: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: theme.border,
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: theme.textPrimary }}>{title}</Text>
        {subtitle && (
          <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{subtitle}</Text>
        )}
      </View>
      {right}
    </View>
  );
}

export default SettingsPage;
