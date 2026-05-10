import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { TabName } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface EmptyPageProps {
  tabName: TabName;
  icon: string;
}

function EmptyPage({ tabName, icon }: EmptyPageProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
      }}
    >
      <View style={{
        backgroundColor: theme.surface,
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
      }}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>{icon}</Text>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: theme.textPrimary,
          marginBottom: 8,
          textAlign: 'center',
        }}>
          {tabName}
        </Text>
        <Text style={{
          fontSize: 16,
          color: theme.textSecondary,
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: 24,
        }}>
          Bu sayfa şu anda geliştirme aşamasında.{'\n'}
          Yakında burada harika özellikler olacak!
        </Text>
        <View style={{
          backgroundColor: theme.accent,
          borderRadius: 25,
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}>
          <Text style={{
            color: theme.accentText,
            fontSize: 14,
            fontWeight: '600',
          }}>
            Çok Yakında
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default EmptyPage;
