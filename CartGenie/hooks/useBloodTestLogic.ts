import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '../src/config/api';
import UserDataService, { UserProfilePayload } from '../components/userDataServices';
import { useUploadFile, UploadedFile } from './useUploadFile';

interface AnalysisResult {
  rawText?: string;
  diagnosis: string[];
}

export const useBloodTestLogic = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { files, chooseSource, clearFiles } = useUploadFile();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (files && files.length > 0) {
      setAnalysisResults(null);
    }
  }, [files]);

  const getStringParam = (param: string | string[] | undefined): string => {
    if (Array.isArray(param)) return param[0];
    return param || '';
  };

  const onAnalyze = async () => {
    if (files.length === 0 || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisResults(null);

    try {
      const formData = new FormData();
      
      formData.append('username', getStringParam(params.username) || 'Guest');

      files.forEach((file: UploadedFile, index: number) => {
          const cleanUri = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');
          
          formData.append('images', {
            uri: cleanUri,
            name: file.name || `image_${index}.jpg`,
            type: file.mimeType || 'image/jpeg',
          } as any);
      });

      const response = await fetch(`${API_URL}/api/blood-test/analyze`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        },
        body: formData,
      });

      const json = await response.json();

      if (!json.success) throw new Error(json.message || 'Server error');

      setAnalysisResults(json.data);
      Alert.alert('Success', 'Analysis complete!');
    } catch (error) {
      console.error('Upload Error:', error);
      Alert.alert('Error', 'Failed to analyze documents.');
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
    
    const detectedConditions: string[] = [];
    if (analysisResults) {
      const { diagnosis } = analysisResults;
      if (diagnosis.includes('High Cholesterol')) detectedConditions.push('High cholesterol');
      if (diagnosis.includes('Type 2 Diabetes')) detectedConditions.push('Diabetes Type 2');
      if (diagnosis.includes('High Blood Pressure (Sodium)')) detectedConditions.push('High blood pressure (Hypertension)');
    }
    if (detectedConditions.length === 0) detectedConditions.push('does not ill');

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
      files,
      isAnalyzing, 
      isSaving, 
      analysisResults, 
      firstName: getStringParam(params.firstName) 
    },
    actions: { 
      chooseSource, 
      onAnalyze, 
      onManualSelect, 
      onSaveAndContinue,
      clearFiles 
    }
  };
};