import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../src/config/api';
import { useAppColors } from '@/components/appThemeProvider';

interface HistoryItem {
  _id: string;
  productName: string;
  brand: string;
  barcode: string;
  aiRecommendation: 'SAFE' | 'CAUTION' | 'AVOID' | 'UNKNOWN';
  aiReason: string;
  scannedAt: string;
}

export default function ProductFeedbackHistory() {
  const col = useAppColors();

  const styles = useMemo(() => createStyles(col), [col]);

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const username = await AsyncStorage.getItem('loggedInUser');
      if (!username) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/history/${username}?t=${Date.now()}`);
      const data = await res.json();

      if (data.success) {
        setHistoryItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const handleDelete = (itemId: string) => {
    Alert.alert('Delete Scan', 'Are you sure you want to remove this item from your history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/api/history/${itemId}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
              setHistoryItems((prev) => prev.filter((item) => item._id !== itemId));
            } else {
              Alert.alert('Error', 'Failed to delete item from server.');
            }
          } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Error', 'Could not connect to server.');
          }
        },
      },
    ]);
  };

  const getStatusStyles = (status: HistoryItem['aiRecommendation']) => {
    // Semantic colors remain consistent across themes; backgrounds are translucent to work in dark mode too.
    switch (status) {
      case 'SAFE':
        return { color: '#10B981', icon: 'checkmark-circle', bg: 'rgba(16,185,129,0.14)', label: 'Safe' };
      case 'CAUTION':
        return { color: '#F59E0B', icon: 'warning', bg: 'rgba(245,158,11,0.14)', label: 'Caution' };
      case 'AVOID':
        return { color: '#EF4444', icon: 'alert-circle', bg: 'rgba(239,68,68,0.14)', label: 'Avoid' };
      default:
        return { color: '#64748B', icon: 'help-circle', bg: 'rgba(100,116,139,0.14)', label: 'Unknown' };
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const styleData = getStatusStyles(item.aiRecommendation);
    const date = new Date(item.scannedAt);

    return (
      <View style={styles.card}>
        <View style={[styles.colorStrip, { backgroundColor: styleData.color }]} />

        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.productName}
              </Text>
              <Text style={styles.brandName}>{item.brand || 'Unknown Brand'}</Text>
            </View>

            <View style={styles.rightHeader}>
              <View style={[styles.badge, { backgroundColor: styleData.bg, borderColor: styleData.color }]}>
                <Ionicons name={styleData.icon as any} size={12} color={styleData.color} />
                <Text style={[styles.badgeText, { color: styleData.color }]}>{styleData.label}</Text>
              </View>

              <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn} activeOpacity={0.8}>
                <Ionicons name="trash-outline" size={18} color={col.subtitle} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.reasonText} numberOfLines={2}>
            {item.aiReason}
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={12} color={col.subtitle} />
              <Text style={styles.dateText}>
                {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={col.accent || '#0096c7'} />
        </View>
      ) : (
        <FlatList
          data={historyItems}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchHistory();
              }}
              tintColor={col.text}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="time-outline" size={40} color={col.subtitle} />
              </View>
              <Text style={styles.emptyTitle}>No History Yet</Text>
              <Text style={styles.emptySubtitle}>Products you scan will appear here.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function createStyles(c: ReturnType<typeof useAppColors>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      padding: 16,
      paddingBottom: 40,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: c.card,
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.inputBorder,
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
        android: { elevation: 2 },
      }),
    },
    colorStrip: {
      width: 6,
      height: '100%',
    },
    cardContent: {
      flex: 1,
      padding: 14,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    titleContainer: {
      flex: 1,
      paddingRight: 8,
    },
    rightHeader: {
      alignItems: 'flex-end',
      gap: 8,
    },
    deleteBtn: {
      padding: 4,
    },
    productName: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
      marginBottom: 2,
    },
    brandName: {
      fontSize: 13,
      color: c.subtitle,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
      gap: 4,
      borderWidth: 1,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    reasonText: {
      fontSize: 14,
      color: c.text,
      lineHeight: 20,
      marginBottom: 12,
      opacity: 0.85,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: c.inputBorder,
      paddingTop: 8,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dateText: {
      fontSize: 12,
      color: c.subtitle,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 80,
      paddingHorizontal: 20,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.inputBorder,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: c.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: c.subtitle,
      textAlign: 'center',
      marginBottom: 24,
    },
  });
}
