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

export const lightTheme: ThemeTokens = {
  mode: 'light',

  bg: '#F5F4ED',
  surface: '#FAF9F5',
  surfaceAlt: '#EFEDE3',

  accent: '#D97757',
  accentSoft: '#F4E5DC',
  accentText: '#FFFFFF',

  textPrimary: '#1F1E1D',
  textSecondary: '#6B6962',
  textMuted: '#9A968D',
  textOnDark: '#FFFFFF',

  border: '#E8E6DC',
  trackOff: '#D6D3C7',

  success: '#5A8A6A',
  successSoft: '#E3ECDF',
  warning: '#C68A2E',
  warningSoft: '#F2E5CB',
  danger: '#C9482F',
  dangerSoft: '#F5E1DA',
  info: '#5A7A92',
  infoSoft: '#E0E8EE',

  levelNormal: '#5A8A6A',
  levelNormalSoft: '#E3ECDF',
  levelWarning: '#C68A2E',
  levelWarningSoft: '#F2E5CB',
  levelDanger: '#C9482F',
  levelDangerSoft: '#F5E1DA',

  statSoft: '#EFEDE3',

  overlay: 'rgba(31,30,29,0.45)',

  swatchTerracotta: '#C8704F',
  swatchTerracottaSoft: '#F4E0D5',
  swatchSage: '#7A9270',
  swatchSageSoft: '#E2EADF',
  swatchSand: '#C99A55',
  swatchSandSoft: '#F5E8D2',
  swatchDustyRose: '#B07484',
  swatchDustyRoseSoft: '#EFDCE2',

  inverse: '#1F1E1D',
  inverseText: '#FAF9F5',
};

export const darkTheme: ThemeTokens = {
  mode: 'dark',

  bg: '#1F1E1D',
  surface: '#2A2826',
  surfaceAlt: '#34322F',

  accent: '#E89478',
  accentSoft: '#3D2E27',
  accentText: '#1F1E1D',

  textPrimary: '#F5F4ED',
  textSecondary: '#B5B0A6',
  textMuted: '#7A7770',
  textOnDark: '#FFFFFF',

  border: '#3D3A36',
  trackOff: '#4A4744',

  success: '#7BAA8A',
  successSoft: '#2D3A2F',
  warning: '#D9A85C',
  warningSoft: '#3D3324',
  danger: '#E27158',
  dangerSoft: '#3D2924',
  info: '#7B96AC',
  infoSoft: '#2A3138',

  levelNormal: '#7BAA8A',
  levelNormalSoft: '#2D3A2F',
  levelWarning: '#D9A85C',
  levelWarningSoft: '#3D3324',
  levelDanger: '#E27158',
  levelDangerSoft: '#3D2924',

  statSoft: '#34322F',

  overlay: 'rgba(0,0,0,0.65)',

  swatchTerracotta: '#D88564',
  swatchTerracottaSoft: '#3D2A23',
  swatchSage: '#92AB87',
  swatchSageSoft: '#2C342B',
  swatchSand: '#D9AC6E',
  swatchSandSoft: '#3D3122',
  swatchDustyRose: '#C58A99',
  swatchDustyRoseSoft: '#36262A',

  inverse: '#FAF9F5',
  inverseText: '#1F1E1D',
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
