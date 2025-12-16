import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors } from '@/components/appThemeProvider';
import { useReceiptAnalysis } from '../hooks/useReceiptAnalysis';
import { createReceiptStyles } from './styles/receiptResults.styles';

// DRY Components
import { ScoreCard } from '../components/receipt/ScoreCard';
import { ReceiptItemRow } from '../components/receipt/ReceiptItemRow';
import { LoadingView, ErrorView } from '../components/receipt/ReceiptStates';

export default function ReceiptResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const col = useAppColors();
  const styles = useMemo(() => createReceiptStyles(col), [col]);

  // Hook Logic
  const { state, actions } = useReceiptAnalysis(params.extractedItems as string);
  const { aiResult, loadingStep, errorMsg, isSaved } = state;

  const handleSave = async () => {
    try {
      await actions.saveReceiptToHistory();
      Alert.alert('Success', 'Receipt saved to history!');
    } catch {
      Alert.alert('Error', 'Failed to save receipt. Ensure you are logged in.');
    }
  };

  const showScoreInfo = () => {
    // Adjust these ranges anytime without touching UI layout
    Alert.alert(
      'Cart Health Score',
      [
        'How to read the score (0–100):',
        '',
        '0–39  → Needs improvement',
        '40–59 → Fair / mixed cart',
        '60–79 → Good choices',
        '80–100 → Excellent (very healthy cart)',
        '',
        'Tip: A higher score usually means more SAFE items and fewer AVOID items.'
      ].join('\n')
    );
  };

  // 1) Loading state
  if (loadingStep !== 'IDLE') {
    return (
      <>
        <Stack.Screen options={{ title: 'Processing' }} />
        <LoadingView step={loadingStep} colors={col} />
      </>
    );
  }

  // 2) Error state
  if (errorMsg || !aiResult) {
    return (
      <>
        <Stack.Screen options={{ title: 'Analysis Failed' }} />
        <ErrorView error={errorMsg!} onRetry={() => router.back()} colors={col} />
      </>
    );
  }

  // 3) Success state
  const { healthMatchScore, analyzedItems } = aiResult;

  return (
    <>
      <Stack.Screen options={{ title: 'Cart Analysis', headerBackTitle: 'Scan' }} />

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Score card with an info icon to explain the score ranges */}
          <View style={styles.scoreHeaderRow}>
            <Text style={styles.scoreHeaderTitle}>Cart Health Score</Text>

            <TouchableOpacity
              onPress={showScoreInfo}
              accessibilityRole="button"
              accessibilityLabel="Cart Health Score information"
              style={styles.infoBtn}
              activeOpacity={0.85}
            >
              <Ionicons name="information-circle-outline" size={22} color={col.subtitle} />
            </TouchableOpacity>
          </View>

          <ScoreCard score={healthMatchScore} colors={col} />

          {/* Save button styled as a primary button (consistent with other CTAs) */}
          <TouchableOpacity
            style={[styles.saveBtn, isSaved && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaved}
            activeOpacity={0.9}
          >
            <Ionicons name={isSaved ? 'checkmark' : 'save-outline'} size={20} color="#fff" />
            <Text style={styles.saveBtnText}>{isSaved ? 'Saved to History' : 'Save to History'}</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analyzed Items ({analyzedItems.length})</Text>
            <View style={styles.itemsList}>
              {analyzedItems.map((item, index) => (
                <ReceiptItemRow key={index} item={item} colors={col} />
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.push('/(tabs)/homePage')} activeOpacity={0.9}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
