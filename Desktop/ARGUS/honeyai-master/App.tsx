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

function getLevelColor(level: Level): string {
  if (level === 'Normal') return '#43A047';
  if (level === 'Dikkat Edilmeli') return '#FB8C00';
  return '#E53935';
}

function Header() {
  return (
    <View className="flex-row justify-between items-center bg-white px-4 py-3 border-b border-gray-200">
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-green-50 justify-center items-center mr-2.5">
          <Text className="text-lg">👤</Text>
        </View>
        <View>
          <Text className="text-sm font-bold text-gray-800">Ahmet BÜYÜK</Text>
          <Text className="text-xs text-gray-500">ID: 66357</Text>
        </View>
      </View>
      <Text className="text-xl font-extrabold text-green-700">honyAI</Text>
    </View>
  );
}

function GaugeBar({ level }: { level: Level }) {
  return (
    <View className="mt-1.5">
      <View className="flex-row h-2.5 rounded-md overflow-hidden">
        <View className="flex-1 h-2.5 bg-[#4CAF50]" />
        <View className="flex-1 h-2.5 bg-[#FF9800]" />
        <View className="flex-1 h-2.5 bg-[#F44336]" />
      </View>
      <View className="flex-row justify-between mt-1.5">
        <Text className="text-[11px] font-semibold text-[#4CAF50]">Normal</Text>
        <Text className="text-[11px] font-semibold text-[#FF9800]">Dikkat Edilmeli</Text>
        <Text className="text-[11px] font-semibold text-[#F44336]">Yüksek</Text>
      </View>
    </View>
  );
}

function GlucoseCard({ value, level }: { value: number; level: Level }) {
  return (
    <View
      className="rounded-2xl py-7 items-center mt-4 shadow-sm"
      style={{ backgroundColor: getLevelColor(level), elevation: 4 }}
    >
      <Text className="text-white text-base font-bold mb-2">{'⚠️  ' + level}</Text>
      <Text className="text-white text-[68px] font-extrabold leading-[72px]">{String(value)}</Text>
      <Text className="text-white/85 text-base font-medium mt-1.5">mg/dL</Text>
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

  return (
    <SafeAreaView
      className="flex-1 bg-[#F5F5F5]"
      style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

      <ScrollView
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-5 mb-1">
          <Text className="text-[15px] font-bold text-gray-800 mb-1.5">Bilgileriniz</Text>
          <Text className="text-[13px] text-gray-600">Ahmet BÜYÜK / 20 / TİP2 D.</Text>
        </View>

        <View className="mt-5 mb-1">
          <Text className="text-[15px] font-bold text-gray-800 mb-1.5">Değer Göstergesi</Text>
          <GaugeBar level={level} />
        </View>

        <GlucoseCard value={glucoseValue} level={level} />

        <View
          className="bg-white rounded-xl p-3.5 mt-3.5 border border-gray-200 shadow-sm"
          style={{ elevation: 2 }}
        >
          <Text className="text-sm text-gray-800 font-medium">{'⚡  Önerilen su seviyesi'}</Text>
        </View>

        <View className="flex-row mt-3.5 justify-between">
          <TouchableOpacity
            className="w-[48%] py-3.5 rounded-xl items-center shadow-sm bg-[#388E3C]"
            style={{ elevation: 3 }}
            activeOpacity={0.8}
          >
            <Text className="text-white text-sm font-bold">Yeniden Ölçüm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-[48%] py-3.5 rounded-xl items-center shadow-sm bg-[#2E7D32]"
            style={{ elevation: 3 }}
            activeOpacity={0.8}
          >
            <Text className="text-white text-sm font-bold">Başlat</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row mt-3.5 justify-between">
          <TouchableOpacity
            className="w-[48%] bg-amber-50 rounded-xl py-5 items-center border border-amber-200 shadow-sm"
            style={{ elevation: 2 }}
            activeOpacity={0.8}
          >
            <Text className="text-2xl mb-2">🍴</Text>
            <Text className="text-[13px] text-amber-900 font-semibold text-center">Yemek Önerisi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-[48%] bg-amber-50 rounded-xl py-5 items-center border border-amber-200 shadow-sm"
            style={{ elevation: 2 }}
            activeOpacity={0.8}
          >
            <Text className="text-2xl mb-2">💧</Text>
            <Text className="text-[13px] text-amber-900 font-semibold text-center">Egzersiz Önerisi</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="bg-gray-900 rounded-xl py-4 items-center mt-3.5" activeOpacity={0.8}>
          <Text className="text-white text-[15px] font-bold">Daha fazla gör</Text>
        </TouchableOpacity>
      </ScrollView>

      <View
        className={`flex-row bg-white border-t border-gray-200 py-2.5 ${
          Platform.OS === 'ios' ? 'pb-5' : 'pb-2.5'
        }`}
      >
        {tabs.map((tab) => (
          <TouchableOpacity key={tab.label} className="flex-1 items-center" activeOpacity={0.7}>
            <Text className="text-xl mb-1">{tab.icon}</Text>
            <Text
              className={`text-[10px] ${
                tab.active ? 'text-green-700 font-bold' : 'text-gray-400 font-medium'
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