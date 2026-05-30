export type ThemeMode = 'light' | 'dark';

export interface ThemeTokens {
  mode: ThemeMode;

  // base
  bg: string;
  surface: string;
  surfaceAlt: string;

  // accent (primary brand)
  accent: string;
  accentSoft: string;
  accentText: string;

  // text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnDark: string;

  // structural
  border: string;
  trackOff: string;

  // semantic
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;

  // glucose level (helpers.ts uses)
  levelNormal: string;
  levelNormalSoft: string;
  levelWarning: string;
  levelWarningSoft: string;
  levelDanger: string;
  levelDangerSoft: string;

  // stat card soft fill
  statSoft: string;

  // overlay (modals)
  overlay: string;

  // 4 warm distinct swatches (RecommendationCards & QuickActions)
  swatchTerracotta: string;
  swatchTerracottaSoft: string;
  swatchSage: string;
  swatchSageSoft: string;
  swatchSand: string;
  swatchSandSoft: string;
  swatchDustyRose: string;
  swatchDustyRoseSoft: string;

  // dark/strong CTA (used by "Detayli Analiz" button)
  inverse: string;
  inverseText: string;
}

// HONYAI · Petek paletinden RN token'larına map.
// Kaynak: desing/honyai_theme.dart → HonyaiColors.light / .dark
export const lightTheme: ThemeTokens = {
  mode: 'light',

  bg: '#FBF7EE',
  surface: '#FFFFFF',
  surfaceAlt: '#F6F0E2',

  accent: '#C89019',
  accentSoft: '#FBE7B5',
  accentText: '#1B1812',

  textPrimary: '#1B1812',
  textSecondary: '#6B5F4E',
  textMuted: '#998C76',
  textOnDark: '#FBF7EE',

  border: 'rgba(20,15,8,0.08)',
  trackOff: '#E5DDC8',

  success: '#4F7F62',
  successSoft: '#DBE7DC',
  warning: '#C97F2A',
  warningSoft: '#F6E0BE',
  danger: '#B4493D',
  dangerSoft: '#F1D7CF',
  info: '#5A7A92',
  infoSoft: '#E0E8EE',

  levelNormal: '#4F7F62',
  levelNormalSoft: '#DBE7DC',
  levelWarning: '#C97F2A',
  levelWarningSoft: '#F6E0BE',
  levelDanger: '#B4493D',
  levelDangerSoft: '#F1D7CF',

  statSoft: '#F6F0E2',

  overlay: 'rgba(20,15,8,0.5)',

  // Petek'in 4 semantik rengi 4 swatch slotuna map edildi (component isimleri korunuyor).
  swatchTerracotta: '#B4493D',
  swatchTerracottaSoft: '#F1D7CF',
  swatchSage: '#4F7F62',
  swatchSageSoft: '#DBE7DC',
  swatchSand: '#C89019',
  swatchSandSoft: '#FBE7B5',
  swatchDustyRose: '#C97F2A',
  swatchDustyRoseSoft: '#F6E0BE',

  inverse: '#1B1812',
  inverseText: '#FBF7EE',
};

export const darkTheme: ThemeTokens = {
  mode: 'dark',

  bg: '#14110C',
  surface: '#1F1A12',
  surfaceAlt: '#2A2419',

  accent: '#F2B83A',
  accentSoft: '#3A2D14',
  accentText: '#14110C',

  textPrimary: '#FAF5E7',
  textSecondary: '#B5A98F',
  textMuted: '#857B66',
  textOnDark: '#FAF5E7',

  border: 'rgba(255,240,200,0.09)',
  trackOff: '#3A332A',

  success: '#85B196',
  successSoft: '#1F2A22',
  warning: '#E5A95A',
  warningSoft: '#332515',
  danger: '#D88176',
  dangerSoft: '#341E1A',
  info: '#7B96AC',
  infoSoft: '#2A3138',

  levelNormal: '#85B196',
  levelNormalSoft: '#1F2A22',
  levelWarning: '#E5A95A',
  levelWarningSoft: '#332515',
  levelDanger: '#D88176',
  levelDangerSoft: '#341E1A',

  statSoft: '#2A2419',

  overlay: 'rgba(0,0,0,0.65)',

  swatchTerracotta: '#D88176',
  swatchTerracottaSoft: '#341E1A',
  swatchSage: '#85B196',
  swatchSageSoft: '#1F2A22',
  swatchSand: '#F2B83A',
  swatchSandSoft: '#3A2D14',
  swatchDustyRose: '#E5A95A',
  swatchDustyRoseSoft: '#332515',

  inverse: '#FAF5E7',
  inverseText: '#14110C',
};

// HonyaiSpacing.radius* değerlerinden alındı (Petek spec).
export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
