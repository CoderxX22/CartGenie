import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Image, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../src/config/api';

const ACCENT = '#0096c7';

export default function ReceiptResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const rawText = params.rawText as string;
  const extractedItemsString = params.extractedItems as string;
  
  // רשימת הברקודים שחולצה מהתמונה
  let barcodes: string[] = [];
  try {
    barcodes = extractedItemsString ? JSON.parse(extractedItemsString) : [];
  } catch (e) {
    console.error('Failed to parse barcodes', e);
  }

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showRawText, setShowRawText] = useState(false);

  // בטעינת המסך: שליחת הברקודים לשרת לבדיקה ב-DB
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (barcodes.length === 0) {
        setLoadingProducts(false);
        return;
      }

      try {
        console.log('Querying DB for barcodes:', barcodes);
        const res = await fetch(`${API_URL}/api/products/batch-details`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcodes })
        });
        
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch product details:', error);
        Alert.alert('Connection Error', 'Could not connect to the database.');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProductDetails();
  }, []);

  const handleConfirm = () => {
    // כאן בעתיד תוכל לשמור את הקנייה בהיסטוריית המשתמש
    Alert.alert('Saved', `${products.filter(p => !p.notFound).length} products added to history.`, [
      { text: 'OK', onPress: () => router.push('/(tabs)/homePage' as Href) }
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Scanned Products', headerBackTitle: 'Back' }} />
      
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Ionicons name="cart-outline" size={44} color={ACCENT} />
            <Text style={styles.title}>Products Found</Text>
            <Text style={styles.subtitle}>Checked database for {barcodes.length} items</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Results ({products.length})</Text>
            
            {loadingProducts ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ACCENT} />
                <Text style={styles.loadingText}>Searching Database...</Text>
              </View>
            ) : products.length > 0 ? (
              <View style={styles.itemsList}>
                {products.map((prod, index) => (
                  <View key={index} style={styles.itemRow}>
                    {/* תמונת המוצר (אם קיימת ב-DB) */}
                    <View style={styles.imageWrapper}>
                        {prod.image ? (
                            <Image source={{ uri: prod.image }} style={styles.productImage} />
                        ) : (
                            <Ionicons name="cube-outline" size={24} color="#CBD5E1" />
                        )}
                    </View>
                    
                    <View style={{ flex: 1 }}>
                        <Text style={styles.itemName} numberOfLines={2}>
                            {prod.notFound ? `Unknown Item (${prod.barcode})` : prod.name}
                        </Text>
                        <Text style={styles.barcodeText}>{prod.barcode}</Text>
                        
                        {/* הצגת קלוריות אם יש */}
                        {prod.nutrients?.calories > 0 && (
                            <Text style={styles.calText}>{prod.nutrients.calories} kcal</Text>
                        )}
                    </View>

                    {/* חיווי הצלחה/כישלון */}
                    <Ionicons 
                        name={prod.notFound ? "close-circle-outline" : "checkmark-circle"} 
                        size={24} 
                        color={prod.notFound ? "#EF4444" : "#10B981"} 
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No known items found.</Text>
              </View>
            )}
          </View>

          {/* Debug View - טקסט גולמי */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.accordionHeader} 
              onPress={() => setShowRawText(!showRawText)}
            >
              <Text style={styles.sectionTitle}>Debug: Raw OCR Text</Text>
              <Ionicons name={showRawText ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
            </TouchableOpacity>
            
            {showRawText && (
              <View style={styles.rawTextContainer}>
                <Text style={styles.rawText}>{rawText}</Text>
              </View>
            )}
          </View>

        </ScrollView>

        {/* כפתורים */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.footerBtn, styles.cancelBtn]} 
            onPress={() => router.back()}
          >
            <Text style={styles.cancelBtnText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.footerBtn, styles.confirmBtn]} 
            onPress={handleConfirm}
          >
            <Text style={styles.confirmBtnText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  itemsList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12
  },
  imageWrapper: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  productImage: {
    width: '100%',
    height: '100%'
  },
  itemName: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 2
  },
  barcodeText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  calText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
    marginTop: 2
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    gap: 10
  },
  loadingText: {
    color: '#334155',
    fontWeight: '600'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '500',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rawTextContainer: {
    marginTop: 10,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
  },
  rawText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#475569',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    backgroundColor: ACCENT,
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 16,
  },
});