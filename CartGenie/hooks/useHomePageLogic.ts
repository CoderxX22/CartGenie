import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useIllnesses } from '@/hooks/useIllnesses';
import { formatShortDate, getRandomTip } from '../utils/homeUtils';

const BLOOD_KEY = 'BLOOD_TEST_LAST_UPLOAD';
const TIME_FORMULA = 1000 * 60 * 60 * 24;
const DAYS_IN_YEAR = 365;

export const useHomePageLogic = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // --- חילוץ בטוח של ה-username ---
  // אנחנו מוודאים שזה מחרוזת ולא מערך (למקרה של שגיאת פרמטרים נדירה)
  const rawUsername = params.username;
  const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;

  // State
  const [lastBloodTest, setLastBloodTest] = useState<Date | null>(null);
  const [bloodLoading, setBloodLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Illinesses Logic
  const { hasSelection, loading: illnessesLoading } = useIllnesses([]);

  // Load Blood Test Date
  useEffect(() => {
    const loadBloodDate = async () => {
      try {
        const raw = await SecureStore.getItemAsync(BLOOD_KEY);
        if (raw) {
          const d = new Date(raw);
          if (!isNaN(d.getTime())) setLastBloodTest(d);
        }
      } catch (e) {
        console.warn('Failed to load blood test date', e);
      } finally {
        setBloodLoading(false);
      }
    };
    loadBloodDate();
  }, []);

  const tip = useMemo(() => getRandomTip(), []);

  // Derived Data
  const firstName = params.firstName as string | undefined;
  const greetingName = firstName || username || 'there';

  const personalCompleted = !!(params.firstName && params.lastName && params.birthDate && params.sex);
  const bodyMeasuresCompleted = !!(params.height && params.weight && params.waist);
  const illnessesFromParams = !!params.illnesses && params.illnesses !== '[]' && params.illnesses !== 'null';
  const hasAnyIllnesses = !illnessesLoading && (hasSelection || illnessesFromParams);

  // Status Calculation
  const bloodStatus = useMemo(() => {
    if (bloodLoading) return { icon: 'ellipse-outline', text: 'Loading...', color: 'gray' };
    if (!lastBloodTest) return { icon: 'ellipse-outline', text: 'Not uploaded yet', color: 'gray' };

    const now = new Date();
    const diffDays = (now.getTime() - lastBloodTest.getTime()) / TIME_FORMULA;
    const formatted = formatShortDate(lastBloodTest);

    if (diffDays > DAYS_IN_YEAR) {
      return { icon: 'alert-circle', text: `Outdated (${formatted})`, color: '#f97316' };
    }
    return { icon: 'checkmark-circle', text: `Up to date (${formatted})`, color: '#22c55e' };
  }, [bloodLoading, lastBloodTest]);

  // Actions
  const toggleMenu = (visible: boolean) => setMenuVisible(visible);

  // --- הפונקציה המתוקנת ---
  const onUpdateInfo = () => {
    setMenuVisible(false);

    // 1. הגנה מפני מצב שבו היוזר חסר
    if (!username) {
      Alert.alert("Error", "Missing user information. Please login again.");
      console.error("onUpdateInfo failed: username is undefined in HomePage params");
      return;
    }

    router.push({ 
      pathname: '/bodyMeasures',
      params: { 
        username: username
      } 
    });
  };

  const onHelp = () => {
    setMenuVisible(false);
    router.push({ pathname: '/(tabs)/helpScreen' });
  };

  const onLogout = () => {
    setMenuVisible(false);
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => router.push({ pathname: '/login' }) },
    ]);
  };

  const onScanReceipt = () => router.push('/scanReceipt');
  const onScanProduct = () => router.push('/scanProduct');

  return {
    state: {
      greetingName,
      tip,
      menuVisible,
      status: {
        personalCompleted,
        bodyMeasuresCompleted,
        bloodStatus,
        hasAnyIllnesses,
        illnessesLoading
      }
    },
    actions: {
      toggleMenu,
      onUpdateInfo,
      onHelp,
      onLogout,
      onScanReceipt,
      onScanProduct
    }
  };
};