import React, { useMemo, memo } from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createScanReceiptStyles } from '../../app/styles/scanReceipt.styles';

interface ReceiptPreviewProps {
  imageUri?: string;
  colors: AppColors;
}

export const ReceiptPreview = memo(({ imageUri, colors }: ReceiptPreviewProps) => {
  // Memoize styles to avoid recreation on every render
  const styles = useMemo(() => createScanReceiptStyles(colors), [colors]);

  return (
    <View style={styles.imageContainer}>
      {imageUri ? (
        <Image 
          source={{ uri: imageUri }} 
          style={styles.previewImage} 
          resizeMode="contain" 
        />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="receipt-outline" size={60} color={colors.subtitle} />
          <Text style={styles.placeholderText}>No receipt selected</Text>
        </View>
      )}
    </View>
  );
});