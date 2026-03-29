import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import ModernGaugeBar from '../home/ModernGaugeBar';
import ModernGlucoseCard from '../home/ModernGlucoseCard';
import QuickActions from '../home/QuickActions';
import RecommendationCards from '../home/RecommendationCards';
import { getLevel } from '../../utils/helpers';

function HomePage() {
  const glucoseValue = 220;
  const level = getLevel(glucoseValue);

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >

      <ModernGaugeBar level={level} />
      <ModernGlucoseCard value={glucoseValue} level={level} />
      <QuickActions />
      <RecommendationCards />
      
      <TouchableOpacity 
        style={{
          backgroundColor: '#111827',
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
          marginTop: 24,
          shadowColor: '#111827',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6
        }}
        activeOpacity={0.8}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>Detaylı Analiz</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default HomePage;