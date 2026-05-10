import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Activity, GlucoseReading, User } from '../../types';
import {
  addReading,
  deleteActivity,
  deleteReading,
  getActivities,
  getReadings,
} from '../../api/client';
import { formatMeasuredAt, getLevel, getLevelConfig } from '../../utils/helpers';
import { useTheme } from '../../theme/ThemeContext';

interface HealthPageProps {
  user: User | null;
  refreshKey: number;
  onDataChanged: () => void;
}

type Range = 7 | 30;

function HealthPage({ user, refreshKey, onDataChanged }: HealthPageProps) {
  const { theme } = useTheme();
  const [range, setRange] = useState<Range>(7);
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [measureModal, setMeasureModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activityTab, setActivityTab] = useState<'food' | 'exercise'>('food');

  const targetMax = user?.targetMax ?? 140;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, a] = await Promise.all([getReadings(range), getActivities(range)]);
      setReadings(r);
      setActivities(a);
    } catch (e: any) {
      setError(e?.message || 'Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const stats = useMemo(() => {
    if (readings.length === 0) return null;
    const values = readings.map((r) => r.value);
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      avg: Math.round(sum / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }, [readings]);

  const dailyAverages = useMemo(() => {
    const buckets = new Map<string, number[]>();
    readings.forEach((r) => {
      const d = new Date(r.measuredAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(r.value);
    });

    const days: { key: string; date: Date; avg: number }[] = [];
    const now = new Date();
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const arr = buckets.get(key) || [];
      const avg = arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
      days.push({ key, date: d, avg });
    }
    return days;
  }, [readings, range]);

  const chartMax = Math.max(250, ...dailyAverages.map((d) => d.avg));

  const handleSubmitReading = async () => {
    const numeric = parseInt(inputValue, 10);
    if (!Number.isFinite(numeric) || numeric < 20 || numeric > 600) {
      Alert.alert('Geçersiz değer', '20 - 600 mg/dL arasında bir sayı girin.');
      return;
    }
    setSubmitting(true);
    try {
      await addReading(numeric);
      setMeasureModal(false);
      setInputValue('');
      onDataChanged();
    } catch (e: any) {
      Alert.alert('Kaydedilemedi', e?.message || 'Sunucu hatası');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReading = (id: number) => {
    Alert.alert('Ölçümü sil', 'Bu kayıt kalıcı olarak silinecek.', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReading(id);
            onDataChanged();
          } catch (e: any) {
            Alert.alert('Silinemedi', e?.message || 'Sunucu hatası');
          }
        },
      },
    ]);
  };

  const handleDeleteActivity = (id: number) => {
    Alert.alert('Aktiviteyi sil', 'Bu kayıt kalıcı olarak silinecek.', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteActivity(id);
            onDataChanged();
          } catch (e: any) {
            Alert.alert('Silinemedi', e?.message || 'Sunucu hatası');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: GlucoseReading }) => {
    const level = getLevel(item.value, targetMax);
    const config = getLevelConfig(level, theme);
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: theme.surface,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.border,
      }}>
        <View style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: config.color,
          marginRight: 12,
        }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textPrimary }}>
            {item.value}{' '}
            <Text style={{ fontSize: 12, color: theme.textSecondary, fontWeight: '500' }}>mg/dL</Text>
          </Text>
          <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
            {formatMeasuredAt(item.measuredAt)}{item.note ? ` • ${item.note}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteReading(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={{ fontSize: 20, color: theme.textMuted }}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const statTokens = [
    { label: 'Ortalama', value: stats?.avg, color: theme.accent,        soft: theme.accentSoft  },
    { label: 'En düşük', value: stats?.min, color: theme.success,       soft: theme.successSoft },
    { label: 'En yüksek',value: stats?.max, color: theme.danger,        soft: theme.dangerSoft  },
    { label: 'Ölçüm',    value: stats?.count, color: theme.warning,     soft: theme.warningSoft },
  ];

  return (
    <>
      <FlatList
        style={{ backgroundColor: theme.bg }}
        data={readings}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <View>
            {/* Yeni Ölçüm butonu */}
            <TouchableOpacity
              onPress={() => setMeasureModal(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.accent,
                paddingVertical: 14,
                borderRadius: 12,
                marginTop: 16,
              }}
              activeOpacity={0.85}
            >
              <Text style={{ color: theme.accentText, fontSize: 16, marginRight: 6 }}>＋</Text>
              <Text style={{ color: theme.accentText, fontSize: 15, fontWeight: '700' }}>
                Yeni Ölçüm
              </Text>
            </TouchableOpacity>

            {/* Range toggle */}
            <View style={{
              flexDirection: 'row',
              backgroundColor: theme.surfaceAlt,
              borderRadius: 10,
              padding: 4,
              marginTop: 16,
              marginBottom: 16,
            }}>
              {([7, 30] as Range[]).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRange(r)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: range === r ? theme.surface : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    fontWeight: '600',
                    color: range === r ? theme.textPrimary : theme.textSecondary,
                  }}>
                    Son {r} gün
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stats */}
            {stats && (
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {statTokens.map((s) => (
                  <View key={s.label} style={{
                    flex: 1,
                    backgroundColor: s.soft,
                    borderRadius: 10,
                    padding: 10,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: s.color }}>{s.value}</Text>
                    <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>{s.label}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Chart */}
            {dailyAverages.some((d) => d.avg > 0) && (
              <View style={{
                backgroundColor: theme.surface,
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: theme.border,
              }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 12 }}>
                  Günlük ortalama (mg/dL)
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  height: 140,
                  gap: range === 7 ? 6 : 2,
                }}>
                  {dailyAverages.map((d) => {
                    const heightPct = d.avg > 0 ? (d.avg / chartMax) * 100 : 0;
                    const level = d.avg > 0 ? getLevel(d.avg, targetMax) : 'Normal';
                    const color = d.avg === 0 ? theme.surfaceAlt : getLevelConfig(level, theme).color;
                    return (
                      <View key={d.key} style={{ flex: 1, alignItems: 'center', height: '100%' }}>
                        <View style={{ flex: 1, justifyContent: 'flex-end', width: '100%' }}>
                          <View style={{
                            height: `${heightPct}%`,
                            backgroundColor: color,
                            borderTopLeftRadius: 3,
                            borderTopRightRadius: 3,
                            minHeight: d.avg > 0 ? 4 : 2,
                          }} />
                        </View>
                      </View>
                    );
                  })}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ fontSize: 11, color: theme.textMuted }}>
                    {dailyAverages[0]?.date.getDate()}.{(dailyAverages[0]?.date.getMonth() ?? 0) + 1}
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.textMuted }}>Bugün</Text>
                </View>
              </View>
            )}

            {/* Activities — Yemek / Egzersiz tabs */}
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textPrimary, marginBottom: 8 }}>
              Geçmiş
            </Text>
            <View style={{
              flexDirection: 'row',
              backgroundColor: theme.surfaceAlt,
              borderRadius: 10,
              padding: 4,
              marginBottom: 12,
            }}>
              {([
                { id: 'food', label: '🍽️ Yemek' },
                { id: 'exercise', label: '🏃‍♂️ Egzersiz' },
              ] as const).map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setActivityTab(t.id)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: activityTab === t.id ? theme.surface : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    fontWeight: '600',
                    color: activityTab === t.id ? theme.textPrimary : theme.textSecondary,
                  }}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {(() => {
              const filtered = activities.filter((a) => a.type === activityTab);
              if (filtered.length === 0) {
                return (
                  <View style={{
                    paddingVertical: 24,
                    alignItems: 'center',
                    backgroundColor: theme.surface,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: theme.border,
                    marginBottom: 16,
                  }}>
                    <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                      Bu aralıkta {activityTab === 'food' ? 'yemek' : 'egzersiz'} kaydı yok
                    </Text>
                  </View>
                );
              }
              return (
                <>
                  {filtered.map((a) => {
                    const isFood = a.type === 'food';
                    return (
                      <View key={a.id} style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        backgroundColor: theme.surface,
                        borderRadius: 10,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: theme.border,
                      }}>
                        <Text style={{ fontSize: 22, marginRight: 10 }}>
                          {isFood ? '🍽️' : '🏃‍♂️'}
                        </Text>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textPrimary }}>
                            {a.name}
                          </Text>
                          <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                            {formatMeasuredAt(a.occurredAt)} • {isFood ? '+' : '-'}
                            {a.calories} kcal
                            {a.glucoseDelta != null && (
                              <Text style={{ color: a.glucoseDelta > 0 ? theme.danger : theme.success }}>
                                {' '}• {a.glucoseDelta > 0 ? '+' : ''}{a.glucoseDelta} mg/dL
                              </Text>
                            )}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleDeleteActivity(a.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={{ fontSize: 20, color: theme.textMuted }}>×</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  <View style={{ height: 16 }} />
                </>
              );
            })()}

            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textPrimary, marginBottom: 12 }}>
              Tüm ölçümler
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingVertical: 60, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.accent} />
            </View>
          ) : error ? (
            <View style={{
              backgroundColor: theme.dangerSoft,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: theme.danger,
            }}>
              <Text style={{ color: theme.danger, fontWeight: '600' }}>Bağlantı hatası</Text>
              <Text style={{ color: theme.textPrimary, fontSize: 13, marginTop: 4 }}>{error}</Text>
            </View>
          ) : (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>📊</Text>
              <Text style={{ color: theme.textSecondary }}>Bu aralıkta ölçüm yok</Text>
            </View>
          )
        }
      />

      <Modal
        visible={measureModal}
        transparent
        animationType="fade"
        onRequestClose={() => setMeasureModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: theme.overlay,
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}>
          <View style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 24,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 8 }}>
              Yeni Ölçüm
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 16 }}>
              Kan şekeri değerinizi mg/dL cinsinden girin.
            </Text>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              placeholder="Örn. 120"
              placeholderTextColor={theme.textMuted}
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.surfaceAlt,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 18,
                color: theme.textPrimary,
              }}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  setMeasureModal(false);
                  setInputValue('');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: theme.surfaceAlt,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitReading}
                disabled={submitting}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: theme.accent,
                  alignItems: 'center',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                <Text style={{ color: theme.accentText, fontWeight: '600' }}>
                  {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default HealthPage;
