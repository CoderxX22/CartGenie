import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColors } from '@/components/appThemeProvider'; // התאמת צבעים אם יש לך

// 1. ייבוא הקומפוננטות שיצרנו קודם (וודא שהן שמורות בקבצים נפרדים)
import ProductFeedbackHistory from '../../components/productFeedbackHistory';
import ReceiptFeedbackHistory from '../../components/ReceiptFeedbackHistory';

const ACCENT = '#0096c7';

export default function FeedbackHistory() {
  const [activeTab, setActiveTab] = useState<'products' | 'receipts'>('products');
  const insets = useSafeAreaInsets();
  const colors = useAppColors(); // שימוש בערכת הנושא שלך

  return (
    <>
      <Stack.Screen options={{ title: 'My Activity', headerShadowVisible: false }} />
      
      <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
        
        {/* --- Tab Switcher --- */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'products' && styles.activeTabBtn]} 
            onPress={() => setActiveTab('products')}
          >
            <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
              Products
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'receipts' && styles.activeTabBtn]} 
            onPress={() => setActiveTab('receipts')}
          >
            <Text style={[styles.tabText, activeTab === 'receipts' && styles.activeTabText]}>
              Receipts
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- Content Area --- */}
        <View style={styles.contentArea}>
          {activeTab === 'products' ? (
            // חשוב: הקומפוננטות הפנימיות צריכות להכיל FlatList עם flex:1 כדי לגלול
            <ProductFeedbackHistory />
          ) : (
            <ReceiptFeedbackHistory />
          )}
        </View>

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // עיצוב הטאבים
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 6,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    // צל עדין
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 1
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabBtn: {
    backgroundColor: ACCENT,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
  },
  
  // אזור התוכן
  contentArea: {
    flex: 1,
    // אם הקומפוננטות הפנימיות מכילות padding משלהן, אין צורך להוסיף כאן
  }
});