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

// Tasarımın hissini yakalamak için renk paletini güncelle
const colors = {
  primary: '#32888F', // Header, Right Button, Alt Nav, Passive Nav
  accentGreen: '#62A48C', // Left Button
  accentBlue: '#32888F', // Right Button
  glucoseHigh: '#E53935', // Glucose Card, High Gauge
  glucoseWarning: '#FB8C00', // Warning Gauge
  glucoseNormal: '#4CAF50', // Normal Gauge
  dark: '#1D262F', // See More Button
  lightBg: '#F5F5F5', // App Bg
  cardBg: '#FFFFFF', // General cards
  mealBg: '#FDF6E3', // Food Card Bg
  exerciseBg: '#EDF7F7', // Exercise Card Bg
};

type Level = 'Normal' | 'Dikkat Edilmeli' | 'Yüksek';

function getLevel(value: number): Level {
  if (value < 140) return 'Normal';
  if (value < 180) return 'Dikkat Edilmeli';
  return 'Yüksek';
}

function getLevelColor(level: Level): string {
  if (level === 'Normal') return colors.glucoseNormal;
  if (level === 'Dikkat Edilmeli') return colors.glucoseWarning;
  return colors.glucoseHigh;
}

function Header() {
  return (
    <View
      className="flex-row justify-between items-center px-4 py-3"
      style={{ backgroundColor: colors.primary }}
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full justify-center items-center mr-3" style={{ backgroundColor: '#E0F2F1' }}>
          <Text className="text-xl" style={{color: colors.primary}}>👤</Text>
        </View>
        <View>
          <Text className="text-sm font-bold text-white">Ahmet BÜYÜK</Text>
          <Text className="text-xs text-white/70">ID: 66357</Text>
        </View>
      </View>
      <Text className="text-2xl font-extrabold text-white">honyAI</Text>
    </View>
  );
}

function GaugeBar({ level }: { level: Level }) {
  const isHigh = level === 'Yüksek';
  return (
    <View className="mt-1.5 relative">
      <View className="flex-row h-2 rounded-md overflow-hidden bg-gray-200">
        <View className="flex-1 h-2 bg-[#4CAF50]" />
        <View className="flex-1 h-2 bg-[#FF9800]" />
        <View className="flex-1 h-2 bg-[#F44336]" />
      </View>
      
      {/* Tasarımdaki Thumb simgesini ekle - Konum dinamik (Yüksek için sağa yakın) */}
      <View 
        className="absolute -top-1 w-4 h-4 bg-gray-600 rounded-full border border-white"
        style={{ left: isHigh ? '85%' : '0%', elevation: 2 }} 
      />

      <View className="flex-row justify-between mt-1.5">
        <Text className="text-[11px] font-medium text-[#4CAF50]">Normal</Text>
        <Text className="text-[11px] font-medium text-[#FF9800]">Dikkat Edilmeli</Text>
        <Text className="text-[11px] font-medium text-[#F44336]">Yüksek</Text>
      </View>
    </View>
  );
}

function GlucoseCard({ value, level }: { value: number; level: Level }) {
  return (
    <View
      className="rounded-2xl p-6 items-center mt-5 shadow-lg"
      style={{ backgroundColor: getLevelColor(level), elevation: 6 }}
    >
      {/* Tasarımdaki hap şeklindeki uyarı etiketi */}
      <View className="bg-white rounded-full px-3 py-1 flex-row items-center mb-4">
        <Text className="text-xl mr-1">⚠️</Text>
        <Text className="text-xs font-bold" style={{ color: getLevelColor(level) }}>{level}</Text>
      </View>
      <Text className="text-white text-6xl font-extrabold leading-[72px]">{String(value)}</Text>
      <Text className="text-white text-base font-medium mt-1">mg/dL</Text>
    </View>
  );
}

