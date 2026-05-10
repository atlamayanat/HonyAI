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
import WaterCard from '../home/WaterCard';
import AddFoodModal from '../modals/AddFoodModal';
import AddExerciseModal from '../modals/AddExerciseModal';
import { getLevel } from '../../utils/helpers';
import { getLatestReading } from '../../api/client';
import { ActivityResponse, GlucoseReading, TabName, User } from '../../types';
import { useTheme } from '../../theme/ThemeContext';

interface HomePageProps {
  user: User | null;
  onNavigate: (tab: TabName) => void;
  refreshKey: number;
  onDataChanged: () => void;
}

function HomePage({ user, onNavigate, refreshKey, onDataChanged }: HomePageProps) {
  const { theme } = useTheme();
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
    setTimeout(() => onDataChanged(), 950);
  };

  const targetMax = user?.targetMax ?? 140;
  const value = latest?.value ?? displayValue;
  const level = getLevel(displayValue || value, targetMax);

  return (
    <>
      <ScrollView
        style={{ backgroundColor: theme.bg }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ paddingVertical: 80, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={{ marginTop: 12, color: theme.textSecondary }}>Yükleniyor...</Text>
          </View>
        ) : error ? (
          <View style={{
            marginTop: 24,
            backgroundColor: theme.dangerSoft,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.danger,
          }}>
            <Text style={{ color: theme.danger, fontWeight: '600', marginBottom: 4 }}>
              Bağlantı hatası
            </Text>
            <Text style={{ color: theme.textPrimary, fontSize: 13 }}>{error}</Text>
            <TouchableOpacity
              onPress={load}
              style={{
                marginTop: 12,
                backgroundColor: theme.danger,
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: theme.textOnDark, fontWeight: '600' }}>Tekrar dene</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
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
            <StepsCard refreshKey={refreshKey} />
            <WaterCard refreshKey={refreshKey} onChanged={onDataChanged} />
            <RecommendationCards onNavigate={onNavigate} />

            <TouchableOpacity
              onPress={() => onNavigate('Sağlık')}
              style={{
                backgroundColor: theme.inverse,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 24,
              }}
              activeOpacity={0.85}
            >
              <Text style={{ color: theme.inverseText, fontSize: 16, fontWeight: 'bold' }}>
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
