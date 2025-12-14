import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  strength: { level: number; label: string; color: string };
  colors: { inputBorder: string; subtitle: string };
}

export const StrengthMeter = ({ strength, colors }: Props) => {
  if (strength.level === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.bars}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              { backgroundColor: i < strength.level ? strength.color : colors.inputBorder },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: strength.color }]}>
        Password strength: {strength.label}
      </Text>
      {strength.level <= 2 && (
        <Text style={[styles.hint, { color: colors.subtitle }]}>
          Use at least 8 characters, mix upper/lowercase letters, numbers, and symbols.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
  bars: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  bar: { flex: 1, height: 6, borderRadius: 4 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  hint: { fontSize: 12 },
});