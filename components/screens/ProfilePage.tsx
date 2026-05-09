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
import { GlucoseReading, User } from '../../types';
import { getReadings, updateUser } from '../../api/client';

interface ProfilePageProps {
  user: User | null;
  refreshKey: number;
  onUserChanged: (user: User) => void;
}

function ProfilePage({ user, refreshKey, onUserChanged }: ProfilePageProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [targetMin, setTargetMin] = useState('');
  const [targetMax, setTargetMax] = useState('');
  const [saving, setSaving] = useState(false);

  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>Profil yükleniyor...</Text>
      </View>
    );
  }

  const initial = (user.name.trim()[0] || 'A').toUpperCase();

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
      <View style={{
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
      }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#10B981',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12,
          shadowColor: '#10B981',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }}>
          <Text style={{ color: '#FFF', fontSize: 32, fontWeight: '900' }}>{initial}</Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>{user.name}</Text>
        <View style={{
          flexDirection: 'row',
          gap: 6,
          marginTop: 8,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <View style={{
            backgroundColor: '#FEF3C7',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}>
            <Text style={{ fontSize: 12, color: '#92400E', fontWeight: '600' }}>
              {user.diabetesType}
            </Text>
          </View>
          <View style={{
            backgroundColor: '#DBEAFE',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}>
            <Text style={{ fontSize: 12, color: '#1E40AF', fontWeight: '600' }}>
              ID: {user.id}
            </Text>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 24, marginBottom: 12 }}>
        Son 30 gün
      </Text>
      {loadingStats ? (
        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
          <ActivityIndicator color="#10B981" />
        </View>
      ) : stats ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: 'Ortalama', value: `${stats.avg} mg/dL`, color: '#3B82F6' },
            { label: 'En düşük', value: `${stats.min} mg/dL`, color: '#10B981' },
            { label: 'En yüksek', value: `${stats.max} mg/dL`, color: '#EF4444' },
            { label: 'Toplam ölçüm', value: String(stats.count), color: '#8B5CF6' },
          ].map((s) => (
            <View key={s.label} style={{
              width: '48%',
              backgroundColor: '#FFF',
              borderRadius: 12,
              padding: 14,
              borderWidth: 1,
              borderColor: '#F3F4F6',
            }}>
              <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>{s.label}</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: s.color }}>{s.value}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ color: '#6B7280', fontSize: 13 }}>Henüz ölçüm yok.</Text>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>Bilgiler</Text>
        <TouchableOpacity
          onPress={() => (editing ? handleSave() : setEditing(true))}
          disabled={saving}
          style={{ marginLeft: 'auto' }}
        >
          <Text style={{ color: '#10B981', fontWeight: '600' }}>
            {saving ? 'Kaydediliyor...' : editing ? 'Kaydet' : 'Düzenle'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
      }}>
        <Field label="İsim">
          {editing ? (
            <TextInput
              value={name}
              onChangeText={setName}
              style={fieldInput}
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <Text style={fieldValue}>{user.name}</Text>
          )}
        </Field>

        <Field label="Yaş">
          {editing ? (
            <TextInput
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              style={fieldInput}
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <Text style={fieldValue}>{user.age}</Text>
          )}
        </Field>

        <Field label="Diyabet Tipi">
          <Text style={fieldValue}>{user.diabetesType}</Text>
        </Field>

        <Field label="Hedef Min (mg/dL)">
          {editing ? (
            <TextInput
              value={targetMin}
              onChangeText={setTargetMin}
              keyboardType="numeric"
              style={fieldInput}
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <Text style={fieldValue}>{user.targetMin}</Text>
          )}
        </Field>

        <Field label="Hedef Max (mg/dL)" last>
          {editing ? (
            <TextInput
              value={targetMax}
              onChangeText={setTargetMax}
              keyboardType="numeric"
              style={fieldInput}
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <Text style={fieldValue}>{user.targetMax}</Text>
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
            backgroundColor: '#F3F4F6',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#374151', fontWeight: '600' }}>İptal</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function Field({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: '#F3F4F6',
    }}>
      <Text style={{ fontSize: 14, color: '#6B7280', flex: 1 }}>{label}</Text>
      <View style={{ flex: 1.4, alignItems: 'flex-end' }}>{children}</View>
    </View>
  );
}

const fieldValue = {
  fontSize: 15,
  color: '#111827',
  fontWeight: '600' as const,
};

const fieldInput = {
  fontSize: 15,
  color: '#111827',
  fontWeight: '600' as const,
  borderWidth: 1,
  borderColor: '#D1D5DB',
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 6,
  minWidth: 120,
  textAlign: 'right' as const,
};

export default ProfilePage;
