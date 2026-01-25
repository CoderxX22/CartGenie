import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScanReceipt } from '@/hooks/useScanReceipt';

type Props = {
  autoOpen?: boolean;
  onComplete: (uri: string) => void;
};

export default function ScanReceipt({ autoOpen = true, onComplete }: Props) {
  const { loading, imageUri, openCamera, reset } = useScanReceipt({
    onDenied: () => Alert.alert('Camera blocked', 'Please enable camera access in Settings.'),
    onError: () => Alert.alert('Error', 'Failed to open camera.'),
  });

  useEffect(() => {
    if (autoOpen) openCamera();
  }, [autoOpen, openCamera]);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.hint}>Opening camera…</Text>
        </View>
      )}

      {!loading && !imageUri && (
        <View style={styles.center}>
          <Text style={styles.hint}>No photo captured.</Text>
          <TouchableOpacity style={styles.button} onPress={openCamera}>
            <Ionicons name="camera" size={18} color="#fff" />
            <Text style={styles.buttonText}>Open Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && imageUri && (
        <>
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
            
            <View style={StyleSheet.absoluteFill}>
              <View style={styles.overlayCenter}>
                <View style={styles.scannerFrame}>
                  <Ionicons name="scan-outline" size={80} color="rgba(255,255,255,0.4)" />
                </View>
              </View>

              <View style={styles.instructionContainer}>
                <View style={styles.instructionPill}>
                  <Ionicons name="alert-circle-outline" size={16} color="#fff" />
                  <Text style={styles.instructionText}>
                    Is the text sharp and inside the frame?
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <TouchableOpacity style={[styles.button, styles.secondary]} onPress={() => { reset(); openCamera(); }}>
              <Ionicons name="camera-reverse-outline" size={18} color="#0f172a" />
              <Text style={styles.secondaryText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => onComplete(imageUri)}>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  hint: { color: '#64748B' },
  
  imageContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden', 
    backgroundColor: '#000', 
  },
  preview: { flex: 1, opacity: 0.9 }, 
  
  overlayCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: '85%',
    height: '75%',
    borderWidth: 2,
    borderColor: '#4CAF50', 
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.05)', 
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  instructionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  instructionText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  row: { flexDirection: 'row', gap: 10, paddingTop: 12 },
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
  secondary: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  secondaryText: { color: '#0f172a', fontSize: 15, fontWeight: '700' },
});