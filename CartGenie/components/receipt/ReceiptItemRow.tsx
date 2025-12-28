import React, { useMemo, memo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createReceiptStyles } from '../../app/styles/receiptResults.styles';
import { AnalyzedItem } from '../../data/receiptTypes';

// --- Configuration ---

interface StatusConfig {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  SAFE:    { icon: 'checkmark-circle', color: '#10B981', bg: '#ECFDF5' },
  CAUTION: { icon: 'warning',          color: '#F59E0B', bg: '#FFFBEB' },
  AVOID:   { icon: 'alert-circle',     color: '#EF4444', bg: '#FEF2F2' },
  DEFAULT: { icon: 'help-circle',      color: '#64748B', bg: '#F1F5F9' },
};

// --- Main Component ---

interface ReceiptItemRowProps {
  item: AnalyzedItem;
  colors: AppColors;
}

export const ReceiptItemRow = memo(({ item, colors }: ReceiptItemRowProps) => {
  // Memoize styles to avoid recreation on every render
  const styles = useMemo(() => createReceiptStyles(colors), [colors]);

  // Determine visual status
  const status = STATUS_MAP[item.recommendation] || STATUS_MAP.DEFAULT;

  return (
    <View style={[styles.itemRow, { backgroundColor: status.bg, borderColor: status.color + '40' }]}>
      
      {/* Header: Name + Icon */}
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Ionicons name={status.icon} size={22} color={status.color} />
      </View>
      
      {/* Badge: Recommendation Label */}
      <View style={styles.badgeContainer}>
        <View style={[styles.badge, { borderColor: status.color }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>
            {item.recommendation}
          </Text>
        </View>
      </View>

      {/* Footer: Reason */}
      <Text style={styles.reasonText}>{item.reason}</Text>
    </View>
  );
});