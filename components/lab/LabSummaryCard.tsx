import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { getLabSummary } from '../../api/client';
import { useTheme } from '../../theme/ThemeContext';
import { LabSummary } from '../../types';
import { ThemeTokens } from '../../theme/tokens';
import {
  HIGHLIGHT_META,
  HIGHLIGHT_ORDER,
  formatTrDate,
  formatValue,
} from './labUtils';

interface Props {
  refreshKey?: number;
  onPress?: () => void;  // tüm listeye gitmek için
}

function LabSummaryCard({ refreshKey = 0, onPress }: Props) {
  const { theme } = useTheme();
  const [summary, setSummary] = useState<LabSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getLabSummary();
      setSummary(s);
    } catch (e: any) {
      setError(e?.message || 'Yüklenemedi');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  if (loading) {
    return (
      <View style={cardBox(theme)}>
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <ActivityIndicator color={theme.accent} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={cardBox(theme)}>
        <Text style={{ color: theme.danger, fontSize: 13 }}>
          Tahlil özeti yüklenemedi: {error}
        </Text>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={cardBox(theme)}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 28, marginRight: 12 }}>🩸</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', fontSize: 14, color: theme.textPrimary }}>
              Henüz tahlil yüklenmedi
            </Text>
            <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
              Aşağıdaki butondan e-Nabız PDF&apos;inizi yükleyebilirsiniz.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      style={cardBox(theme)}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, marginRight: 6 }}>🩸</Text>
            <Text style={{ fontWeight: '700', fontSize: 15, color: theme.textPrimary }}>
              Son Tahlil Sonuçları
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
            {formatTrDate(summary.testDate || summary.createdAt)}
          </Text>
        </View>
        {summary.abnormalCount > 0 && (
          <View style={{
            backgroundColor: theme.warningSoft,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}>
            <Text style={{ color: theme.warning, fontSize: 11, fontWeight: '700' }}>
              {summary.abnormalCount} anormal
            </Text>
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {HIGHLIGHT_ORDER.map((key) => {
          const v = summary.values[key];
          const meta = HIGHLIGHT_META[key];
          if (!v || !meta) return null;
          const valColor = v.isAbnormal ? theme.danger : theme.textPrimary;
          return (
            <View
              key={key}
              style={{
                width: '48%',
                backgroundColor: theme.statSoft,
                borderRadius: 12,
                padding: 10,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 2 }}>
                {meta.label}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: valColor }}>
                  {formatValue(v.value)}
                </Text>
                <Text style={{ fontSize: 10, color: theme.textMuted, marginLeft: 4, marginBottom: 2 }}>
                  {v.unit || meta.defaultUnit}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {onPress && (
        <Text style={{
          fontSize: 12,
          color: theme.accent,
          fontWeight: '600',
          marginTop: 10,
          textAlign: 'right',
        }}>
          Tümünü gör ›
        </Text>
      )}
    </TouchableOpacity>
  );
}

const cardBox = (theme: ThemeTokens) => ({
  backgroundColor: theme.surface,
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: theme.border,
} as const);

export default LabSummaryCard;
