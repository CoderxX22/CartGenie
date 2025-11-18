// Navbar.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { key: 'Discover', label: 'Discover', icon: 'compass-outline', path: '/discover', match: (p: string) => p.includes('/discover') },
    { key: 'FeedbackHistory', label: 'Feedback History', icon: 'document-text-outline', path: '/feedbackHistory', match: (p: string) => p.includes('/feedbackHistory') },
  ];

  return (
    <View style={styles.container}>
      {items.map((it) => {
        const active = it.match(pathname || '/');
        return (
          <TouchableOpacity
            key={it.key}
            style={[styles.item, active && styles.itemActive]}
            activeOpacity={0.9}
            onPress={() => router.push(it.path as any)}
          >
            <Ionicons
              name={it.icon as any}
              size={22}
              color={active ? '#0F172A' : '#64748B'}
              style={{ marginBottom: 2 }}
            />
            <Text style={[styles.label, active && styles.labelActive]}>{it.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: 12, paddingTop: 10,
    paddingBottom: Platform.select({ ios: 20, android: 14 }),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#E5E9F2',
    flexDirection: 'row', gap: 8,
    ...Platform.select({
      ios: { shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: -6 } },
      android: { elevation: 10 },
    }),
  },
  item: {
    flex: 1, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#FFF',
  },
  itemActive: { backgroundColor: '#E9F6FB', borderColor: '#CBEAF6' },
  label: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  labelActive: { color: '#0F172A' },
});
