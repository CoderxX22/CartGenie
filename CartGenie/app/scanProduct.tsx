import React from 'react';
import { Stack } from 'expo-router';

import { useAppColors } from '@/components/appThemeProvider';
import { useScanProductLogic } from '@/hooks/useScanProductLogic';
import ScanProduct from '@/components/ScanProduct';
import { HomeBackButton } from '@/components/scanProduct/HomeBackButton';

const FALLBACK_ACCENT = '#0096c7';

export default function ScanProductScreen() {
  const col = useAppColors();
  const { actions } = useScanProductLogic();

  // Determine the active accent color once for consistency
  const headerTintColor = col.accent ?? FALLBACK_ACCENT;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Scan Product',
          headerShown: true,
          headerStyle: { backgroundColor: col.background },
          headerTitleStyle: { color: col.text },
          headerTintColor: headerTintColor,
          headerShadowVisible: false,
          headerLeft: () => (
            <HomeBackButton 
              onPress={actions.goHome} 
              color={headerTintColor} 
            />
          ),
        }}
      />

      {/* Pass the completion handler from the logic hook.
        If you need to handle reset logic, it should likely be done inside ScanProduct 
        or via a ref/key, but local state here was unused.
      */}
      <ScanProduct onComplete={actions.onScanComplete} />
    </>
  );
}