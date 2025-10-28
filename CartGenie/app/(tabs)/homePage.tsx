import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '@/components/navBar';
const ACCENT = '#0096c7';
const CARD_MAX = 520;

export default function homePage() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Home', headerShown:false }} />
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 96 }]}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome 👋</Text>
          <Text style={styles.subtitle}>
            This is your generic home. Use the tabs below to navigate.
          </Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.primary} activeOpacity={0.9}>
              <Ionicons name="barcode-outline" size={18} color="#fff" />
              <Text style={styles.primaryText}>Scan Nutrition</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primary}
              activeOpacity={0.9}
              onPress={() => router.push('/scanReceipt')}
            >
              <Ionicons name="document-text-outline" size={18} color="#fff" />
              <Text style={styles.primaryText}>Scan Reciept</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tip}>
            <Ionicons name="bulb-outline" size={18} color="#64748B" />
            <Text style={styles.tipText}>
              Pro tip: you can deep-link to any screen with router.push('/path').
            </Text>
          </View>
        </View>
      </ScrollView>
      <Navbar/>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F6FA',
    minHeight: '100%',
  },
  card: {
    width: '100%',
    maxWidth: CARD_MAX,
    marginTop:60,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    ...Platform.select({
      ios: { shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 5 },
    }),
  },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 6, letterSpacing: 0.2 },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 14 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  primary: {
    flex: 1,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...Platform.select({
      ios: { shadowColor: '#0369A1', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.22, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondary: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryText: { color: '#0f172a', fontSize: 15, fontWeight: '700' },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tipText: { flex: 1, fontSize: 13, color: '#334155' },
});
