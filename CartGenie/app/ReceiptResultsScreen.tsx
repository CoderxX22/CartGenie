import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform,
  Alert
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../src/config/api';

const ACCENT = '#0096c7';

// מבנה התשובה מהסוכן
interface AnalyzedItem {
  productName: string;
  allowed: boolean;
  recommendation: 'SAFE' | 'CAUTION' | 'AVOID';
  reason: string;
}

interface AiResult {
  healthMatchScore: number;
  analyzedItems: AnalyzedItem[];
}

export default function ReceiptResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const rawText = params.rawText as string;
  const extractedItemsString = params.extractedItems as string; 

  // סטייטים לניהול התהליך הדו-שלבי
  // 1. FETCHING_NAMES: המרת ברקודים לשמות מול ה-DB
  // 2. ANALYZING_HEALTH: שליחת השמות ל-AI
  const [loadingStep, setLoadingStep] = useState<'IDLE' | 'FETCHING_NAMES' | 'ANALYZING_HEALTH'>('FETCHING_NAMES');
  
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);

  useEffect(() => {
    const runSmartAnalysis = async () => {
      try {
        setLoadingStep('FETCHING_NAMES');

        // 1. פענוח רשימת הברקודים מה-Params
        let barcodes: string[] = [];
        try {
          barcodes = extractedItemsString ? JSON.parse(extractedItemsString) : [];
        } catch (e) {
          console.error('Error parsing barcodes:', e);
          setErrorMsg('Failed to read barcode list.');
          setLoadingStep('IDLE');
          return;
        }

        if (barcodes.length === 0) {
            setErrorMsg('No barcodes found to analyze.');
            setLoadingStep('IDLE');
            return;
        }

        // 2. שליפת שמות המוצרים ממסד הנתונים (DB Lookup)
        console.log(`🔍 Resolving ${barcodes.length} barcodes against DB...`);
        
        const dbRes = await fetch(`${API_URL}/api/products/batch-details`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcodes })
        });

        const dbData = await dbRes.json();
        
        if (!dbData.success) {
            throw new Error('Failed to resolve product names from DB');
        }

        // חילוץ השמות בלבד (רק מוצרים שנמצאו ב-DB)
        // אם תרצה לשלוח גם את המותג, אפשר לשרשר: `${p.name} ${p.brand}`
        const productNames: string[] = dbData.data
            .filter((p: any) => !p.notFound) // מסננים מוצרים לא ידועים
            .map((p: any) => p.name);

        if (productNames.length === 0) {
            setErrorMsg('None of the scanned items were found in our database.');
            setLoadingStep('IDLE');
            return;
        }

        console.log(`✅ Identified ${productNames.length} products. Names:`, productNames);

        // 3. שליפת המשתמש והפעלת ה-AI עם השמות הנקיים
        setLoadingStep('ANALYZING_HEALTH');
        
        const savedUsername = await AsyncStorage.getItem('loggedInUser');
        const currentUser = savedUsername || 'guest';

        console.log(`🤖 Sending names to AI for user: ${currentUser}`);

        // שליחה ל-Endpoint של העגלה עם *השמות* בלבד
        const aiRes = await fetch(`${API_URL}/api/ai/consult-cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentUser,
            products: productNames // שולחים את השמות, לא את הברקודים!
          })
        });

        const aiJson = await aiRes.json();

        if (aiJson.success && aiJson.data) {
           setAiResult(aiJson.data);
        } else {
           throw new Error(aiJson.message || 'AI Analysis failed');
        }

      } catch (error) {
        console.error('Error in smart analysis:', error);
        setErrorMsg('Analysis failed. Please try again.');
      } finally {
        setLoadingStep('IDLE');
      }
    };

    runSmartAnalysis();
  }, [extractedItemsString]);

  // --- Helpers לעיצוב ---
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; 
    if (score >= 50) return '#F59E0B'; 
    return '#EF4444'; 
  };

  const getItemStatus = (rec: string) => {
    switch (rec) {
      case 'SAFE': return { icon: 'checkmark-circle', color: '#10B981', bg: '#ECFDF5' };
      case 'CAUTION': return { icon: 'warning', color: '#F59E0B', bg: '#FFFBEB' };
      case 'AVOID': return { icon: 'alert-circle', color: '#EF4444', bg: '#FEF2F2' };
      default: return { icon: 'help-circle', color: '#64748B', bg: '#F1F5F9' };
    }
  };

  // --- תצוגת טעינה דו-שלבית ---
  if (loadingStep !== 'IDLE') {
    return (
      <>
        <Stack.Screen options={{ title: 'Processing' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={ACCENT} />
          
          <Text style={styles.loadingText}>
            {loadingStep === 'FETCHING_NAMES' 
                ? 'Identifying Products...' 
                : 'AI Analyzing Health Impact...'}
          </Text>
          
          <Text style={styles.subLoadingText}>
            {loadingStep === 'FETCHING_NAMES'
                ? 'Converting barcodes to product names'
                : 'Checking compatibility with your profile'}
          </Text>
        </View>
      </>
    );
  }

  // --- תצוגת שגיאה ---
  if (errorMsg || !aiResult) {
    return (
      <>
        <Stack.Screen options={{ title: 'Analysis Failed' }} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#CBD5E1" />
          <Text style={styles.errorText}>{errorMsg || 'No data available'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const { healthMatchScore, analyzedItems } = aiResult;

  return (
    <>
      <Stack.Screen options={{ title: 'Cart Analysis', headerBackTitle: 'Scan' }} />
      
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* כרטיס ציון בריאותי */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Cart Health Score</Text>
            <View style={[styles.scoreCircle, { borderColor: getScoreColor(healthMatchScore) + '30' }]}>
                <Text style={[styles.scoreNumber, { color: getScoreColor(healthMatchScore) }]}>
                    {healthMatchScore}
                </Text>
            </View>
            <Text style={styles.scoreSubtitle}>Based on your health profile</Text>
          </View>

          {/* רשימת המוצרים */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analyzed Items ({analyzedItems.length})</Text>
            
            <View style={styles.itemsList}>
                {analyzedItems.map((item, index) => {
                  const status = getItemStatus(item.recommendation);
                  return (
                    <View key={index} style={[styles.itemRow, { backgroundColor: status.bg, borderColor: status.color + '40' }]}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemName}>{item.productName}</Text>
                            <Ionicons name={status.icon as any} size={22} color={status.color} />
                        </View>
                        
                        <View style={styles.badgeContainer}>
                             <View style={[styles.badge, { borderColor: status.color }]}>
                                <Text style={[styles.badgeText, { color: status.color }]}>
                                    {item.recommendation}
                                </Text>
                             </View>
                        </View>

                        <Text style={styles.reasonText}>
                            {item.reason}
                        </Text>
                    </View>
                  );
                })}
            </View>
          </View>

          {/* דיבאג OCR (אופציונלי) */}
          {rawText && (
            <View style={styles.section}>
                <TouchableOpacity style={styles.accordionHeader} onPress={() => setShowRawText(!showRawText)}>
                  <Text style={styles.debugTitle}>Show Raw OCR Text</Text>
                  <Ionicons name={showRawText ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
                </TouchableOpacity>
                {showRawText && (
                    <View style={styles.rawTextContainer}>
                        <Text style={styles.rawText}>{rawText}</Text>
                    </View>
                )}
            </View>
          )}

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.push('/(tabs)/homePage')}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  
  loadingText: { marginTop: 16, fontSize: 18, fontWeight: '600', color: '#0F172A' },
  subLoadingText: { marginTop: 8, fontSize: 14, color: '#64748B', textAlign: 'center' },
  errorText: { fontSize: 18, fontWeight: '700', color: '#334155', marginTop: 16, textAlign: 'center', marginBottom: 20 },

  scrollContent: { padding: 20, paddingBottom: 100 },
  
  scoreCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24, shadowOpacity: 0.05, elevation: 3 },
  scoreTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  scoreCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  scoreNumber: { fontSize: 36, fontWeight: '800' },
  scoreSubtitle: { fontSize: 13, color: '#64748B' },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  itemsList: { gap: 12 },
  itemRow: { padding: 16, borderRadius: 16, borderWidth: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 8 },
  badgeContainer: { flexDirection: 'row', marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, backgroundColor: '#fff' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  reasonText: { fontSize: 14, color: '#475569', lineHeight: 20 },

  retryBtn: { marginTop: 20, padding: 12, backgroundColor: '#E2E8F0', borderRadius: 8 },
  retryBtnText: { fontWeight: '600', color: '#0F172A' },

  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  debugTitle: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  rawTextContainer: { marginTop: 5, backgroundColor: '#E2E8F0', padding: 10, borderRadius: 8 },
  rawText: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 11, color: '#475569' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  doneBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});