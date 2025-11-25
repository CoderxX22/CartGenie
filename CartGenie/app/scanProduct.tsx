// app/scanProduct.tsx
import React from 'react';
import { Stack, useRouter } from 'expo-router';
import ScanProduct from '@/components/ScanProduct';

export default function ScanProductScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Scan Product', headerShown: true }} />
      <ScanProduct
        onComplete={(barcode) => {
          // barcode — строка штрихкода
          router.push({
            pathname: '/productResult',
            params: { barcode },
          } as any); // as any — чтобы TypeScript не ныл по типам путей
        }}
      />
    </>
  );
}
