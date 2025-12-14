import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createProductResultStyles } from '../../app/styles/productResult.styles';
import { Product } from '../../data/productTypes';

export const ProductMiniCard = ({ product, colors }: { product: Product; colors: AppColors }) => {
  const styles = createProductResultStyles(colors);

  return (
    <View style={styles.miniProductCard}>
      <View>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.brandName}>{product.brand}</Text>
      </View>
      <View style={styles.barcodeBadge}>
        <Ionicons name="barcode-outline" size={14} color={colors.subtitle} />
        <Text style={styles.badgeText}>{product.barcode}</Text>
      </View>
    </View>
  );
};