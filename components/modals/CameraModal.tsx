import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../theme/ThemeContext';
import { FoodRecognitionResult } from '../../types';
import { recognizeFood } from '../../utils/foodRecognition';
import { captureVideoFrame, uriToDataUri } from '../../utils/imageUtils';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onAnalyzed?: (result: FoodRecognitionResult) => void;
}

// Web kamera: getUserMedia ile akış. Stream'i video elementine bağla.
// Parent video element ref'ine erişebilsin diye videoRef callback'le yukarı verilir.
function WebCameraView({
  onError,
  onStreamReady,
  onVideoRef,
}: {
  onError: (msg: string) => void;
  onStreamReady: (stream: MediaStream) => void;
  onVideoRef: (el: HTMLVideoElement | null) => void;
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

  return React.createElement('video', {
    ref: (el: HTMLVideoElement | null) => {
      videoRef.current = el;
      onVideoRef(el);
    },
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
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [coldStart, setColdStart] = useState(false);
  const [result, setResult] = useState<FoodRecognitionResult | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [pickerActive, setPickerActive] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isWeb = Platform.OS === 'web';

  const stopWebStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const resetAll = useCallback(() => {
    setError(null);
    setAnalyzing(false);
    setColdStart(false);
    setResult(null);
    setImageDataUri(null);
    setPickerActive(false);
    stopWebStream();
  }, [stopWebStream]);

  // Modal kapaninca her seyi temizle
  useEffect(() => {
    if (!visible) resetAll();
  }, [visible, resetAll]);

  // Native: modal acilinca otomatik sistem kamerasini ac
  useEffect(() => {
    if (!visible || isWeb || imageDataUri || pickerActive) return;
    setPickerActive(true);

    (async () => {
      try {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!mountedRef.current) return;
        if (!perm.granted) {
          setError('Kamera izni reddedildi. Sistem ayarlarından izin verin.');
          setPickerActive(false);
          return;
        }
        const res = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          allowsEditing: false,
        });
        if (!mountedRef.current) return;
        if (res.canceled) {
          onClose();
          return;
        }
        const asset = res.assets?.[0];
        if (!asset?.uri) {
          setError('Fotoğraf alınamadı.');
          return;
        }
        const dataUri = await uriToDataUri(asset.uri);
        if (!mountedRef.current) return;
        setImageDataUri(dataUri);
      } catch (e: any) {
        if (!mountedRef.current) return;
        setError(e?.message || 'Kamera açılamadı.');
      } finally {
        if (mountedRef.current) setPickerActive(false);
      }
    })();
  }, [visible, isWeb, imageDataUri, pickerActive, onClose]);

  const handleCapture = () => {
    if (!videoElRef.current) {
      setError('Video hazır değil, biraz bekleyin.');
      return;
    }
    try {
      const dataUri = captureVideoFrame(videoElRef.current);
      setImageDataUri(dataUri);
      stopWebStream(); // preview'e gectik, stream'i durdur
    } catch (e: any) {
      setError(e?.message || 'Frame yakalanamadı');
    }
  };

  const handleRetake = async () => {
    setImageDataUri(null);
    setResult(null);
    setError(null);

    if (isWeb) {
      // WebCameraView yeniden mount olsun diye effect tetiklenir (imageDataUri null oldu)
      return;
    }
    // Native: yeniden picker ac
    setPickerActive(true);
    try {
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: false,
      });
      if (!mountedRef.current) return;
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (asset?.uri) {
        const dataUri = await uriToDataUri(asset.uri);
        if (!mountedRef.current) return;
        setImageDataUri(dataUri);
      }
    } catch (e: any) {
      if (!mountedRef.current) return;
      setError(e?.message || 'Kamera açılamadı.');
    } finally {
      if (mountedRef.current) setPickerActive(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imageDataUri) return;
    setAnalyzing(true);
    setError(null);
    setColdStart(false);
    const coldTimer = setTimeout(() => {
      if (mountedRef.current) setColdStart(true);
    }, 5000);
    try {
      const r = await recognizeFood(imageDataUri);
      if (!mountedRef.current) return;
      setResult(r);
    } catch (e: any) {
      if (!mountedRef.current) return;
      setError(e?.message || 'Analiz başarısız');
    } finally {
      clearTimeout(coldTimer);
      if (mountedRef.current) setAnalyzing(false);
    }
  };

  const handleAccept = () => {
    if (!result) return;
    if (result.guven_skoru < 0.5) {
      Alert.alert(
        'Düşük güven',
        `"${result.ad}" için tam emin değilim (%${Math.round(result.guven_skoru * 100)}). Yine de ekleyeyim mi?`,
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: 'Yine de ekle',
            onPress: () => {
              onAnalyzed?.(result);
              onClose();
            },
          },
        ]
      );
      return;
    }
    onAnalyzed?.(result);
    onClose();
  };

  const confidenceTone = (score: number) => {
    if (score >= 0.7) return { color: theme.success, soft: theme.successSoft };
    if (score >= 0.5) return { color: theme.warning, soft: theme.warningSoft };
    return { color: theme.danger, soft: theme.dangerSoft };
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{
        flex: 1,
        backgroundColor: theme.overlay,
        justifyContent: 'center',
        paddingHorizontal: 16,
      }}>
        <View style={{
          backgroundColor: theme.surface,
          borderRadius: 16,
          padding: 20,
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 12 }}>
            📷 Kamera ile Analiz
          </Text>

          {/* Hata bannerı */}
          {error ? (
            <View style={{
              backgroundColor: theme.dangerSoft,
              borderRadius: 10,
              padding: 14,
              borderWidth: 1,
              borderColor: theme.danger,
              marginBottom: 12,
            }}>
              <Text style={{ color: theme.danger, fontWeight: '600', marginBottom: 4 }}>
                Hata
              </Text>
              <Text style={{ color: theme.textPrimary, fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          {/* Kamera / Preview alanı */}
          {imageDataUri ? (
            <Image
              source={{ uri: imageDataUri }}
              style={{
                width: '100%',
                height: 220,
                borderRadius: 12,
                backgroundColor: theme.surfaceAlt,
                marginBottom: 12,
              }}
              resizeMode="cover"
            />
          ) : isWeb && !error ? (
            <View style={{ marginBottom: 12 }}>
              <WebCameraView
                onError={setError}
                onStreamReady={(s) => { streamRef.current = s; }}
                onVideoRef={(el) => { videoElRef.current = el; }}
              />
            </View>
          ) : !isWeb && !error ? (
            <View style={{
              backgroundColor: theme.surfaceAlt,
              borderRadius: 12,
              minHeight: 220,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              {pickerActive ? (
                <>
                  <ActivityIndicator color={theme.accent} />
                  <Text style={{ color: theme.textSecondary, marginTop: 8, fontSize: 13 }}>
                    Kamera açılıyor...
                  </Text>
                </>
              ) : (
                <Text style={{ color: theme.textMuted, fontSize: 13 }}>
                  Sistem kamerası bekleniyor
                </Text>
              )}
            </View>
          ) : null}

          {/* Analiz durumu */}
          {analyzing && (
            <View style={{
              backgroundColor: theme.accentSoft,
              padding: 12,
              borderRadius: 10,
              marginBottom: 12,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color={theme.accent} />
                <Text style={{ marginLeft: 10, color: theme.accent, fontWeight: '600' }}>
                  Analiz ediliyor…
                </Text>
              </View>
              {coldStart && (
                <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 6 }}>
                  Sunucu uyanıyor, ilk istek 30-60 sn sürebilir...
                </Text>
              )}
            </View>
          )}

          {/* Sonuç paneli */}
          {result && !analyzing && (() => {
            const tone = confidenceTone(result.guven_skoru);
            return (
              <View style={{
                backgroundColor: tone.soft,
                padding: 14,
                borderRadius: 10,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: tone.color,
              }}>
                <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 4 }}>
                  ✓ {result.ad}
                </Text>
                <Text style={{ color: theme.textPrimary, fontSize: 14, marginBottom: 8 }}>
                  ~{result.tahmini_kalori_kcal} kcal
                </Text>
                <View style={{
                  alignSelf: 'flex-start',
                  backgroundColor: tone.color,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 8,
                  marginBottom: 6,
                }}>
                  <Text style={{ color: theme.textOnDark, fontSize: 11, fontWeight: '700' }}>
                    Güven: %{Math.round(result.guven_skoru * 100)}
                  </Text>
                </View>
                {result.uyari && (
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
                    {result.uyari}
                  </Text>
                )}
                {/* DEMO: Bu model sadece meyve/sebze tanır (kısıtlı dataset) */}
                <Text style={{ color: theme.textMuted, fontSize: 10, marginTop: 8 }}>
                  Not: Model meyve/sebzeye odaklıdır.
                </Text>
              </View>
            );
          })()}

          {/* Butonlar */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={onClose}
              disabled={analyzing}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: theme.surfaceAlt,
                alignItems: 'center',
                opacity: analyzing ? 0.5 : 1,
              }}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>Kapat</Text>
            </TouchableOpacity>

            {/* Web: imageDataUri yoksa "Cek", varsa retake gosterilir */}
            {isWeb && !imageDataUri && !result && !error && (
              <TouchableOpacity
                onPress={handleCapture}
                disabled={analyzing}
                style={{
                  flex: 1.4,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: theme.swatchDustyRose,
                  alignItems: 'center',
                  opacity: analyzing ? 0.5 : 1,
                }}
              >
                <Text style={{ color: theme.textOnDark, fontWeight: '600' }}>
                  📸 Fotoğraf Çek
                </Text>
              </TouchableOpacity>
            )}

            {/* Preview asamasi: Yeniden Cek + Analiz Et */}
            {imageDataUri && !result && (
              <>
                <TouchableOpacity
                  onPress={handleRetake}
                  disabled={analyzing}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    backgroundColor: theme.surfaceAlt,
                    alignItems: 'center',
                    opacity: analyzing ? 0.5 : 1,
                  }}
                >
                  <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>
                    Yeniden Çek
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAnalyze}
                  disabled={analyzing}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor: theme.accent,
                    alignItems: 'center',
                    opacity: analyzing ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: theme.accentText, fontWeight: '700' }}>
                    {analyzing ? 'Analiz...' : 'Analiz Et'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Sonuc gosterilince Tamam */}
            {result && (
              <>
                <TouchableOpacity
                  onPress={handleRetake}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    backgroundColor: theme.surfaceAlt,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>Tekrar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAccept}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor: theme.success,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: theme.textOnDark, fontWeight: '700' }}>Tamam</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Hata: yalnizca tekrar dene */}
            {error && !analyzing && !result && (
              <TouchableOpacity
                onPress={() => {
                  setError(null);
                  if (imageDataUri) {
                    handleAnalyze();
                  } else {
                    handleRetake();
                  }
                }}
                style={{
                  flex: 1.4,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: theme.accent,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.accentText, fontWeight: '600' }}>
                  Tekrar Dene
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default CameraModal;
