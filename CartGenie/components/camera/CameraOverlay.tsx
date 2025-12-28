import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CameraOverlayProps {
  title: string;
  subtitle: string;
}

export const CameraOverlay = memo(({ title, subtitle }: CameraOverlayProps) => (
  <View style={styles.overlay} pointerEvents="none">
    {/* Scanning Frame */}
    <View style={styles.frame} />
    
    {/* Bottom Hint Panel */}
    <View style={styles.bottomPanel}>
      <View style={styles.hintBox}>
        <Text style={styles.hintTitle}>{title}</Text>
        <Text style={styles.hintText}>{subtitle}</Text>
      </View>
    </View>
  </View>
));

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    zIndex: 10, // Ensures overlay is above camera view
  },
  frame: {
    width: '70%',
    aspectRatio: 1,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    // Slight shadow to help frame stand out against light backgrounds
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bottomPanel: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 40, // Increased spacing from the frame
  },
  hintBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)', // Slightly more opaque for readability
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    maxWidth: '90%',
  },
  hintTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  hintText: {
    color: '#e5e7eb',
    fontSize: 13,
    textAlign: 'center',
  },
});