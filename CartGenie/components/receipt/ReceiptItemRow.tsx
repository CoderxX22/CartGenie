import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createReceiptStyles } from '../../app/styles/receiptResults.styles';
import { AnalyzedItem } from '../../data/receiptTypes';

export const ReceiptItemRow = ({ item, colors }: { item: AnalyzedItem; colors: AppColors }) => {
  const styles = createReceiptStyles(colors);

  const getItemStatus = (rec: string) => {
    switch (rec) {
      case 'SAFE': return { icon: 'checkmark-circle', color: '#10B981', bg: '#ECFDF5' };
      case 'CAUTION': return { icon: 'warning', color: '#F59E0B', bg: '#FFFBEB' };
      case 'AVOID': return { icon: 'alert-circle', color: '#EF4444', bg: '#FEF2F2' };
      default: return { icon: 'help-circle', color: '#64748B', bg: '#F1F5F9' };
    }
  };

  const status = getItemStatus(item.recommendation);

  return (
    <View style={[styles.itemRow, { backgroundColor: status.bg, borderColor: status.color + '40' }]}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Ionicons name={status.icon as any} size={22} color={status.color} />
      </View>
      
      <View style={styles.badgeContainer}>
        <View style={[styles.badge, { borderColor: status.color }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{item.recommendation}</Text>
        </View>
      </View>

      <Text style={styles.reasonText}>{item.reason}</Text>
    </View>
  );
};