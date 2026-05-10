import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { WaterToday } from '../../types';
import { addWater, getWaterToday, resetWaterToday } from '../../api/client';
import { useTheme } from '../../theme/ThemeContext';

interface WaterCardProps {
  refreshKey?: number;
  onChanged?: () => void;
}

function WaterCard({ refreshKey, onChanged }: WaterCardProps) {
  const { theme } = useTheme();
  const [data, setData] = useState<WaterToday | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await getWaterToday();
      setData(r);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleAdd = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await addWater(250);
      setData(r);
      onChanged?.();
    } catch (e: any) {
      Alert.alert('Eklenemedi', e?.message || 'Sunucu hatası');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = () => {
    Alert.alert('Sıfırla', 'Bugünkü tüm su kayıtları silinsin mi?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sıfırla',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await resetWaterToday();
            await load();
            onChanged?.();
          } catch (e: any) {
            Alert.alert('Hata', e?.message || 'Sunucu hatası');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const progress = data ? Math.min(1, data.progress) : 0;
  const pct = Math.round(progress * 100);
  const completed = progress >= 1;

  return (
    <View
      style={{
        marginTop: 16,
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 20, marginRight: 8 }}>💧</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textPrimary }}>Günlük Su</Text>
        <View style={{
          marginLeft: 'auto',
          backgroundColor: completed ? theme.successSoft : theme.surfaceAlt,
          paddingHorizontal: 10,
          paddingVertical: 3,
          borderRadius: 10,
        }}>
          <Text style={{
            fontSize: 11,
            fontWeight: '700',
            color: completed ? theme.success : theme.textSecondary,
          }}>
            %{pct}
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.accent} />
      ) : !data ? (
        <Text style={{ color: theme.textMuted, fontSize: 13 }}>Veri alınamadı</Text>
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 }}>
            <Text style={{ fontSize: 32, fontWeight: '900', color: theme.textPrimary }}>
              {data.consumedMl}
            </Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginLeft: 6 }}>
              / {data.goalMl} ml • {data.glasses} bardak
            </Text>
          </View>
          <View style={{
            height: 8,
            backgroundColor: theme.surfaceAlt,
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 12,
          }}>
            <View style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: completed ? theme.success : theme.info,
              borderRadius: 4,
            }} />
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={handleAdd}
              disabled={busy}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: theme.info,
                alignItems: 'center',
                opacity: busy ? 0.6 : 1,
              }}
              activeOpacity={0.85}
            >
              <Text style={{ color: theme.textOnDark, fontWeight: '700', fontSize: 13 }}>
                + 1 Bardak ({data.glassMl} ml)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReset}
              disabled={busy || data.consumedMl === 0}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 8,
                backgroundColor: theme.surfaceAlt,
                alignItems: 'center',
                opacity: data.consumedMl === 0 ? 0.4 : 1,
              }}
            >
              <Text style={{ color: theme.textSecondary, fontWeight: '600', fontSize: 13 }}>
                Sıfırla
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

export default WaterCard;
