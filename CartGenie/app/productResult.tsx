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

  // --- Actions ---

  const handleDone = () => {
    router.replace('/(tabs)/homePage');
  };

  const handleScanAgain = () => {
    router.replace('/scanProduct');
  };

  // --- Render States ---

  // 1. Loading State
  if (loadingStep !== 'IDLE') {
    return (
      <>
        <Stack.Screen options={{ title: 'Product Assistent' }} />
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
          error={errorMsg ?? undefined} 
          barcode={barcode} 
          onRetry={handleScanAgain} 
          onDone={handleDone}
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
        
        {/* Product Info Header */}
        <ProductMiniCard product={product} colors={col} />

        {/* AI Analysis Result */}
        {aiResult && <AiAnalysisCard result={aiResult} colors={col} />}

        {/* Secondary Action: Scan Another */}
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={handleScanAgain} 
          activeOpacity={0.9}
        >
          <Text style={styles.actionBtnText}>Scan Another Item</Text>
        </TouchableOpacity>

        {/* Nutrition Facts Footer */}
        <View style={styles.nutritionContainer}>
          <Text style={styles.sectionTitle}>Product Facts (100g)</Text>
          <Text style={styles.factsText}>
            Calories: {product.nutrients?.calories ?? '-'} • 
            Sugar: {product.nutrients?.sugar ?? '-'}g • 
            Sodium: {product.nutrients?.sodium ?? '-'}mg
          </Text>
        </View>

      </ScrollView>
      
      {/* Sticky Bottom Footer */}
      <View style={styles.footer}>
          <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.9}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
      </View>
    </>
  );
}