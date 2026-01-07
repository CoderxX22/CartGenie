import Constants from "expo-constants";
import { Platform } from "react-native";

const PROD_URL = "https://cartgenie-docker-server.azurewebsites.net"; 

export function getApiUrl() {
  if (!__DEV__) {
    return PROD_URL;
  }

  const hostUri = Constants.expoConfig?.hostUri;

  if (!hostUri) {
    if (Platform.OS === 'android') {
      return "http://10.0.2.2:4000";
    }
    return "http://localhost:4000";
  }

  const host = hostUri.split(":")[0];
  
  return `http://${host}:4000`;
}

export const API_URL = getApiUrl();