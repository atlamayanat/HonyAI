import React from 'react';
import { Text, View } from 'react-native';
import { LabParameter } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import { abnormalDirection, formatReferenceRange, formatValue } from './labUtils';

interface Props {
  paramKey: string;
  parameter: LabParameter;
  isLast?: boolean;
}

function LabParameterTile({ paramKey, parameter, isLast }: Props) {
  const { theme } = useTheme();
  const direction = abnormalDirection(parameter);
  const isAbnormal = parameter.isAbnormal || direction !== 'normal';

  const valueColor = isAbnormal ? theme.danger : theme.success;
  const bgSoft = isAbnormal ? theme.dangerSoft : 'transparent';

  const arrow = direction === 'high' ? '▲' : direction === 'low' ? '▼' : null;

  return (
    <View
      style={{
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.border,
        backgroundColor: bgSoft,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: isAbnormal ? theme.danger : theme.success,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 12, color: theme.textOnDark, fontWeight: '700' }}>
          {isAbnormal ? '!' : '✓'}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary }} numberOfLines={2}>
          {parameter.rawLabel || paramKey.replace(/_/g, ' ').toUpperCase()}
        </Text>
        <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
          Referans: {formatReferenceRange(parameter)}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', minWidth: 70 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {arrow && (
            <Text style={{ color: valueColor, fontSize: 12, marginRight: 3 }}>
              {arrow}
            </Text>
          )}
          <Text style={{ fontSize: 17, fontWeight: '800', color: valueColor }}>
            {formatValue(parameter.value)}
          </Text>
        </View>
        {parameter.unit && (
          <Text style={{ fontSize: 10, color: theme.textMuted, marginTop: 1 }}>
            {parameter.unit}
          </Text>
        )}
      </View>
    </View>
  );
}

export default LabParameterTile;
