import Constants from "expo-constants";

export function getApiUrl() {
  const hostUri = Constants.expoConfig?.hostUri;

  if (!hostUri) return "http://10.0.2.2:4000";

  const host = hostUri.split(":")[0];
  return `http://${host}:4000`;
}

export const API_URL = getApiUrl();
