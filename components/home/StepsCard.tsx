import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { StepsToday } from '../../types';
import { getStepsToday } from '../../api/client';

interface StepsCardProps {
  onPress?: () => void;
  refreshKey?: number;
}

function StepsCard({ onPress, refreshKey }: StepsCardProps) {
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

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        marginTop: 16,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 20, marginRight: 8 }}>👣</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>Günlük Adımlar</Text>
        <View style={{
          marginLeft: 'auto',
          backgroundColor: progress >= 1 ? '#ECFDF5' : '#F3F4F6',
          paddingHorizontal: 10,
          paddingVertical: 3,
          borderRadius: 10,
        }}>
          <Text style={{
            fontSize: 11,
            fontWeight: '700',
            color: progress >= 1 ? '#065F46' : '#6B7280',
          }}>
            %{pct}
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#10B981" />
      ) : !data ? (
        <Text style={{ color: '#9CA3AF', fontSize: 13 }}>Veri alınamadı</Text>
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 }}>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#111827' }}>
              {data.steps.toLocaleString('tr-TR')}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginLeft: 6 }}>
              / {data.goal.toLocaleString('tr-TR')} adım
            </Text>
          </View>
          <View style={{
            height: 8,
            backgroundColor: '#F3F4F6',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <View style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: progress >= 1 ? '#10B981' : '#3B82F6',
              borderRadius: 4,
            }} />
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

export default StepsCard;
