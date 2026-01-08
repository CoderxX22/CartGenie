import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export interface UploadedFile {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export function useUploadFile() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, 
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newFile: UploadedFile = {
          uri: asset.uri,
          name: `photo_${Date.now()}.jpg`,
          size: asset.fileSize,
          mimeType: 'image/jpeg',
        };
        setFiles((prev) => [...prev, newFile]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  }, []);

  const pickFromLibrary = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Library permission is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets) {
        const newFiles: UploadedFile[] = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize,
          mimeType: asset.mimeType || 'image/jpeg',
        }));
        setFiles((prev) => [...prev, ...newFiles]);
      }
    } catch (error) {
      console.error('Error picking from library:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  }, []);

  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const newFiles: UploadedFile[] = result.assets
          .filter((asset) => asset.mimeType !== 'application/pdf')
          .map((asset) => ({
            uri: asset.uri,
            name: asset.name,
            size: asset.size,
            mimeType: asset.mimeType || 'image/jpeg',
          }));

        if (newFiles.length === 0 && result.assets.length > 0) {
            Alert.alert("Invalid selection", "Please select image files only.");
            return;
        }

        setFiles((prev) => [...prev, ...newFiles]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  }, []);

  const chooseSource = useCallback(() => {
    Alert.alert(
      'Select Source',
      'Choose how you want to add your file',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickFromLibrary },
        { text: 'Pick Document', onPress: pickDocument },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [takePhoto, pickFromLibrary, pickDocument]);

  const clearFiles = useCallback(() => setFiles([]), []);

  return {
    files,
    chooseSource,
    takePhoto,
    pickFromLibrary,
    pickDocument,
    clearFiles,
  };
}