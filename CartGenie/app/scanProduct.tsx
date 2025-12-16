import React from 'react';
import { Stack } from 'expo-router';
import { useAppColors } from '@/components/appThemeProvider';
import ScanProduct from '@/components/ScanProduct';
import { useScanProductLogic } from '@/hooks/useScanProductLogic';
import { HomeBackButton } from '@/components/scanProduct/HomeBackButton';

import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react'; // וודא שיש לך גם את אלו

const ACCENT = '#0096c7';

export default function ScanProductScreen() {
  const col = useAppColors();
  const { actions } = useScanProductLogic();
  const [scanned, setScanned] = useState(false);
  
  useFocusEffect(
    useCallback(() => {
      setScanned(false); // משחרר את הנעילה
    }, [])
  );

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
            <HomeBackButton 
              onPress={actions.goHome} 
              color={col.accent ?? ACCENT} 
            />
          ),
        }}
      />

      <ScanProduct onComplete={actions.onScanComplete} />
    </>
  );
}