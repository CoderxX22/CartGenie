import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '../src/config/api';
import { consultAiAgent, AIResponse } from '../services/AiConsultService';
import { useAppColors, AppColors } from '@/components/appThemeProvider';

const ACCENT = '#0096c7';
const CARD_MAX = 520;

type ProductNutrients = {
  calories?: number;
  sugar?: number;
  sodium?: number;
};

type Product = {
  name?: string;
  brand?: string;
  barcode?: string;
  notFound?: boolean;
  nutrients?: ProductNutrients;
};

type LoadingStep = 'IDLE' | 'CHECKING_DB' | 'ANALYZING_HEALTH';

export default function ProductResultScreen() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const router = useRouter();
  const col = useAppColors();
  const styles = useMemo(() => makeStyles(col), [col]);

  const [product, setProduct] = useState<Product | null>(null);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('CHECKING_DB');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const runAnalysisFlow = async () => {
      if (!barcode) return;

      // Reset state before each analysis flow
      setProduct(null);
      setAiResult(null);
      setErrorMsg(null);
      setLoadingStep('CHECKING_DB');

      try {
        // Step 1: Check product in database
        const res = await fetch(`${API_URL}/api/products/batch-details`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcodes: [barcode] }),
        });

        const data = await res.json();

        if (!data.success || !data.data || data.data.length === 0) {
          setErrorMsg('Product not found in database');
          setLoadingStep('IDLE');
          return;
        }

        const foundProduct: Product = data.data[0];

        console.log('API Response for product:', foundProduct);

        if (!foundProduct || foundProduct.notFound || !foundProduct.name) {
          setErrorMsg('Item not in database. AI analysis skipped.');
          setLoadingStep('IDLE');
          return;
        }

        setProduct(foundProduct);

        // Step 2: Run AI agent against user profile
        setLoadingStep('ANALYZING_HEALTH');

        const savedUsername = await AsyncStorage.getItem('loggedInUser');
        const currentUser = savedUsername || 'guest';

        console.log(
          `👤 Sending "${foundProduct.name}" to AI for user: ${currentUser}`,
        );

        const analysis = await consultAiAgent(foundProduct, currentUser);

        setAiResult(analysis);
      } catch (error) {
        console.error('Error in flow:', error);
        setErrorMsg('Failed to analyze product.');
      } finally {
        setLoadingStep('IDLE');
      }
    };

    runAnalysisFlow();
  }, [barcode]);

  // Loading state
  if (loadingStep !== 'IDLE') {
    return (
      <>
        <Stack.Screen options={{ title: 'AI Agent' }} />
        <View style={styles.screen}>
          <View style={styles.centerCard}>
            <ActivityIndicator size="large" color={col.accent ?? ACCENT} />
            <Text style={styles.loadingText}>
              {loadingStep === 'CHECKING_DB'
                ? 'Identifying product...'
                : 'Analyzing health impact...'}
            </Text>
            {loadingStep === 'ANALYZING_HEALTH' && (
              <Text style={styles.subLoadingText}>
                Checking against your medical profile...
              </Text>
            )}
          </View>
        </View>
      </>
    );
  }

  // Error or missing product
  if (errorMsg || !product) {
    return (
      <>
        <Stack.Screen options={{ title: 'Unknown Product' }} />
        <View style={styles.screen}>
          <View style={styles.centerCard}>
            <Ionicons
              name="help-circle-outline"
              size={64}
              color={col.subtitle}
            />
            <Text style={styles.errorText}>
              {errorMsg || 'Item not in database'}
            </Text>

            <View style={styles.barcodeBox}>
              <Text style={styles.barcodeText}>{barcode}</Text>
            </View>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => router.back()}
              activeOpacity={0.9}
            >
              <Text style={styles.btnText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.push('/(tabs)/homePage')}
            activeOpacity={0.9}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  // Status colors (kept as-is, only styling around them themed)
  let statusColor = '#64748B';
  let statusIcon: any = 'help-circle';
  let statusText = 'Unknown';

  if (aiResult) {
    switch (aiResult.recommendation) {
      case 'SAFE':
        statusColor = '#10B981';
        statusIcon = 'checkmark-circle';
        statusText = 'Safe to Consume';
        break;
      case 'CAUTION':
        statusColor = '#F59E0B';
        statusIcon = 'warning';
        statusText = 'Consume with Caution';
        break;
      case 'AVOID':
        statusColor = '#EF4444';
        statusIcon = 'alert-circle';
        statusText = 'Better to Avoid';
        break;
    }
  }

  return (
    <>
      <Stack.Screen
        options={{ title: 'Health Analysis', headerBackTitle: 'Back' }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: 120 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Product card */}
          <View style={styles.miniProductCard}>
            <View>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.brandName}>{product.brand}</Text>
            </View>
            <View style={styles.barcodeBadge}>
              <Ionicons
                name="barcode-outline"
                size={14}
                color={col.subtitle}
              />
              <Text style={styles.badgeText}>{product.barcode}</Text>
            </View>
          </View>

          {/* AI card */}
          {aiResult && (
            <View style={[styles.aiCard, { borderColor: statusColor }]}>
              <View
                style={[styles.statusHeader, { backgroundColor: statusColor }]}
              >
                <Ionicons name={statusIcon} size={24} color="#fff" />
                <Text style={styles.statusTitle}>{statusText}</Text>
              </View>

              <View style={styles.aiBody}>
                <View style={styles.aiLabelRow}>
                  <Ionicons name="sparkles" size={16} color={ACCENT} />
                  <Text style={styles.aiLabel}>AI Health Insight</Text>
                </View>
                <Text style={styles.aiReasonText}>{aiResult.reason}</Text>

                {aiResult.alternatives &&
                  aiResult.alternatives.length > 0 && (
                    <View style={styles.altContainer}>
                      <Text style={styles.altTitle}>Better Alternatives:</Text>
                      {aiResult.alternatives.map((alt: any, index: number) => (
                        <View key={index} style={styles.altItem}>
                          <Ionicons
                            name="leaf-outline"
                            size={14}
                            color="#10B981"
                          />
                          <Text style={styles.altText}>
                            <Text style={{ fontWeight: '700' }}>
                              {alt.name}
                            </Text>
                            : {alt.reason}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.back()}
            activeOpacity={0.9}
          >
            <Text style={styles.actionBtnText}>Scan Another Item</Text>
          </TouchableOpacity>

          {/* Nutrition facts */}
          <View style={styles.nutritionContainer}>
            <Text style={styles.sectionTitle}>Product Facts (100g)</Text>
            <Text style={styles.factsText}>
              Calories: {product.nutrients?.calories ?? '-'} • Sugar:{' '}
              {product.nutrients?.sugar ?? '-'}g • Sodium:{' '}
              {product.nutrients?.sodium ?? '-'}mg
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.push('/(tabs)/homePage')}
          activeOpacity={0.9}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    // Root screen background (theme-aware)
    screen: {
      flex: 1,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 24,
    },

    // Center card for loading/error states
    centerCard: {
      width: '100%',
      maxWidth: CARD_MAX,
      backgroundColor: c.card,
      borderRadius: 18,
      paddingHorizontal: 20,
      paddingVertical: 22,
      borderWidth: 1,
      borderColor: c.inputBorder,
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#0F172A',
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
        },
        android: { elevation: 5 },
      }),
    },

    // Main content container (success state)
    container: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 24,
      backgroundColor: c.background,
    },

    // Main card like other onboarding screens
    card: {
      width: '100%',
      maxWidth: CARD_MAX,
      backgroundColor: c.card,
      borderRadius: 18,
      paddingHorizontal: 20,
      paddingVertical: 22,
      borderWidth: 1,
      borderColor: c.inputBorder,
      ...Platform.select({
        ios: {
          shadowColor: '#0F172A',
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
        },
        android: { elevation: 5 },
      }),
    },

    loadingText: {
      marginTop: 12,
      color: c.text,
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
    },
    subLoadingText: {
      marginTop: 8,
      color: c.subtitle,
      fontSize: 14,
      textAlign: 'center',
    },

    errorText: {
      fontSize: 18,
      fontWeight: '700',
      color: c.text,
      marginTop: 16,
      textAlign: 'center',
      marginBottom: 10,
    },

    barcodeBox: {
      backgroundColor: c.inputBg,
      padding: 8,
      borderRadius: 6,
      marginBottom: 20,
    },
    barcodeText: {
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      color: c.text,
    },

    miniProductCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: c.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    productName: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
    },
    brandName: {
      fontSize: 13,
      color: c.subtitle,
    },
    barcodeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.inputBg,
      padding: 6,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 12,
      color: c.subtitle,
    },

    aiCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 2,
      marginBottom: 24,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
        },
        android: { elevation: 4 },
      }),
    },
    statusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 16,
    },
    statusTitle: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    aiBody: {
      padding: 20,
    },
    aiLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
    },
    aiLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: ACCENT,
      textTransform: 'uppercase',
    },
    aiReasonText: {
      fontSize: 16,
      lineHeight: 24,
      color: c.text,
    },

    altContainer: {
      marginTop: 16,
      backgroundColor: '#F0FDFA',
      padding: 12,
      borderRadius: 8,
    },
    altTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#0F766E',
      marginBottom: 8,
    },
    altItem: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 4,
    },
    altText: {
      fontSize: 13,
      color: '#134E4A',
      flex: 1,
    },

    actionBtn: {
      backgroundColor: '#0F172A',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 30,
    },
    actionBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },

    btn: {
      backgroundColor: c.accent ?? ACCENT,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    btnText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },

    nutritionContainer: {
      alignItems: 'center',
      opacity: 0.8,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: c.subtitle,
      marginBottom: 4,
    },
    factsText: {
      fontSize: 14,
      color: c.text,
      textAlign: 'center',
    },

    // Theme-aware footer, similar style to Navbar/footer on other screens
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.card,
      paddingHorizontal: 20,
      paddingVertical: Platform.select({ ios: 20, android: 16 }),
      borderTopWidth: 1,
      borderTopColor: c.inputBorder,
      ...Platform.select({
        ios: {
          shadowColor: '#0F172A',
          shadowOpacity: 0.06,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: -6 },
        },
        android: { elevation: 10 },
      }),
    },
    doneBtn: {
      backgroundColor: c.accent ?? ACCENT,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    doneBtnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
  });
