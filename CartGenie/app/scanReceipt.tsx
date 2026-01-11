import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors, AppColors } from '@/components/appThemeProvider';
import { useScanReceiptLogic } from '../hooks/useScanReceiptLogic';
import { createScanReceiptStyles } from './styles/scanReceipt.styles';
import { ReceiptPreview } from '../components/scanReceipt/ReceiptPreview';

export default function ScanReceiptScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const col = useAppColors();
  const styles = useMemo(() => createScanReceiptStyles(col), [col]);

  const { state, actions } = useScanReceiptLogic();
  
  const { files, loading } = state;

  const currentFile = files && files.length > 0 ? files[0] : null;

  // Type-safe navigation logic
  const goHome = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/homePage');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Scan Receipt',
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={goHome}
              disabled={loading}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 }}
            >
              <Ionicons name="home-outline" size={18} color={col.text} />
              <Text style={{ color: col.text, fontSize: 16, fontWeight: '600' }}>Home</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Receipt Preview Component */}
        {/* 👇 תיקון 3: שימוש ב-currentFile */}
        <ReceiptPreview imageUri={currentFile?.uri} colors={col} />

        {/* Action Buttons Row */}
        <View style={styles.buttonRow}>
          <ActionButton
            label="Documents"
            icon="document-outline"
            onPress={actions.pickDocument}
            loading={loading}
            color={col.accent}
            styles={styles}
            variant="secondary"
          />
          
          <ActionButton
            label="Gallery"
            icon="images-outline"
            onPress={actions.pickFromLibrary}
            loading={loading}
            color={col.accent}
            styles={styles}
            variant="secondary"
          />

          <ActionButton
            label="Camera"
            icon="camera-outline"
            onPress={actions.takePhoto}
            loading={loading}
            color="#fff"
            styles={styles}
            variant="primary"
          />
        </View>

        {/* Analyze Button (Conditional) */}
        {/* 👇 תיקון 4: בדיקה אם יש קבצים במערך */}
        {files.length > 0 && (
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

// --- Sub-Components ---

interface ActionButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  loading: boolean;
  color: string;
  styles: any;
  variant: 'primary' | 'secondary';
}

function ActionButton({ label, icon, onPress, loading, color, styles, variant }: ActionButtonProps) {
  const containerStyle = variant === 'primary' ? styles.primaryBtn : styles.secondaryBtn;
  
  return (
    <TouchableOpacity
      style={[styles.actionBtn, containerStyle]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.9}
    >
      <View style={styles.actionBtnContent}>
        <Ionicons name={icon} size={22} color={color} />
        <Text style={[styles.actionBtnText, { color }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}