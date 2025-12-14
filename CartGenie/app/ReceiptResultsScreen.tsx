import React, { useMemo, useState } from 'react';
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
  const rawText = params.rawText as string;
  
  const col = useAppColors();
  const styles = useMemo(() => createReceiptStyles(col), [col]);

  // Hook Logic
  const { state, actions } = useReceiptAnalysis(params.extractedItems as string);
  const { aiResult, loadingStep, errorMsg, isSaved } = state;
  const [showRawText, setShowRawText] = useState(false);

  const handleSave = async () => {
    try {
      await actions.saveReceiptToHistory();
      Alert.alert("Success", "Receipt saved to history!");
    } catch (e) {
      Alert.alert("Error", "Failed to save receipt. Ensure you are logged in.");
    }
  };

  // 1. Loading
  if (loadingStep !== 'IDLE') {
    return (
      <>
        <Stack.Screen options={{ title: 'Processing' }} />
        <LoadingView step={loadingStep} colors={col} />
      </>
    );
  }

  // 2. Error
  if (errorMsg || !aiResult) {
    return (
      <>
        <Stack.Screen options={{ title: 'Analysis Failed' }} />
        <ErrorView error={errorMsg!} onRetry={() => router.back()} colors={col} />
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
          
          <ScoreCard score={healthMatchScore} colors={col} />

          <TouchableOpacity 
            style={[styles.saveBtn, isSaved && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={isSaved}
          >
             <Ionicons name={isSaved ? "checkmark" : "save-outline"} size={20} color="#fff" />
             <Text style={styles.saveBtnText}>
                {isSaved ? "Saved to History" : "Save to History"}
             </Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analyzed Items ({analyzedItems.length})</Text>
            <View style={styles.itemsList}>
                {analyzedItems.map((item, index) => (
                  <ReceiptItemRow key={index} item={item} colors={col} />
                ))}
            </View>
          </View>

          {/* Debug / Raw Text Section */}
          {rawText && (
            <View style={styles.section}>
                <TouchableOpacity style={styles.accordionHeader} onPress={() => setShowRawText(!showRawText)}>
                  <Text style={styles.debugTitle}>Show Raw OCR Text</Text>
                  <Ionicons name={showRawText ? "chevron-up" : "chevron-down"} size={20} color={col.subtitle} />
                </TouchableOpacity>
                {showRawText && (
                    <View style={styles.rawTextContainer}>
                        <Text style={styles.rawText}>{rawText}</Text>
                    </View>
                )}
            </View>
          )}

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.push('/(tabs)/homePage')}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}