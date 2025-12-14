// app/scanProduct.tsx
import React, { useCallback } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScanProduct from '@/components/ScanProduct';
import { useAppColors } from '@/components/appThemeProvider';

const ACCENT = '#0096c7';

export default function ScanProductScreen() {
  const router = useRouter();
  const col = useAppColors();

  const goHome = useCallback(() => {
    router.replace('/(tabs)/homePage' as any);
  }, [router]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Scan Product',
          headerShown: true,
          headerStyle: { backgroundColor: col.background },
          headerTitleStyle: { color: col.text },
          headerTintColor: col.accent ?? ACCENT,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={goHome}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 8,
              }}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={col.accent ?? ACCENT}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  marginLeft: 4,
                  color: col.accent ?? ACCENT,
                }}
              >
                Home
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScanProduct
        onComplete={(barcode) => {
          router.push({
            pathname: '/productResult',
            params: { barcode },
          } as any);
        }}
      />
    </>
  );
}
