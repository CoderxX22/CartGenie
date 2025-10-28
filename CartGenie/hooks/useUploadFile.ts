import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionSheetIOS, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export type SelectedFile = { name: string; size?: number };

export function useUploadFile() {
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startSimulatedUpload = useCallback((nextFile: SelectedFile) => {
    setFile(nextFile);
    setProgress(0);
    setUploading(true);

    clearTimer();
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const n = p + 6;
        if (n >= 100) {
          clearTimer();
          return 100;
        }
        return n;
      });
    }, 120);
  }, [clearTimer]);

  const pickFromCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera permission required', 'Please enable camera permission to scan.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (res.canceled) return;
    const a = res.assets?.[0];
    if (!a) return;
    startSimulatedUpload({
      name: a.fileName ?? 'Scanned photo.jpg',
      size: a.fileSize,
    });
  }, [startSimulatedUpload]);

  const pickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Photos permission required', 'Please enable photo library permission.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.9,
    });
    if (res.canceled) return;
    const a = res.assets?.[0];
    if (!a) return;
    startSimulatedUpload({
      name: a.fileName ?? 'Selected photo.jpg',
      size: a.fileSize,
    });
  }, [startSimulatedUpload]);

  const pickPdf = useCallback(async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset) return;
      startSimulatedUpload({ name: asset.name ?? 'Selected file.pdf', size: asset.size });
    } catch (e) {
      console.warn('picker error', e);
    }
  }, [startSimulatedUpload]);

  const chooseSource = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Scan with Camera', 'Choose from Photos', 'Pick a PDF', 'Cancel'],
          cancelButtonIndex: 3,
        },
        (i) => {
          if (i === 0) pickFromCamera();
          else if (i === 1) pickFromGallery();
          else if (i === 2) pickPdf();
        }
      );
    } else {
      Alert.alert('Upload', 'Choose source', [
        { text: 'Scan with Camera', onPress: pickFromCamera },
        { text: 'Choose from Photos', onPress: pickFromGallery },
        { text: 'Pick a PDF', onPress: pickPdf },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }, [pickFromCamera, pickFromGallery, pickPdf]);

  useEffect(() => {
    if (progress >= 100 && uploading) setUploading(false);
    return clearTimer;
  }, [progress, uploading, clearTimer]);

  const canSubmit = !!file && progress === 100;

  return {
    file,
    progress,
    uploading,
    canSubmit,
    chooseSource,   
  };
}
