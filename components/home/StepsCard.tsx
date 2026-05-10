import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { StepsToday } from '../../types';
import { getStepsToday } from '../../api/client';
import { useTheme } from '../../theme/ThemeContext';

interface StepsCardProps {
  onPress?: () => void;
  refreshKey?: number;
}

function StepsCard({ onPress, refreshKey }: StepsCardProps) {
  const { theme } = useTheme();
  const [data, setData] = useState<StepsToday | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      // DEMO: Backend deterministik bir adım sayısı döner.
      // Gerçek entegrasyon: Expo Pedometer / iOS HealthKit / Google Fit.
      const r = await getStepsToday();
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

  const progress = data ? Math.min(1, data.progress) : 0;
  const pct = Math.round(progress * 100);
  const completed = progress >= 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
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
        <Text style={{ fontSize: 20, marginRight: 8 }}>👣</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textPrimary }}>Günlük Adımlar</Text>
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
              {data.steps.toLocaleString('tr-TR')}
            </Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginLeft: 6 }}>
              / {data.goal.toLocaleString('tr-TR')} adım
            </Text>
          </View>
          <View style={{
            height: 8,
            backgroundColor: theme.surfaceAlt,
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <View style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: completed ? theme.success : theme.accent,
              borderRadius: 4,
            }} />
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

export default StepsCard;
