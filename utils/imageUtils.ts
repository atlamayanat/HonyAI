import * as ImageManipulator from 'expo-image-manipulator';

const DEFAULT_MAX_DIM = 1024;
const DEFAULT_QUALITY = 0.7;

// Web: video element'inden frame yakala -> data:image/jpeg dataURL
// 1024px max boyuta küçültür (oran korunur), 0.7 kalite ile JPEG.
export function captureVideoFrame(
  video: HTMLVideoElement,
  maxDim = DEFAULT_MAX_DIM,
  quality = DEFAULT_QUALITY
): string {
  const w0 = video.videoWidth || 640;
  const h0 = video.videoHeight || 480;
  const scale = Math.min(1, maxDim / Math.max(w0, h0));
  const w = Math.round(w0 * scale);
  const h = Math.round(h0 * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context oluşturulamadı');
  ctx.drawImage(video, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}

// Native (ve web): file uri -> resize -> base64 dataURL
// expo-image-manipulator ile manipulate edip base64 alır, prefix ekler.
export async function uriToDataUri(
  uri: string,
  maxDim = DEFAULT_MAX_DIM,
  quality = DEFAULT_QUALITY
): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxDim } }],
    {
      base64: true,
      format: ImageManipulator.SaveFormat.JPEG,
      compress: quality,
    }
  );
  if (!result.base64) {
    throw new Error('Görüntü base64 dönüşümü başarısız');
  }
  return `data:image/jpeg;base64,${result.base64}`;
}
