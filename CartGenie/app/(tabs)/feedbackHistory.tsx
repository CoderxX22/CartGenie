import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppColors } from '@/components/appThemeProvider';
import { createFeedbackHistoryStyles } from '../styles/feedbackHistory.styles';

// Components
import ProductFeedbackHistory from '../../components/productFeedbackHistory';
import ReceiptFeedbackHistory from '../../components/ReceiptFeedbackHistory';

type TabOption = 'products' | 'receipts';

export default function FeedbackHistory() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabOption>('products');

  const col = useAppColors();
  const styles = useMemo(() => createFeedbackHistoryStyles(col), [col]);

  const goHome = () => {
    router.replace('/(tabs)/homePage');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Activity',
          headerShadowVisible: false,
          headerBackVisible: false,
          headerLeft: () => <HomeHeaderButton onPress={goHome} color={col.text} />,
        }}
      />

      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        
        {/* Tabs Section */}
        <View style={styles.tabContainer}>
          <TabButton 
            label="Products" 
            isActive={activeTab === 'products'} 
            onPress={() => setActiveTab('products')} 
            styles={styles} 
          />
          <TabButton 
            label="Receipts" 
            isActive={activeTab === 'receipts'} 
            onPress={() => setActiveTab('receipts')} 
            styles={styles} 
          />
        </View>

        {/* Content Section */}
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

// --- Sub-Components ---

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  styles: any;
}

const TabButton = ({ label, isActive, onPress, styles }: TabButtonProps) => (
  <TouchableOpacity
    style={[styles.tabBtn, isActive && styles.activeTabBtn]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const HomeHeaderButton = ({ onPress, color }: { onPress: () => void; color: string }) => (
  <TouchableOpacity
    onPress={onPress}
    style={localStyles.homeBtn}
    activeOpacity={0.85}
  >
    <Ionicons name="home-outline" size={18} color={color} />
    <Text style={{ color, fontSize: 16, fontWeight: '600' }}>Home</Text>
  </TouchableOpacity>
);

// --- Local Styles ---
const localStyles = StyleSheet.create({
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
});