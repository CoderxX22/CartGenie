import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';

interface Props {
  status: 'loading' | 'denied';
  onRequestPermission?: () => void;
  colors: AppColors;
}

export const CameraPermissionView = ({ status, onRequestPermission, colors }: Props) => {
  const accent = colors.accent || '#0096c7';

  return (
    <View style={[styles.center, { backgroundColor: '#000' }]}>
      {status === 'loading' ? (
        <>
          <ActivityIndicator size="large" color={accent} />
          <Text style={[styles.infoText, { color: '#e5e7eb' }]}>Checking permissions…</Text>
        </>
      ) : (
        <>
          <Ionicons name="alert-circle-outline" size={32} color="#f97316" />
          <Text style={[styles.infoText, { color: '#e5e7eb' }]}>
            We need your permission to use the camera for barcode scanning.
          </Text>
          {onRequestPermission && (
            <TouchableOpacity style={[styles.button, { backgroundColor: accent }]} onPress={onRequestPermission}>
              <Ionicons name="camera" size={18} color="#fff" />
              <Text style={styles.buttonText}>Grant Permission</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  infoText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  button: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});