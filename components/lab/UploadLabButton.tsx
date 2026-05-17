import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { uploadLabPdf } from '../../api/client';
import { useTheme } from '../../theme/ThemeContext';
import { LabResult } from '../../types';

interface Props {
  onUploaded?: (result: LabResult) => void;
}

function UploadLabButton({ onUploaded }: Props) {
  const { theme } = useTheme();
  const [busy, setBusy] = useState(false);

  const handlePick = async () => {
    if (busy) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const asset = result.assets[0];

      setBusy(true);
      const uploaded = await uploadLabPdf({
        uri: asset.uri,
        name: asset.name || 'tahlil.pdf',
        mimeType: asset.mimeType || 'application/pdf',
        size: asset.size,
      });

      if (uploaded.status === 'failed') {
        Alert.alert(
          'Parse edilemedi',
          uploaded.errorMessage || 'PDF içeriği okunamadı.'
        );
      } else {
        onUploaded?.(uploaded);
      }
    } catch (e: any) {
      Alert.alert('Yükleme başarısız', e?.message || 'Bilinmeyen hata');
    } finally {
      setBusy(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePick}
      disabled={busy}
      activeOpacity={0.8}
      style={{
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        opacity: busy ? 0.7 : 1,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: theme.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Text style={{ fontSize: 24 }}>📄</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: theme.textPrimary }}>
          {busy ? 'Yükleniyor...' : 'Kan Tahlili Yükle'}
        </Text>
        <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
          {busy
            ? 'PDF parse ediliyor, birkaç saniye sürebilir'
            : 'e-Nabız PDF dosyanızı seçin'}
        </Text>
      </View>
      {busy ? (
        <ActivityIndicator color={theme.accent} />
      ) : (
        <Text style={{ fontSize: 22, color: theme.textMuted }}>›</Text>
      )}
    </TouchableOpacity>
  );
}

export default UploadLabButton;
