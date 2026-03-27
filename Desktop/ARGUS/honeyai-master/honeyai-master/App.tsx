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

// Tema Renkleri
const colors = {
  headerBg: '#5E898F',
  background: '#F5F8FA', // İçerik için daha yumuşak bir arka plan
  redCard: '#D14343',
  greenBtn: '#72A98A',
  tealBtn: '#6B9E9F',
  waterBg: '#F6F8FB',
  waterText: '#435B71',
  mealBg: '#FEF4E8',
  mealText: '#A45E35',
  exerciseBg: '#EEF3FB',
  exerciseText: '#4A6C9C',
  darkBtn: '#313947',
  textMain: '#2D3748',
  textMuted: '#718096',
};

function Header() {
  return (
    <View className="flex-row justify-between items-center px-6 py-4 bg-[#5E898F] pb-6">
      <View className="flex-row items-center">
        <View className="w-14 h-14 rounded-full bg-white/15 justify-center items-center mr-3 border border-white/20">
          <Text className="text-2xl text-white">👤</Text>
        </View>
        <View>
          <Text className="text-base font-extrabold text-white tracking-wide">Ahmet BÜYÜK</Text>
          <View className="bg-white/20 px-2 py-0.5 rounded-md mt-1 self-start">
            <Text className="text-[10px] font-semibold text-white">ID: 66357</Text>
          </View>
        </View>
      </View>
      <Text className="text-2xl font-black text-white tracking-widest opacity-90">honyAI</Text>
    </View>
  );
}

function GaugeBar() {
  return (
    <View className="mt-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100" style={{ elevation: 2 }}>
      <Text className="text-sm font-bold text-gray-700 mb-3">Kan Şekeri Durumu</Text>
      <View className="relative h-3 rounded-full bg-gray-200 overflow-hidden flex-row">
        <View className="flex-[4] bg-[#75C091]" />
        <View className="flex-[4] bg-[#EBA846]" />
        <View className="flex-[2] bg-[#D14343]" />
      </View>
      
      {/* Gösterge Çubuğu (Thumb) */}
      <View 
        className="absolute top-[36px] h-4 w-4 rounded-full bg-white border-[3px] border-[#D14343] shadow-md"
        style={{ left: '81%', elevation: 5 }} 
      />

      <View className="flex-row justify-between mt-3">
        <Text className="text-[10px] font-bold text-[#75C091] uppercase tracking-wider">Normal</Text>
        <Text className="text-[10px] font-bold text-[#EBA846] uppercase tracking-wider">Dikkat</Text>
        <Text className="text-[10px] font-bold text-[#D14343] uppercase tracking-wider">Yüksek</Text>
      </View>
    </View>
  );
}

