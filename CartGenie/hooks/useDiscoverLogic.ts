import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useIllnesses } from '@/hooks/useIllnesses';
import { Mode, PRODUCT_ITEMS, ProductItem } from '../data/discoverData';

export const useDiscoverLogic = () => {
  const router = useRouter();
  
  // State
  const [mode, setMode] = useState<Mode>('products');
  const [query, setQuery] = useState('');

  // Illnesses Context
  const { selected } = useIllnesses([]);
  
  // Create a Set for faster lookups
  const selectedIllnesses = useMemo(
    () => new Set(Array.from(selected)),
    [selected],
  );

  // Filter Logic
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCT_ITEMS.filter((item) =>
      item.name.toLowerCase().includes(q),
    );
  }, [query]);

  // Suitability Check Logic
  const isSuitable = (item: ProductItem) => {
    const hasConflict = item.avoidFor.some((ill) => selectedIllnesses.has(ill));
    return !hasConflict;
  };

  // Actions
  const goHome = () => router.push('/(tabs)/homePage');

  return {
    state: { mode, query, filteredProducts },
    setters: { setMode, setQuery },
    actions: { isSuitable, goHome }
  };
};