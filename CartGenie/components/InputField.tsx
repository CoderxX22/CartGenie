import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { AppColors } from '@/components/appThemeProvider';

// 1. הוספנו את 'error' להגדרת הטיפוסים
interface InputFieldProps extends TextInputProps {
  label: string;
  colors: AppColors;
  error?: string; 
}

export const InputField = ({ label, colors, style, error, ...props }: InputFieldProps) => {
  return (
    <View style={localStyles.field}>
      <Text style={[localStyles.label, { color: colors.subtitle }]}>{label}</Text>
      <TextInput
        style={[
          localStyles.input,
          { 
            backgroundColor: colors.inputBg, 
            color: colors.text, 
            // 2. אם יש שגיאה, המסגרת הופכת לאדומה
            borderColor: error ? '#ef4444' : colors.inputBorder 
          },
          style
        ]}
        placeholderTextColor={colors.subtitle}
        {...props}
      />
      {/* 3. הצגת טקסט השגיאה אם קיים */}
      {!!error && <Text style={localStyles.errorText}>{error}</Text>}
    </View>
  );
};

const localStyles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: {
    fontSize: 13,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  input: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  // 4. עיצוב לטקסט שגיאה
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: '#ef4444',
  },
});