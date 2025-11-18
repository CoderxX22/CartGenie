import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export type UseScanProductOpts = {
  onDenied?: () => void;              // camera permission denied
  onError?: (err: unknown) => void;   // general error
};

export function useScanProduct(opts: UseScanProductOpts = {}) {
  const { onDenied, onError } = opts;

  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const openCamera = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        onDenied?.();
        return;
      }

      // 2. Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: false,              // для штрихкода лучше без crop
        quality: 1,
        exif: false,
        cameraType: ImagePicker.CameraType.back,
      });

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri ?? null;
      setImageUri(uri);
    } catch (err) {
      onError?.(err);
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
