import { ActivityType, AllergenId, Level, LevelConfig, NutritionMeal } from '../types';
import { ThemeTokens } from '../theme/tokens';

export const NUTRITION_MEALS: NutritionMeal[] = [
  { id: 'salata',     name: 'Tavuk Salata',         icon: '🥗', calories: 350, carbs: 'low',    allergens: [],                 description: 'Yüksek protein, düşük karbonhidrat. Kan şekerini stabil tutar.' },
  { id: 'mercimek',   name: 'Mercimek Çorbası',     icon: '🍲', calories: 200, carbs: 'low',    allergens: [],                 description: 'Lif yönünden zengin, tokluk hissi verir.' },
  { id: 'omlet',      name: 'Sebzeli Omlet',        icon: '🍳', calories: 280, carbs: 'low',    allergens: ['yumurta'],        description: 'Hızlı protein kaynağı, kahvaltı için ideal.' },
  { id: 'yogurt',     name: 'Yoğurt + Yaban Mers.', icon: '🫐', calories: 180, carbs: 'low',    allergens: ['sut'],            description: 'Probiyotik + antioksidan. Düşük glisemik indeks.' },
  { id: 'somon',      name: 'Izgara Somon + Yeşil', icon: '🐟', calories: 420, carbs: 'low',    allergens: [],                 description: 'Omega-3 yönünden zengin, kan şekerini düşürür.' },
  { id: 'humus',      name: 'Humus + Sebze',        icon: '🥕', calories: 220, carbs: 'medium', allergens: [],                 description: 'Bitki bazlı protein. Orta porsiyon önerilir.' },
  { id: 'yulaf',      name: 'Yulaf Ezmesi + Ceviz', icon: '🥣', calories: 320, carbs: 'medium', allergens: ['sut','ceviz'],    description: 'Yavaş salınımlı karbonhidrat. Ölçülü tüketin.' },
  { id: 'mantar',     name: 'Karnıyarık (yağsız)',  icon: '🍆', calories: 290, carbs: 'medium', allergens: [],                 description: 'Sebze ağırlıklı, orta kalorili.' },
  { id: 'meyve',      name: 'Meyve Tabağı',         icon: '🍎', calories: 150, carbs: 'medium', allergens: [],                 description: 'Doğal şeker — yüksek kan şekerinde sınırlı tüketin.' },
  { id: 'pilav',      name: 'Pilav + Et',           icon: '🍛', calories: 600, carbs: 'high',   allergens: [],                 description: 'Yüksek karbonhidrat. Dengeli aralıkta tercih edin.' },
  { id: 'pizza',      name: 'Pizza (1 dilim)',      icon: '🍕', calories: 285, carbs: 'high',   allergens: ['gluten','sut'],   description: 'Yüksek karbonhidrat ve yağ. Nadir tüketin.' },
  { id: 'fistikli',   name: 'Fıstıklı Tatlı',       icon: '🍮', calories: 400, carbs: 'high',   allergens: ['fistik','sut'],   description: 'Yüksek şeker — kan şekerini hızla yükseltir.' },
];

export function recommendMeals(
  meals: NutritionMeal[],
  glucose: number,
  targetMax: number,
  allergens: AllergenId[]
): NutritionMeal[] {
  const allergenSet = new Set(allergens);
  const safe = meals.filter((m) => !m.allergens.some((a) => allergenSet.has(a)));

  // Kan sekeri yuksekse low-carb basa, dusukse karisik, normal ise low+medium
  const score = (m: NutritionMeal): number => {
    const carbWeight = m.carbs === 'low' ? 0 : m.carbs === 'medium' ? 1 : 2;
    if (glucose > targetMax + 40) return carbWeight * 10;          // YUKSEK -> low ilk
    if (glucose > targetMax) return carbWeight * 5;                // DIKKAT -> low + medium
    if (glucose < 80) return Math.abs(carbWeight - 1);              // DUSUK -> medium ilk
    return carbWeight;                                              // NORMAL -> low ilk yine
  };

  return [...safe].sort((a, b) => score(a) - score(b));
}

const DEFAULT_TARGET_MAX = 140;
const DEFAULT_WARN_DELTA = 40; // Yüksek eşiği targetMax + 40

export function getLevel(
  value: number,
  targetMax: number = DEFAULT_TARGET_MAX
): Level {
  if (value <= targetMax) return 'Normal';
  if (value <= targetMax + DEFAULT_WARN_DELTA) return 'Dikkat Edilmeli';
  return 'Yüksek';
}

export function getLevelConfig(level: Level, theme: ThemeTokens): LevelConfig {
  const configs: Record<Level, LevelConfig> = {
    'Normal': {
      color: theme.levelNormal,
      icon: '✅',
      message: 'Harika! Değerleriniz normal aralıkta'
    },
    'Dikkat Edilmeli': {
      color: theme.levelWarning,
      icon: '⚠️',
      message: 'Dikkat! Değerlerinizi takip edin'
    },
    'Yüksek': {
      color: theme.levelDanger,
      icon: '🚨',
      message: 'Acil! Hemen önlem alın'
    }
  };
  return configs[level];
}

export function formatMeasuredAt(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');

  if (sameDay) return `Bugün ${hh}:${mm}`;
  if (isYesterday) return `Dün ${hh}:${mm}`;

  const dd = d.getDate().toString().padStart(2, '0');
  const mo = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${dd}.${mo} ${hh}:${mm}`;
}

// DEMO: Basitleştirilmiş kan şekeri simülasyonu, gerçek tıbbi hesaplama değildir.
// food: +calories/10, exercise: -calories/15. Sonuç 60-300 mg/dL aralığında clamp'lenir.
export function simulateGlucoseDelta(type: ActivityType, calories: number): number {
  if (type === 'food') return Math.round(calories / 10);
  if (type === 'exercise') return -Math.round(calories / 15);
  return 0;
}

export function clampGlucose(value: number): number {
  return Math.max(60, Math.min(300, Math.round(value)));
}
