import React, { useMemo, memo } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createReceiptStyles } from '../../app/styles/receiptResults.styles';

const ACCENT = '#0096c7';

// --- Loading Component ---

interface LoadingViewProps {
  step: string;
  colors: AppColors;
}

export const LoadingView = memo(({ step, colors }: LoadingViewProps) => {
  const styles = useMemo(() => createReceiptStyles(colors), [colors]);

  const mainText = step === 'FETCHING_NAMES' 
    ? 'Identifying Products...' 
    : 'AI Analyzing Health Impact...';

  const subText = step === 'FETCHING_NAMES' 
    ? 'Converting barcodes to product names' 
    : 'Checking compatibility with your profile';

  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={ACCENT} />
      <Text style={styles.loadingText}>{mainText}</Text>
      <Text style={styles.subLoadingText}>{subText}</Text>
    </View>
  );
});

// --- Error Component ---

interface ErrorViewProps {
  error?: string;
  onRetry: () => void;
  colors: AppColors;
}

export const ErrorView = memo(({ error, onRetry, colors }: ErrorViewProps) => {
  const styles = useMemo(() => createReceiptStyles(colors), [colors]);

  return (
    <View style={styles.centerContainer}>
      <Ionicons name="alert-circle-outline" size={64} color={colors.subtitle} />
      
      <Text style={styles.errorText}>
        {error || 'No data available'}
      </Text>
      
      <TouchableOpacity 
        style={styles.retryBtn} 
        onPress={onRetry} 
        activeOpacity={0.8}
      >
        <Text style={styles.retryBtnText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
});