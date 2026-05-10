import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityResponse, ExercisePreset } from '../../types';
import { addActivity } from '../../api/client';
import { useTheme } from '../../theme/ThemeContext';

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded: (response: ActivityResponse) => void;
}

const EXERCISE_PRESETS: ExercisePreset[] = [
  { id: 'run',     name: 'Koşu',      durationMin: 30, calories: 300, icon: '🏃‍♂️' },
  { id: 'swim',    name: 'Yüzme',     durationMin: 20, calories: 200, icon: '🏊' },
  { id: 'walk',    name: 'Yürüyüş',   durationMin: 45, calories: 180, icon: '🚶' },
  { id: 'bike',    name: 'Bisiklet',  durationMin: 30, calories: 250, icon: '🚴' },
  { id: 'hiit',    name: 'HIIT',      durationMin: 15, calories: 180, icon: '🔥' },
];

function AddExerciseModal({ visible, onClose, onAdded }: AddExerciseModalProps) {
  const { theme } = useTheme();
  const [selectedId, setSelectedId] = useState<string>(EXERCISE_PRESETS[0].id);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const preset = EXERCISE_PRESETS.find((e) => e.id === selectedId);
    if (!preset) return;
    setSubmitting(true);
    try {
      const response = await addActivity(
        'exercise',
        `${preset.durationMin} dk ${preset.name}`,
        preset.calories
      );
      onAdded(response);
      onClose();
    } catch (e: any) {
      Alert.alert('Eklenemedi', e?.message || 'Sunucu hatası');
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.textPrimary }}>
              Hareket Verisi Ekle
            </Text>
            <TouchableOpacity onPress={onClose} style={{ marginLeft: 'auto', padding: 4 }}>
              <Text style={{ fontSize: 20, color: theme.textSecondary }}>×</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 16 }}>
            Yaptığınız aktiviteyi seçin
          </Text>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            {EXERCISE_PRESETS.map((item) => {
              const selected = selectedId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedId(item.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? theme.swatchSage : theme.border,
                    backgroundColor: selected ? theme.swatchSageSoft : theme.surface,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 8,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 28, marginRight: 12 }}>{item.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: theme.textPrimary }}>
                      {item.durationMin} dk {item.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                      ~{item.calories} kcal yakım
                    </Text>
                  </View>
                  <View style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: selected ? theme.swatchSage : theme.border,
                    backgroundColor: selected ? theme.swatchSage : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    {selected && <Text style={{ color: theme.textOnDark, fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
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
              backgroundColor: theme.swatchSage,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            <Text style={{ color: theme.textOnDark, fontWeight: '700', fontSize: 15 }}>
              {submitting ? 'Ekleniyor...' : 'Ekle'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default AddExerciseModal;
