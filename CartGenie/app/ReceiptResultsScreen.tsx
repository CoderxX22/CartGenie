import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors, AppColors } from '@/components/appThemeProvider';
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

  // Ensure params are handled safely (Expo params can be string or string[])
  const rawItems = params.extractedItems;
  const itemsStr = Array.isArray(rawItems) ? rawItems[0] : rawItems;

  const { state, actions } = useReceiptAnalysis(itemsStr as string);
  // 👇 שינוי 1: משכנו את warningMsg מה-State
  const { aiResult, loadingStep, errorMsg, warningMsg, isSaved } = state;

  // --- Actions ---

  const handleSave = async () => {
    try {
      await actions.saveReceiptToHistory();
      Alert.alert('Success', 'Receipt saved to history!');
    } catch {
      Alert.alert('Error', 'Failed to save receipt. Ensure you are logged in.');
    }
  };

  const handleDone = () => {
    // Replace prevents the user from going "Back" to this result screen from Home
    router.replace('/(tabs)/homePage');
  };

  // --- Render States ---

  // 1. Loading
  if (loadingStep !== 'IDLE') {
    return (
      <>
        <Stack.Screen options={{ title: 'Processing' }} />
        <LoadingView step={loadingStep} colors={col} />
      </>
    );
  }

  // 2. Error or Missing Data
  if (errorMsg || !aiResult) {
    return (
      <>
        <Stack.Screen options={{ title: 'Analysis Failed' }} />
        <ErrorView 
          error={errorMsg ?? 'Unknown error occurred'} 
          onRetry={() => router.back()} 
          colors={col} 
        />
      </>
    );
  }

  // 3. Success
  const { healthMatchScore, analyzedItems } = aiResult;

  return (
    <>
      <Stack.Screen options={{ title: 'Cart Analysis', headerBackTitle: 'Scan' }} />

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Header with Info Button */}
          <ScoreSectionHeader styles={styles} colors={col} />

          <ScoreCard score={healthMatchScore} colors={col} />

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, isSaved && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaved}
            activeOpacity={0.9}
          >
            <Ionicons name={isSaved ? 'checkmark' : 'save-outline'} size={20} color="#fff" />
            <Text style={styles.saveBtnText}>
              {isSaved ? 'Saved to History' : 'Save to History'}
            </Text>
          </TouchableOpacity>

          {/* 👇 שינוי 2: באנר אזהרה במקרה שחלק מהמוצרים לא זוהו */}
          {warningMsg && (
            <View style={{
              backgroundColor: '#FFF3CD',
              borderColor: '#FFEEBA',
              borderWidth: 1,
              padding: 12,
              borderRadius: 8,
              marginTop: 15,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10
            }}>
              <Ionicons name="warning-outline" size={22} color="#856404" />
              <Text style={{ color: '#856404', fontSize: 13, fontWeight: '600', flex: 1 }}>
                {warningMsg}
              </Text>
            </View>
          )}

          {/* Items List */}
          <View style={[styles.section, warningMsg ? { marginTop: 15 } : {}]}>
            <Text style={styles.sectionTitle}>Analyzed Items ({analyzedItems.length})</Text>
            <View style={styles.itemsList}>
              {analyzedItems.map((item, index) => (
                <ReceiptItemRow key={index} item={item} colors={col} />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.doneBtn} 
            onPress={handleDone} 
            activeOpacity={0.9}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

// --- Sub-Components ---

const ScoreSectionHeader = ({ styles, colors }: { styles: any, colors: AppColors }) => {
  const showScoreInfo = () => {
    Alert.alert(
      'Cart Health Score',
      `How to read the score (0–100):

0–39  → Needs improvement
40–59 → Fair / mixed cart
60–79 → Good choices
80–100 → Excellent (very healthy cart)

Tip: A higher score usually means more SAFE items and fewer AVOID items.`
    );
  };

  return (
    <View style={styles.scoreHeaderRow}>
      <Text style={styles.scoreHeaderTitle}>Cart Health Score</Text>
      <TouchableOpacity
        onPress={showScoreInfo}
        accessibilityRole="button"
        accessibilityLabel="Cart Health Score information"
        style={styles.infoBtn}
        activeOpacity={0.85}
      >
        <Ionicons name="information-circle-outline" size={22} color={colors.subtitle} />
      </TouchableOpacity>
    </View>
  );
};