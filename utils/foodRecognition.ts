import { FoodRecognitionResult } from '../types';

// DEMO: Production'da bu URL .env'den (EXPO_PUBLIC_INFERENCE_URL) gelmeli
const HF_SPACE_BASE = 'https://atlamayanat-honyai.hf.space';
const TIMEOUT_MS = 90_000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5_000;

export type FoodRecognitionErrorCode =
  | 'network'
  | 'cold_start'
  | 'parse'
  | 'timeout'
  | 'no_result';

export class FoodRecognitionError extends Error {
  code: FoodRecognitionErrorCode;
  constructor(message: string, code: FoodRecognitionErrorCode) {
    super(message);
    this.name = 'FoodRecognitionError';
    this.code = code;
  }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs = TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timer);
  });
}

async function postPredict(imageDataUri: string): Promise<string> {
  const body = JSON.stringify({
    data: [
      {
        path: null,
        url: imageDataUri,
        meta: { _type: 'gradio.FileData' },
      },
    ],
  });

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `${HF_SPACE_BASE}/gradio_api/call/predict`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        }
      );

      if (res.status === 503) {
        // DEMO: Cold start retry — production'da metric/Sentry ile izlenmeli
        lastErr = new FoodRecognitionError(
          'Sunucu uyanıyor, tekrar deneniyor...',
          'cold_start'
        );
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      if (!res.ok) {
        throw new FoodRecognitionError(
          `Sunucu hatası (${res.status})`,
          'network'
        );
      }

      const json = await res.json();
      const eventId = json?.event_id;
      if (!eventId || typeof eventId !== 'string') {
        throw new FoodRecognitionError(
          'Sunucu yanıtında event_id yok',
          'no_result'
        );
      }
      return eventId;
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        throw new FoodRecognitionError('Zaman aşımı (POST)', 'timeout');
      }
      lastErr = e instanceof Error ? e : new Error(String(e));
      if (e instanceof FoodRecognitionError && e.code !== 'cold_start') {
        throw e;
      }
      // cold_start ya da generic network — retry
      if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY_MS);
    }
  }
  throw lastErr || new FoodRecognitionError('Bilinmeyen hata', 'network');
}

async function getResult(eventId: string): Promise<FoodRecognitionResult> {
  let res: Response;
  try {
    res = await fetchWithTimeout(
      `${HF_SPACE_BASE}/gradio_api/call/predict/${eventId}`,
      { method: 'GET' }
    );
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new FoodRecognitionError('Zaman aşımı (GET)', 'timeout');
    }
    throw new FoodRecognitionError(
      e?.message || 'Ağ hatası',
      'network'
    );
  }

  if (!res.ok) {
    throw new FoodRecognitionError(
      `Sonuç alınamadı (${res.status})`,
      'network'
    );
  }

  // SSE: tüm metni al, satır satır tara, "data: " ile başlayanı bul
  const text = await res.text();
  const lines = text.split('\n');
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    const payload = line.slice(6).trim();
    if (!payload || payload === 'null') continue;
    try {
      const parsed = JSON.parse(payload);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
        return parsed[0] as FoodRecognitionResult;
      }
    } catch {
      // bu satır geçerli JSON değil — sıradakine geç
    }
  }
  throw new FoodRecognitionError(
    'Sonuç akışında geçerli veri bulunamadı',
    'parse'
  );
}

export async function recognizeFood(
  imageDataUri: string
): Promise<FoodRecognitionResult> {
  if (!imageDataUri || !imageDataUri.startsWith('data:image')) {
    throw new FoodRecognitionError(
      'Geçersiz görüntü verisi (dataURI bekleniyor)',
      'parse'
    );
  }
  const eventId = await postPredict(imageDataUri);
  return getResult(eventId);
}
