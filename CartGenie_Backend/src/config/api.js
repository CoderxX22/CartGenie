import Constants from "expo-constants";
import { Platform } from "react-native";

export function getApiUrl() {
  // מנסה להשיג את כתובת ה-IP של המחשב דרך Expo
  const hostUri = Constants.expoConfig?.hostUri;

  // אם אין כתובת (למשל בסימולטורים מסוימים או בבילד ייצור)
  if (!hostUri) {
    // באנדרואיד אמולטור, הכתובת של המחשב המארח היא 10.0.2.2
    if (Platform.OS === 'android') {
      return "http://10.0.2.2:4000";
    }
    // ב-iOS סימולטור או בדפדפן, זה localhost רגיל
    return "http://localhost:4000";
  }

  // חילוץ ה-IP מתוך ה-URI (הפורמט הוא IP:PORT)
  const host = hostUri.split(":")[0];
  
  // החזרת הכתובת עם הפורט של השרת שלך (4000)
  return `http://${host}:4000`;
}

export const API_URL = getApiUrl();