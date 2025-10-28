// app/scanReceipt.tsx
import React from 'react';
import { Stack, useRouter } from 'expo-router';
import ScanReceipt from '@/components/ScanReceipt';

export default function ScanReceiptScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Scan Receipt', headerShown: true }} />
      <ScanReceipt
        autoOpen
        onComplete={(uri) => {
          // כאן המשך ה-flow שלך: העלאה/עיבוד/ניווט
          // לדוגמה:
          // router.replace({ pathname: '/processReceipt', params: { uri } });
          router.back(); // דוגמה: חוזר אחורה זמנית
        }}
      />
    </>
  );
}
