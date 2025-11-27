import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../src/config/api';

const ACCENT = '#0096c7';

export default function ProductResultScreen() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!barcode) return;

      try {
        // שימוש ב-Endpoint של ה-Batch גם עבור פריט בודד
        const res = await fetch(`${API_URL}/api/products/batch-details`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcodes: [barcode] })
        });

        const data = await res.json();
        
        if (data.success && data.data && data.data.length > 0) {
          setProduct(data.data[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [barcode]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={styles.loadingText}>Checking Database...</Text>
        </View>
      </>
    );
  }

  // אם המוצר לא נמצא ב-DB או חזר עם דגל notFound
  if (!product || product.notFound) {
    return (
      <>
        <Stack.Screen options={{ title: 'Unknown Product' }} />
        <View style={styles.centerContainer}>
          <Ionicons name="help-circle-outline" size={64} color="#CBD5E1" />
          <Text style={styles.errorText}>Item not in database</Text>
          <Text style={styles.barcodeText}>{barcode}</Text>
          <Text style={styles.hintText}>Only seeded products are recognized.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
            <Text style={styles.btnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Product Details', headerBackTitle: 'Back' }} />
      
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* פרטים */}
        <View style={styles.card}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.badge}>
                <Ionicons name="barcode-outline" size={14} color="#475569" />
                <Text style={styles.badgeText}>{product.barcode}</Text>
            </View>
            {product.brand && (
                <View style={[styles.badge, { backgroundColor: '#E0F2FE' }]}>
                    <Text style={[styles.badgeText, { color: '#0369A1' }]}>{product.brand}</Text>
                </View>
            )}
          </View>
        </View>

        {/* טבלת ערכים תזונתיים */}
        {product.nutrients && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Nutritional Values (per 100g)</Text>
            
            <NutrientRow label="Energy" value={product.nutrients.calories} unit="kcal" />
            <View style={styles.divider} />
            
            <NutrientRow label="Protein" value={product.nutrients.protein} unit="g" />
            <View style={styles.divider} />
            
            <NutrientRow label="Carbohydrates" value={product.nutrients.carbs} unit="g" />
            <View style={styles.divider} />
            
            <NutrientRow label="of which Sugars" value={product.nutrients.sugar} unit="g" indent />
            <View style={styles.divider} />

            <NutrientRow label="Fats" value={product.nutrients.fat} unit="g" />
            <View style={styles.divider} />

            <NutrientRow label="Sodium" value={product.nutrients.sodium} unit="mg" />
          </View>
        )}

      </ScrollView>
    </>
  );
}

// קומפוננטה קטנה לשורת ערך תזונתי
const NutrientRow = ({ label, value, unit, indent }: { label: string, value: any, unit: string, indent?: boolean }) => (
    <View style={styles.nutrientRow}>
        <Text style={[styles.nutrientLabel, indent && { paddingLeft: 16, fontSize: 13 }]}>{label}</Text>
        <Text style={styles.nutrientValue}>{value ?? '-'} {unit}</Text>
    </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
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
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginTop: 16,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 24,
  },
  barcodeText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 8,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    color: '#94A3B8',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  badgeText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  nutrientLabel: {
    fontSize: 15,
    color: '#334155',
  },
  nutrientValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  btn: {
    backgroundColor: ACCENT,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});