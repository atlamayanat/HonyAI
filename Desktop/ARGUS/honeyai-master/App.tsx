import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';

type Level = 'Normal' | 'Dikkat Edilmeli' | 'Yüksek';

function getLevel(value: number): Level {
  if (value < 140) return 'Normal';
  if (value < 180) return 'Dikkat Edilmeli';
  return 'Yüksek';
}

function getLevelConfig(level: Level) {
  const configs = {
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

function Header() {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 24,
      paddingVertical: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: '#10B981',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
          shadowColor: '#10B981',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>A</Text>
        </View>
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>Ahmet BÜYÜK</Text>
          <Text style={{ fontSize: 14, color: '#6B7280' }}>ID: 66357 • Tip 2 Diyabet</Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#10B981' }}>hony</Text>
        <Text style={{ fontSize: 12, color: '#059669', fontWeight: '600', marginTop: -4 }}>AI Health</Text>
      </View>
    </View>
  );
}

function ModernGaugeBar({ level }: { level: Level }) {
  const config = getLevelConfig(level);
  
  return (
    <View style={{
      marginTop: 16,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: '#F3F4F6'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>Değer Aralığı</Text>
        <View style={{ marginLeft: 'auto' }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: config.color }}>
            {config.icon} {level}
          </Text>
        </View>
      </View>
      
      <View style={{ position: 'relative' }}>
        <View style={{
          flexDirection: 'row',
          height: 12,
          borderRadius: 6,
          overflow: 'hidden',
          backgroundColor: '#F3F4F6'
        }}>
          <View style={{ flex: 1, height: 12, backgroundColor: '#10B981' }} />
          <View style={{ flex: 1, height: 12, backgroundColor: '#F59E0B' }} />
          <View style={{ flex: 1, height: 12, backgroundColor: '#EF4444' }} />
        </View>
        
        <View style={{
          position: 'absolute',
          top: 0,
          width: 4,
          height: 12,
          borderRadius: 2,
          backgroundColor: config.color,
          shadowColor: config.color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 4,
          elevation: 4,
          left: level === 'Normal' ? '16%' : level === 'Dikkat Edilmeli' ? '50%' : '83%'
        }} />
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
        <Text style={{ fontSize: 12, fontWeight: '500', color: '#10B981' }}>0-140</Text>
        <Text style={{ fontSize: 12, fontWeight: '500', color: '#F59E0B' }}>140-180</Text>
        <Text style={{ fontSize: 12, fontWeight: '500', color: '#EF4444' }}>180+</Text>
      </View>
    </View>
  );
}

function ModernGlucoseCard({ value, level }: { value: number; level: Level }) {
  const config = getLevelConfig(level);
  
  return (
    <View style={{ marginTop: 24 }}>
      <View style={{
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 32,
        alignItems: 'center',
        backgroundColor: config.color,
        shadowColor: config.color,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
      }}>
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginBottom: 16
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>{config.message}</Text>
        </View>
        
        <Text style={{ color: '#FFFFFF', fontSize: 72, fontWeight: '900', marginBottom: 8 }}>{value}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: '500' }}>mg/dL</Text>
        
        <View style={{
          marginTop: 16,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 20,
          paddingHorizontal: 24,
          paddingVertical: 8
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '500' }}>
            Son ölçüm: Bugün 14:30
          </Text>
        </View>
      </View>
    </View>
  );
}

function QuickActions() {
  const actions = [
    { icon: '🔄', title: 'Yeniden Ölçüm', color: '#10B981' },
    { icon: '📊', title: 'Geçmiş', color: '#3B82F6' },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={{
            flex: 1,
            backgroundColor: action.color,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            shadowColor: action.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6
          }}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 24, marginBottom: 4 }}>{action.icon}</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>{action.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function RecommendationCards() {
  const recommendations = [
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

function ModernTabBar() {
  const tabs = [
    { icon: '🏠', label: 'Ana Sayfa', active: true },
    { icon: '📊', label: 'Raporlar', active: false },
    { icon: '🎯', label: 'Hedefler', active: false },
    { icon: '⚙️', label: 'Ayarlar', active: false },
  ];

  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 24 : 12
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {tabs.map((tab, index) => (
          <TouchableOpacity key={index} style={{ alignItems: 'center', paddingVertical: 8 }} activeOpacity={0.7}>
            <View style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: tab.active ? '#F0FDF4' : 'transparent'
            }}>
              <Text style={{ fontSize: 20 }}>{tab.icon}</Text>
            </View>
            <Text style={{
              fontSize: 12,
              marginTop: 4,
              color: tab.active ? '#10B981' : '#6B7280',
              fontWeight: tab.active ? 'bold' : '500'
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function App() {
  const glucoseValue = 220;
  const level = getLevel(glucoseValue);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

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

      <ModernTabBar />
    </SafeAreaView>
  );
}