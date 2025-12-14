import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform 
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../src/config/api';
import { consultAiAgent, AIResponse } from '../services/AiConsultService';

const ACCENT = '#0096c7';

// 👇 פונקציית עזר לשמירת ההיסטוריה בשרת
const saveToHistory = async (productData: any, aiData: AIResponse) => {
  try {
    const username = await AsyncStorage.getItem('loggedInUser');
    if (!username) return; // לא שומרים היסטוריה לאורחים

    await fetch(`${API_URL}/api/history/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        productName: productData.name,
        barcode: productData.barcode,
        brand: productData.brand,
        aiRecommendation: aiData.recommendation,
        aiReason: aiData.reason
      })
    });
    console.log('✅ History saved to DB successfully');
  } catch (err) {
    console.error('❌ Failed to save history:', err);
  }
};

export default function ProductResultScreen() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  
  // ניהול סטטוסים
  const [loadingStep, setLoadingStep] = useState<'IDLE' | 'CHECKING_DB' | 'ANALYZING_HEALTH'>('CHECKING_DB');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const runAnalysisFlow = async () => {
      if (!barcode) return;

      // 1️⃣ איפוס נתונים קריטי
      setProduct(null);
      setAiResult(null);
      setErrorMsg(null);
      setLoadingStep('CHECKING_DB');

      try {
        // --- שלב 1: בדיקת המוצר ב-DB ---
        const res = await fetch(`${API_URL}/api/products/batch-details`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcodes: [barcode] })
        });

        const data = await res.json();
        
        if (!data.success || !data.data || data.data.length === 0) {
           setErrorMsg('Product not found in database');
           setLoadingStep('IDLE');
           return;
        }

        const foundProduct = data.data[0];
        console.log('API Response for product:', foundProduct); 

        if (!foundProduct || foundProduct.notFound || !foundProduct.name) {
            setErrorMsg('Item not in database. AI analysis skipped.');
            setLoadingStep('IDLE');
            return;
        }

        setProduct(foundProduct);

        // --- שלב 2: זיהוי המשתמש והפעלת סוכן ה-AI ---
        setLoadingStep('ANALYZING_HEALTH');
        
        const savedUsername = await AsyncStorage.getItem('loggedInUser');
        const currentUser = savedUsername || 'guest';

        console.log(`👤 Sending "${foundProduct.name}" to AI for user: ${currentUser}`);

        const analysis = await consultAiAgent(foundProduct, currentUser);
        
        setAiResult(analysis);

        // 👇 כאן אנחנו שומרים את ההיסטוריה לשרת ברקע
        saveToHistory(foundProduct, analysis);

      } catch (error) {
        console.error('Error in flow:', error);
        setErrorMsg('Failed to analyze product.');
      } finally {
        setLoadingStep('IDLE');
      }
    };

    runAnalysisFlow();
  }, [barcode]);

  // --- תצוגת טעינה ---
  if (loadingStep !== 'IDLE') {
    return (
      <>
        <Stack.Screen options={{ title: 'AI Agent' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={styles.loadingText}>
            {loadingStep === 'CHECKING_DB' ? 'Identifying Product...' : 'Analyzing Health Impact...'}
          </Text>
          {loadingStep === 'ANALYZING_HEALTH' && (
             <Text style={styles.subLoadingText}>Checking against your medical profile...</Text>
          )}
        </View>
      </>
    );
  }

  // --- תצוגת שגיאה ---
  if (errorMsg || !product) {
    return (
      <>
        <Stack.Screen options={{ title: 'Unknown Product' }} />
        <View style={styles.centerContainer}>
          <Ionicons name="help-circle-outline" size={64} color="#CBD5E1" />
          <Text style={styles.errorText}>{errorMsg || 'Item not in database'}</Text>
          
          <View style={styles.barcodeBox}>
            <Text style={styles.barcodeText}>{barcode}</Text>
          </View>

          <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
            <Text style={styles.btnText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.push('/(tabs)/homePage')}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  // --- לוגיקת הצבעים ---
  let statusColor = '#64748B'; 
  let statusIcon: any = 'help-circle';
  let statusText = 'Unknown';

  if (aiResult) {
      switch (aiResult.recommendation) {
          case 'SAFE':
              statusColor = '#10B981'; 
              statusIcon = 'checkmark-circle';
              statusText = 'Safe to Consume';
              break;
          case 'CAUTION':
              statusColor = '#F59E0B'; 
              statusIcon = 'warning';
              statusText = 'Consume with Caution';
              break;
          case 'AVOID':
              statusColor = '#EF4444'; 
              statusIcon = 'alert-circle';
              statusText = 'Better to Avoid';
              break;
      }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Health Analysis', headerBackTitle: 'Back' }} />
      
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* כרטיס המוצר */}
        <View style={styles.miniProductCard}>
            <View>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.brandName}>{product.brand}</Text>
            </View>
            <View style={styles.barcodeBadge}>
                <Ionicons name="barcode-outline" size={14} color="#64748B" />
                <Text style={styles.badgeText}>{product.barcode}</Text>
            </View>
        </View>

        {/* כרטיס ה-AI */}
        {aiResult && (
            <View style={[styles.aiCard, { borderColor: statusColor }]}>
                <View style={[styles.statusHeader, { backgroundColor: statusColor }]}>
                    <Ionicons name={statusIcon} size={24} color="#fff" />
                    <Text style={styles.statusTitle}>{statusText}</Text>
                </View>
                
                <View style={styles.aiBody}>
                    <View style={styles.aiLabelRow}>
                        <Ionicons name="sparkles" size={16} color={ACCENT} />
                        <Text style={styles.aiLabel}>AI Health Insight</Text>
                    </View>
                    <Text style={styles.aiReasonText}>
                        {aiResult.reason}
                    </Text>

                    {aiResult.alternatives && aiResult.alternatives.length > 0 && (
                        <View style={styles.altContainer}>
                            <Text style={styles.altTitle}>Better Alternatives:</Text>
                            {aiResult.alternatives.map((alt: any, index: number) => (
                                <View key={index} style={styles.altItem}>
                                    <Ionicons name="leaf-outline" size={14} color="#10B981" />
                                    <Text style={styles.altText}>
                                        <Text style={{fontWeight: '700'}}>{alt.name}</Text>: {alt.reason}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        )}

        <TouchableOpacity style={styles.actionBtn} onPress={() => router.back()}>
            <Text style={styles.actionBtnText}>Scan Another Item</Text>
        </TouchableOpacity>

        {/* מידע תזונתי */}
        <View style={styles.nutritionContainer}>
            <Text style={styles.sectionTitle}>Product Facts (100g)</Text>
            <Text style={styles.factsText}>
                Calories: {product.nutrients?.calories ?? '-'} • Sugar: {product.nutrients?.sugar ?? '-'}g • Sodium: {product.nutrients?.sodium ?? '-'}mg
            </Text>
        </View>

      </ScrollView>
      
      {/* Footer */}
      <View style={styles.footer}>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.push('/(tabs)/homePage')}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100, // הוספתי ריפוד למטה כדי שהכפתור לא יסתיר את התוכן
    backgroundColor: '#F8FAFC',
    minHeight: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  loadingText: { marginTop: 12, color: '#334155', fontSize: 18, fontWeight: '600' },
  subLoadingText: { marginTop: 8, color: '#64748B', fontSize: 14 },
  errorText: { fontSize: 18, fontWeight: '700', color: '#334155', marginTop: 16, textAlign: 'center', marginBottom: 10 },
  barcodeBox: { backgroundColor: '#E2E8F0', padding: 8, borderRadius: 6, marginBottom: 20 },
  barcodeText: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: '#475569' },
  
  miniProductCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1
  },
  productName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  brandName: { fontSize: 13, color: '#64748B' },
  barcodeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', padding: 6, borderRadius: 6 },
  badgeText: { fontSize: 12, color: '#64748B' },

  aiCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    marginBottom: 24,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  statusTitle: { color: '#fff', fontSize: 20, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  aiBody: { padding: 20 },
  aiLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  aiLabel: { fontSize: 14, fontWeight: '700', color: ACCENT, textTransform: 'uppercase' },
  aiReasonText: { fontSize: 16, lineHeight: 24, color: '#334155' },

  altContainer: { marginTop: 16, backgroundColor: '#F0FDFA', padding: 12, borderRadius: 8 },
  altTitle: { fontSize: 14, fontWeight: '700', color: '#0F766E', marginBottom: 8 },
  altItem: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  altText: { fontSize: 13, color: '#134E4A', flex: 1 },

  actionBtn: { backgroundColor: '#0F172A', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btn: { backgroundColor: ACCENT, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  nutritionContainer: { alignItems: 'center', opacity: 0.7 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#94A3B8', marginBottom: 4 },
  factsText: { fontSize: 14, color: '#64748B' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  doneBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});