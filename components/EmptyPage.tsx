import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { TabName } from '../types';

interface EmptyPageProps {
  tabName: TabName;
  icon: string;
}

function EmptyPage({ tabName, icon }: EmptyPageProps) {
  return (
    <ScrollView 
      contentContainerStyle={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingHorizontal: 24 
      }}
    >
      <View style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#F3F4F6'
      }}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>{icon}</Text>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: 8,
          textAlign: 'center'
        }}>
          {tabName}
        </Text>
        <Text style={{ 
          fontSize: 16, 
          color: '#6B7280',
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: 24
        }}>
          Bu sayfa şu anda geliştirme aşamasında.{'\n'}
          Yakında burada harika özellikler olacak!
        </Text>
        <View style={{
          backgroundColor: '#10B981',
          borderRadius: 25,
          paddingHorizontal: 20,
          paddingVertical: 10
        }}>
          <Text style={{ 
            color: '#FFFFFF', 
            fontSize: 14, 
            fontWeight: '600' 
          }}>
            Çok Yakında
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default EmptyPage;