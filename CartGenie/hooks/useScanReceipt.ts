import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export type UseScanReceiptOpts = {
  onDenied?: () => void;             
  onError?: (err: unknown) => void;  
};

export function useScanReceipt(opts: UseScanReceiptOpts = {}) {
  const { onDenied, onError } = opts;
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const openCamera = useCallback(async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        onDenied?.();
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 1,
        exif: false,
        cameraType: ImagePicker.CameraType.back,
      });
      
      

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri ?? null;
      setImageUri(uri);
    } catch (e) {
      onError?.(e);
    } finally {
      setLoading(false);
    }
  }, [onDenied, onError]);

  const reset = useCallback(() => setImageUri(null), []);

  return {
    loading,
    imageUri,
    openCamera,
    reset,
  };
}
