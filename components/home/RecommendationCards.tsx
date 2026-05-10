import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TabName } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import { ThemeTokens } from '../../theme/tokens';

type SwatchKey =
  | 'swatchTerracotta'
  | 'swatchSage'
  | 'swatchSand'
  | 'swatchDustyRose';

interface RecItem {
  icon: string;
  title: string;
  subtitle: string;
  colorKey: SwatchKey;
  navigateTo?: TabName;
}

interface RecommendationCardsProps {
  onNavigate?: (tab: TabName) => void;
}

function RecommendationCards({ onNavigate }: RecommendationCardsProps) {
  const { theme } = useTheme();

  const recommendations: RecItem[] = [
    { icon: '🍎', title: 'Beslenme',  subtitle: 'Önerilen yemekler',  colorKey: 'swatchTerracotta', navigateTo: 'Beslenme' },
    { icon: '🏃‍♂️', title: 'Egzersiz',  subtitle: 'Aktivite programı',  colorKey: 'swatchSage',       navigateTo: 'Sağlık' },
    { icon: '🧘', title: 'Stres',     subtitle: 'Rahatlama önerileri', colorKey: 'swatchSand' },
    { icon: '😴', title: 'Uyku',      subtitle: 'Dinlenme analizi',   colorKey: 'swatchDustyRose' },
  ];

  return (
    <View style={{ marginTop: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 16 }}>
        Kişisel Öneriler
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {recommendations.map((item, index) => {
          const bg = (theme as ThemeTokens)[item.colorKey];
          return (
            <TouchableOpacity
              key={index}
              onPress={() => item.navigateTo && onNavigate?.(item.navigateTo)}
              style={{
                width: '48%',
                backgroundColor: bg,
                borderRadius: 12,
                padding: 16,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</Text>
              <Text style={{ color: theme.textOnDark, fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
                {item.title}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>{item.subtitle}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default RecommendationCards;
