import React, { useMemo, memo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createReceiptStyles } from '../../app/styles/receiptResults.styles';
import { AnalyzedItem } from '../../data/receiptTypes';

// --- Configuration ---

const isDarkMode = (colors: AppColors) => {
  return colors.text === '#ffffff' || colors.text === '#F8FAFC' || colors.background === '#000000';
};

const getStatusTheme = (status: string, isDark: boolean) => {
  const baseColors = {
    SAFE:    '#10B981', // Green
    CAUTION: '#F59E0B', // Amber
    AVOID:   '#EF4444', // Red
    DEFAULT: '#64748B', // Slate
  };

  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    SAFE: 'checkmark-circle',
    CAUTION: 'warning',
    AVOID: 'alert-circle',
    DEFAULT: 'help-circle',
  };

  const color = baseColors[status as keyof typeof baseColors] || baseColors.DEFAULT;
  const icon = icons[status as keyof typeof icons] || icons.DEFAULT;

  let bg;
  if (isDark) {
    switch (status) {
      case 'SAFE':    bg = 'rgba(16, 185, 129, 0.15)'; break;
      case 'CAUTION': bg = 'rgba(245, 158, 11, 0.15)'; break;
      case 'AVOID':   bg = 'rgba(239, 68, 68, 0.15)';  break;
      default:        bg = 'rgba(100, 116, 139, 0.2)';
    }
  } else {
    // צבעים מקוריים למצב אור
    switch (status) {
      case 'SAFE':    bg = '#ECFDF5'; break;
      case 'CAUTION': bg = '#FFFBEB'; break;
      case 'AVOID':   bg = '#FEF2F2'; break;
      default:        bg = '#F1F5F9';
    }
  }

  return { color, bg, icon };
};

// --- Main Component ---

interface ReceiptItemRowProps {
  item: AnalyzedItem;
  colors: AppColors;
}

export const ReceiptItemRow = memo(({ item, colors }: ReceiptItemRowProps) => {
  const styles = useMemo(() => createReceiptStyles(colors), [colors]);
  
  const isDark = useMemo(() => isDarkMode(colors), [colors]);

  const statusTheme = getStatusTheme(item.recommendation, isDark);

  return (
    <View style={[
      styles.itemRow, 
      { 
        backgroundColor: statusTheme.bg, 
        borderColor: isDark ? statusTheme.color + '80' : statusTheme.color + '40'
      }
    ]}>
      
      {/* Header: Name + Icon */}
      <View style={styles.itemHeader}>
        <Text style={[styles.itemName, { color: colors.text }]}>
          {item.productName}
        </Text>
        <Ionicons name={statusTheme.icon} size={22} color={statusTheme.color} />
      </View>
      
      {/* Badge: Recommendation Label */}
      <View style={styles.badgeContainer}>
        <View style={[styles.badge, { borderColor: statusTheme.color, borderWidth: 1 }]}>
          <Text style={[styles.badgeText, { color: statusTheme.color, fontWeight: '700' }]}>
            {item.recommendation}
          </Text>
        </View>
      </View>

      {/* Footer: Reason */}
      <Text style={[styles.reasonText, { color: colors.subtitle || colors.text, opacity: 0.9 }]}>
        {item.reason}
      </Text>
    </View>
  );
});