import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors } from '@/components/appThemeProvider';
import { useScanReceiptLogic } from '../hooks/useScanReceiptLogic';
import { createScanReceiptStyles } from './styles/scanReceipt.styles';
import { ReceiptPreview } from '../components/scanReceipt/ReceiptPreview';

export default function ScanReceiptScreen() {
  const router = useRouter();
  const col = useAppColors();
  const styles = useMemo(() => createScanReceiptStyles(col), [col]);

  const { state, actions } = useScanReceiptLogic();
  const { file, loading } = state;

  const goHome = () => {
    // Prefer back navigation to preserve existing Home params/state when possible
    const canGoBack = (router as any).canGoBack?.() ?? false;
    if (canGoBack) router.back();
    else router.replace('/(tabs)/homePage');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Scan Receipt',
          // Disable default back button (stack-based) to avoid inconsistent behavior
          headerBackVisible: false,
          // Always show a deterministic "Home" action
          headerLeft: () => (
            <TouchableOpacity
              onPress={goHome}
              disabled={loading}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 }}
            >
              <Ionicons name="home-outline" size={18} color={col.text} />
              <Text style={{ color: col.text, fontSize: 16, fontWeight: '600' }}>Home</Text>
            </TouchableOpacity>
          )
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Preview area for the selected receipt (image) */}
        <ReceiptPreview imageUri={file?.uri} colors={col} />

        {/* Source buttons: Documents / Gallery / Camera (icon above text) */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.secondaryBtn]}
            onPress={actions.pickDocument}
            disabled={loading}
            activeOpacity={0.9}
          >
            <View style={styles.actionBtnContent}>
              <Ionicons name="document-outline" size={22} color={col.accent} />
              <Text style={[styles.actionBtnText, { color: col.accent }]}>Documents</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.secondaryBtn]}
            onPress={actions.pickFromLibrary}
            disabled={loading}
            activeOpacity={0.9}
          >
            <View style={styles.actionBtnContent}>
              <Ionicons name="images-outline" size={22} color={col.accent} />
              <Text style={[styles.actionBtnText, { color: col.accent }]}>Gallery</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn]}
            onPress={actions.takePhoto}
            disabled={loading}
            activeOpacity={0.9}
          >
            <View style={styles.actionBtnContent}>
              <Ionicons name="camera-outline" size={22} color="#fff" />
              <Text style={[styles.actionBtnText, { color: '#fff' }]}>Camera</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Show Analyze button only after a file is selected */}
        {file && (
          <TouchableOpacity
            style={[styles.scanBtn, loading && { opacity: 0.7 }]}
            onPress={actions.uploadAndScan}
            disabled={loading}
            activeOpacity={0.9}
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
