import { API_URL } from '../src/config/api';

// ממשק עבור הנתונים שנשלחים לשמירת הפרופיל
export interface UserProfilePayload {
  username: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  sex: string;
  ageYears: string;
  weight: string;
  height: string;
  waist: string;
  bmi: string;
  illnesses: string[];
  otherIllnesses: string;
  whtr: string;
}

class UserDataService {
  /**
   * שומר את פרופיל המשתמש המלא (כולל מחלות ונתונים דמוגרפיים)
   * @param payload - אובייקט הנתונים לשליחה המוגדר ע"י הממשק UserProfilePayload
   */
  static async saveUserProfile(payload: UserProfilePayload): Promise<any> {
    const endpoint = `${API_URL}/api/userdata/save`;
    console.log(`📤 Service: Sending user profile to ${endpoint}`);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ Service: Server returned non-JSON:', responseText.slice(0, 200));
        throw new Error(`Server returned unexpected response. Status: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(result.message || `Server Error: ${response.status}`);
      }

      console.log('✅ Service: Data saved successfully');
      return result;
    } catch (error) {
      console.error('❌ Service Error (saveUserProfile):', error);
      throw error;
    }
  }
}

export default UserDataService;