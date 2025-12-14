import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';

// 1. Illness Chip
export const IllnessChip = ({ label, isSelected, onPress, colors }: { 
  label: string; isSelected: boolean; onPress: () => void; colors: AppColors 
}) => {
  const accent = colors.accent || '#0096c7';
  return (
    <TouchableOpacity
      style={[
        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
        isSelected 
          ? { backgroundColor: accent, borderColor: accent } 
          : { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[
        { fontSize: 14 },
        isSelected ? { color: '#fff', fontWeight: '700' } : { color: colors.text, fontWeight: '600' }
      ]}>
        {label}
      </Text>
      <Ionicons
        name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
        size={18}
        color={isSelected ? '#fff' : colors.subtitle}
        style={{ marginLeft: 6 }}
      />
    </TouchableOpacity>
  );
};

// 2. Action Pill (Clear / Nothing)
export const ActionPill = ({ label, icon, isPrimary, onPress, colors }: {
  label: string; icon: keyof typeof Ionicons.glyphMap; isPrimary?: boolean; onPress: () => void; colors: AppColors
}) => {
  const accent = colors.accent || '#0096c7';
  return (
    <TouchableOpacity
      style={[
        { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
        isPrimary
           ? { backgroundColor: accent, borderColor: accent }
           : { backgroundColor: colors.background, borderColor: colors.inputBorder }
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Ionicons name={icon} size={16} color={isPrimary ? '#fff' : colors.text} />
      <Text style={[
        { marginLeft: 6, fontSize: 13 },
        isPrimary ? { color: '#fff', fontWeight: '700' } : { color: colors.text, fontWeight: '600' }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};