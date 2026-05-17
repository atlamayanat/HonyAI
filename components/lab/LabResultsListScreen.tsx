import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getLabResults } from '../../api/client';
import { useTheme } from '../../theme/ThemeContext';
import { LabResultListItem } from '../../types';
import { formatTrDate } from './labUtils';

interface Props {
  onBack: () => void;
  onSelect: (id: number) => void;
  refreshKey?: number;
}

function LabResultsListScreen({ onBack, onSelect, refreshKey = 0 }: Props) {
  const { theme } = useTheme();
  const [items, setItems] = useState<LabResultListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getLabResults();
      setItems(data);
    } catch (e: any) {
      setError(e?.message || 'Yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const renderItem = ({ item }: { item: LabResultListItem }) => {
    const failed = item.status === 'failed';
    return (
      <TouchableOpacity
        onPress={() => onSelect(item.id)}
        activeOpacity={0.8}
        style={{
          backgroundColor: theme.surface,
          borderRadius: 12,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: theme.border,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: failed ? theme.dangerSoft : theme.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 18 }}>{failed ? '⚠️' : '📄'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textPrimary }}>
            {formatTrDate(item.testDate || item.createdAt)}
            {item.testTime ? ` · ${item.testTime}` : ''}
          </Text>
          {item.facility && (
            <Text
              style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}
              numberOfLines={1}
            >
              {item.facility}
            </Text>
          )}
          <View style={{ flexDirection: 'row', marginTop: 6, gap: 6, flexWrap: 'wrap' }}>
            {failed ? (
              <Badge color={theme.danger} bg={theme.dangerSoft} text="Parse hatası" />
            ) : (
              <>
                <Badge
                  color={theme.textSecondary}
                  bg={theme.statSoft}
                  text={`${item.parameterCount} parametre`}
                />
                {item.abnormalCount > 0 && (
                  <Badge
                    color={theme.warning}
                    bg={theme.warningSoft}
                    text={`${item.abnormalCount} anormal`}
                  />
                )}
              </>
            )}
          </View>
        </View>
        <Text style={{ fontSize: 22, color: theme.textMuted }}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header theme={theme} onBack={onBack} title="Kan Tahlilleri" />
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : error ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.danger }}>Hata: {error}</Text>
          <TouchableOpacity
            onPress={() => load()}
            style={{
              marginTop: 12,
              backgroundColor: theme.accent,
              borderRadius: 10,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: theme.accentText, fontWeight: '600' }}>Tekrar dene</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🧪</Text>
          <Text style={{ fontSize: 16, color: theme.textSecondary, marginBottom: 6 }}>
            Henüz tahlil yüklenmedi
          </Text>
          <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>
            Profil ekranındaki &ldquo;Kan Tahlili Yükle&rdquo; butonundan e-Nabız PDF&apos;inizi yükleyebilirsiniz.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={theme.accent}
            />
          }
        />
      )}
    </View>
  );
}

function Header({
  theme,
  onBack,
  title,
}: {
  theme: any;
  onBack: () => void;
  title: string;
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
        style={{
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 22, color: theme.textPrimary }}>‹</Text>
      </TouchableOpacity>
      <Text
        style={{
          flex: 1,
          fontSize: 16,
          fontWeight: '700',
          color: theme.textPrimary,
          marginLeft: 4,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function Badge({ color, bg, text }: { color: string; bg: string; text: string }) {
  return (
    <View
      style={{
        backgroundColor: bg,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: '700', color }}>{text}</Text>
    </View>
  );
}

export default LabResultsListScreen;
