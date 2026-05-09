import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  Activity,
  ActivityResponse,
  ActivityType,
  GlucoseReading,
  Settings,
  StepsToday,
  User,
} from '../types';

const BACKEND_PORT = 3001;

function resolveApiBase(): string {
  // Web: localhost yeterli
  if (Platform.OS === 'web') return `http://localhost:${BACKEND_PORT}`;

  // Expo Go / dev client: Metro bundler'ın IP'sini kullan
  const hostUri =
    (Constants.expoConfig as any)?.hostUri ||
    (Constants as any).manifest?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const host = String(hostUri).split(':')[0];
    return `http://${host}:${BACKEND_PORT}`;
  }

  // Android emulator fallback
  if (Platform.OS === 'android') return `http://10.0.2.2:${BACKEND_PORT}`;
  return `http://localhost:${BACKEND_PORT}`;
}

export const API_BASE = resolveApiBase();

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.error || detail;
    } catch {}
    throw new ApiError(detail, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// --- USER ---
export const getUser = () => request<User>('/api/user');
export const updateUser = (patch: Partial<User>) =>
  request<User>('/api/user', { method: 'PUT', body: JSON.stringify(patch) });

// --- READINGS ---
export const getLatestReading = () =>
  request<GlucoseReading | null>('/api/readings/latest');
export const getReadings = (days = 7) =>
  request<GlucoseReading[]>(`/api/readings?days=${days}`);
export const addReading = (value: number, note?: string) =>
  request<GlucoseReading>('/api/readings', {
    method: 'POST',
    body: JSON.stringify({ value, note }),
  });
export const deleteReading = (id: number) =>
  request<{ ok: true }>(`/api/readings/${id}`, { method: 'DELETE' });

// --- ACTIVITIES ---
export const addActivity = (
  type: ActivityType,
  name: string,
  calories: number
) =>
  request<ActivityResponse>('/api/activities', {
    method: 'POST',
    body: JSON.stringify({ type, name, calories }),
  });
export const getActivities = (days = 7) =>
  request<Activity[]>(`/api/activities?days=${days}`);
export const deleteActivity = (id: number) =>
  request<{ ok: true }>(`/api/activities/${id}`, { method: 'DELETE' });

// --- STEPS ---
export const getStepsToday = () => request<StepsToday>('/api/steps/today');

// --- SETTINGS ---
export const getSettings = () => request<Settings>('/api/settings');
export const updateSettings = (patch: Partial<Settings>) =>
  request<Settings>('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(patch),
  });

export { ApiError };
