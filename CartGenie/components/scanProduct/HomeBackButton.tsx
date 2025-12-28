import React, { useMemo, memo } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors } from '@/components/appThemeProvider';
import { createScanScreenStyles } from '../../app/styles/scanProduct.styles';

interface HomeBackButtonProps {
  onPress: () => void;
  color?: string;
}

export const HomeBackButton = memo(({ onPress, color }: HomeBackButtonProps) => {
  const col = useAppColors();
  const styles = useMemo(() => createScanScreenStyles(col), [col]);

  // Determine effective color (Prop -> Theme -> Default)
  const effectiveColor = color || col.accent || '#0096c7';

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.headerButton}
      activeOpacity={0.7}
    >
      <Ionicons name="chevron-back" size={24} color={effectiveColor} />
      <Text style={[styles.headerButtonText, { color: effectiveColor }]}>
        Home
      </Text>
    </TouchableOpacity>
  );
});