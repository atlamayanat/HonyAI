import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Recommendation } from '../../types';

function RecommendationCards() {
  const recommendations: Recommendation[] = [
    { icon: '🍎', title: 'Beslenme', subtitle: 'Önerilen yemekler', color: '#F97316' },
    { icon: '🏃‍♂️', title: 'Egzersiz', subtitle: 'Aktivite programı', color: '#3B82F6' },
    { icon: '💧', title: 'Hidrasyon', subtitle: 'Su takibi', color: '#06B6D4' },
    { icon: '😴', title: 'Uyku', subtitle: 'Dinlenme analizi', color: '#8B5CF6' },
  ];

  return (
    <View style={{ marginTop: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Kişisel Öneriler</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {recommendations.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              width: '48%',
              backgroundColor: item.color,
              borderRadius: 12,
              padding: 16,
              shadowColor: item.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>{item.title}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default RecommendationCards;