import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityResponse, FoodPreset, FoodRecognitionResult } from '../../types';
import { addActivity } from '../../api/client';
import CameraModal from './CameraModal';
import { useTheme } from '../../theme/ThemeContext';

interface AddFoodModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded: (response: ActivityResponse) => void;
}

const FOOD_PRESETS: FoodPreset[] = [
  { id: 'salad',  name: 'Tavuk Salata',         calories: 350, icon: '🥗' },
  { id: 'soup',   name: 'Mercimek Çorbası',     calories: 200, icon: '🍲' },
  { id: 'meat',   name: 'Pilav + Et',           calories: 600, icon: '🍛' },
  { id: 'oats',   name: 'Yulaf Ezmesi',         calories: 250, icon: '🥣' },
  { id: 'pizza',  name: 'Pizza (1 dilim)',      calories: 285, icon: '🍕' },
  { id: 'fruit',  name: 'Meyve Tabağı',         calories: 150, icon: '🍎' },
];

function AddFoodModal({ visible, onClose, onAdded }: AddFoodModalProps) {
  const { theme } = useTheme();
  const [selectedId, setSelectedId] = useState<string>(FOOD_PRESETS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const [recognized, setRecognized] = useState<FoodRecognitionResult | null>(null);
  const [useRecognized, setUseRecognized] = useState(false);

  // Modal kapanirken tanima sonucunu da temizle
  useEffect(() => {
    if (!visible) {
      setRecognized(null);
      setUseRecognized(false);
      setSelectedId(FOOD_PRESETS[0].id);
    }
  }, [visible]);

  const handleSubmit = async () => {
    let name: string;
    let calories: number;
    if (useRecognized && recognized) {
      // DEMO: Kalori -> kan sekeri formulu helpers.ts'te (kalori/10)
      name = `📷 ${recognized.ad}`;
      calories = recognized.tahmini_kalori_kcal;
    } else {
      const preset = FOOD_PRESETS.find((f) => f.id === selectedId);
      if (!preset) return;
      name = preset.name;
      calories = preset.calories;
    }
    setSubmitting(true);
    try {
      const response = await addActivity('food', name, calories);
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
        <View style={{ flex: 1, backgroundColor: theme.overlay, justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: theme.surface,
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
              backgroundColor: theme.border,
              marginBottom: 12,
            }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: theme.textPrimary }}>Besin Ekle</Text>
              <TouchableOpacity onPress={onClose} style={{ marginLeft: 'auto', padding: 4 }}>
                <Text style={{ fontSize: 20, color: theme.textSecondary }}>×</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 16 }}>
              Bir öğün seçin veya kamerayla analiz edin
            </Text>

            {/* Kamera butonu */}
            <TouchableOpacity
              onPress={() => setCameraOpen(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.swatchDustyRose,
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 22, marginRight: 10 }}>📷</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textOnDark, fontWeight: '700', fontSize: 15 }}>
                  Kamera ile Analiz
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>
                  Yemeği kameraya tutun, otomatik tanınsın
                </Text>
              </View>
              <Text style={{ color: theme.textOnDark, fontSize: 18 }}>›</Text>
            </TouchableOpacity>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {/* Tanınan kart (varsa) */}
              {recognized && (
                <TouchableOpacity
                  onPress={() => setUseRecognized(true)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: useRecognized ? theme.success : theme.border,
                    backgroundColor: useRecognized ? theme.successSoft : theme.surface,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 28, marginRight: 12 }}>✨</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: theme.success, fontWeight: '700', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Tanınan
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: theme.textPrimary }}>
                      {recognized.ad}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                      ~{recognized.tahmini_kalori_kcal} kcal · Güven: %{Math.round(recognized.guven_skoru * 100)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setRecognized(null);
                      setUseRecognized(false);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ paddingHorizontal: 6 }}
                  >
                    <Text style={{ fontSize: 18, color: theme.textMuted }}>×</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}

              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textPrimary, marginBottom: 8 }}>
                Hazır seçenekler
              </Text>

              {FOOD_PRESETS.map((item) => {
                const selected = !useRecognized && selectedId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      setSelectedId(item.id);
                      setUseRecognized(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? theme.accent : theme.border,
                      backgroundColor: selected ? theme.accentSoft : theme.surface,
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 8,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 28, marginRight: 12 }}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: theme.textPrimary }}>
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                        ~{item.calories} kcal
                      </Text>
                    </View>
                    <View style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: selected ? theme.accent : theme.border,
                      backgroundColor: selected ? theme.accent : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      {selected && <Text style={{ color: theme.accentText, fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
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
                backgroundColor: theme.accent,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              <Text style={{ color: theme.accentText, fontWeight: '700', fontSize: 15 }}>
                {submitting ? 'Ekleniyor...' : 'Ekle'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CameraModal
        visible={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onAnalyzed={(r) => {
          setRecognized(r);
          setUseRecognized(true);
        }}
      />
    </>
  );
}

export default AddFoodModal;
