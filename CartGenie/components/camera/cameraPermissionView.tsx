import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';

interface CameraPermissionViewProps {
  status: 'loading' | 'denied';
  onRequestPermission?: () => void;
  colors: AppColors;
}

export const CameraPermissionView = memo(({ status, onRequestPermission, colors }: CameraPermissionViewProps) => {
  const accent = colors.accent || '#0096c7';

  return (
    <View style={styles.container}>
      {status === 'loading' ? (
        <>
          <ActivityIndicator size="large" color={accent} />
          <Text style={styles.text}>Checking permissions…</Text>
        </>
      ) : (
        <>
          <Ionicons name="alert-circle-outline" size={48} color="#f97316" style={{ marginBottom: 12 }} />
          
          <Text style={styles.text}>
            We need access to your camera to scan barcodes.
          </Text>
          <Text style={styles.subText}>
            Please enable camera permissions in your settings.
          </Text>

          {onRequestPermission && (
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: accent }]} 
              onPress={onRequestPermission}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.buttonText}>Grant Permission</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#000', // Camera fallback is usually black
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#e5e7eb',
    fontWeight: '600',
    marginTop: 12,
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#9ca3af', // Gray-400
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    // Add shadow for better visibility
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});