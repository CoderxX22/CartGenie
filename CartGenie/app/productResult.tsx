import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { useAppColors } from '@/components/appThemeProvider';
import { useProductAnalysis } from '../hooks/useProductAnalysis';
import { createProductResultStyles } from './styles/productResult.styles';

// DRY Components
import { AiAnalysisCard } from '../components/productResult/AiAnalysisCard';
import { ProductMiniCard } from '../components/productResult/ProductMiniCard';
import { LoadingView, ErrorView } from '../components/productResult/ResultStates';

export default function ProductResultScreen() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const router = useRouter();
  const col = useAppColors();
  const styles = useMemo(() => createProductResultStyles(col), [col]);

  // Hook handles logic
  const { state } = useProductAnalysis(barcode);
  const { product, aiResult, loadingStep, errorMsg } = state;

  // 1. Loading State
  if (loadingStep !== 'IDLE') {
    return (
      <>
        <Stack.Screen options={{ title: 'AI Agent' }} />
        <LoadingView step={loadingStep} colors={col} />
      </>
    );
  }

  // 2. Error State
  if (errorMsg || !product) {
    return (
      <>
        <Stack.Screen options={{ title: 'Unknown Product' }} />
        <ErrorView 
          error={errorMsg} 
          barcode={barcode} 
          onRetry={() => router.back()} 
          onDone={() => router.push('/(tabs)/homePage')}
          colors={col} 
        />
      </>
    );
  }

  // 3. Success State
  return (
    <>
      <Stack.Screen options={{ title: 'Health Analysis', headerBackTitle: 'Back' }} />

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* Product Info */}
        <ProductMiniCard product={product} colors={col} />

        {/* AI Result Card */}
        {aiResult && <AiAnalysisCard result={aiResult} colors={col} />}

        {/* Scan Another Button */}
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.back()} activeOpacity={0.9}>
          <Text style={styles.actionBtnText}>Scan Another Item</Text>
        </TouchableOpacity>

        {/* Nutrition Facts */}
        <View style={styles.nutritionContainer}>
          <Text style={styles.sectionTitle}>Product Facts (100g)</Text>
          <Text style={styles.factsText}>
            Calories: {product.nutrients?.calories ?? '-'} • Sugar: {product.nutrients?.sugar ?? '-'}g • Sodium: {product.nutrients?.sodium ?? '-'}mg
          </Text>
        </View>

      </ScrollView>
      
      {/* Footer */}
      <View style={styles.footer}>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.push('/(tabs)/homePage')}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
      </View>
    </>
  );
}