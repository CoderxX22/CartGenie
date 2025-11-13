import * as SecureStore from 'expo-secure-store';

const KEY = 'ALLERGIES_V2'; // новая версия, чтобы не конфликтовать со старой

export type Severity = 'mild' | 'moderate' | 'severe';

export interface StoredAllergies {
  selected: string[];
  other: string;
  /** optional for backward compatibility */
  severity?: Record<string, Severity>;
  /** timestamp of last update */
  updatedAt?: number;
}

export async function saveAllergies(data: StoredAllergies) {
  try {
    const payload: StoredAllergies = {
      selected: Array.isArray(data.selected) ? data.selected : [],
      other: (data.other ?? '').trim(),
      severity: data.severity,
      updatedAt: Date.now(),
    };

    await SecureStore.setItemAsync(KEY, JSON.stringify(payload), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED, // iOS
    });
  } catch (e) {
    console.warn('saveAllergies failed', e);
  }
}

export async function getAllergies(): Promise<StoredAllergies | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAllergies>;
    return {
      selected: Array.isArray(parsed.selected) ? parsed.selected : [],
      other: typeof parsed.other === 'string' ? parsed.other : '',
      severity: parsed.severity ?? {},
      updatedAt: parsed.updatedAt ?? undefined,
    };
  } catch (e) {
    console.warn('getAllergies failed', e);
    return null;
  }
}

export async function clearAllergies() {
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch (e) {
    console.warn('clearAllergies failed', e);
  }
}
