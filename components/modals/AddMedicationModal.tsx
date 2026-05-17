import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityResponse, MedicationPreset } from '../../types';
import { addMedication, getMedicationPresets } from '../../api/client';
import { useTheme } from '../../theme/ThemeContext';

interface AddMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded: (response: ActivityResponse) => void;
}

function AddMedicationModal({ visible, onClose, onAdded }: AddMedicationModalProps) {
  const { theme } = useTheme();
  const [presets, setPresets] = useState<MedicationPreset[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    getMedicationPresets()
      .then((list) => {
        setPresets(list);
        if (list.length > 0) setSelectedId((prev) => prev ?? list[0].id);
      })
      .catch((e) => Alert.alert('İlaç listesi yüklenemedi', e?.message || 'Sunucu hatası'))
      .finally(() => setLoading(false));
  }, [visible]);

  const handleSubmit = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      const response = await addMedication(selectedId);
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
              İlaç Ekle
            </Text>
            <TouchableOpacity onPress={onClose} style={{ marginLeft: 'auto', padding: 4 }}>
              <Text style={{ fontSize: 20, color: theme.textSecondary }}>×</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 16 }}>
            Aldığınız ilacı seçin — kan şekerine etkisi otomatik hesaplanır
          </Text>

          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.accent} />
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {presets.map((item) => {
                const selected = selectedId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedId(item.id)}
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
                        {item.info}
                      </Text>
                      <Text style={{ fontSize: 12, color: theme.success, marginTop: 2, fontWeight: '700' }}>
                        Tahmini etki: {item.delta} mg/dL
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
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || !selectedId || loading}
            style={{
              marginTop: 12,
              backgroundColor: theme.accent,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              opacity: submitting || !selectedId || loading ? 0.6 : 1,
            }}
          >
            <Text style={{ color: theme.accentText, fontWeight: '700', fontSize: 15 }}>
              {submitting ? 'Ekleniyor...' : 'Ekle'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default AddMedicationModal;
