import { useCallback } from 'react';
import { useRouter } from 'expo-router';

export const useScanProductLogic = () => {
  const router = useRouter();

  const goHome = useCallback(() => {
    // replace כדי שלא יהיה אפשר לחזור למסך המצלמה בטעות
    router.replace('/(tabs)/homePage' as any);
  }, [router]);

  const onScanComplete = useCallback((barcode: string) => {
    router.push({
      pathname: '/productResult',
      params: { barcode },
    } as any);
  }, [router]);

  return {
    actions: { goHome, onScanComplete }
  };
};