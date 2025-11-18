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
        autoOpen
        onComplete={(productData) => {
          // Here you continue your flow: upload/process/navigate
          // For example:
          // router.replace({ pathname: '/productResult', params: { id: productData.id } });
          router.back(); // temporary: just go back
        }}
      />
    </>
  );
}
