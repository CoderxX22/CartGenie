import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createReceiptStyles } from '../../app/styles/receiptResults.styles';

const ACCENT = '#0096c7';

export const LoadingView = ({ step, colors }: { step: string; colors: AppColors }) => {
  const styles = createReceiptStyles(colors);
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={ACCENT} />
      <Text style={styles.loadingText}>
        {step === 'FETCHING_NAMES' ? 'Identifying Products...' : 'AI Analyzing Health Impact...'}
      </Text>
      <Text style={styles.subLoadingText}>
        {step === 'FETCHING_NAMES' ? 'Converting barcodes to product names' : 'Checking compatibility with your profile'}
      </Text>
    </View>
  );
};

export const ErrorView = ({ error, onRetry, colors }: { error: string; onRetry: () => void; colors: AppColors }) => {
  const styles = createReceiptStyles(colors);
  return (
    <View style={styles.centerContainer}>
      <Ionicons name="alert-circle-outline" size={64} color={colors.subtitle} />
      <Text style={styles.errorText}>{error || 'No data available'}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryBtnText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};