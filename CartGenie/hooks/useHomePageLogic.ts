import { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useIllnesses } from '@/hooks/useIllnesses';
import { formatShortDate, getRandomTip } from '../utils/homeUtils';
import { getUserLocal, clearUserLocal } from '../utils/userDataManger'; // וודא שהשם תואם לשם הקובץ שלך

const BLOOD_KEY = 'BLOOD_TEST_LAST_UPLOAD';
const TIME_FORMULA = 1000 * 60 * 60 * 24;
const DAYS_IN_YEAR = 365;

export const useHomePageLogic = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // State
  const [userData, setUserData] = useState<any>({}); 
  const [lastBloodTest, setLastBloodTest] = useState<Date | null>(null);
  const [bloodLoading, setBloodLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  
  const { hasSelection, loading: illnessesLoading } = useIllnesses([]);

  // --- טעינה מהקובץ המקומי ---
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        // 1. קריאת הנתונים מהקובץ (כולל hasBloodTests)
        const localData = await getUserLocal();
        
        if (isActive && localData) {
          setUserData(localData);
        }

        // 2. קריאת תאריך (לצורך תצוגת תאריך אם צריך)
        try {
          const raw = await SecureStore.getItemAsync(BLOOD_KEY);
          if (isActive && raw) {
            const d = new Date(raw);
            if (!isNaN(d.getTime())) setLastBloodTest(d);
          }
        } catch (e) {
          console.warn('Blood date error', e);
        } finally {
          if (isActive) setBloodLoading(false);
        }
      };

      loadData();

      return () => { isActive = false; };
    }, [])
  );

  const tip = useMemo(() => getRandomTip(), []);

  const greetingName = userData.firstName || params.username || 'there';

  // --- סטטוסים ---
  
  const personalCompleted = useMemo(() => {
    return !!(userData.firstName && userData.lastName && userData.birthDate && userData.sex);
  }, [userData]);

  const bodyMeasuresCompleted = useMemo(() => {
    return !!(userData.height && userData.weight && userData.waist);
  }, [userData]);

  const hasAnyIllnesses = useMemo(() => {
    const fromFile = userData.illnesses && Array.isArray(userData.illnesses) && userData.illnesses.length > 0;
    return !illnessesLoading && (hasSelection || fromFile);
  }, [userData, hasSelection, illnessesLoading]);

  // Actions
  const toggleMenu = (visible: boolean) => setMenuVisible(visible);

  const onUpdateInfo = () => {
    setMenuVisible(false);
    router.push({ pathname: '/bodyMeasures', params: { username: params.username } });
  };

  const onHelp = () => {
    setMenuVisible(false);
    router.push({ pathname: '/(tabs)/helpScreen' });
  };

  const onLogout = async () => {
    setMenuVisible(false);
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive', 
        onPress: async () => {
          await clearUserLocal();
          router.replace('/login');
        } 
      },
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