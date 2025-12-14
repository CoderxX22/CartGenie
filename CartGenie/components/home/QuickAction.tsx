import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createHomeStyles } from '../../app/styles/homePage.styles';

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  colors: AppColors;
  isPrimary?: boolean;
}

export const QuickAction = ({ title, subtitle, icon, onPress, colors, isPrimary }: QuickActionProps) => {
  const styles = createHomeStyles(colors);
  const accent = '#0096c7';

  // עיצוב דינמי לפי סוג הכפתור (ראשי או משני)
  const containerStyle = [
    styles.actionBtn,
    isPrimary 
      ? { backgroundColor: accent } 
      : { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder }
  ];

  const iconBg = isPrimary ? '#0369A1' : '#E0F2FE';
  const iconColor = isPrimary ? '#fff' : accent;
  const textColor = isPrimary ? '#fff' : colors.text;
  const subTextColor = isPrimary ? '#E0F2FE' : colors.subtitle;
  const chevronColor = isPrimary ? '#E0F2FE' : colors.subtitle;

  return (
    <TouchableOpacity style={containerStyle} activeOpacity={0.9} onPress={onPress}>
      <View style={[styles.actionIconCircle, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.actionTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.actionSubtitle, { color: subTextColor }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={chevronColor} />
    </TouchableOpacity>
  );
};