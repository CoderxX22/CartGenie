// hooks/useLoginLogic.ts
import { useState, useEffect, useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../src/config/api'; // וודא שהנתיב נכון לפרויקט שלך

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

      // 2. User Data Request
      const userDataRes = await fetch(`${API_URL}/api/userdata/${cleanUsername}`);
      
      // שמירה לוקאלית בכל מקרה של הצלחה ב-Auth
      await AsyncStorage.setItem('loggedInUser', cleanUsername);

      if (userDataRes.status === 200) {
        const json = await userDataRes.json();
        const userData = json.data;

        // הכנת הנתונים (Data Transformation) - הועבר מהמסך לכאן
        const allUserParams = {
            username: cleanUsername,
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
        // מקרה קצה: משתמש קיים ללא דאטה
        router.replace({ pathname: '/personalDetails', params: { username: cleanUsername } });
      }

    } catch (e) {
      console.error('Login error:', e);
      Alert.alert('Login failed', 'Network error or server issue.');
    } finally {
      setIsLoading(false);
    }
  }, [username, password, isLoading, router]);

  const handleGoogleLogin = () => Alert.alert('Coming soon', 'Google sign-in will be available soon.');
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
    isDisabled: isLoading || !username.trim() || !password.trim()
  };
};