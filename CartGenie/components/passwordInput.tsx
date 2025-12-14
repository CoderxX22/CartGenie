import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  colors: AppColors;
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
}

export const PasswordInput = ({ value, onChangeText, placeholder, error, colors, returnKeyType, onSubmitEditing }: Props) => {
  const [show, setShow] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          placeholder={placeholder}
          style={[
            styles.input, 
            { backgroundColor: colors.inputBg, color: colors.text, borderColor: error ? '#ef4444' : colors.inputBorder }
          ]}
          placeholderTextColor={colors.subtitle}
          secureTextEntry={!show}
          value={value}
          onChangeText={onChangeText}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
        />
        <Pressable onPress={() => setShow(!show)} hitSlop={10} style={styles.eyeBtn}>
          <Ionicons name={show ? 'eye-off' : 'eye'} size={20} color={colors.subtitle} />
        </Pressable>
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  eyeBtn: { marginLeft: 8, paddingHorizontal: 8 },
  errorText: { marginTop: 6, color: '#ef4444', fontSize: 12 },
});