import { ActivityType, Level, LevelConfig } from '../types';

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

export function getLevelConfig(level: Level): LevelConfig {
  const configs: Record<Level, LevelConfig> = {
    'Normal': {
      color: '#10B981',
      icon: '✅',
      message: 'Harika! Değerleriniz normal aralıkta'
    },
    'Dikkat Edilmeli': {
      color: '#F59E0B',
      icon: '⚠️',
      message: 'Dikkat! Değerlerinizi takip edin'
    },
    'Yüksek': {
      color: '#EF4444',
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
