import axios from 'axios';
import { API_URL } from '@/src/config/api'; 
// API_URL = הכתובת הבסיסית של השרת (למשל http://10.0.0.5:4000)

export const authService = {
  /**
   * שלב 1: בדיקת התאמה
   */
  verifyIdentity: async (username: string, email: string) => {
    // 👇 שינוי הקידומת ל- /api/passRest
    const response = await axios.post(`${API_URL}/api/passRest/verify-identity`, { username, email });
    return response.data;
  },

  /**
   * שלב 2: איפוס הסיסמה
   */
  resetPassword: async (username: string, newPassword: string) => {
    // 👇 שינוי הקידומת ל- /api/passRest
    const response = await axios.post(`${API_URL}/api/passRest/reset-password`, { username, newPassword });
    return response.data;
  }
};