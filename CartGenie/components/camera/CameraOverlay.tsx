import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  subtitle: string;
}

export const CameraOverlay = ({ title, subtitle }: Props) => (
  <View style={styles.overlay}>
    <View style={styles.frame} />
    <View style={styles.bottomPanel}>
      <View style={styles.hintBox}>
        <Text style={styles.hintTitle}>{title}</Text>
        <Text style={styles.hintText}>{subtitle}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  frame: { width: '70%', aspectRatio: 1, borderRadius: 18, borderWidth: 3, borderColor: '#fff', backgroundColor: 'transparent' },
  bottomPanel: { width: '100%', paddingHorizontal: 24, alignItems: 'center', marginTop: 24 },
  hintBox: { backgroundColor: 'rgba(15,23,42,0.78)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, alignItems: 'center' },
  hintTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  hintText: { color: '#e5e7eb', fontSize: 13, textAlign: 'center' },
});