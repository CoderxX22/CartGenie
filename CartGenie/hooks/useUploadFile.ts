import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

interface FileData {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export function useUploadFile() {
  const [file, setFile] = useState<FileData | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // איפוס הפרוגרס כשמחליפים קובץ
  useEffect(() => {
    if (file) {
      setProgress(100); // מציין שהקובץ נבחר בהצלחה
      setUploading(false);
    }
  }, [file]);

  const chooseSource = () => {
    Alert.alert(
      'Select Source',
      'Choose how you want to add your blood test results',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Library',
          onPress: pickFromLibrary,
        },
        {
          text: 'Pick Document',
          onPress: pickDocument,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async () => {
    try {
      // בקשת הרשאה למצלמה
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          name: `photo_${Date.now()}.jpg`,
          size: asset.fileSize,
          mimeType: 'image/jpeg',
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickFromLibrary = async () => {
    try {
      // בקשת הרשאה לגלריה
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Photo library permission is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize,
          mimeType: asset.type || 'image/jpeg',
        });
      }
    } catch (error) {
      console.error('Error picking from library:', error);
      Alert.alert('Error', 'Failed to pick image from library');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      console.log('DocumentPicker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        setFile({
          uri: asset.uri,
          name: asset.name,
          size: asset.size || undefined,
          mimeType: asset.mimeType || undefined,
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const canSubmit = file !== null && !uploading;

  return {
    file,
    progress,
    uploading,
    canSubmit,
    chooseSource,
    setFile,
    setProgress,
    setUploading,
  };
}