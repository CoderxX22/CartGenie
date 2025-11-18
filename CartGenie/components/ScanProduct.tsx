// components/ScanProduct.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScanProduct } from '@/hooks/useScanProduct';

type Props = {
  autoOpen?: boolean; // auto-open camera on mount
  onComplete: (uri: string) => void; // pass barcode photo URI upward
};

export default function ScanProduct({ autoOpen = true, onComplete }: Props) {
  const { loading, imageUri, openCamera, reset } = useScanProduct({
    onDenied: () =>
      Alert.alert(
        'Camera Permission Needed',
        'Please enable camera access in Settings to scan products.'
      ),
    onError: () =>
      Alert.alert('Error', 'Unable to open the camera. Please try again.'),
  });

  useEffect(() => {
    if (autoOpen) openCamera();
  }, [autoOpen, openCamera]);

  return (
    <View style={styles.container}>
      {/* CAMERA LOADING */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.hint}>Opening camera…</Text>
        </View>
      )}

      {/* NO IMAGE YET */}
      {!loading && !imageUri && (
        <View style={styles.center}>
          <Ionicons name="barcode-outline" size={42} color="#64748B" />
          <Text style={styles.hint}>No barcode captured yet.</Text>
          <TouchableOpacity style={styles.button} onPress={openCamera}>
            <Ionicons name="camera" size={18} color="#fff" />
            <Text style={styles.buttonText}>Open Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* IMAGE PREVIEW */}
      {!loading && imageUri && (
        <>
          <Image
            source={{ uri: imageUri }}
            style={styles.preview}
            resizeMode="contain"
          />

          <View style={styles.row}>
            {/* RETAKE */}
            <TouchableOpacity
              style={[styles.button, styles.secondary]}
              onPress={() => {
                reset();
                openCamera();
              }}
            >
              <Ionicons
                name="camera-reverse-outline"
                size={18}
                color="#0f172a"
              />
              <Text style={styles.secondaryText}>Retake</Text>
            </TouchableOpacity>

            {/* USE PHOTO */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => onComplete(imageUri)}
            >
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.buttonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  hint: { color: '#64748B', fontSize: 14 },
  preview: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#0096c7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryText: { color: '#0f172a', fontSize: 15, fontWeight: '700' },
});