function GlucoseCard() {
  return (
    <View 
      className="bg-[#D14343] rounded-[32px] py-8 items-center mt-6 shadow-lg border border-red-400"
      style={{ elevation: 8, shadowColor: '#D14343', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
    >
      {/* Hap Şeklinde Uyarı */}
      <View className="bg-white/20 rounded-full px-5 py-2 flex-row items-center mb-4 border border-white/30">
        <Text className="text-white font-bold text-xs uppercase tracking-widest">⚠️ Kritik Seviye</Text>
      </View>
      
      <View className="flex-row items-baseline">
        <Text className="text-white text-[84px] font-black leading-none tracking-tighter">220</Text>
      </View>
      <Text className="text-white/80 text-base font-bold mt-1 tracking-widest">mg/dL</Text>
    </View>
  );
}

export default function App() {
  const tabs = [
    { icon: '🏠', label: 'Anasayfa' },
    { icon: '🤍', label: 'Sağlık' },
    { icon: '🔍', label: 'Arama' },
    { icon: '👤', label: 'Profil' },
    { icon: '⚙️', label: 'Ayarlar' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#5E898F]">
      <StatusBar barStyle="light-content" backgroundColor={colors.headerBg} />
      
      <Header />

      {/* Ana İçerik Alanı (Yuvarlak köşeli beyaz/gri alan) */}
      <View className="flex-1 bg-[#F5F8FA] rounded-t-[36px] overflow-hidden mt-[-16px]">
        <ScrollView contentContainerClassName="px-6 pb-10 pt-6" showsVerticalScrollIndicator={false}>
          
          {/* Kısa Bilgi */}
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text className="text-lg font-black text-[#2D3748]">Özet Tablonuz</Text>
            <Text className="text-xs font-bold text-[#718096] bg-gray-200 px-3 py-1 rounded-full">TİP2 D. / 20 Yaş</Text>
          </View>

          {/* Değer Göstergesi */}
          <GaugeBar />

          {/* Ana Kırmızı Kart */}
          <GlucoseCard />

          {/* Su Seviyesi (Modern Pill Button) */}
          <TouchableOpacity 
            className="bg-white rounded-2xl py-4 mt-6 flex-row justify-center items-center shadow-sm border border-gray-100"
            activeOpacity={0.7}
            style={{ elevation: 2 }}
          >
            <View className="bg-blue-50 w-8 h-8 rounded-full items-center justify-center mr-3">
              <Text className="text-[#ECA552] text-sm">⚡</Text>
            </View>
            <Text className="text-[#435B71] text-[15px] font-extrabold">Önerilen su seviyesine ulaşın</Text>
          </TouchableOpacity>

          {/* İkili Butonlar */}
          <View className="flex-row mt-4 justify-between gap-x-4">
            <TouchableOpacity 
              className="flex-1 bg-[#72A98A] rounded-[20px] py-4 items-center shadow-sm"
              activeOpacity={0.8}
              style={{ elevation: 3 }}
            >
              <Text className="text-white text-[15px] font-bold">Yeniden Ölçüm</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-[#6B9E9F] rounded-[20px] py-4 items-center shadow-sm"
              activeOpacity={0.8}
              style={{ elevation: 3 }}
            >
              <Text className="text-white text-[15px] font-bold">Kaydı Başlat</Text>
            </TouchableOpacity>
          </View>

          {/* Öneri Kartları */}
          <View className="flex-row mt-6 justify-between gap-x-4">
            <TouchableOpacity 
              className="flex-1 bg-white border border-[#FEF4E8] rounded-[24px] p-5 items-center shadow-sm"
              activeOpacity={0.8}
              style={{ elevation: 2 }}
            >
              <View className="bg-[#FEF4E8] w-14 h-14 rounded-full items-center justify-center mb-3">
                <Text className="text-[28px]">🍴</Text>
              </View>
              <Text className="text-[#A45E35] text-[14px] font-bold text-center">Yemek{'\n'}Önerisi</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-white border border-[#EEF3FB] rounded-[24px] p-5 items-center shadow-sm"
              activeOpacity={0.8}
              style={{ elevation: 2 }}
            >
              <View className="bg-[#EEF3FB] w-14 h-14 rounded-full items-center justify-center mb-3">
                <Text className="text-[28px]">💧</Text>
              </View>
              <Text className="text-[#4A6C9C] text-[14px] font-bold text-center">Egzersiz{'\n'}Önerisi</Text>
            </TouchableOpacity>
          </View>

          {/* Daha Fazla Gör Butonu */}
          <TouchableOpacity 
            className="bg-[#313947] rounded-full py-4 items-center mt-8 shadow-md"
            activeOpacity={0.8}
            style={{ elevation: 4 }}
          >
            <Text className="text-white text-base font-bold">Tüm Verileri Gör</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>

      {/* Alt Navigasyon */}
      <View 
        className={`flex-row bg-white pt-4 border-t border-gray-100 ${Platform.OS === 'ios' ? 'pb-8' : 'pb-4'}`}
      >
        {tabs.map((tab, index) => {
          const isActive = index === 0;
          return (
            <TouchableOpacity key={tab.label} className="flex-1 items-center" activeOpacity={0.7}>
              <View className={`px-4 py-1.5 rounded-full ${isActive ? 'bg-[#5E898F]/10' : 'bg-transparent'}`}>
                <Text className="text-[22px] mb-1 text-center">{tab.icon}</Text>
              </View>
              <Text className={`text-[10px] mt-1 ${isActive ? 'text-[#5E898F] font-extrabold' : 'text-gray-400 font-bold'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}