export default function App() {
  const glucoseValue = 220;
  const level = getLevel(glucoseValue);

  const tabs = [
    { icon: '🏠', label: 'Anasayfa', active: true },
    { icon: '❤️', label: 'Sağlık', active: false },
    { icon: '🔍', label: 'Arama', active: false },
    { icon: '👤', label: 'Profil', active: false },
    { icon: '⚙️', label: 'Ayarlar', active: false },
  ];

  // StatusBar rengini header rengiyle eşleştir
  React.useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.primary);
    }
  }, []);

  return (
    <SafeAreaView
      className="flex-1 bg-white" // Tasarımda beyaz gibi görünüyor, temiz tutalım.
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Header />

      <ScrollView
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-6 mb-1">
          <Text className="text-lg font-bold text-gray-800 mb-1.5">Bilgileriniz</Text>
          <Text className="text-sm text-gray-700">Ahmet BÜYÜK / 20 / TIP2 D.</Text>
        </View>

        <View className="mt-6 mb-1">
          <Text className="text-lg font-bold text-gray-800 mb-1.5">Değer Göstergesi</Text>
          <GaugeBar level={level} />
        </View>

        <GlucoseCard value={glucoseValue} level={level} />

        {/* Su Kartı - Artık bir düğme gibi görünüyor */}
        <TouchableOpacity
          className="bg-white rounded-2xl p-4 mt-5 border border-gray-100 shadow-sm flex-row items-center"
          style={{ elevation: 1 }}
          activeOpacity={0.8}
        >
          <Text className="text-xl mr-2">⚡</Text>
          <Text className="text-base text-gray-800 font-medium">Önerilen su seviyesi</Text>
        </TouchableOpacity>

        {/* İşlem Düğmeleri - Renkler doğru */}
        <View className="flex-row mt-5 justify-between gap-x-2">
          <TouchableOpacity
            className="flex-1 py-4 rounded-2xl items-center shadow-md"
            style={{ backgroundColor: colors.accentGreen, elevation: 3 }}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-bold">Yeniden Ölçüm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-4 rounded-2xl items-center shadow-md"
            style={{ backgroundColor: colors.accentBlue, elevation: 3 }}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-bold">Başlat</Text>
          </TouchableOpacity>
        </View>

        {/* Öneri Kartları - Renkler ve Simgeler doğru */}
        <View className="flex-row mt-5 justify-between gap-x-2">
          <TouchableOpacity
            className="flex-1 rounded-2xl py-6 items-center shadow-md"
            style={{ backgroundColor: colors.mealBg, elevation: 2 }}
            activeOpacity={0.8}
          >
            <Text className="text-4xl mb-3" style={{ color: colors.accentGreen }}>🍴</Text>
            <Text className="text-sm text-amber-900 font-semibold text-center">Yemek Önerisi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 rounded-2xl py-6 items-center shadow-md"
            style={{ backgroundColor: colors.exerciseBg, elevation: 2 }}
            activeOpacity={0.8}
          >
            <Text className="text-4xl mb-3" style={{ color: colors.accentBlue }}>💧</Text>
            <Text className="text-sm text-cyan-900 font-semibold text-center">Egzersiz Önerisi</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="rounded-2xl py-4 items-center mt-5" style={{ backgroundColor: colors.dark }} activeOpacity={0.8}>
          <Text className="text-white text-lg font-bold">Daha fazla gör</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Alt Navigasyon - Renkler tam olarak doğru: Koyu Turkuaz/Yeşil */}
      <View
        className={`flex-row border-t border-gray-200 py-2.5 ${
          Platform.OS === 'ios' ? 'pb-6' : 'pb-2.5'
        }`}
        style={{ backgroundColor: colors.primary }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity key={tab.label} className="flex-1 items-center" activeOpacity={0.7}>
            <Text className="text-2xl mb-1">{tab.icon}</Text>
            <Text
              className={`text-[11px] ${
                tab.active ? 'text-white font-bold' : 'text-white/70 font-medium'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}