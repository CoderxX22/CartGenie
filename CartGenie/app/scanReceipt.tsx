import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors } from '@/components/appThemeProvider';
import { useScanReceiptLogic } from '../hooks/useScanReceiptLogic';
import { createScanReceiptStyles } from './styles/scanReceipt.styles';
import { ReceiptPreview } from '../components/scanReceipt/ReceiptPreview';

export default function ScanReceiptScreen() {
  const col = useAppColors();
  const styles = useMemo(() => createScanReceiptStyles(col), [col]);
  
  // שימוש ב-Hook החדש
  const { state, actions } = useScanReceiptLogic();
  const { file, loading } = state;

  return (
    <>
      <Stack.Screen options={{ title: 'Scan Receipt', headerBackTitle: 'Back' }} />
      
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Receipt Preview Component */}
        <ReceiptPreview imageUri={file?.uri} colors={col} />

        {/* Action Buttons (Gallery / Camera) */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.secondaryBtn]} 
            onPress={actions.pickFromLibrary}
            disabled={loading}
          >
            <Ionicons name="images-outline" size={22} color={col.accent} />
            <Text style={styles.secondaryBtnText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, styles.primaryBtn]} 
            onPress={actions.takePhoto}
            disabled={loading}
          >
            <Ionicons name="camera-outline" size={22} color="#fff" />
            <Text style={styles.primaryBtnText}>Camera</Text>
          </TouchableOpacity>
        </View>

        {/* Analyze Button */}
        {file && (
          <TouchableOpacity 
            style={[styles.scanBtn, loading && { opacity: 0.7 }]} 
            onPress={actions.uploadAndScan}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.scanBtnText}>Analyze Receipt</Text>
                <Ionicons name="sparkles" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>
    </>
  );
}