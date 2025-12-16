import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { API_URL } from '../src/config/api';
import { useUploadFile } from './useUploadFile';

export const useScanReceiptLogic = () => {
  const router = useRouter();

  const { file, takePhoto, pickFromLibrary, pickDocument } = useUploadFile();
  const [loading, setLoading] = useState(false);

  const uploadAndScan = async () => {
    if (!file) return;
    if (loading) return;

    setLoading(true);

    try {
      const formData = new FormData();
      const cleanUri = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');

      // @ts-ignore
      formData.append('receiptImage', {
        uri: cleanUri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      });

      const response = await fetch(`${API_URL}/api/ocr/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
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
    state: { file, loading },
    actions: { takePhoto, pickFromLibrary, pickDocument, uploadAndScan },
  };
};
