import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '../src/config/api';
import UserDataService, { UserProfilePayload } from '../components/userDataServices';
// 👇 ייבוא ה-Hook הגנרי החדש
import { useUploadFile } from './useUploadFile'; 

interface AnalysisResult {
  rawText?: string;
  diagnosis: string[];
}

export const useBloodTestLogic = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // 👇 שימוש ב-Hook הגנרי לבחירת קובץ
  const { file, chooseSource, clearFile } = useUploadFile();

  // State מקומי רק ללוגיקה העסקית (ניתוח ושמירה)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);

  // ברגע שנבחר קובץ חדש, נאפס את תוצאות הניתוח הקודמות
  useEffect(() => {
    if (file) {
      setAnalysisResults(null);
    }
  }, [file]);

  const getStringParam = (param: string | string[] | undefined): string => {
    if (Array.isArray(param)) return param[0];
    return param || '';
  };

  // --- Actions ---

  const onAnalyze = async () => {
    if (!file || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisResults(null);

    try {
      const formData = new FormData();
      
      // תיקון נתיב לאנדרואיד
      const cleanUri = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');
      
      // זיהוי סוג קובץ נכון - ברירת מחדל ל-PDF אם זה PDF
      const fileType = file.mimeType || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

      formData.append('username', getStringParam(params.username) || 'Guest');
      
      // @ts-ignore
      formData.append('bloodTestFile', {
        uri: cleanUri,
        name: file.name,
        type: fileType, // ✅ תיקון 1: סוג קובץ דינמי ונכון
      });

      console.log('📤 Uploading file:', file.name, fileType);

      const response = await fetch(`${API_URL}/api/blood-test/analyze`, {
        method: 'POST',
        // ✅ תיקון 2: מחקנו את ה-Header של Content-Type!
        // ה-fetch יוסיף אותו לבד עם ה-boundary הנכון.
        headers: {
            'Accept': 'application/json',
        },
        body: formData,
      });

      const json = await response.json();
      console.log('📥 Server Response:', json);

      if (!json.success) throw new Error(json.message || 'Server error');

      setAnalysisResults(json.data);
      Alert.alert('Success', 'Analysis complete!');
    } catch (error) {
      console.error('Upload Error:', error);
      Alert.alert('Error', 'Failed to analyze document.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onManualSelect = () => {
    router.push({
      pathname: '/illnessesScreen',
      params: { ...(params as any) },
    });
  };

  const onSaveAndContinue = async () => {
    if (isSaving) return;
    
    // 1. Process Conditions
    const detectedConditions: string[] = [];
    if (analysisResults) {
      const { diagnosis } = analysisResults;
      if (diagnosis.includes('High Cholesterol')) detectedConditions.push('High cholesterol');
      if (diagnosis.includes('Type 2 Diabetes')) detectedConditions.push('Diabetes Type 2');
      if (diagnosis.includes('High Blood Pressure (Sodium)')) detectedConditions.push('High blood pressure (Hypertension)');
    }
    if (detectedConditions.length === 0) detectedConditions.push('does not ill');

    // 2. Prepare Payload
    const payload: UserProfilePayload = {
      username: getStringParam(params.username),
      firstName: getStringParam(params.firstName),
      lastName: getStringParam(params.lastName),
      birthDate: getStringParam(params.birthDate),
      sex: getStringParam(params.sex),
      ageYears: getStringParam(params.ageYears),
      weight: getStringParam(params.weight),
      height: getStringParam(params.height),
      waist: getStringParam(params.waist),
      bmi: getStringParam(params.bmi),
      whtr: getStringParam(params.whtr),
      illnesses: detectedConditions,
      otherIllnesses: '', 
    };

    try {
      setIsSaving(true);
      await UserDataService.saveUserProfile(payload);

      router.push({
        pathname: '/(tabs)/homePage',
        params: {
          ...payload,
          illnesses: JSON.stringify(payload.illnesses),
        } as any,
      });
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Error", "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    state: { 
      file, // מגיע מ-useUploadFile
      isAnalyzing, 
      isSaving, 
      analysisResults, 
      firstName: getStringParam(params.firstName) 
    },
    actions: { 
      chooseSource, // מגיע מ-useUploadFile
      onAnalyze, 
      onManualSelect, 
      onSaveAndContinue,
      clearFile // אופציונלי: אם תרצה כפתור X לניקוי קובץ
    }
  };
};