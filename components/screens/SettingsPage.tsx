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

function SettingsPage() {
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
      const padded = [...s.reminderTimes];
      while (padded.length < 3) padded.push('');
      setReminderInputs(padded.slice(0, 3));
    } catch (e: any) {
      setError(e?.message || 'Ayarlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persist = async (patch: Partial<Settings>) => {
    if (!settings) return;
    const optimistic = { ...settings, ...patch };
    setSettings(optimistic);
    setSaving(true);
    try {
      const saved = await updateSettings(patch);
      setSettings(saved);
    } catch (e: any) {
      setSettings(settings);
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (error || !settings) {
    return (
      <View style={{ padding: 16 }}>
        <View style={{
          backgroundColor: '#FEF2F2',
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: '#FECACA',
        }}>
          <Text style={{ color: '#991B1B', fontWeight: '600' }}>Ayarlar yüklenemedi</Text>
          <Text style={{ color: '#991B1B', fontSize: 13, marginTop: 4 }}>{error}</Text>
          <TouchableOpacity
            onPress={load}
            style={{
              marginTop: 12,
              backgroundColor: '#EF4444',
              borderRadius: 8,
              paddingVertical: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Tekrar dene</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 16, marginBottom: 12 }}>
        Genel
      </Text>

      <View style={cardStyle}>
        <Row
          title="Bildirimler"
          subtitle="Ölçüm hatırlatıcıları"
          right={
            <Switch
              value={settings.remindersEnabled}
              onValueChange={(v) => persist({ remindersEnabled: v })}
              trackColor={{ true: '#10B981', false: '#D1D5DB' }}
            />
          }
        />
        <Row
          title="Koyu Mod"
          subtitle="(Demo için yer tutucu)"
          right={
            <Switch
              value={settings.darkMode}
              onValueChange={(v) => persist({ darkMode: v })}
              trackColor={{ true: '#10B981', false: '#D1D5DB' }}
            />
          }
          last
        />
      </View>

      <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 24, marginBottom: 12 }}>
        Dil
      </Text>
      <View style={cardStyle}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['tr', 'en'] as const).map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => persist({ language: lang })}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: settings.language === lang ? '#10B981' : '#F3F4F6',
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: settings.language === lang ? '#FFF' : '#374151',
                fontWeight: '600',
              }}>
                {lang === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 24, marginBottom: 12 }}>
        Ölçüm Hatırlatıcıları
      </Text>
      <View style={cardStyle}>
        <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>
          Saat formatı: HH:MM (örn. 08:00, 13:30)
        </Text>
        {reminderInputs.map((val, idx) => (
          <View key={idx} style={{ marginBottom: 8 }}>
            <TextInput
              value={val}
              onChangeText={(text) => {
                const next = [...reminderInputs];
                next[idx] = text;
                setReminderInputs(next);
              }}
              placeholder={`Hatırlatıcı ${idx + 1} — örn. ${['08:00', '13:00', '20:00'][idx]}`}
              placeholderTextColor="#9CA3AF"
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 15,
                color: '#111827',
              }}
            />
          </View>
        ))}
        <TouchableOpacity
          onPress={saveReminderTimes}
          disabled={saving}
          style={{
            marginTop: 8,
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor: '#10B981',
            alignItems: 'center',
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: '600' }}>
            {saving ? 'Kaydediliyor...' : 'Hatırlatıcıları Kaydet'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 24, marginBottom: 12 }}>
        Hakkında
      </Text>
      <View style={cardStyle}>
        <Row title="Uygulama" subtitle="HoneyAI Health" right={null} />
        <Row title="Sürüm" subtitle="1.0.0 (Demo)" right={null} last />
      </View>
    </ScrollView>
  );
}

function Row({ title, subtitle, right, last }: {
  title: string;
  subtitle?: string;
  right: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: '#F3F4F6',
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>{title}</Text>
        {subtitle && (
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{subtitle}</Text>
        )}
      </View>
      {right}
    </View>
  );
}

const cardStyle = {
  backgroundColor: '#FFF',
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  borderColor: '#F3F4F6',
};

export default SettingsPage;
