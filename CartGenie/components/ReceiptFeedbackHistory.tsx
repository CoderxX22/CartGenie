import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../src/config/api';

interface ReceiptHistoryItem {
  _id: string;
  storeName?: string;
  totalPrice?: number;
  currency?: string;
  scanDate: string;
  itemCount: number;
  healthSummary: {
    safe: number;
    caution: number;
    avoid: number;
  };
}

export default function ReceiptFeedbackHistory() {
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<ReceiptHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReceipts = async () => {
    try {
      const username = await AsyncStorage.getItem('loggedInUser');
      if (!username) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/history/receipts/${username}?t=${Date.now()}`);
      const data = await res.json();

      if (data.success) {
        setHistoryItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReceipts();
    }, [])
  );

  // 👇 פונקציית מחיקה (אותו עיקרון כמו במוצרים)
  const handleDelete = (itemId: string) => {
    Alert.alert(
      "Delete Receipt",
      "Are you sure you want to remove this receipt from history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/api/history/${itemId}`, {
                method: 'DELETE',
              });
              
              const data = await res.json();
              
              if (data.success) {
                setHistoryItems(prev => prev.filter(item => item._id !== itemId));
              } else {
                Alert.alert("Error", "Failed to delete receipt.");
              }
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Could not connect to server.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: ReceiptHistoryItem }) => {
    const date = new Date(item.scanDate);

    return (
      <View style={styles.card}>
        {/* כותרת הכרטיס */}
        <View style={styles.cardHeader}>
            <View style={styles.storeContainer}>
                <View style={styles.iconBox}>
                    <Ionicons name="receipt-outline" size={20} color="#fff" />
                </View>
                <View>
                    <Text style={styles.storeName}>{item.storeName || 'Unknown Store'}</Text>
                    <Text style={styles.dateText}>
                        {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
            
            {/* צד ימין: מחיר + כפתור מחיקה */}
            <View style={styles.rightHeader}>
                <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color="#94A3B8" />
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.divider} />

        {/* סיכום בריאותי */}
        <View style={styles.summaryContainer}>
            <Text style={styles.itemCountText}>{item.itemCount} Items Scanned</Text>
            
            <View style={styles.healthStats}>
                {item.healthSummary.safe > 0 && (
                    <View style={[styles.statBadge, { backgroundColor: '#D1FAE5' }]}>
                        <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                        <Text style={[styles.statText, { color: '#065F46' }]}>{item.healthSummary.safe}</Text>
                    </View>
                )}
                
                {item.healthSummary.caution > 0 && (
                    <View style={[styles.statBadge, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="warning" size={12} color="#F59E0B" />
                        <Text style={[styles.statText, { color: '#92400E' }]}>{item.healthSummary.caution}</Text>
                    </View>
                )}

                {item.healthSummary.avoid > 0 && (
                    <View style={[styles.statBadge, { backgroundColor: '#FEE2E2' }]}>
                        <Ionicons name="alert-circle" size={12} color="#EF4444" />
                        <Text style={[styles.statText, { color: '#991B1B' }]}>{item.healthSummary.avoid}</Text>
                    </View>
                )}
            </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0096c7" />
        </View>
      ) : (
        <FlatList
          data={historyItems}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReceipts(); }} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Receipts Scanned</Text>
              <Text style={styles.emptySubtitle}>Upload a receipt to track your shopping.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  storeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconBox: {
    width: 40, height: 40,
    borderRadius: 10,
    backgroundColor: '#334155',
    justifyContent: 'center', alignItems: 'center'
  },
  storeName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  dateText: { fontSize: 12, color: '#64748B', marginTop: 2 },
  
  // עיצוב חדש לצד ימין
  rightHeader: {
    alignItems: 'flex-end',
    gap: 4
  },
  priceText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  deleteBtn: { padding: 4 },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },

  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemCountText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  
  healthStats: { flexDirection: 'row', gap: 8 },
  statBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 12, gap: 4
  },
  statText: { fontSize: 12, fontWeight: '700' },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#64748B', marginBottom: 24, marginTop: 4 },
  scanBtn: { backgroundColor: '#0096c7', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  scanBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});