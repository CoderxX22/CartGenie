import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { API_URL } from '../src/config/api';
import { useUploadFile } from './useUploadFile';

export const useScanReceiptLogic = () => {
  const router = useRouter();

  // 👇 שינוי 1: מושכים את files (מערך)
  const { files, takePhoto, pickFromLibrary, pickDocument } = useUploadFile();
  const [loading, setLoading] = useState(false);

  const uploadAndScan = async () => {
    // 👇 שינוי 2: בדיקה אם המערך ריק
    if (files.length === 0) return;
    if (loading) return;

    setLoading(true);

    try {
      // 👇 שינוי 3: לוקחים את הקובץ הראשון מהמערך
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
        // 👇 שינוי 4: הסרת Content-Type כדי שהדפדפן יגדיר boundary לבד
        headers: { 
            'Accept': 'application/json' 
        },
        body: formData,
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'OCR Failed');

      router.push({
        pathname: '/ReceiptResultsScreen' as Href,
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
    // 👇 שינוי 5: מחזירים את files למסך (כדי שיוכל להציג שהקובץ נבחר)
    state: { files, loading },
    actions: { takePhoto, pickFromLibrary, pickDocument, uploadAndScan },
  };
};