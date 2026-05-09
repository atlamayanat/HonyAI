import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityResponse, FoodPreset } from '../../types';
import { addActivity } from '../../api/client';
import CameraModal from './CameraModal';

interface AddFoodModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded: (response: ActivityResponse) => void;
}

// DEMO: Hazır besin listesi. Gerçek uygulamada veritabanından gelir.
const FOOD_PRESETS: FoodPreset[] = [
  { id: 'salad',  name: 'Tavuk Salata',         calories: 350, icon: '🥗' },
  { id: 'soup',   name: 'Mercimek Çorbası',     calories: 200, icon: '🍲' },
  { id: 'meat',   name: 'Pilav + Et',           calories: 600, icon: '🍛' },
  { id: 'oats',   name: 'Yulaf Ezmesi',         calories: 250, icon: '🥣' },
  { id: 'pizza',  name: 'Pizza (1 dilim)',      calories: 285, icon: '🍕' },
  { id: 'fruit',  name: 'Meyve Tabağı',         calories: 150, icon: '🍎' },
];

function AddFoodModal({ visible, onClose, onAdded }: AddFoodModalProps) {
  // DEMO: Varsayılan olarak ilk öğe seçili
  const [selectedId, setSelectedId] = useState<string>(FOOD_PRESETS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const handleSubmit = async () => {
    const preset = FOOD_PRESETS.find((f) => f.id === selectedId);
    if (!preset) return;
    setSubmitting(true);
    try {
      const response = await addActivity('food', preset.name, preset.calories);
      onAdded(response);
      onClose();
    } catch (e: any) {
      Alert.alert('Eklenemedi', e?.message || 'Sunucu hatası');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: '#FFF',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
            maxHeight: '90%',
          }}>
            <View style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#D1D5DB',
              marginBottom: 12,
            }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#111827' }}>Besin Ekle</Text>
              <TouchableOpacity onPress={onClose} style={{ marginLeft: 'auto', padding: 4 }}>
                <Text style={{ fontSize: 20, color: '#6B7280' }}>×</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
              Bir öğün seçin veya kamerayla analiz edin
            </Text>

            {/* Kamera butonu */}
            <TouchableOpacity
              onPress={() => setCameraOpen(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#4F46E5',
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 12,
                marginBottom: 16,
                shadowColor: '#4F46E5',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text style={{ fontSize: 22, marginRight: 10 }}>📷</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>
                  Kamera ile Analiz
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>
                  Yemeği kameraya tutun, otomatik tanınsın
                </Text>
              </View>
              <Text style={{ color: '#FFF', fontSize: 18 }}>›</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 }}>
              Hazır seçenekler
            </Text>

            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {FOOD_PRESETS.map((item) => {
                const selected = selectedId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedId(item.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? '#10B981' : '#E5E7EB',
                      backgroundColor: selected ? '#ECFDF5' : '#FFF',
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 8,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 28, marginRight: 12 }}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                        ~{item.calories} kcal
                      </Text>
                    </View>
                    <View style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: selected ? '#10B981' : '#D1D5DB',
                      backgroundColor: selected ? '#10B981' : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      {selected && <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              style={{
                marginTop: 12,
                backgroundColor: '#10B981',
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>
                {submitting ? 'Ekleniyor...' : 'Ekle'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CameraModal
        visible={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onAnalyzed={() => {
          // DEMO: Analiz sonucu mock — varsayılan seçim ile devam et
          // Gerçek entegrasyonda algılanan yemeğe göre selectedId güncellenir.
        }}
      />
    </>
  );
}

export default AddFoodModal;
