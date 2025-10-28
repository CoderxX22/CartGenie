import * as SecureStore from 'expo-secure-store';

const KEY = 'ALLERGIES_V1';

export type StoredAllergies = {
  selected: string[];
  other: string;
};

export async function saveAllergies(data: StoredAllergies) {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(data), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED, // iOS
    });
  } catch (e) {
    console.warn('saveAllergies failed', e);
  }
}

export async function getAllergies(): Promise<StoredAllergies | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as StoredAllergies) : null;
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
