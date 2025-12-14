import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColors } from '@/components/appThemeProvider';

// Styles
import { createFeedbackHistoryStyles } from '../styles/feedbackHistory.styles';

// Components
import ProductFeedbackHistory from '../../components/productFeedbackHistory';
import ReceiptFeedbackHistory from '../../components/ReceiptFeedbackHistory';

export default function FeedbackHistory() {
  const [activeTab, setActiveTab] = useState<'products' | 'receipts'>('products');
  const insets = useSafeAreaInsets();
  
  // Theme & Styles
  const col = useAppColors();
  const styles = useMemo(() => createFeedbackHistoryStyles(col), [col]);

  return (
    <>
      <Stack.Screen options={{ title: 'My Activity', headerShadowVisible: false }} />
      
      {/* הוספתי את ה-padding התחתון ל-style בצורה נקייה */}
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        
        {/* --- Tab Switcher --- */}
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

        {/* --- Content Area --- */}
        <View style={styles.contentArea}>
          {activeTab === 'products' ? (
            <ProductFeedbackHistory />
          ) : (
            <ReceiptFeedbackHistory />
          )}
        </View>

      </View>
    </>
  );
}