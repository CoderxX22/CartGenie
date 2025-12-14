import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createProductResultStyles } from '../../app/styles/productResult.styles';

const ACCENT = '#0096c7';

export const LoadingView = ({ step, colors }: { step: string; colors: AppColors }) => {
  const styles = createProductResultStyles(colors);
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={ACCENT} />
      <Text style={styles.loadingText}>
        {step === 'CHECKING_DB' ? 'Identifying product...' : 'Analyzing health impact...'}
      </Text>
      {step === 'ANALYZING_HEALTH' && (
        <Text style={styles.subLoadingText}>Checking against your medical profile...</Text>
      )}
    </View>
  );
};

export const ErrorView = ({ error, barcode, onRetry, onDone, colors }: any) => {
  const styles = createProductResultStyles(colors);
  return (
    <>
      <View style={styles.centerContainer}>
        <Ionicons name="help-circle-outline" size={64} color={colors.subtitle} />
        <Text style={styles.errorText}>{error || 'Item not in database'}</Text>
        <View style={styles.barcodeBox}>
          <Text style={styles.barcodeText}>{barcode}</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={onRetry} activeOpacity={0.9}>
          <Text style={styles.btnText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.9}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};