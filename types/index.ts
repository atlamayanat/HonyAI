export type Level = 'Normal' | 'Dikkat Edilmeli' | 'Yüksek';
export type TabName = 'Ana Sayfa' | 'Sağlık' | 'Arama' | 'Profil' | 'Ayarlar';

export interface LevelConfig {
  color: string;
  icon: string;
  message: string;
}

export interface Recommendation {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
}

export interface QuickAction {
  icon: string;
  title: string;
  color: string;
}

export interface TabItem {
  icon: string;
  label: TabName;
}

export interface User {
  id: number;
  name: string;
  age: number;
  diabetesType: string;
  targetMin: number;
  targetMax: number;
}

export interface GlucoseReading {
  id: number;
  value: number;
  measuredAt: string;
  note?: string;
}

export interface Settings {
  remindersEnabled: boolean;
  reminderTimes: string[];
  darkMode: boolean;
  language: 'tr' | 'en';
}

export type ActivityType = 'food' | 'exercise';

export interface Activity {
  id: number;
  type: ActivityType;
  name: string;
  calories: number;
  occurredAt: string;
  glucoseDelta?: number | null;
}

export interface ActivityResponse {
  activity: Activity;
  newGlucose: number;
  previousGlucose: number;
  delta: number;
}

export interface StepsToday {
  steps: number;
  goal: number;
  progress: number;
}

export interface FoodPreset {
  id: string;
  name: string;
  calories: number;
  icon: string;
}

export interface ExercisePreset {
  id: string;
  name: string;
  calories: number;
  icon: string;
  durationMin: number;
}
