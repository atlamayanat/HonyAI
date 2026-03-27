import { Level, LevelConfig } from '../types';

export function getLevel(value: number): Level {
  if (value < 140) return 'Normal';
  if (value < 180) return 'Dikkat Edilmeli';
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