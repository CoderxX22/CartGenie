import React, { useMemo, memo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createProductResultStyles } from '../../app/styles/productResult.styles';
import { Product } from '../../data/productTypes';

interface ProductMiniCardProps {
  product: Product;
  colors: AppColors;
}

export const ProductMiniCard = memo(({ product, colors }: ProductMiniCardProps) => {
  // Memoize styles to avoid recreation on every render
  const styles = useMemo(() => createProductResultStyles(colors), [colors]);

  return (
    <View style={styles.miniProductCard}>
      {/* Product Details */}
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.brandName} numberOfLines={1}>
          {product.brand}
        </Text>
      </View>

      {/* Barcode Badge */}
      <View style={styles.barcodeBadge}>
        <Ionicons name="barcode-outline" size={14} color={colors.subtitle} />
        <Text style={styles.badgeText}>{product.barcode}</Text>
      </View>
    </View>
  );
});