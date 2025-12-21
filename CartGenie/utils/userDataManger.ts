import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_STORAGE_KEY = 'app_user_data_v1';

// פונקציה לשמירת נתונים (תקרא לה כשאתה עושה Login או Save)
export const saveUserLocal = async (userData: any) => {
  try {
    // אנחנו ממזגים עם מה שכבר קיים כדי לא לדרוס שדות אחרים
    const existing = await getUserLocal();
    const merged = { ...existing, ...userData };
    
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(merged));
    console.log("💾 Saved to local file:", merged);
  } catch (e) {
    console.error("Failed to save user locally", e);
  }
};

// פונקציה לקריאת נתונים (דף הבית ישתמש בזה)
export const getUserLocal = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Failed to read user locally", e);
    return null;
  }
};

// פונקציה למחיקת נתונים (למשל ב-Logout)
export const clearUserLocal = async () => {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear user", e);
  }
};