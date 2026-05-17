import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { deleteLabResult, getLabResult } from '../../api/client';
import { useTheme } from '../../theme/ThemeContext';
import { LabParameter, LabResult } from '../../types';
import LabParameterTile from './LabParameterTile';
import {
  CATEGORY_NAMES,
  CATEGORY_ORDER,
  formatTrDate,
} from './labUtils';

interface Props {
  labId: number;
  onBack: () => void;
  onDeleted: () => void;
}

function LabResultDetailScreen({ labId, onBack, onDeleted }: Props) {
  const { theme } = useTheme();
  const [result, setResult] = useState<LabResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLabResult(labId);
      setResult(data);
    } catch (e: any) {
      setError(e?.message || 'Yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = () => {
    Alert.alert(
      'Tahlili sil',
      'Bu tahlil ve PDF dosyası kalıcı olarak silinecek. Onaylıyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLabResult(labId);
              onDeleted();
            } catch (e: any) {
              Alert.alert('Silinemedi', e?.message || 'Sunucu hatası');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (error || !result) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <Header theme={theme} onBack={onBack} title="Tahlil" />
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.danger }}>{error || 'Tahlil bulunamadı'}</Text>
        </View>
      </View>
    );
  }

  const isFailed = result.status === 'failed';

  // Parametreleri kategoriye göre grupla
  const grouped: Record<string, [string, LabParameter][]> = {};
  for (const [key, p] of Object.entries(result.parameters)) {
    const cat = p.category || 'unknown';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push([key, p]);
  }
  // Her grup içindeki parametreleri raw_label'a göre sırala
  for (const arr of Object.values(grouped)) {
    arr.sort((a, b) => (a[1].rawLabel || a[0]).localeCompare(b[1].rawLabel || b[0]));
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header theme={theme} onBack={onBack} title="Tahlil Detayı" onDelete={confirmDelete} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.border,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '800', color: theme.textPrimary }}>
            {formatTrDate(result.testDate || result.createdAt)}
            {result.testTime ? ` · ${result.testTime}` : ''}
          </Text>
          {result.facility && (
            <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>
              {result.facility}
            </Text>
          )}
          {result.patientName && (
            <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
              {result.patientName}
              {result.patientGender ? ` · ${result.patientGender}` : ''}
            </Text>
          )}

          {isFailed ? (
            <View
              style={{
                marginTop: 12,
                padding: 10,
                backgroundColor: theme.dangerSoft,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.danger,
              }}
            >
              <Text style={{ color: theme.danger, fontWeight: '700' }}>
                PDF parse edilemedi
              </Text>
              {result.errorMessage && (
                <Text style={{ color: theme.textPrimary, fontSize: 12, marginTop: 4 }}>
                  {result.errorMessage}
                </Text>
              )}
            </View>
          ) : result.abnormalCount > 0 ? (
            <View
              style={{
                marginTop: 12,
                padding: 10,
                backgroundColor: theme.warningSoft,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 18, marginRight: 8 }}>⚠️</Text>
              <Text style={{ color: theme.warning, fontWeight: '600', flex: 1 }}>
                {result.abnormalCount} parametre referans aralığı dışında
              </Text>
            </View>
          ) : (
            <View
              style={{
                marginTop: 12,
                padding: 10,
                backgroundColor: theme.successSoft,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 18, marginRight: 8 }}>✅</Text>
              <Text style={{ color: theme.success, fontWeight: '600', flex: 1 }}>
                Tüm parametreler referans aralığında
              </Text>
            </View>
          )}
        </View>

        {CATEGORY_ORDER.filter((c) => grouped[c]?.length > 0).map((cat) => {
          const arr = grouped[cat];
          return (
            <View key={cat} style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: theme.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                {CATEGORY_NAMES[cat] || cat}
              </Text>
              <View
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                  overflow: 'hidden',
                }}
              >
                {arr.map(([k, p], idx) => (
                  <LabParameterTile
                    key={k}
                    paramKey={k}
                    parameter={p}
                    isLast={idx === arr.length - 1}
                  />
                ))}
              </View>
            </View>
          );
        })}

        {result.sourceFileName && (
          <Text style={{ fontSize: 11, color: theme.textMuted, textAlign: 'center', marginTop: 8 }}>
            Kaynak: {result.sourceFileName}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

function Header({
  theme,
  onBack,
  title,
  onDelete,
}: {
  theme: any;
  onBack: () => void;
  title: string;
  onDelete?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        backgroundColor: theme.surface,
      }}
    >
      <TouchableOpacity
        onPress={onBack}
        style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ fontSize: 22, color: theme.textPrimary }}>‹</Text>
      </TouchableOpacity>
      <Text style={{ flex: 1, fontSize: 16, fontWeight: '700', color: theme.textPrimary, marginLeft: 4 }}>
        {title}
      </Text>
      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={{ paddingHorizontal: 12, paddingVertical: 6 }}
        >
          <Text style={{ color: theme.danger, fontWeight: '600', fontSize: 13 }}>Sil</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default LabResultDetailScreen;
