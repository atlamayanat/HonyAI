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