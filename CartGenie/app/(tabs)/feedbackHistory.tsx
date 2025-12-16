import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColors } from '@/components/appThemeProvider';

// Styles
import { createFeedbackHistoryStyles } from '../styles/feedbackHistory.styles';

// Components
import ProductFeedbackHistory from '../../components/productFeedbackHistory';
import ReceiptFeedbackHistory from '../../components/ReceiptFeedbackHistory';

export default function FeedbackHistory() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'receipts'>('products');
  const insets = useSafeAreaInsets();

  // Theme & Styles
  const col = useAppColors();
  const styles = useMemo(() => createFeedbackHistoryStyles(col), [col]);

  const goHome = () => {
    // Deterministic navigation: avoids reliance on stack back behavior
    router.replace('/(tabs)/homePage');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Activity',
          headerShadowVisible: false,
          // Disable the default back behavior (stack-dependent) and show a stable Home action
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={goHome}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 }}
              activeOpacity={0.85}
            >
              <Ionicons name="home-outline" size={18} color={col.text} />
              <Text style={{ color: col.text, fontSize: 16, fontWeight: '600' }}>Home</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Safe-area padding prevents content from being hidden behind system UI */}
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {/* Tab switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'products' && styles.activeTabBtn]}
            onPress={() => setActiveTab('products')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
              Products
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'receipts' && styles.activeTabBtn]}
            onPress={() => setActiveTab('receipts')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'receipts' && styles.activeTabText]}>
              Receipts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content area */}
        <View style={styles.contentArea}>
          {activeTab === 'products' ? <ProductFeedbackHistory /> : <ReceiptFeedbackHistory />}
        </View>
      </View>
    </>
  );
}
