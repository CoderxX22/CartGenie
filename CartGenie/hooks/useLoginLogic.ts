import { useState, useEffect, useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { API_URL } from '../src/config/api';
import { saveUserLocal } from '../utils/userDataManger'; 

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

  // הגדרת גוגל
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '853411236325-qmdu42qrcq7qoiaq0cmu240j2jm2uamb.apps.googleusercontent.com', 
      offlineAccess: true,
    });
  }, []);

  // --- לוגין רגיל ---
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

      await fetchUserDataAndNavigate(cleanUsername);

    } catch (e) {
      console.error('Login error:', e);
      Alert.alert('Login failed', 'Network error or server issue.');
    } finally {
      setIsLoading(false);
    }
  }, [username, password, isLoading, router]);


  // --- לוגין עם גוגל ---
  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const token = response.data?.idToken;

      if (!token) throw new Error('Failed to get ID token from Google');

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

      await fetchUserDataAndNavigate(data.username);

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('In progress');
      } else {
        console.error('Google Login Error:', error);
        Alert.alert('Error', 'An error occurred during Google Sign-In');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- פונקציית העזר המרכזית ---
  const fetchUserDataAndNavigate = async (userToFetch: string) => {
    try {
      await AsyncStorage.setItem('loggedInUser', userToFetch);

      const userDataRes = await fetch(`${API_URL}/api/userdata/${userToFetch}`);
      
      if (userDataRes.status === 200) {
        const json = await userDataRes.json();
        const serverData = json.data; 

        // יצירת האובייקט - הוספנו את hasBloodTests
        const formattedUser = {
            username: userToFetch,
            firstName: serverData.personalDetails?.firstName || '',
            lastName: serverData.personalDetails?.lastName || '',
            birthDate: serverData.personalDetails?.birthDate || '',
            sex: serverData.personalDetails?.sex || '',
            
            ageYears: serverData.personalDetails?.age?.toString() || '',
            weight: serverData.bodyMeasurements?.weight?.toString() || '',
            height: serverData.bodyMeasurements?.height?.toString() || '',
            waist: serverData.bodyMeasurements?.waist?.toString() || '',
            bmi: serverData.bodyMeasurements?.bmi?.toString() || '',
            whtr: serverData.bodyMeasurements?.whtr?.toString() || '',
            
            illnesses: serverData.medicalData?.illnesses || [], 
            otherIllnesses: serverData.medicalData?.otherIllnesses || '',

            // --- השדה החדש ---
            // השרת צריך להחזיר hasBloodTests: true/false
            // אם השרת לא מחזיר כלום, ברירת המחדל תהיה false
            hasBloodTests: !!serverData.hasBloodTests 
        };

        // 1. שמירה לקובץ המקומי
        await saveUserLocal(formattedUser);
        // 2. ניווט לדף הבית
        router.replace({ 
            pathname: '/(tabs)/homePage', 
            params: { 
                ...formattedUser,
                illnesses: JSON.stringify(formattedUser.illnesses),
                // חשוב: אם הראוטר הופך הכל למחרוזות, אולי תצטרך להפוך גם את זה ל-string
                // אבל אם homePage קורא מהקובץ המקומי, זה פחות קריטי כאן
                hasBloodTests: formattedUser.hasBloodTests ? 'true' : 'false' 
            } 
        });

      } else {
        router.replace({ pathname: '/personalDetails', params: { username: userToFetch } });
      }
    } catch (e) {
      console.error('Fetch Data Error:', e);
      Alert.alert('Error', 'Failed to retrieve user data.');
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    isLoading,
    handleLogin,
    handleGoogleLogin,
    isDisabled: isLoading || !username.trim() || !password.trim()
  };
};
