import React, { useMemo } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors } from '@/components/appThemeProvider';
import { createScanScreenStyles } from '../../app/styles/scanProduct.styles';

interface HomeBackButtonProps {
  onPress: () => void;
  color?: string;
}

export const HomeBackButton = ({ onPress, color }: HomeBackButtonProps) => {
  const col = useAppColors();
  const styles = useMemo(() => createScanScreenStyles(col), [col]);
  const iconColor = color || col.accent || '#0096c7';

  return (
    <TouchableOpacity onPress={onPress} style={styles.headerButton}>
      <Ionicons name="chevron-back" size={22} color={iconColor} />
      <Text style={[styles.headerButtonText, { color: iconColor }]}>
        Home
      </Text>
    </TouchableOpacity>
  );
};