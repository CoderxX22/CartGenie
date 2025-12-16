import { API_URL } from '../src/config/api';

// שיניתי ל-Partial כדי לאפשר שליחה של חלק מהשדות (למשל רק משקל)
export interface UserProfilePayload {
  username?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  sex?: string;
  ageYears?: string;
  weight?: string;
  height?: string;
  waist?: string;
  bmi?: string;
  illnesses?: string[];
  otherIllnesses?: string;
  whtr?: string;
}

class UserDataService {
  
  /**
   * פונקציית עזר לניקוי שדות שהם null, undefined או מחרוזות ריקות (אם תרצה)
   * זה מונע מהשרת לקבל "זבל" או לקרוס על שדות חסרים
   */
  private static cleanPayload(payload: UserProfilePayload): Partial<UserProfilePayload> {
    const cleaned: any = {};
    
    Object.keys(payload).forEach((key) => {
      const value = (payload as any)[key];
      // אנו שומרים את השדה רק אם הוא לא null ולא undefined
      if (value !== null && value !== undefined) {
        cleaned[key] = value;
      }
    });
    
    return cleaned;
  }

  /**
   * שומר את פרופיל המשתמש המלא (כולל מחלות ונתונים דמוגרפיים)
   * @param payload - אובייקט הנתונים (יכול להיות חלקי)
   */
  static async saveUserProfile(payload: UserProfilePayload): Promise<any> {
    const endpoint = `${API_URL}/api/userdata/save`;
    
    // 1. ניקוי הנתונים לפני השליחה
    const cleanData = this.cleanPayload(payload);

    console.log(`📤 Service: Sending user profile to ${endpoint}`, cleanData);

    // אם אחרי הניקוי אין שדות לשליחה - נזרוק שגיאה או נחזיר תשובה ריקה
    if (Object.keys(cleanData).length === 0) {
        console.warn('⚠️ Service: No valid data to save (all fields were empty)');
        return; 
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST', // שים לב: לעדכונים נהוג להשתמש ב-PUT או PATCH, אבל אם השרת מוגדר ל-POST זה בסדר
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData), // שולחים רק את המידע הנקי
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