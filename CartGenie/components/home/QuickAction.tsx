import React, { useMemo, memo } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createHomeStyles } from '../../app/styles/homePage.styles';

const ACCENT = '#0096c7';

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  colors: AppColors;
  isPrimary?: boolean;
}

export const QuickAction = memo(({ title, subtitle, icon, onPress, colors, isPrimary }: QuickActionProps) => {
  // Memoize styles to prevent recreation on every render
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  // Consolidate color logic to keep JSX clean
  const theme = isPrimary
    ? {
        containerBg: ACCENT,
        borderColor: ACCENT,
        iconCircleBg: '#0369A1',
        iconColor: '#fff',
        titleColor: '#fff',
        subtitleColor: '#E0F2FE',
        chevronColor: '#E0F2FE',
      }
    : {
        containerBg: colors.inputBg,
        borderColor: colors.inputBorder,
        iconCircleBg: '#E0F2FE',
        iconColor: ACCENT,
        titleColor: colors.text,
        subtitleColor: colors.subtitle,
        chevronColor: colors.subtitle,
      };

  return (
    <TouchableOpacity
      style={[
        styles.actionBtn,
        { 
          backgroundColor: theme.containerBg, 
          borderColor: theme.borderColor,
          borderWidth: isPrimary ? 0 : 1 
        }
      ]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={[styles.actionIconCircle, { backgroundColor: theme.iconCircleBg }]}>
        <Ionicons name={icon} size={22} color={theme.iconColor} />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={[styles.actionTitle, { color: theme.titleColor }]}>
          {title}
        </Text>
        <Text style={[styles.actionSubtitle, { color: theme.subtitleColor }]}>
          {subtitle}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={theme.chevronColor} />
    </TouchableOpacity>
  );
});