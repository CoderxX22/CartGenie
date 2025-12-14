import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createScanReceiptStyles } from '../../app/styles/scanReceipt.styles';

interface Props {
  imageUri?: string;
  colors: AppColors;
}

export const ReceiptPreview = ({ imageUri, colors }: Props) => {
  const styles = createScanReceiptStyles(colors);

  return (
    <View style={styles.imageContainer}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="receipt-outline" size={60} color={colors.subtitle} />
          <Text style={styles.placeholderText}>No receipt selected</Text>
        </View>
      )}
    </View>
  );
};