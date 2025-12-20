// hooks/useLoginLogic.ts
import { useState, useEffect, useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'; // <--- הוספה
import { API_URL } from '../src/config/api';

export const useLoginLogic = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // חסימת כפתור חזרה באנדרואיד
  useEffect(() => {
    const onBackPress = () => true;
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  // <--- הוספה: הגדרת גוגל (החלף את המחרוזת ב-Client ID האמיתי שלך)
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '853411236325-qmdu42qrcq7qoiaq0cmu240j2jm2uamb.apps.googleusercontent.com', 
      offlineAccess: true,
    });
  }, []);

  const handleLogin = useCallback(async () => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      Alert.alert('Missing information', 'Please fill in both fields.');
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      // 1. Auth Request
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
      });

      let loginData: any = {};
      try { loginData = await loginRes.json(); } catch {}

      if (!loginRes.ok || !loginData?.success) {
        Alert.alert('Login failed', loginData?.message || 'Invalid credentials.');
        return;
      }

      // --- המשך הלוגיקה זהה למה שיקרה בגוגל, לכן זה משוכפל למטה ---
      // 2. User Data Request
      await fetchUserDataAndNavigate(cleanUsername);

    } catch (e) {
      console.error('Login error:', e);
      Alert.alert('Login failed', 'Network error or server issue.');
    } finally {
      setIsLoading(false);
    }
  }, [username, password, isLoading, router]);


  // <--- הוספה: הפונקציה החדשה להתחברות עם גוגל
  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await GoogleSignin.hasPlayServices();
      
      // 1. ביצוע ההתחברות
      const response = await GoogleSignin.signIn();
      
      // התיקון: בגרסה החדשה הנתונים נמצאים בתוך 'data'
      // אנחנו מוודאים ש-'data' קיים לפני שניגשים ל-'idToken'
      const token = response.data?.idToken;

      if (!token) {
        throw new Error('Failed to get ID token from Google');
      }

      // 2. שליחת הטוקן לשרת שלך
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        Alert.alert('Login Failed', data.message || 'Google authentication failed on server.');
        return;
      }

      // קבלת ה-username מהשרת
      const googleUsername = data.username;

      // 3. משיכת נתונים וניווט
      await fetchUserDataAndNavigate(googleUsername);

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Operation is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available');
      } else {
        console.error('Google Login Error:', error);
        Alert.alert('Error', 'An error occurred during Google Sign-In');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // <--- הוספה: פונקציית עזר למניעת שכפול קוד (משמשת גם את Login וגם את Google)
  const fetchUserDataAndNavigate = async (userToFetch: string) => {
    try {
      // שמירה לוקאלית
      await AsyncStorage.setItem('loggedInUser', userToFetch);

      const userDataRes = await fetch(`${API_URL}/api/userdata/${userToFetch}`);
      
      if (userDataRes.status === 200) {
        const json = await userDataRes.json();
        const userData = json.data;

        // הכנת הנתונים (Data Transformation)
        const allUserParams = {
            username: userToFetch,
            firstName: userData.personalDetails?.firstName || '',
            lastName: userData.personalDetails?.lastName || '',
            birthDate: userData.personalDetails?.birthDate || '',
            ageYears: userData.personalDetails?.age?.toString() || '',
            sex: userData.personalDetails?.sex || '',
            weight: userData.bodyMeasurements?.weight?.toString() || '',
            height: userData.bodyMeasurements?.height?.toString() || '',
            waist: userData.bodyMeasurements?.waist?.toString() || '',
            bmi: userData.bodyMeasurements?.bmi?.toString() || '',
            whtr: userData.bodyMeasurements?.whtr?.toString() || '',
            illnesses: JSON.stringify(userData.medicalData?.illnesses?.map((i: any) => i.name) || []),
            otherIllnesses: userData.medicalData?.otherIllnesses || '',
        };

        router.replace({ pathname: '/(tabs)/homePage', params: allUserParams });
      } else {
        // מקרה קצה: משתמש קיים ללא דאטה (או משתמש גוגל חדש שצריך להשלים פרטים)
        router.replace({ pathname: '/personalDetails', params: { username: userToFetch } });
      }
    } catch (e) {
      console.error('Fetch Data Error:', e);
      Alert.alert('Error', 'Failed to retrieve user data.');
    }
  };

  const handleForgotPassword = () => Alert.alert('Not implemented', 'Password recovery not available yet.');

  return {
    username,
    setUsername,
    password,
    setPassword,
    isLoading,
    handleLogin,
    handleGoogleLogin,
    handleForgotPassword,
    isDisabled: isLoading || !username.trim() || !password.trim() // שים לב: זה משפיע רק על כפתור הלוגין הרגיל
  };
};