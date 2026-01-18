import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL } from '../src/config/api';
import { useUploadFile } from './useUploadFile';

export const useScanReceiptLogic = () => {
  const router = useRouter();

  // 👇 שינוי 1: שימוש במצב 'replace' וחשיפת הפונקציה clearFiles
  const { files, takePhoto, pickFromLibrary, pickDocument, clearFiles } = useUploadFile({ mode: 'replace' });
  
  const [loading, setLoading] = useState(false);

  const uploadAndScan = async () => {
    if (files.length === 0) return;
    if (loading) return;

    setLoading(true);

    try {
      // במצב replace, הקובץ הרלוונטי הוא תמיד הראשון (והיחיד)
      const fileToUpload = files[0];

      const formData = new FormData();
      const cleanUri = Platform.OS === 'android' ? fileToUpload.uri : fileToUpload.uri.replace('file://', '');

      // @ts-ignore
      formData.append('receiptImage', {
        uri: cleanUri,
        name: fileToUpload.name,
        type: fileToUpload.mimeType || 'image/jpeg',
      });

      const response = await fetch(`${API_URL}/api/ocr/scan`, {
        method: 'POST',
        headers: { 
            'Accept': 'application/json' 
        },
        body: formData,
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'OCR Failed');

      // 👇 שינוי 2: איפוס הקבצים מיד לאחר הצלחה
      clearFiles();

      router.push({
        // 👇 שינוי 3: עקיפת שגיאת הטיפוסים של הראוטר
        pathname: '/ReceiptResultsScreen' as any,
        params: {
          rawText: data.data.rawText,
          extractedItems: JSON.stringify(data.data.extractedItems),
        },
      });
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Error', 'Failed to scan receipt.');
    } finally {
      setLoading(false);
    }
  };

  return {
    state: { files, loading },
    actions: { takePhoto, pickFromLibrary, pickDocument, uploadAndScan, clearFiles },
  };
};