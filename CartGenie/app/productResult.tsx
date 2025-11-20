import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function ProductResultScreen() {
  const { barcode } = useLocalSearchParams<{ barcode?: string }>();

  return (
    <>
      <Stack.Screen options={{ title: 'Scanned Product' }} />

      <View style={styles.container}>
        <Text style={styles.label}>Scanned barcode:</Text>

        <Text style={styles.barcode}>
          {barcode ?? 'No barcode'}
        </Text>

        <Text style={styles.hint}>
          (Searching in the database is temporarily disabled)
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  label: {
    fontSize: 16,
    color: '#6B7280'
  },
  barcode: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A'
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: '#9CA3AF'
  }
});
