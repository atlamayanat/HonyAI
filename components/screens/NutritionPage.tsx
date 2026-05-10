import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AllergenId, NutritionMeal, User } from '../../types';
import {
  getLatestReading,
  getPreferences,
  updatePreferences,
} from '../../api/client';
import {
  NUTRITION_MEALS,
  getLevel,
  recommendMeals,
} from '../../utils/helpers';
import { useTheme } from '../../theme/ThemeContext';
import AllergenSelector from '../AllergenSelector';

interface NutritionPageProps {
  user: User | null;
  refreshKey: number;
}

function NutritionPage({ user, refreshKey }: NutritionPageProps) {
  const { theme } = useTheme();
  const [allergens, setAllergens] = useState<AllergenId[]>([]);
  const [savingAllergens, setSavingAllergens] = useState(false);
  const [glucose, setGlucose] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const targetMax = user?.targetMax ?? 140;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prefs, latest] = await Promise.all([
        getPreferences(),
        getLatestReading(),
      ]);
      setAllergens(prefs.allergens);
      setGlucose(latest?.value ?? null);
    } catch {
      // sessizce gec
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

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

  const meals = useMemo(
    () => recommendMeals(NUTRITION_MEALS, glucose ?? 110, targetMax, allergens),
    [glucose, targetMax, allergens]
  );

  const level = glucose != null ? getLevel(glucose, targetMax) : null;
  const banner = useMemo(() => {
    if (glucose == null) {
      return { color: theme.textSecondary, soft: theme.surfaceAlt, msg: 'Kan şekeri verisi yok — genel öneriler gösteriliyor.' };
    }
    if (level === 'Yüksek') {
      return {
        color: theme.danger,
        soft: theme.dangerSoft,
        msg: `Kan şekeri yüksek (${glucose} mg/dL) — düşük karbonhidratlı seçenekler önerildi.`,
      };
    }
    if (level === 'Dikkat Edilmeli') {
      return {
        color: theme.warning,
        soft: theme.warningSoft,
        msg: `Kan şekeri sınırda (${glucose} mg/dL) — orta-düşük karbonhidrat tercih edilmeli.`,
      };
    }
    return {
      color: theme.success,
      soft: theme.successSoft,
      msg: `Kan şekeri normal (${glucose} mg/dL) — dengeli seçenekler.`,
    };
  }, [glucose, level, theme]);

  const carbBadge = (carbs: NutritionMeal['carbs']) => {
    const map = {
      low:    { label: 'Düşük karb',  color: theme.success, soft: theme.successSoft },
      medium: { label: 'Orta karb',   color: theme.warning, soft: theme.warningSoft },
      high:   { label: 'Yüksek karb', color: theme.danger,  soft: theme.dangerSoft },
    } as const;
    return map[carbs];
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
    >
      {/* Banner: kan sekerine gore neden bu oneriler */}
      <View style={{
        marginTop: 16,
        backgroundColor: banner.soft,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: banner.color,
      }}>
        <Text style={{ color: banner.color, fontWeight: '700', fontSize: 14, marginBottom: 4 }}>
          Önerilerin kaynağı
        </Text>
        <Text style={{ color: theme.textPrimary, fontSize: 13 }}>
          {banner.msg}
        </Text>
      </View>

      {/* Alerjen filtresi (Profil ile senkron) */}
      <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textPrimary, marginTop: 24, marginBottom: 4 }}>
        Filtre
      </Text>
      <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 12 }}>
        Seçtikleriniz hem burada hem profilinizde geçerlidir.
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
      </View>

      {/* Yemek onerileri */}
      <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textPrimary, marginTop: 24, marginBottom: 12 }}>
        Önerilen Yemekler ({meals.length})
      </Text>

      {meals.length === 0 ? (
        <View style={{
          padding: 24,
          backgroundColor: theme.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🚫</Text>
          <Text style={{ color: theme.textSecondary, textAlign: 'center', fontSize: 13 }}>
            Filtrelerinize uyan yemek bulunamadı. Bazı alerjen seçimlerini kaldırın.
          </Text>
        </View>
      ) : (
        meals.map((m) => {
          const badge = carbBadge(m.carbs);
          return (
            <View key={m.id} style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: 14,
              backgroundColor: theme.surface,
              borderRadius: 12,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: theme.border,
            }}>
              <Text style={{ fontSize: 32, marginRight: 12 }}>{m.icon}</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: theme.textPrimary }}>
                    {m.name}
                  </Text>
                  <View style={{
                    backgroundColor: badge.soft,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                  }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: badge.color }}>
                      {badge.label}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                    ~{m.calories} kcal
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4, lineHeight: 17 }}>
                  {m.description}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

export default NutritionPage;
