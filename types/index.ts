export type Level = 'Normal' | 'Dikkat Edilmeli' | 'Yüksek';
export type TabName = 'Ana Sayfa' | 'Sağlık' | 'Beslenme' | 'Profil' | 'Ayarlar';

export type AllergenId = 'fistik' | 'sut' | 'ceviz' | 'gluten' | 'yumurta' | 'soya';

export interface AllergenOption {
  id: AllergenId;
  label: string;
  icon: string;
}

export const ALLERGEN_OPTIONS: AllergenOption[] = [
  { id: 'fistik',  label: 'Fıstık',  icon: '🥜' },
  { id: 'sut',     label: 'Süt',     icon: '🥛' },
  { id: 'ceviz',   label: 'Ceviz',   icon: '🌰' },
  { id: 'gluten',  label: 'Gluten',  icon: '🌾' },
  { id: 'yumurta', label: 'Yumurta', icon: '🥚' },
  { id: 'soya',    label: 'Soya',    icon: '🫘' },
];

export interface NutritionMeal {
  id: string;
  name: string;
  icon: string;
  calories: number;
  carbs: 'low' | 'medium' | 'high';
  allergens: AllergenId[];
  description: string;
}

export interface WaterToday {
  consumedMl: number;
  goalMl: number;
  progress: number;
  glasses: number;
  glassMl: number;
}

export interface Preferences {
  allergens: AllergenId[];
}

export interface FoodRecognitionAlt {
  ad: string;
  skor: number;
}

export interface FoodRecognitionResult {
  ad: string;
  ad_en: string;
  guven_skoru: number;
  tahmini_kalori_kcal: number;
  uyari: string | null;
  alternatif_tahminler: FoodRecognitionAlt[];
}

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
  allergens?: AllergenId[];
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

export type ActivityType = 'food' | 'exercise' | 'medication';

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

export interface MedicationPreset {
  id: string;
  name: string;
  icon: string;
  delta: number;
  info: string;
}

// --- LAB RESULTS (kan tahlilleri) ---

export interface LabParameter {
  rawLabel: string | null;
  value: number;
  unit: string | null;
  refMin: number | null;
  refMax: number | null;
  isAbnormal: boolean;
  category: string;
}

export interface LabResultListItem {
  id: number;
  testDate: string | null;        // ISO yyyy-mm-dd
  testTime: string | null;        // HH:MM
  facility: string | null;
  patientName: string | null;
  patientGender: string | null;
  patientBirthDate: string | null;
  abnormalCount: number;
  parameterCount: number;
  sourceFileName: string | null;
  status: 'processed' | 'failed';
  errorMessage: string | null;
  extractorVersion: string | null;
  processedAt: string | null;
  createdAt: string;              // SQLite datetime("now") → 'YYYY-MM-DD HH:MM:SS'
}

export interface LabResult extends LabResultListItem {
  parameters: Record<string, LabParameter>;
}

export interface LabSummaryValue {
  value: number;
  unit: string | null;
  isAbnormal: boolean;
  refMin: number | null;
  refMax: number | null;
}

export interface LabSummary {
  labResultId: number;
  testDate: string | null;
  abnormalCount: number;
  values: Record<string, LabSummaryValue>;
  createdAt: string;
}

// Document picker'dan gelen dosya descriptor'ı (Expo: DocumentPickerAsset)
export interface PickedPdf {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}
