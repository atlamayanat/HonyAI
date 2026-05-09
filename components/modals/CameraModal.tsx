import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onAnalyzed?: (presetId?: string) => void;
}

// Web kamera: getUserMedia ile akış. Stream'i video elementine bağla.
function WebCameraView({
  onError,
  onStreamReady,
}: {
  onError: (msg: string) => void;
  onStreamReady: (stream: MediaStream) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          onError('Tarayıcınız kamera erişimini desteklemiyor.');
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        onStreamReady(stream);
      } catch (e: any) {
        if (e?.name === 'NotAllowedError') {
          onError('Kamera izni reddedildi. Tarayıcı ayarlarından izin verin.');
        } else if (e?.name === 'NotFoundError') {
          onError('Bağlı bir kamera bulunamadı.');
        } else {
          onError(e?.message || 'Kamera başlatılamadı.');
        }
      }
    })();

    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onError, onStreamReady]);

  // RN-Web altında <video> doğrudan DOM elementi olarak render edilir.
  return React.createElement('video', {
    ref: videoRef,
    autoPlay: true,
    playsInline: true,
    muted: true,
    style: {
      width: '100%',
      maxHeight: 320,
      borderRadius: 12,
      backgroundColor: '#000',
      objectFit: 'cover',
    },
  });
}

function CameraModal({ visible, onClose, onAnalyzed }: CameraModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!visible) {
      setError(null);
      setAnalyzing(false);
      setAnalyzed(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }
  }, [visible]);

  const handleAnalyze = () => {
    setAnalyzing(true);
    // DEMO: Gerçek görsel analiz yapılmıyor, sadece görsel gecikme.
    // Gerçek entegrasyon için: backend'e frame gönder veya on-device model çalıştır.
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 1800);
  };

  const handleAccept = () => {
    onAnalyzed?.(undefined);
    onClose();
  };

  const isWeb = Platform.OS === 'web';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        paddingHorizontal: 16,
      }}>
        <View style={{
          backgroundColor: '#FFF',
          borderRadius: 16,
          padding: 20,
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>
            📷 Kamera ile Analiz
          </Text>

          {error ? (
            <View style={{
              backgroundColor: '#FEF2F2',
              borderRadius: 10,
              padding: 14,
              borderWidth: 1,
              borderColor: '#FECACA',
              marginBottom: 12,
            }}>
              <Text style={{ color: '#991B1B', fontWeight: '600', marginBottom: 4 }}>
                Kamera açılamadı
              </Text>
              <Text style={{ color: '#991B1B', fontSize: 13 }}>{error}</Text>
            </View>
          ) : isWeb ? (
            <View style={{ marginBottom: 12 }}>
              <WebCameraView
                onError={setError}
                onStreamReady={(s) => { streamRef.current = s; }}
              />
            </View>
          ) : (
            <View style={{
              backgroundColor: '#111827',
              borderRadius: 12,
              minHeight: 220,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              {/* DEMO: Gerçek native kamera için expo-camera gerekir. */}
              <Text style={{ fontSize: 64 }}>📷</Text>
            </View>
          )}

          {analyzing && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#EEF2FF',
              padding: 12,
              borderRadius: 10,
              marginBottom: 12,
            }}>
              <ActivityIndicator color="#4F46E5" />
              <Text style={{ marginLeft: 10, color: '#3730A3', fontWeight: '600' }}>
                Analiz ediliyor…
              </Text>
            </View>
          )}

          {analyzed && (
            <View style={{
              backgroundColor: '#ECFDF5',
              padding: 12,
              borderRadius: 10,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#A7F3D0',
            }}>
              <Text style={{ color: '#065F46', fontWeight: '700', marginBottom: 2 }}>
                ✓ Analiz tamamlandı
              </Text>
              <Text style={{ color: '#065F46', fontSize: 12 }}>
                Tahmini içerik: ~300 kcal · orta GI
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#374151', fontWeight: '600' }}>Kapat</Text>
            </TouchableOpacity>
            {!analyzed ? (
              <TouchableOpacity
                onPress={handleAnalyze}
                disabled={analyzing || !!error}
                style={{
                  flex: 1.4,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: '#4F46E5',
                  alignItems: 'center',
                  opacity: analyzing || error ? 0.5 : 1,
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>
                  {analyzing ? 'Analiz ediliyor…' : 'Analiz Et'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleAccept}
                style={{
                  flex: 1.4,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: '#10B981',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Tamam</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default CameraModal;
