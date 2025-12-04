import * as SecureStore from 'expo-secure-store';

const KEY = 'ILLNESSES_V1'; // уникальный ключ для хранения болезней

export interface StoredIllnesses {
  /** список выбранных болезней */
  selected: string[];
  /** текст "другое" */
  other: string;
  /** время последнего обновления (мс) */
  updatedAt?: number;
}

/**
 * 💾 Сохранение выбранных болезней в SecureStore
 */
export async function saveIllnesses(data: StoredIllnesses) {
  try {
    const payload: StoredIllnesses = {
      selected: Array.isArray(data.selected) ? data.selected : [],
      other: (data.other ?? '').trim(),
      updatedAt: Date.now(),
    };

    await SecureStore.setItemAsync(KEY, JSON.stringify(payload), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED, // для iOS
    });
  } catch (e) {
    console.warn('saveIllnesses failed', e);
  }
}

/**
 * 📥 Загрузка сохранённых болезней из SecureStore
 */
export async function getIllnesses(): Promise<StoredIllnesses | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredIllnesses>;

    return {
      selected: Array.isArray(parsed.selected) ? parsed.selected : [],
      other: typeof parsed.other === 'string' ? parsed.other : '',
      updatedAt: parsed.updatedAt ?? undefined,
    };
  } catch (e) {
    console.warn('getIllnesses failed', e);
    return null;
  }
}

/**
 * 🧹 Очистка данных (удаление сохранённых болезней)
 */
export async function clearIllnesses() {
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch (e) {
    console.warn('clearIllnesses failed', e);
  }
}
