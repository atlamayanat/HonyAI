import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface State {
  error: Error | null;
  info: string | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): State {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    this.setState({ info: info.componentStack || null });
  }

  reset = () => this.setState({ error: null, info: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: '#1a1a1a' }}
        contentContainerStyle={{ padding: 20, paddingTop: 60 }}
      >
        <Text style={{ color: '#ff6b6b', fontSize: 22, fontWeight: '800', marginBottom: 8 }}>
          Uygulama hatası
        </Text>
        <Text style={{ color: '#fff', fontSize: 14, marginBottom: 16 }}>
          {this.state.error.message}
        </Text>
        <View style={{ backgroundColor: '#000', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Text selectable style={{ color: '#aaa', fontFamily: 'monospace', fontSize: 11 }}>
            {this.state.error.stack || '(stack yok)'}
          </Text>
        </View>
        {this.state.info ? (
          <View style={{ backgroundColor: '#000', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ color: '#888', fontSize: 11, marginBottom: 6 }}>Component stack:</Text>
            <Text selectable style={{ color: '#aaa', fontFamily: 'monospace', fontSize: 10 }}>
              {this.state.info}
            </Text>
          </View>
        ) : null}
        <TouchableOpacity
          onPress={this.reset}
          style={{
            backgroundColor: '#4a9eff',
            padding: 14,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Tekrar dene</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

export default ErrorBoundary;
