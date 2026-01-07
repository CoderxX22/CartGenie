import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '../src/config/api';
import UserDataService, { UserProfilePayload } from '../components/userDataServices';
import { useUploadFile } from './useUploadFile'; 
import PdfThumbnail from "react-native-pdf-thumbnail";

interface AnalysisResult {
  rawText?: string;
  diagnosis: string[];
}

export const useBloodTestLogic = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { file, chooseSource, clearFile } = useUploadFile();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);

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
      formData.append('username', getStringParam(params.username) || 'Guest');

      let filesToUpload: any[] = [];

      const isPdf = file.mimeType === 'application/pdf' || file.name.endsWith('.pdf');

      if (isPdf) {
        try {
          const results = await PdfThumbnail.generateAllPages(file.uri, 90);
          
          filesToUpload = results.map((page, index) => ({
             uri: page.uri,
             name: `page_${index}.jpg`,
             type: 'image/jpeg'
          }));
          
          console.log(`Converted PDF to ${filesToUpload.length} images`);

        } catch (conversionError) {
          console.error("PDF Conversion failed:", conversionError);
          Alert.alert("Error", "Could not process PDF file. Please try a screenshot instead.");
          setIsAnalyzing(false);
          return;
        }

      } else {
        const cleanUri = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');
        
        filesToUpload.push({
          uri: cleanUri,
          name: file.name,
          type: file.mimeType || 'image/jpeg'
        });
      }

      filesToUpload.forEach((fileItem) => {
          // @ts-ignore
          formData.append('bloodTestFiles', {
            uri: fileItem.uri,
            name: fileItem.name,
            type: fileItem.type,
          });
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
      file, 
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
      clearFile 
    }
  };
};