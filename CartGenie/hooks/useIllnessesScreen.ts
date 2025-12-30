import { useState, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useIllnesses } from '@/hooks/useIllnesses';
import UserDataService from '@/components/userDataServices';
import { ILLNESSES_LIST } from '../data/illnesses';

export const useIllnessesScreenLogic = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log(params);
  const {
    selected,
    other,
    setOther,
    toggle,
    clearAll,
    hasSelection,
    loading: loadingIllnesses 
  } = useIllnesses(ILLNESSES_LIST);

  const [query, setQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // --- Filtering ---
  const filteredIllnesses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ILLNESSES_LIST;
    return ILLNESSES_LIST.filter((a) => a.toLowerCase().includes(q));
  }, [query]);

  // --- Actions ---
  const handleToggle = (item: string) => {
    toggle(item);
    Haptics.selectionAsync();
  };

  const handleClearAll = () => {
    clearAll();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const saveDataAndNavigate = async (illnessesList: string[], otherText: string) => {
    // 1. בדיקת תקינות - האם קיבלנו בכלל שם משתמש?
    const currentUsername = params.username;
    
    if (!currentUsername) {
      console.error("❌ Missing username in params:", params);
      Alert.alert('Error', 'User data is missing. Please go back and register again.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        ...params, // מעתיק את הגובה, משקל, וכו'
        username: currentUsername, // מוודאים שהשם נכנס
        illnesses: illnessesList,
        otherIllnesses: otherText,
      };
      
      console.log("Payload to save:", payload); // לוג לניפוי באגים

      // שימוש ב-Service המתוקן (שים לב לסוגריים המסולסלים ב-import למעלה)
      await UserDataService.saveUserProfile(payload);

      // שמירה באחסון המקומי
      await AsyncStorage.setItem('loggedInUser', currentUsername as string);

      router.push({
        pathname: '/(tabs)/homePage',
        params: {
          ...payload,
          illnesses: JSON.stringify(illnessesList),
        },
      });

    } catch (error: any) {
      console.error("Save Error:", error);
      Alert.alert('Save Error', 'Could not save your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const onConfirmNothing = () => {
    Alert.alert(
      'No conditions?',
      'This will confirm you have no known health conditions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Save',
          onPress: async () => {
            await Haptics.selectionAsync();
            saveDataAndNavigate([], '');
          },
        },
      ]
    );
  };

  const onFinish = async () => {
    if (isSaving) return;
    await Haptics.selectionAsync();
    saveDataAndNavigate(Array.from(selected) as string[], other.trim());
  };

  return {
    state: { 
      query, selected, other, filteredIllnesses, isSaving, loadingIllnesses, hasSelection,
      selectedCount: selected.size + (other.trim() ? 1 : 0)
    },
    actions: { 
      setQuery, setOther, handleToggle, handleClearAll, onConfirmNothing, onFinish 
    }
  };
};