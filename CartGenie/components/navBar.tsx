// Navbar.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors, AppColors } from '@/components/appThemeProvider';

const ACCENT = '#0096c7';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const col = useAppColors();
  const styles = useMemo(() => makeStyles(col), [col]);

  const items = [
    {
      key: 'Discover',
      label: 'Discover',
      icon: 'compass-outline',
      path: '/discover',
      match: (p: string) => p.includes('/discover'),
    },
    {
      key: 'FeedbackHistory',
      label: 'Feedback History',
      icon: 'document-text-outline',
      path: '/feedbackHistory',
      match: (p: string) => p.includes('/feedbackHistory'),
    },
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
              color={active ? col.accent ?? ACCENT : col.subtitle}
              style={{ marginBottom: 2 }}
            />
            <Text style={[styles.label, active && styles.labelActive]}>
              {it.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: Platform.select({ ios: 20, android: 14 }),
      backgroundColor: c.card,          // light: белый, dark: тёмная карточка
      borderTopWidth: 1,
      borderTopColor: c.inputBorder,
      flexDirection: 'row',
      gap: 8,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: -6 },
        },
        android: { elevation: 10 },
      }),
    },
    item: {
      flex: 1,
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    itemActive: {
      backgroundColor: (c.accent ?? ACCENT) + '22', // лёгкий оверлей акцентного
      borderColor: c.inputBorder,
    },
    label: {
      fontSize: 11,
      color: c.subtitle,
      fontWeight: '600',
    },
    labelActive: {
      color: c.accent ?? ACCENT,
    },
  });
