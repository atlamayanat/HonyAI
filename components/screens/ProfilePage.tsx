import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ALLERGEN_OPTIONS, AllergenId, GlucoseReading, User } from '../../types';
import { getPreferences, getReadings, updatePreferences, updateUser } from '../../api/client';
import { useTheme } from '../../theme/ThemeContext';
import { ThemeTokens } from '../../theme/tokens';
import AllergenSelector from '../AllergenSelector';

interface ProfilePageProps {
  user: User | null;
  refreshKey: number;
  onUserChanged: (user: User) => void;
}

function ProfilePage({ user, refreshKey, onUserChanged }: ProfilePageProps) {
  const { theme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [targetMin, setTargetMin] = useState('');
  const [targetMax, setTargetMax] = useState('');
  const [saving, setSaving] = useState(false);

  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const [allergens, setAllergens] = useState<AllergenId[]>([]);
  const [savingAllergens, setSavingAllergens] = useState(false);

  useEffect(() => {
    getPreferences()
      .then((p) => setAllergens(p.allergens))
      .catch(() => {});
  }, [refreshKey]);

  const handleAllergensChange = async (next: AllergenId[]) => {
    const previous = allergens;
    setAllergens(next);
    setSavingAllergens(true);
    try {
      await updatePreferences(next);
    } catch (e: any) {
      setAllergens(previous);
      Alert.alert('Kaydedilemedi', e?.message || 'Sunucu hatası');
    } finally {
      setSavingAllergens(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAge(String(user.age));
      setTargetMin(String(user.targetMin));
      setTargetMax(String(user.targetMax));
    }
  }, [user]);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await getReadings(30);
      setReadings(data);
    } catch {
      setReadings([]);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats, refreshKey]);

  const stats = useMemo(() => {
    if (readings.length === 0) return null;
    const values = readings.map((r) => r.value);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    return {
      avg,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }, [readings]);

  const handleSave = async () => {
    const ageNum = parseInt(age, 10);
    const minNum = parseInt(targetMin, 10);
    const maxNum = parseInt(targetMax, 10);

    if (!name.trim()) {
      Alert.alert('Geçersiz', 'İsim boş olamaz.');
      return;
    }
    if (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120) {
      Alert.alert('Geçersiz yaş', '1-120 arasında bir yaş girin.');
      return;
    }
    if (!Number.isFinite(minNum) || !Number.isFinite(maxNum) || minNum >= maxNum) {
      Alert.alert('Geçersiz hedef', 'Min < Max olmalı.');
      return;
    }
    if (minNum < 40 || maxNum > 300) {
      Alert.alert('Geçersiz hedef', 'Hedef aralık 40-300 mg/dL içinde olmalı.');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateUser({
        name: name.trim(),
        age: ageNum,
        targetMin: minNum,
        targetMax: maxNum,
      });
      onUserChanged(updated);
      setEditing(false);
    } catch (e: any) {
      Alert.alert('Kaydedilemedi', e?.message || 'Sunucu hatası');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ marginTop: 12, color: theme.textSecondary }}>Profil yükleniyor...</Text>
      </View>
    );
  }

  const initial = (user.name.trim()[0] || 'A').toUpperCase();

  const statTokens = stats ? [
    { label: 'Ortalama',     value: `${stats.avg} mg/dL`, color: theme.accent,  soft: theme.accentSoft  },
    { label: 'En düşük',     value: `${stats.min} mg/dL`, color: theme.success, soft: theme.successSoft },
    { label: 'En yüksek',    value: `${stats.max} mg/dL`, color: theme.danger,  soft: theme.dangerSoft  },
    { label: 'Toplam ölçüm', value: String(stats.count),  color: theme.warning, soft: theme.warningSoft },
  ] : [];

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
    >
      <View style={{
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: theme.border,
      }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: theme.accent,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <Text style={{ color: theme.accentText, fontSize: 32, fontWeight: '900' }}>{initial}</Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textPrimary }}>{user.name}</Text>
        <View style={{
          flexDirection: 'row',
          gap: 6,
          marginTop: 8,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <View style={{
            backgroundColor: theme.warningSoft,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}>
            <Text style={{ fontSize: 12, color: theme.warning, fontWeight: '600' }}>
              {user.diabetesType}
            </Text>
          </View>
          <View style={{
            backgroundColor: theme.accentSoft,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}>
            <Text style={{ fontSize: 12, color: theme.accent, fontWeight: '600' }}>
              ID: {user.id}
            </Text>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textPrimary, marginTop: 24, marginBottom: 12 }}>
        Son 30 gün
      </Text>
      {loadingStats ? (
        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : stats ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {statTokens.map((s) => (
            <View key={s.label} style={{
              width: '48%',
              backgroundColor: s.soft,
              borderRadius: 12,
              padding: 14,
              borderWidth: 1,
              borderColor: theme.border,
            }}>
              <Text style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 4 }}>{s.label}</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: s.color }}>{s.value}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Henüz ölçüm yok.</Text>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textPrimary }}>Bilgiler</Text>
        <TouchableOpacity
          onPress={() => (editing ? handleSave() : setEditing(true))}
          disabled={saving}
          style={{ marginLeft: 'auto' }}
        >
          <Text style={{ color: theme.accent, fontWeight: '600' }}>
            {saving ? 'Kaydediliyor...' : editing ? 'Kaydet' : 'Düzenle'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.border,
      }}>
        <Field theme={theme} label="İsim">
          {editing ? (
            <TextInput
              value={name}
              onChangeText={setName}
              style={fieldInput(theme)}
              placeholderTextColor={theme.textMuted}
            />
          ) : (
            <Text style={fieldValue(theme)}>{user.name}</Text>
          )}
        </Field>

        <Field theme={theme} label="Yaş">
          {editing ? (
            <TextInput
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              style={fieldInput(theme)}
              placeholderTextColor={theme.textMuted}
            />
          ) : (
            <Text style={fieldValue(theme)}>{user.age}</Text>
          )}
        </Field>

        <Field theme={theme} label="Diyabet Tipi">
          <Text style={fieldValue(theme)}>{user.diabetesType}</Text>
        </Field>

        <Field theme={theme} label="Hedef Min (mg/dL)">
          {editing ? (
            <TextInput
              value={targetMin}
              onChangeText={setTargetMin}
              keyboardType="numeric"
              style={fieldInput(theme)}
              placeholderTextColor={theme.textMuted}
            />
          ) : (
            <Text style={fieldValue(theme)}>{user.targetMin}</Text>
          )}
        </Field>

        <Field theme={theme} label="Hedef Max (mg/dL)" last>
          {editing ? (
            <TextInput
              value={targetMax}
              onChangeText={setTargetMax}
              keyboardType="numeric"
              style={fieldInput(theme)}
              placeholderTextColor={theme.textMuted}
            />
          ) : (
            <Text style={fieldValue(theme)}>{user.targetMax}</Text>
          )}
        </Field>
      </View>

      {editing && (
        <TouchableOpacity
          onPress={() => {
            setEditing(false);
            setName(user.name);
            setAge(String(user.age));
            setTargetMin(String(user.targetMin));
            setTargetMax(String(user.targetMax));
          }}
          style={{
            marginTop: 12,
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor: theme.surfaceAlt,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>İptal</Text>
        </TouchableOpacity>
      )}

      {/* Alerjenler ve Kişisel Tercihler */}
      <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textPrimary, marginTop: 24, marginBottom: 4 }}>
        Alerjenler ve Kişisel Tercihler
      </Text>
      <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 12 }}>
        Beslenme önerilerinde bu besinler hariç tutulur. Beslenme sekmesinden de düzenlenebilir.
      </Text>

      <View style={{
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.border,
      }}>
        <Text style={{
          fontSize: 13,
          fontWeight: '600',
          color: theme.textSecondary,
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          Önerilerde Gösterilmeyecek Besinler
        </Text>
        <AllergenSelector
          selected={allergens}
          onChange={handleAllergensChange}
          disabled={savingAllergens}
        />
        {allergens.length === 0 && (
          <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 12, fontStyle: 'italic' }}>
            Henüz seçim yok — tüm besinler önerilebilir.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

function Field({ theme, label, children, last }: {
  theme: ThemeTokens;
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: theme.border,
    }}>
      <Text style={{ fontSize: 14, color: theme.textSecondary, flex: 1 }}>{label}</Text>
      <View style={{ flex: 1.4, alignItems: 'flex-end' }}>{children}</View>
    </View>
  );
}

const fieldValue = (theme: ThemeTokens) => ({
  fontSize: 15,
  color: theme.textPrimary,
  fontWeight: '600' as const,
});

const fieldInput = (theme: ThemeTokens) => ({
  fontSize: 15,
  color: theme.textPrimary,
  fontWeight: '600' as const,
  borderWidth: 1,
  borderColor: theme.border,
  backgroundColor: theme.surfaceAlt,
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 6,
  minWidth: 120,
  textAlign: 'right' as const,
});

export default ProfilePage;
