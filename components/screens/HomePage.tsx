import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ModernGaugeBar from '../home/ModernGaugeBar';
import ModernGlucoseCard from '../home/ModernGlucoseCard';
import QuickActions from '../home/QuickActions';
import RecommendationCards from '../home/RecommendationCards';
import StepsCard from '../home/StepsCard';
import AddFoodModal from '../modals/AddFoodModal';
import AddExerciseModal from '../modals/AddExerciseModal';
import { getLevel } from '../../utils/helpers';
import { getLatestReading } from '../../api/client';
import { ActivityResponse, GlucoseReading, TabName, User } from '../../types';

interface HomePageProps {
  user: User | null;
  onNavigate: (tab: TabName) => void;
  refreshKey: number;
  onDataChanged: () => void;
}

function HomePage({ user, onNavigate, refreshKey, onDataChanged }: HomePageProps) {
  const [latest, setLatest] = useState<GlucoseReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [foodModal, setFoodModal] = useState(false);
  const [exerciseModal, setExerciseModal] = useState(false);

  // Anında animasyonlu güncelleme için ayrı bir görünen değer.
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const reading = await getLatestReading();
      setLatest(reading);
      const v = reading?.value ?? 0;
      animatedValue.setValue(v);
      setDisplayValue(v);
    } catch (e: any) {
      setError(e?.message || 'Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [animatedValue]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  useEffect(() => {
    const id = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });
    return () => animatedValue.removeListener(id);
  }, [animatedValue]);

  const handleActivityAdded = (response: ActivityResponse) => {
    // Anında animasyonlu güncelleme — backend'i de senkron tutmak için onDataChanged'i çağır.
    Animated.timing(animatedValue, {
      toValue: response.newGlucose,
      duration: 900,
      useNativeDriver: false,
    }).start();
    setLatest((prev) => prev ? {
      ...prev,
      value: response.newGlucose,
      measuredAt: response.activity.occurredAt,
      note: response.activity.name,
    } : prev);
    // Refresh diğer ekranlara propagate olsun
    setTimeout(() => onDataChanged(), 950);
  };

  const targetMax = user?.targetMax ?? 140;
  const value = latest?.value ?? displayValue;
  const level = getLevel(displayValue || value, targetMax);

  return (
    <>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ paddingVertical: 80, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={{ marginTop: 12, color: '#6B7280' }}>Yükleniyor...</Text>
          </View>
        ) : error ? (
          <View style={{
            marginTop: 24,
            backgroundColor: '#FEF2F2',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: '#FECACA',
          }}>
            <Text style={{ color: '#991B1B', fontWeight: '600', marginBottom: 4 }}>
              Bağlantı hatası
            </Text>
            <Text style={{ color: '#991B1B', fontSize: 13 }}>{error}</Text>
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
        ) : (
          <>
            <StepsCard refreshKey={refreshKey} />
            <ModernGaugeBar level={level} targetMax={targetMax} />
            <ModernGlucoseCard
              value={displayValue || value}
              level={level}
              measuredAt={latest?.measuredAt}
            />
            <QuickActions
              onAddFood={() => setFoodModal(true)}
              onAddExercise={() => setExerciseModal(true)}
            />
            <RecommendationCards />

            <TouchableOpacity
              onPress={() => onNavigate('Sağlık')}
              style={{
                backgroundColor: '#111827',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 24,
                shadowColor: '#111827',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
                Detaylı Analiz
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <AddFoodModal
        visible={foodModal}
        onClose={() => setFoodModal(false)}
        onAdded={handleActivityAdded}
      />
      <AddExerciseModal
        visible={exerciseModal}
        onClose={() => setExerciseModal(false)}
        onAdded={handleActivityAdded}
      />
    </>
  );
}

export default HomePage;
