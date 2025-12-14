import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';

interface SelectFieldProps {
  label: string;
  value?: string | null;
  placeholder: string;
  onPress: () => void;
  iconName: keyof typeof Ionicons.glyphMap;
  colors: AppColors;
  error?: string;
  helperText?: string;
  style?: StyleProp<ViewStyle>;
}

export const SelectField = ({
  label,
  value,
  placeholder,
  onPress,
  iconName,
  colors,
  error,
  helperText,
  style
}: SelectFieldProps) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: colors.subtitle }]}>{label}</Text>
      
      <TouchableOpacity
        style={[
          styles.inputButton,
          { 
            backgroundColor: colors.inputBg, 
            borderColor: error ? '#ef4444' : colors.inputBorder 
          }
        ]}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <Text style={[styles.inputText, { color: value ? colors.text : colors.subtitle }]}>
          {value || placeholder}
        </Text>
        <Ionicons name={iconName} size={20} color={colors.subtitle} />
      </TouchableOpacity>
      
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      {!!helperText && <Text style={[styles.helperText, { color: colors.text }]}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 13,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: { fontSize: 16 },
  errorText: { marginTop: 6, fontSize: 12, color: '#ef4444' },
  helperText: { marginTop: 6, fontSize: 12 },
});